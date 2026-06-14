/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatMessage, ParticipantMetrics } from "../types";

/**
 * Parses raw text input into a structured ChatMessage array.
 * Cleans date-time segments from the line to isolate the actual sender and message text.
 */
export function parseChatLog(rawText: string): ChatMessage[] {
  const lines = rawText.split(/\r?\n/);
  const messages: ChatMessage[] = [];
  
  let currentSender: string | null = null;
  let currentDate = new Date(2026, 5, 12); // Baseline date (June 12, 2026)
  
  // Pattern 1: Bracket format (Mobile export/Copy-paste style)
  // E.g., [민우] [오전 11:42] 안녕하세요
  const mobilePattern = /^\[([^\]]+)\]\s+\[(오전|오후)\s+(\d{1,2}):(\d{2})\]\s+(.*)$/;
  
  // Pattern 2: Universal DateTime stamp cleaner
  // This detects line starts like:
  // "2026. 6. 13. 오후 3:51, 민우 : 안녕하세요" OR "2026년 6월 13일 오후 3:51, "민우" : 안녕하세요"
  // OR "[2026. 06. 13. 15:51] 준호: 네 반갑습니다."
  const dateTimePrefixRegex = /^\[?(\d{4})[\.\-\s년]+(\d{1,2})[\.\-\s월]+(\d{1,2})일?\.?\s*,?\s*(오전|오후)?\s*(\d{1,2}):(\d{2})(?::\d{2})?\]?,?\s*(.*)$/;

  // Pattern 3: Simple Colon Divider Fallback
  // E.g., "민우 : 안녕하세요" OR "민우: 안녕하세요"
  const simpleColonPattern = /^([^:\n]+)\s*[:：]\s*(.*)$/;

  // KakaoTalk Mobile Date separator: --------------- 2026년 6월 14일 일요일 ---------------
  const dateSeparatorPattern = /^-+\s+(\d{4})년\s+(\d{1,2})월\s+(\d{1,2})일\s+([^\s-]+)?\s*-+$/;

  const ignoredKeywords = [
    "저장한 날짜", "저장한날짜", "대화 기간", "대화기간", "참여자", "기기", "운영체제", 
    "talk_2026", "talk-", "배경", "파일", "채팅방", "대화 시작", "대화 시작 시간",
    "http://", "https://", "수신 위치", "발신인", "수신인", "일시", "일자", "시간", "날짜", "작성일"
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Reject headers/metadata immediately
    const lowerLine = line.toLowerCase();
    const shouldSkipLine = ignoredKeywords.some(keyword => {
      return lowerLine.startsWith(keyword) || 
             (lowerLine.includes(keyword) && lowerLine.includes(":") && !lowerLine.includes("오전") && !lowerLine.includes("오후"));
    }) || lowerLine.startsWith("talk_") || lowerLine.endsWith(".txt") || lowerLine.startsWith("-------");

    if (shouldSkipLine) {
      continue;
    }

    // Check for date separator first to update currentDate
    const dateMatch = line.match(dateSeparatorPattern);
    if (dateMatch) {
      const year = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10) - 1; // 0-indexed
      const day = parseInt(dateMatch[3], 10);
      currentDate = new Date(year, month, day);
      continue;
    }

    // Try Standard KakaoTalk mobile bracket pattern
    const mobileMatch = line.match(mobilePattern);
    if (mobileMatch) {
      const sender = mobileMatch[1].trim();

      // Additional safety check on sender length and noise
      const isLikelyNoise = sender.length > 20 || 
                            /^\d+$/.test(sender.replace(/[\s\.\-\/\:]/g, '')) || 
                            ignoredKeywords.some(kw => sender.toLowerCase().includes(kw));
      if (isLikelyNoise) continue;

      const ampm = mobileMatch[2];
      let hour = parseInt(mobileMatch[3], 10);
      const minute = parseInt(mobileMatch[4], 10);
      const text = mobileMatch[5];

      if (ampm === "오후" && hour < 12) hour += 12;
      if (ampm === "오전" && hour === 12) hour = 0;

      const mTime = new Date(currentDate);
      mTime.setHours(hour, minute, 0, 0);

      messages.push({
        sender,
        timestamp: mTime,
        text
      });
      currentSender = sender;
      continue;
    }

    // Checking if the line begins with a Date-Time stamp to safely skip/ignore it as a sender nickname
    const prefixMatch = line.match(dateTimePrefixRegex);
    if (prefixMatch) {
      const year = parseInt(prefixMatch[1], 10);
      const month = parseInt(prefixMatch[2], 10) - 1;
      const day = parseInt(prefixMatch[3], 10);
      const ampm = prefixMatch[4];
      let hour = parseInt(prefixMatch[5], 10);
      const minute = parseInt(prefixMatch[6], 10);
      const remainder = prefixMatch[7].trim();

      if (ampm === "오후" && hour < 12) hour += 12;
      if (ampm === "오전" && hour === 12) hour = 0;

      const mTime = new Date(year, month, day, hour, minute, 0, 0);
      currentDate = mTime;

      // Now we process the remainder after stripping the datetime prefix
      // Check if remainder is of style: "민우 : 안녕하세요" or `"지혜": 네 반갑습니다.`
      const colonMatch = remainder.match(simpleColonPattern);
      if (colonMatch) {
        let sender = colonMatch[1].trim();
        // Clear quotes or brackets around sender name if any
        sender = sender.replace(/^["'\[]+|["'\]]+$/g, '').trim();

        const isLikelyNoise = sender.length > 20 || 
                              /^\d+$/.test(sender.replace(/[\s\.\-\/\:]/g, '')) || 
                              ignoredKeywords.some(kw => sender.toLowerCase().includes(kw));
        if (isLikelyNoise) continue;

        const text = colonMatch[2];

        messages.push({
          sender,
          timestamp: mTime,
          text
        });
        currentSender = sender;
        continue;
      }
    }

    // Try simple colon pattern as final fallback (cannot extract full complex date, use current calendar date)
    const simpleMatch = line.match(simpleColonPattern);
    if (simpleMatch && !line.includes("http://") && !line.includes("https://")) {
      let sender = simpleMatch[1].trim();
      // Skip if the extracted "sender" is entirely a date-time stamp or numeric noise that leaked
      const likelyDateNoise = /^[\d\.\s:\-,요일오전후]+$/.test(sender);
      if (!likelyDateNoise) {
        sender = sender.replace(/^["'\[]+|["'\]]+$/g, '').trim();

        const isLikelyNoise = sender.length > 20 || 
                              /^\d+$/.test(sender.replace(/[\s\.\-\/\:]/g, '')) || 
                              ignoredKeywords.some(kw => sender.toLowerCase().includes(kw));

        if (!isLikelyNoise) {
          const text = simpleMatch[2];
          
          const mTime = new Date(currentDate);
          mTime.setMinutes(mTime.getMinutes() + messages.length);

          messages.push({
            sender,
            timestamp: mTime,
            text
          });
          currentSender = sender;
          continue;
        }
      }
    }

    // Multi-line continuation helper
    if (currentSender && messages.length > 0) {
      messages[messages.length - 1].text += "\n" + line;
    }
  }

  return messages;
}

/**
 * Advanced analytics to accurately output requested traits & ratios:
 * - 질문 횟수 (Question Count)
 * - 총 메시지 비율 (Message Ratio)
 * - 대화 시작 비율 (Initiation Ratio)
 * - 대화 종료 비율 (Session Ending Ratio)
 * - 평균 답장 길이 (Average Reply Length)
 */
export function analyzeChatData(
  messages: ChatMessage[],
  mode: string = "couple",
  customModeText: string = ""
): ParticipantMetrics[] {
  if (messages.length === 0) return [];

  const totalMsgsCount = messages.length;
  const sendersList = Array.from(new Set(messages.map(m => m.sender)));
  
  // Standard metric holders
  const rawMetricsMap = new Map<string, {
    messageCount: number;
    wordCount: number;
    characterCount: number;
    questionCount: number;
    initiateCount: number;
    endCount: number;
    responseTimes: number[];
    hourlyDistribution: number[];
  }>();

  sendersList.forEach(sender => {
    rawMetricsMap.set(sender, {
      messageCount: 0,
      wordCount: 0,
      characterCount: 0,
      questionCount: 0,
      initiateCount: 0,
      endCount: 0,
      responseTimes: [],
      hourlyDistribution: Array(24).fill(0)
    });
  });

  // Calculate precise starts and endings mathematically
  // Threshold interval: 2 hours (7200 seconds) defines separate sessions
  let totalSessions = 0;
  let lastMessageTime: Date | null = null;
  let lastSender: string | null = null;

  messages.forEach((msg, idx) => {
    const metrics = rawMetricsMap.get(msg.sender);
    if (!metrics) return;

    metrics.messageCount++;
    
    const words = msg.text.trim().split(/\s+/).filter(Boolean);
    metrics.wordCount += words.length;
    metrics.characterCount += msg.text.length;

    // Check Korean/English direct questions
    if (msg.text.includes("?") || msg.text.includes("까") || msg.text.includes("가요")) {
      metrics.questionCount++;
    }

    if (msg.timestamp) {
      const hour = msg.timestamp.getHours();
      metrics.hourlyDistribution[hour]++;
    }

    // Session starter tracking
    let isSessionStarter = false;
    if (idx === 0) {
      isSessionStarter = true;
    } else if (msg.timestamp && lastMessageTime) {
      const diffSeconds = (msg.timestamp.getTime() - lastMessageTime.getTime()) / 1000;
      if (diffSeconds >= 7200) { // 2 hours
        isSessionStarter = true;
        
        // This means the PREVIOUS message (at raw index idx - 1) was the END of the previous session!
        const prevMsg = messages[idx - 1];
        const prevMetrics = rawMetricsMap.get(prevMsg.sender);
        if (prevMetrics) {
          prevMetrics.endCount++;
        }
      }
    }

    if (isSessionStarter) {
      metrics.initiateCount++;
      totalSessions++;
    }

    // Response time differentials
    if (msg.timestamp && lastMessageTime && lastSender && lastSender !== msg.sender) {
      const diffSeconds = (msg.timestamp.getTime() - lastMessageTime.getTime()) / 1000;
      if (diffSeconds < 3600 && diffSeconds >= 0) { // under 1 hour in a prompt reply chain
        metrics.responseTimes.push(diffSeconds);
      }
    }

    if (msg.timestamp) {
      lastMessageTime = msg.timestamp;
    }
    lastSender = msg.sender;
  });

  // Final message of the whole chat always counts as ending the last active session
  if (messages.length > 0) {
    const finalMsg = messages[messages.length - 1];
    const finalMetrics = rawMetricsMap.get(finalMsg.sender);
    if (finalMetrics) {
      finalMetrics.endCount++;
    }
  }

  // Ensure total sessions matching starters & closers structurally
  if (totalSessions === 0 && messages.length > 0) {
    totalSessions = 1;
  }

  // Format reports customized dynamically based on social context mode
  const analyzedReports: ParticipantMetrics[] = [];

  sendersList.forEach(sender => {
    const raw = rawMetricsMap.get(sender)!;
    
    // Exact Metrics Calculations
    const messageRate = totalMsgsCount > 0 ? Math.round((raw.messageCount / totalMsgsCount) * 100) : 0;
    const avgCharCount = raw.messageCount > 0 ? Math.round(raw.characterCount / raw.messageCount) : 0;
    const questionRate = raw.messageCount > 0 ? Math.round((raw.questionCount / raw.messageCount) * 100) : 0;
    
    const initiateRate = totalSessions > 0 ? Math.round((raw.initiateCount / totalSessions) * 100) : 0;
    const endRate = totalSessions > 0 ? Math.round((raw.endCount / totalSessions) * 100) : 0;

    const validResponseTimes = raw.responseTimes;
    const avgResponseTime = validResponseTimes.length > 0 
      ? Math.round(validResponseTimes.reduce((a, b) => a + b, 0) / validResponseTimes.length) 
      : 0;

    // Peak active hour category
    const morningCount = raw.hourlyDistribution.slice(6, 12).reduce((a,b)=>a+b, 0);
    const afternoonCount = raw.hourlyDistribution.slice(12, 18).reduce((a,b)=>a+b, 0);
    const eveningCount = raw.hourlyDistribution.slice(18, 24).reduce((a,b)=>a+b, 0);
    const nightCount = raw.hourlyDistribution.slice(0, 6).reduce((a,b)=>a+b, 0);

    let dominantTimeLabel = "오후 소통 중심";
    let maxCount = afternoonCount;
    if (morningCount > maxCount) { dominantTimeLabel = "오전 소통 중심"; maxCount = morningCount; }
    if (eveningCount > maxCount) { dominantTimeLabel = "저녁 소통 중심"; maxCount = eveningCount; }
    if (nightCount > maxCount) { dominantTimeLabel = "새벽 감성 집중형"; maxCount = nightCount; }

    const traits: string[] = [];
    let styleTag = "";
    let detailedDescription = "";

    // Generate context descriptions depending on selected Mode
    const relationalDescriptor = customModeText ? customModeText : (
      mode === "couple" ? "연인 관계" :
      mode === "team" ? "학업/팀플 관계" :
      mode === "work" ? "비즈니스/직장 관계" : "맞춤 소통 관계"
    );

    // Dynamic tags allocation
    if (mode === "couple") {
      // Couple Mode specialized attributes
      if (questionRate > 25) {
        styleTag = "따뜻한 공감형 큐레이터";
        traits.push("다정한 관심 표명가");
        traits.push("풍성한 정서 나눔");
        detailedDescription = `${sender}님은 연인 관계에서 상대방의 사소한 하루와 미세한 기분에 주도적인 귀를 기울이는 '정서 촉진자'입니다. 문장 내 질문 비율(${questionRate}%)이 높아, 일상을 묻는 사소한 질문들로 상대방이 자연스럽게 안식을 품도록 사랑스러운 대화 마중물 역할을 세련되게 담당합니다.`;
      } else if (initiateRate > 55) {
        styleTag = "하루를 밝히는 모닝 엔진";
        traits.push("관계의 든든한 신호탄");
        traits.push("에너제틱 소통 리더");
        detailedDescription = `${sender}님은 연락의 첫 단추를 주저 없이 먼저 여는 활기찬 에너지를 가지고 있습니다. 대화 시작 비율(${initiateRate}%)에서 확인되듯, 일과의 시작이나 고요한 순간에 먼저 따뜻하게 손 내림으로써 안정적인 소통 루틴과 긍정적인 파동을 선사해 주는 굳건한 등대입니다.`;
      } else if (avgResponseTime > 0 && avgResponseTime < 60) {
        styleTag = "포근하고 기민한 리액션 러버";
        traits.push("빛보다 기민한 교감");
        traits.push("즉각적인 든든한 반응");
        detailedDescription = `${sender}님은 상대의 톡 소리에 언제나 열린 가슴으로 반응하는 다정한 면모를 지닙니다. 즉각적인 호응과 높은 밀집형 리포트 속도에서 정성을 전하며, '언제나 곁에 머문다'는 든든하고 소중한 정서적 유효성을 상대 마음에 깊게 심어줍니다.`;
      } else if (avgCharCount >= 30) {
        styleTag = "진심 어린 편지형 메신저";
        traits.push("사려 깊고 묵직한 온도");
        traits.push("스토리 메이커");
        detailedDescription = `${sender}님은 자소형 짧은 문글보다 풍부하고 영양 깊은 문장 구조로 따뜻한 이야기를 전합니다. 대화 평균 길이(평균 ${avgCharCount}자)가 입증하듯, 진심의 밀도가 고스란히 묻어나는 장문을 건넴으로써 서로의 일상을 고즈넉하게 엮어 나가는 매력적인 소통을 실천합니다.`;
      } else {
        styleTag = "센스 넘치는 명쾌한 소통가";
        traits.push("밀도 높은 간결 소통");
        traits.push("부담 없는 유연한 호흡");
        detailedDescription = `${sender}님은 가볍고 맑은 미들포맷 핑퐁을 즐깁니다. 지나친 글부담보다는 서로의 일상 루틴을 완벽히 존중하며 물 흐르듯 가볍고 쾌적한 관계를 유지하는, 편안한 힐링형 대화 패턴을 구사합니다.`;
      }
    } else if (mode === "team") {
      // Team / Student Project Mode specialized
      if (questionRate > 20) {
        styleTag = "맥락 가이드 브레인";
        traits.push("안건 피드백 전문가");
        traits.push("토의 흐름 환기");
        detailedDescription = `${sender}님은 팀 프로젝트 대화에서 회의 아젠다와 안건 확인을 집요하게 이끌어내는 생산형 리더입니다. 질문 및 환기 장치(${questionRate}%)의 발현율이 높으며, 팀원들이 각자의 작업을 선명히 보고할 수 있도록 토의 주파수를 쾌적하게 조율합니다.`;
      } else if (initiateRate > 50) {
        styleTag = "안건 추진 추진기";
        traits.push("선제적 토론 점화자");
        traits.push("일정과 신뢰 지킴이");
        detailedDescription = `${sender}님은 모임이나 팀플방의 적막을 깨고 할 일과 스케줄 조율을 먼저 제안하는 '행동 촉진기'입니다. 시작 비율(${initiateRate}%)이 높아, 조원들의 참여 의지를 환기시키고 정량 분석의 중심을 확실히 고정해 줍니다.`;
      } else if (avgCharCount >= 25) {
        styleTag = "명확한 정보 전달의 앵커";
        traits.push("사무적인 사려 깊음");
        traits.push("상세한 구조 서술");
        detailedDescription = `${sender}님은 대화 평균 글자수(${avgCharCount}자)에서 보듯, 자신이 수행한 기획이나 산출물을 조원들이 일목요연하게 파악할 수 있도록 세련된 문장 구조로 세세하게 서술합니다. 가독성과 책임감 높은 소통을 전단합니다.`;
      } else {
        styleTag = "민첩하고 확실한 서포터";
        traits.push("깔끔한 컨펌 요원");
        traits.push("최상의 의사결정 수렴");
        detailedDescription = `${sender}님은 복집하고 난무하는 팀방의 토의에서 불필요한 사설을 제거하고 군더더기 없이 확실하고 스마트한 의사 동조를 전파합니다. 덕분에 리소스 낭비를 줄이고 액션 위주로 업무가 수렴됩니다.`;
      }
    } else if (mode === "work") {
      // Workplace Mode
      if (questionRate > 20) {
        styleTag = "프로페셔널 안건 조율가";
        traits.push("안건 구체화 전문가");
        traits.push("명료한 이슈 트래커");
        detailedDescription = `${sender}님은 협업 스페이스에서 불명확한 태스크를 정교하게 쪼개고 질문을 던져 리스크를 예방하는 정갈한 지성형 리더 패턴입니다. 상대를 무안하지 않게 배려하며 이슈의 원인을 파악하는 훌륭한 파트너십을 지닙니다.`;
      } else if (initiateRate > 50) {
        styleTag = "업무 전개를 이끄는 퍼실리테이터";
        traits.push("명확한 목표 지표 제안");
        traits.push("협업 공간 주도력");
        detailedDescription = `${sender}님은 새로운 프로젝트 흐름이나 일일 진행도를 주도적으로 공유하여 협업의 투명성을 견인하는 앵커 소통가입니다. 업무가 지체되는 타이밍을 빠르게 식별하는 안목을 가집니다.`;
      } else if (avgCharCount >= 30) {
        styleTag = "정교하고 투명한 기술 서술가";
        traits.push("세련된 구조화 리포팅");
        traits.push("디테일 지향성 메신저");
        detailedDescription = `${sender}님은 모호한 논의 대신 디테일이 집약된 장글을 구사합니다. 업무 맥락과 작업 경과를 인수인계에 무리 없도록 풍부히 작성((${avgCharCount}자)함으로써 비즈니스 커뮤니케이션의 정석적 품격을 선보입니다.`;
      } else {
        styleTag = "핵심 요약형 스마트 클로저";
        traits.push("결론 지향적 업무 처리");
        traits.push("인적 자원 최적화");
        detailedDescription = `${sender}님은 불필요한 메일이나 메신저 피로도를 최소화하고, 단답과 임팩트 있는 알짜 피드백만으로 의사를 신속히 종결합니다. 수평적이고 세련된 업무 프로세스에 안성맞춤입니다.`;
      }
    } else {
      // Custom specialized context or relationships (가족, 친구 등)
      if (questionRate > 20) {
        styleTag = "세심한 흐름 파수꾼";
        traits.push("관심 어린 영양 공급");
        traits.push("호기심과 존중");
        detailedDescription = `${sender}님은 이 [${relationalDescriptor}]의 대화에서 질문과 안부를 풍부하게 교류(${questionRate}%)하는 촉매 역할을 합니다. 언제나 상대의 건강이나 컨디션을 정교하게 살피며 대화방의 활력을 한 단계 끌어올리는 주춧돌입니다.`;
      } else if (initiateRate > 50) {
        styleTag = "다정하게 먼저 이끄는 크리에이터";
        traits.push("소통 리더십 발휘");
        traits.push("긍정의 발걸음");
        detailedDescription = `${sender}님은 상대가 조용히 생활을 이어갈 때 반갑게 노크를 던져 관계의 불을 지피는 긍정 전파가입니다. 시작 비율(${initiateRate}%)이 우수하여 소통 관계에 명랑한 생명력을 부여해 줍니다.`;
      } else {
        styleTag = "의리 깊고 든든한 경청 지지자";
        traits.push("신뢰 가득한 보금자리");
        traits.push("안정적인 동반 조율");
        detailedDescription = `${sender}님은 부담 없이 상대의 주파수에 맞추는 탁월한 지지력을 발휘합니다. 일상 호흡에 맞추며 대화가 끊어지거나 이어질 때 늘 그 자리에서 변함없이 호응하는 깊고 단단한 우정을 선사합니다.`;
      }
    }

    analyzedReports.push({
      sender,
      messageCount: raw.messageCount,
      messageRate,
      wordCount: raw.wordCount,
      characterCount: raw.characterCount,
      avgCharCount,
      questionCount: raw.questionCount,
      questionRate,
      initiateCount: raw.initiateCount,
      initiateRate,
      endCount: raw.endCount,
      endRate,
      avgResponseTime,
      hourlyDistribution: raw.hourlyDistribution,
      dominantTimeLabel,
      styleTag,
      traits,
      detailedDescription
    });
  });

  return analyzedReports;
}
