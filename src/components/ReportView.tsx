/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, 
  Clock, 
  MessageSquare, 
  Heart, 
  BookOpen, 
  Layers, 
  ArrowRightLeft, 
  Scale, 
  Users, 
  Briefcase, 
  Sparkle,
  Zap,
  Skull,
  ShieldAlert,
  Flame,
  CornerDownRight,
  HelpCircle,
  TrendingDown,
  RefreshCw,
  EyeOff
} from "lucide-react";
import { ParticipantMetrics } from "../types";
import Disclaimer from "./Disclaimer";

interface ReportViewProps {
  participants: ParticipantMetrics[];
  title: string;
  mode?: string;
  customModeText?: string;
}

// -------------------------------------------------------------
// COGNITIVE DARK NEON MODE-DEPENDENT THEMES
// -------------------------------------------------------------
const modeThemes: Record<string, {
  name: string;
  emoji: string;
  wrapperClass: string;
  cardBg: string;
  cardBorder: string;
  textMuted: string;
  textCore: string;
  
  // Header Panel Styling
  headerBg: string;
  headerBorder: string;
  badgeClass: string;
  accentColor: string;
  
  // Svg / Chart styling
  chartBg: string;
  chartLine: string;
  chartFill: string;
  accentStroke: string;

  // Matrix bar styling
  matrixP1Bg: string;
  matrixP2Bg: string;
  matrixContainerClass: string;

  // Participant specific lines for analytical metrics
  participants: Array<{
    iconBg: string;
    barBg: string;
    stroke: string;
    fill: string;
  }>;
}> = {
  // 1. COUPLE MODE (밝고 화사한 딥로즈 핑크 & 화이트)
  couple: {
    name: "연인 & 썸 팩트폭격 모드",
    emoji: "💝",
    wrapperClass: "bg-gradient-to-br from-[#fdf2f8] via-[#f4efe3] to-[#fce7f3] p-4 sm:p-6 border border-rose-250/50 rounded-2xl shadow-xs",
    cardBg: "bg-[#faf6ec] border border-rose-150 shadow-xs",
    cardBorder: "border-rose-200",
    textMuted: "text-slate-500",
    textCore: "text-rose-950",
    headerBg: "bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 border border-rose-400 shadow-sm",
    headerBorder: "border-rose-300",
    badgeClass: "bg-white/20 text-white border-white/30",
    accentColor: "text-rose-600",
    chartBg: "bg-[#fbfaf6] border border-[#dfd8c2]",
    chartLine: "#f43f5e",
    chartFill: "rgba(244,63,94,0.05)",
    accentStroke: "#fb7185",
    matrixP1Bg: "bg-rose-500 shadow-xs",
    matrixP2Bg: "bg-slate-100 border border-slate-200",
    matrixContainerClass: "bg-rose-50 border border-rose-150",
    participants: [
      {
        iconBg: "bg-rose-100 text-rose-650",
        barBg: "bg-gradient-to-r from-rose-500 to-pink-500 shadow-xs",
        stroke: "#f43f5e",
        fill: "rgba(244,63,94,0.08)"
      },
      {
        iconBg: "bg-pink-100 text-pink-650",
        barBg: "bg-gradient-to-r from-pink-400 to-[#e11d48] shadow-xs",
        stroke: "#d946ef",
        fill: "rgba(217,70,239,0.04)"
      }
    ]
  },

  // 2. TEAM MODE (차분하고 산뜻한 에메랄드 그린 & 화이트)
  team: {
    name: "비협조 무임승차 처단 모드",
    emoji: "👥",
    wrapperClass: "bg-gradient-to-br from-[#f0fdf4] via-[#f4efe3] to-[#ecfdf5] p-4 sm:p-6 border border-emerald-250/50 rounded-2xl shadow-xs",
    cardBg: "bg-[#faf6ec] border border-emerald-150 shadow-xs",
    cardBorder: "border-emerald-200",
    textMuted: "text-slate-500",
    textCore: "text-emerald-950",
    headerBg: "bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 border border-emerald-500 shadow-sm",
    headerBorder: "border-emerald-400",
    badgeClass: "bg-white/20 text-white border-white/30",
    accentColor: "text-emerald-700",
    chartBg: "bg-[#fbfaf6] border border-[#dfd8c2]",
    chartLine: "#10b981",
    chartFill: "rgba(16,185,129,0.05)",
    accentStroke: "#34d399",
    matrixP1Bg: "bg-emerald-500 shadow-xs",
    matrixP2Bg: "bg-slate-100 border border-slate-200",
    matrixContainerClass: "bg-emerald-50 border border-emerald-150",
    participants: [
      {
        iconBg: "bg-emerald-100 text-emerald-705",
        barBg: "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xs",
        stroke: "#10b981",
        fill: "rgba(16,185,129,0.08)"
      },
      {
        iconBg: "bg-teal-100 text-teal-705",
        barBg: "bg-gradient-to-r from-teal-400 to-[#059669] shadow-xs",
        stroke: "#14b8a6",
        fill: "rgba(20,184,166,0.04)"
      }
    ]
  },

  // 3. WORK MODE (품격있고 이성적인 오피스 블루 & 화이트)
  work: {
    name: "비즈니스 기밀 감시 모드",
    emoji: "💼",
    wrapperClass: "bg-gradient-to-br from-[#eff6ff] via-[#f4efe3] to-[#e0f2fe] p-4 sm:p-6 border border-blue-250/50 rounded-2xl shadow-xs",
    cardBg: "bg-[#faf6ec] border border-blue-150 shadow-xs",
    cardBorder: "border-blue-200",
    textMuted: "text-slate-500",
    textCore: "text-blue-955",
    headerBg: "bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 border border-blue-500 shadow-sm",
    headerBorder: "border-blue-400",
    badgeClass: "bg-white/20 text-white border-white/30",
    accentColor: "text-blue-700",
    chartBg: "bg-[#fbfaf6] border border-[#dfd8c2]",
    chartLine: "#3b82f6",
    chartFill: "rgba(59,130,246,0.05)",
    accentStroke: "#60a5fa",
    matrixP1Bg: "bg-blue-500 shadow-xs",
    matrixP2Bg: "bg-slate-100 border border-slate-200",
    matrixContainerClass: "bg-blue-50 border border-blue-150",
    participants: [
      {
        iconBg: "bg-blue-105 text-blue-705",
        barBg: "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-xs",
        stroke: "#3b82f6",
        fill: "rgba(59,130,246,0.08)"
      },
      {
        iconBg: "bg-indigo-100 text-indigo-705",
        barBg: "bg-gradient-to-r from-indigo-400 to-[#2563eb] shadow-xs",
        stroke: "#6366f1",
        fill: "rgba(99,102,241,0.04)"
      }
    ]
  },

  // 4. CUSTOM MODE (세련되고 트렌디한 바이올렛 & 퍼플 & 화이트)
  custom: {
    name: "개인 소외감 해체 모드",
    emoji: "✨",
    wrapperClass: "bg-gradient-to-br from-[#f5f3ff] via-[#f4efe3] to-[#fae8ff] p-4 sm:p-6 border border-purple-250/50 rounded-2xl shadow-xs",
    cardBg: "bg-[#faf6ec] border border-purple-150 shadow-xs",
    cardBorder: "border-purple-200",
    textMuted: "text-slate-500",
    textCore: "text-purple-955",
    headerBg: "bg-gradient-to-br from-purple-650 via-violet-600 to-purple-755 border border-purple-500 shadow-sm",
    headerBorder: "border-purple-400",
    badgeClass: "bg-white/20 text-white border-white/30",
    accentColor: "text-purple-700",
    chartBg: "bg-[#fbfaf6] border border-[#dfd8c2]",
    chartLine: "#a855f7",
    chartFill: "rgba(168,85,247,0.05)",
    accentStroke: "#c084fc",
    matrixP1Bg: "bg-purple-500 shadow-xs",
    matrixP2Bg: "bg-slate-100 border border-slate-200",
    matrixContainerClass: "bg-purple-50 border border-purple-150",
    participants: [
      {
        iconBg: "bg-purple-100 text-purple-705",
        barBg: "bg-gradient-to-r from-purple-500 to-violet-500 shadow-xs",
        stroke: "#a855f7",
        fill: "rgba(168,85,247,0.08)"
      },
      {
        iconBg: "bg-violet-100 text-violet-705",
        barBg: "bg-gradient-to-r from-violet-400 to-[#7c3aed] shadow-xs",
        stroke: "#8b5cf6",
        fill: "rgba(139,92,246,0.04)"
      }
    ]
  }
};

// Brutal Translate Bank
const phraseTomb = {
  couple: [
    { text: "아 그래? ㅋㅋㅋ", rawTruth: "더 이상 화제를 이어가기 귀찮으니 빨리 이 대화를 음소거하고 유튜브를 보러 가겠다는 숨은 거절의 시그널입니다.", level: "매콤" },
    { text: "바빠서 답장 늦었어 ㅠㅠ", rawTruth: "팩트: 그 사람도 하루에 80번 이상 휴대폰 보며 인스타 릴스를 봅니다. 당신 메세지를 남겨둔 건 우선순위가 바닥이라는 소리입니다.", level: "핵불닭" },
    { text: "나 피곤해서 먼저 잘게!", rawTruth: "침대에 누워 페이스북/인스타를 보거나 친구들이랑 롤 랭겜 하러 들어가는 길입니다.", level: "매콤" },
    { text: "나중에 연락할게~", rawTruth: "'그 나중은 오지 않는다'에 전재산을 겁니다. 예의상 친 도피용 방어벽입니다.", level: "핵불닭" }
  ],
  team: [
    { text: "제가 지금 밖이라 이따 확인할게요!", rawTruth: "무임승차 승객의 단골 멘트. 과제가 성패를 가르든 말든 다른 성실한 조원이 독박을 쓰고 해주길 존버하는 전략입니다.", level: "핵불닭" },
    { text: "그거 제가 할까요...?", rawTruth: "해보라고 대답하면 '아 근데 제가 피피티는 잘 못 만져서...'라면서 즉시 뒤로 물러날 궁리를 하는 밑장빼기 수법입니다.", level: "매콤" },
    { text: "자료조사는 다 보냈습니다~", rawTruth: "네이버 블로그 1페이지 글 통째로 복사해서 메모장에 띡 던져놓고 1인분 다 했다고 정신승리하는 중입니다.", level: "핵불닭" }
  ],
  work: [
    { text: "네 알겠습니다.", rawTruth: "네 귀찮으니 그만 떠드세요. 퇴근 시간 3분 남았는데 긴 카톡 보내는 당신이 끔찍하게 느껴집니다.", level: "매콤" },
    { text: "퇴근후 확인해보겠습니다!", rawTruth: "메시지 읽씹하고 내일 출근 시간 전까지 절대 방을 안 보겠다는 선전포고입니다.", level: "매콤" },
    { text: "아, 그 부분은 몰랐네요.", rawTruth: "인수인계 안 한 당신 탓이거나 내 업무 아니니 알아서 하라는 유려한 책임 회피입니다.", level: "핵불닭" }
  ],
  custom: [
    { text: "아 진짜 신기하다~", rawTruth: "리액션이 고장 났습니다. 고개를 한참 끄덕이지만 머릿속은 '저 얘기가 언제 끝날까'에 집중되어 있습니다.", level: "매콤" },
    { text: "언제 밥 한번 먹자!", rawTruth: "약속 잡지 마세요. 이번 세기 안에는 밥 안 먹습니다. 사교적 영혼 없는 매너입니다.", level: "핵불닭" }
  ]
};

// Prescription database
const prescriptionBox = {
  couple: {
    title: "🏥 짝사랑 주파수 탈출 응급 조치 처방전",
    scenarios: [
      {
        id: "stop_texting",
        title: "🚫 '선톡 전면 중단' 72시간 셧다운 챌린지",
        effect: "상대가 당신을 공기로 보는지 인간으로 보는지 3일 만에 구분하는 극약 처방. 3일간 절대 선톡하지 마십시오. 만약 선톡이 안 온다면, 죄송하지만 그 관계는 죽은 자식 부랄 만지기입니다.",
        dangerScore: "★★★★★ (돌아가기 불가능)"
      },
      {
        id: "three_times_slow",
        title: "🐢 '상대방 답장 속도 × 3.5배' 미러링 전술",
        effect: "상대가 22분 만에 답하면 당신은 80분 만에 답하고, 상대가 4시간 뒤에 띡 대답하면 당신은 다음 날 아침에 대답하십시오. 똑같이 가해자가 되어보는 상대적 미러링 훈련입니다.",
        dangerScore: "★★★☆☆ (자존심 회복용)"
      },
      {
        id: "abandon_hope",
        title: "🗑️ 미련 상자 초기화 및 연락처 삭제",
        effect: "차갑게 식어버린 조개껍데기에서 진주를 찾는 미련은 그만두세요. 대화량 80%가 당신의 짝사랑이라면, 이미 당신의 가치는 상대에게 바닥입니다. 더 품격 떨어지기 전에 연락 접고 도망치세요.",
        dangerScore: "★★★★★ (영혼의 자유 획득)"
      }
    ]
  },
  team: {
    title: "🚨 무임승차 파괴형 전술 사령실",
    scenarios: [
      {
        id: "exclude_member",
        title: "✂️ 최종 PPT 이름 즉시 투명화 처리",
        effect: "카톡 차단하고 이름 슬라이드에서 흔적도 없이 지운 뒤 교수님 메일로 '기여도 0%'를 통보하십시오. 자비가 없는 고양이 목에 방울 달기 작전입니다.",
        dangerScore: "★★★★☆"
      },
      {
        id: "fake_schedule",
        title: "⏱️ '가짜 데드라인' 선조치 및 선날리기",
        effect: "마감일보다 무려 48시간 일찍 끝내야 교수님이 보신다고 거짓 일정을 퍼트리십시오. 그래야 겨우 턱걸이로 가공 불가능한 쓰레기 과제라도 들고 옵니다.",
        dangerScore: "★★☆☆☆"
      }
    ]
  },
  work: {
    title: "🛡️ 직무 스트레스 오프용 철벽 차단 프로토콜",
    scenarios: [
      {
        id: "work_silence",
        title: "🔇 퇴근 즉시 알림 무음 & 사리분별 차단",
        effect: "오후 6시 이후 카톡은 안읽씹 처리하십시오. 미치지 않고선 퇴근 후 사장이나 거래처 단톡방을 켜지 않는 게 생존을 좌우합니다.",
        dangerScore: "★★★☆☆"
      }
    ]
  },
  custom: {
    title: "🔮 아웃사이더 탈출 및 인싸 매너 시뮬레이터",
    scenarios: [
      {
        id: "say_no",
        title: "🙅 싫으면 싫다고 말할 수 있는 성대 생성술",
        effect: "남의 시선에 지배당해서 '아 그래? 좋아 좋은 생각이야'만 하느라 본인의 진심을 은폐하고 있습니다. 단칼에 거절하는 법을 하루에 한 번 연습하세요.",
        dangerScore: "★★☆☆☆"
      }
    ]
  }
};

export default function ReportView({ participants, title, mode = "couple", customModeText = "" }: ReportViewProps) {
  if (participants.length === 0) return null;

  const currentMode = (modeThemes[mode] ? mode : "couple") as "couple" | "team" | "work" | "custom";
  const activeTheme = modeThemes[currentMode];

  // Specific state for interactives
  const [selectedPhrase, setSelectedPhrase] = useState<number | null>(null);
  const [activeSolutionId, setActiveSolutionId] = useState<string | null>(null);
  const [realityLevel, setRealityLevel] = useState<"mild" | "angry" | "fact">("fact");

  const totalMsgs = participants.reduce((sum, p) => sum + p.messageCount, 0);

  // Participant data mapping (usually two persons, let's ensure safety with fallback values)
  const p1 = participants[0];
  const p2 = participants[1] || {
    sender: "상대방",
    messageCount: 0,
    messageRate: 0,
    wordCount: 0,
    characterCount: 0,
    avgCharCount: 0,
    questionCount: 0,
    questionRate: 0,
    initiateCount: 0,
    initiateRate: 0,
    endCount: 0,
    endRate: 0,
    avgResponseTime: 0,
    hourlyDistribution: Array(24).fill(0),
    dominantTimeLabel: "정보 없음",
    styleTag: "관망자",
    traits: ["수동적 소통"],
    detailedDescription: "대화 데이터 비중이 적거나 불완전합니다."
  };

  // Calculations for symmetry audit
  const msgRateDiff = Math.abs(p1.messageRate - p2.messageRate);
  const charLengthDiffFactor = p2.avgCharCount > 0 ? p1.avgCharCount / p2.avgCharCount : 1;
  const questionRateDiff = Math.abs(p1.questionRate - p2.questionRate);
  
  // Specific red-flag flags
  const isOneSidedVolume = p1.messageRate >= 68 || p2.messageRate >= 68;
  const isOneSidedLength = (p1.avgCharCount >= 22 && p2.avgCharCount <= 7) || (p2.avgCharCount >= 22 && p1.avgCharCount <= 7);
  const isOneSidedCuriosity = (p1.questionRate >= 18 && p2.questionRate <= 3) || (p2.questionRate >= 18 && p1.questionRate <= 3);
  const isOneSidedInitiation = (p1.initiateRate >= 75 && p2.initiateRate <= 15) || (p2.initiateRate >= 75 && p1.initiateRate <= 15);

  const activeWarningsCount = [isOneSidedVolume, isOneSidedLength, isOneSidedCuriosity, isOneSidedInitiation].filter(Boolean).length;

  // Synergy or Reality Verdict
  const getSymmetryVerdict = () => {
    // Determine who is holding the oxygen mask
    const activeSub = p1.messageCount > p2.messageCount ? p1 : p2;
    const passiveSub = p1.messageCount > p2.messageCount ? p2 : p1;

    if (activeWarningsCount >= 3) {
      return {
        status: "danger",
        title: "🚨 매우 불안정한 일방통행형 기류 (극심한 짝사랑 경보)",
        badge: "unrequited",
        verdictText: `대화의 밸런스가 완전히 기괴합니다. ${activeSub.sender}님이 인공호흡기를 억지로 잡고 필사적으로 기류를 수혈하는 반면, ${passiveSub.sender}님은 단물 다 빠진 껌처럼 무성의하고 무가치한 '의무방어 단답'만을 내뱉으며 산소치료기를 발로 차고 있습니다. 억지로 부채질해봐야 소용없는 관계의 불장난일 뿐입니다. 데이터는 참회하지 않습니다. 이 사람은 당신에게 관심이 0.1%도 없습니다. 매달리는 정성을 반으로 접어 즉시 현생으로 도피하십시오. 저주가 아니라 완벽한 디지털 수리 통계의 냉철한 팩트입니다.`,
        colorClass: "bg-red-500/10 border-red-500 text-red-100",
        indicatorText: "일방적 구걸 위험군 (산소 호흡 끊김)"
      };
    } else if (activeWarningsCount >= 1) {
      return {
        status: "warning",
        title: "⚠️ 전형적인 비대칭 흐름 (주의 및 가치 재고 필요)",
        badge: "unbalanced",
        verdictText: `두 사람의 소통 온도 차이가 심각한 감기 기운을 머금고 있습니다. 한쪽(${activeSub.sender} 님)은 질문도 많고 답변 길이도 푸짐하게 가득 차 있지만, 상대방(${passiveSub.sender} 님)은 수동적으로 대답이나 해주며 '예의만 장착한 소통 교제성'을 보여줍니다. 성격 차이라는 한가한 핑계보다, 그냥 '나만 노력하고 있나?'라는 찝찝한 직관의 팩트가 맞습니다. 소중한 카톡 에너지를 낭비하지 말고 잠시 손을 떼고 상대방이 선톡하는지 감시해 보세요.`,
        colorClass: "bg-amber-500/10 border-amber-500 text-amber-100",
        indicatorText: "대칭 밸런스 불안정"
      };
    } else {
      return {
        status: "stable",
        title: "✨ 균형 잡힌 상호 호혜 대칭 소통 (건강한 양방향 흐름)",
        badge: "stable-symmetry",
        verdictText: "전혀 상처 받을 필요가 없는 정갈한 핑퐁 대칭성입니다. 질문의 배분, 선톡의 주파수, 답장의 묵직함이 고르게 영양분을 나누고 있습니다. 비뚤어진 외사랑이나 무성의한 단답의 상처가 보이지 않는, 흔치 않은 데이터 청정 구역입니다. 이 조화로운 주파수를 해치지 말고 곱게 키워나가세요.",
        colorClass: "bg-emerald-500/10 border-emerald-500 text-emerald-100",
        indicatorText: "상호 대칭 조화 지표 우수"
      };
    }
  };

  const verdict = getSymmetryVerdict();

  // Peak Hours calculator
  const hourlySums = Array(24).fill(0);
  participants.forEach(p => {
    p.hourlyDistribution.forEach((val, hour) => {
      hourlySums[hour] += val;
    });
  });

  // SVG Chart Dimensions
  const chartHeight = 120;
  const chartWidth = 500;

  const getSvgCoordinates = (distribution: number[]) => {
    const maxVal = Math.max(...distribution, 1);
    return distribution.map((val, index) => {
      const x = (index / 23) * chartWidth;
      const y = chartHeight - (val / maxVal) * (chartHeight - 20) - 10;
      return `${x},${y}`;
    }).join(" ");
  };

  // Specific brutal translation list derived from current mode
  const currentPhrases = phraseTomb[currentMode] || phraseTomb.couple;
  const activePrescription = prescriptionBox[currentMode] || prescriptionBox.couple;

  return (
    <div id="report-view-root" className={`space-y-8 animate-fade-in text-slate-800 rounded-xl ${activeTheme.wrapperClass}`}>
      
      {/* 1. Immersive Dynamic Theme Header */}
      <div id="report-top-summary" className={`rounded-xl p-6 shadow-md relative overflow-hidden ${activeTheme.headerBg} ${activeTheme.headerBorder}`}>
        {/* Decorative Grid glow indicator */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full filter blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-mono font-black tracking-widest rounded border ${activeTheme.badgeClass}`}>
                {activeTheme.emoji} {activeTheme.name}
              </span>
              <span className="inline-flex items-center gap-0.5 px-2 bg-rose-500/30 text-rose-100 text-[10px] font-extrabold rounded border border-rose-550/30">
                <Flame className="w-3 h-3 text-rose-200 mr-0.5 animate-pulse" />
                정량 필터링 기반 팩폭 모드
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-sans text-white tracking-tight mt-1">
              {title || "대화 소통 분석 리포트"}
            </h2>
          </div>
          <div className="text-left bg-black/20 backdrop-blur-xs px-4 py-2 rounded-lg border border-white/10">
            <span className="text-[9px] text-white/80 font-mono font-bold block mb-0.5">VERIFIED LINES</span>
            <p className="text-3xl font-mono font-black text-white tracking-tight">
              {totalMsgs.toLocaleString()} <span className="text-xs font-normal text-white/80">건</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs text-white/90 relative z-10">
          <div className="bg-black/15 p-3 rounded-lg border border-white/5">
            <span className="text-[9px] text-white/70 font-bold block mb-1">인물 통계</span>
            <span className="text-sm font-bold font-mono text-white block">{participants.length}명 대조 완료</span>
          </div>
          <div className="bg-black/15 p-3 rounded-lg border border-white/5">
            <span className="text-[9px] text-white/70 font-bold block mb-1">팩트진단 상태</span>
            <span className="text-sm font-bold text-yellow-300 block truncate">
              {verdict.indicatorText}
            </span>
          </div>
          <div className="bg-black/15 p-3 rounded-lg border border-white/5">
            <span className="text-[9px] text-white/70 font-bold block mb-1">총 누적 질문수</span>
            <span className="text-sm font-bold font-mono text-white block">
              {participants.reduce((sum, p) => sum + p.questionCount, 0)}회 발산
            </span>
          </div>
          <div className="bg-black/15 p-3 rounded-lg border border-white/5">
            <span className="text-[9px] text-white/70 font-bold block mb-1">진단 정밀수치</span>
            <span className="text-sm font-bold text-white block truncate">
              {msgRateDiff}% 격차 발생
            </span>
          </div>
        </div>
      </div>

      {/* 2. BRUTALLY HONEST "FACT-BOMB" (뼈 때리는 팩폭) VERDICT CARD */}
      <div 
        id="brutal-reality-cabinet" 
        className={`border rounded-xl p-5 sm:p-6 shadow-sm relative overflow-hidden transition-all duration-300 ${realityLevel === "fact" ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}
      >
        <div className="absolute top-0 right-0 p-2 bg-red-100 border-l border-b border-red-200 text-[9px] font-mono tracking-widest text-red-700 rounded-bl font-black">
          NO WRAPPING • 100% RAW
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Skull className="w-6 h-6 text-red-500 shrink-0 animate-bounce" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-red-650">
                수치 기반 무자비한 기류 대조 결과
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">Statistical Reality Assessment</p>
            </div>
          </div>
          
          <div className="bg-[#faf6ec] border border-red-200 p-4 rounded-lg text-slate-855 leading-relaxed font-sans text-xs sm:text-sm shadow-inner">
            <p className="font-extrabold text-red-650 mb-2 border-b border-red-100 pb-1">
              [ 뼈 때리는 뇌피셜 대화 해부 ]
            </p>
            <p className="whitespace-pre-line text-slate-750 leading-relaxed">
              {verdict.verdictText}
            </p>
          </div>
        </div>

        {/* Dynamic Warning Indicator Pills */}
        <div className="mt-4 pt-4 border-t border-slate-250 grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className={`p-2.5 rounded-lg border ${isOneSidedVolume ? "bg-red-50/50 border-red-200 text-red-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
            <span className="block text-[9px] text-slate-500 uppercase">대화 분량 불균형</span>
            <span className="font-black text-sm block mt-0.5 text-slate-800">{msgRateDiff}% 차이</span>
            <span className="text-[9px] opacity-85">{isOneSidedVolume ? "🚨 극단적 치우침" : "✓ 정상 범위"}</span>
          </div>

          <div className={`p-2.5 rounded-lg border ${isOneSidedLength ? "bg-red-50/50 border-red-200 text-red-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
            <span className="block text-[9px] text-slate-500 uppercase">답장 글자수 비대칭</span>
            <span className="font-black text-sm block mt-0.5 text-slate-800">{charLengthDiffFactor.toFixed(1)}배 편차</span>
            <span className="text-[9px] opacity-85">{isOneSidedLength ? "🚨 상대가 가성비 답함" : "✓ 티키타카 우수"}</span>
          </div>

          <div className={`p-2.5 rounded-lg border ${isOneSidedCuriosity ? "bg-red-50/50 border-red-200 text-red-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
            <span className="block text-[9px] text-slate-500 uppercase">질문 주도권 쏠림</span>
            <span className="font-black text-sm block mt-0.5 text-slate-800">{questionRateDiff}% 차이</span>
            <span className="text-[9px] opacity-85">{isOneSidedCuriosity ? "🚨 한 사람만 지질하게 묻는 중" : "✓ 대등한 호기심"}</span>
          </div>

          <div className={`p-2.5 rounded-lg border ${isOneSidedInitiation ? "bg-red-50/50 border-red-200 text-red-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
            <span className="block text-[9px] text-slate-500 uppercase">시동(선톡) 비대칭</span>
            <span className="font-black text-sm block mt-0.5 text-slate-800">{Math.abs(p1.initiateRate - p2.initiateRate)}% 격차</span>
            <span className="text-[9px] opacity-85">{isOneSidedInitiation ? "🚨 시동 모터 고장남" : "✓ 안부 균형"}</span>
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC CLICKABLE INTERACTIVE COMPONENT - "속마음 해킹 번역기" */}
      <div id="interactive-mind-hack" className="bg-[#faf6ec] border border-[#dfd8c2] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                🔌 대화 상대방의 '속마음 필터' (문구 클릭 번역기)
              </h4>
              <p className="text-[10px] text-slate-500">
                상대의 대표 문구를 클릭해서 대화 이면의 진짜 의미를 까발립니다.
              </p>
            </div>
          </div>
          <span className="text-[9px] px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-505/30 rounded font-black">
            CLICK TO UNLOCK
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* List of phrases */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 font-bold block mb-1">상대방이 자주 쓰는 회피 문구 유형</span>
            {currentPhrases.map((item, idx) => (
              <button
                key={idx}
                id={`mind-hack-phrase-${idx}`}
                onClick={() => setSelectedPhrase(idx)}
                className={`w-full text-left p-3 rounded-lg text-xs font-bold border transition-all flex justify-between items-center cursor-pointer ${
                  selectedPhrase === idx
                    ? "bg-amber-50 border-amber-450 text-slate-900 shadow-sm"
                    : "bg-slate-50 border-slate-200 hover:border-slate-350 text-slate-700"
                }`}
              >
                <span>"{item.text}"</span>
                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                  item.level === "핵불닭" ? "bg-red-100 text-red-650" : "bg-amber-100 text-amber-650"
                }`}>
                  {item.level}
                </span>
              </button>
            ))}
          </div>

          {/* Translation Result Panel */}
          <div className="bg-[#fbfaf6] border border-[#dfd8c2] p-4 rounded-lg flex flex-col justify-between min-h-[140px]">
            {selectedPhrase !== null ? (
              <div className="space-y-3 animate-fade-in text-xs">
                <div className="flex items-center gap-1">
                  <CornerDownRight className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-600 font-black">무보정 번역 팩트</span>
                </div>
                <p className="text-slate-800 font-semibold leading-relaxed">
                  "{currentPhrases[selectedPhrase].text}" 이라는 예의를 한 껍질 벗겨보면:
                </p>
                <p className="p-3 bg-white border border-amber-200 text-amber-800 italic rounded leading-relaxed shadow-xs">
                  {currentPhrases[selectedPhrase].rawTruth}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-slate-400 h-full py-6 space-y-2">
                <HelpCircle className="w-7 h-7 text-slate-400" />
                <p className="text-xs font-bold">좌측의 문장 중 하나를 클릭하여</p>
                <p className="text-[10px]">상대의 무의식 철옹성 속마음을 복호화하세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. CLINICAL BRUTAL SOLUTION CABINET - "팩폭 처방전 & 관계 생존 솔루션 우체통" */}
      <div id="brutal-prescription-center" className="bg-[#faf6ec] border border-[#dfd8c2] rounded-xl p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                {activePrescription.title}
              </h4>
              <p className="text-[10px] text-slate-500">
                대화 데이터에서 우려되는 비대칭을 상쇄하기 위해 당신이 취해야 할 최선 조치
              </p>
            </div>
          </div>
          
          {/* Segmented spice controls */}
          <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-lg text-[10px] font-black font-mono">
            <button 
              onClick={() => setRealityLevel("mild")}
              className={`px-2 py-1 rounded transition-all cursor-pointer ${realityLevel === "mild" ? "bg-white text-emerald-600 shadow-xs" : "text-slate-500"}`}
            >
              순한맛
            </button>
            <button 
              onClick={() => setRealityLevel("angry")}
              className={`px-2 py-1 rounded transition-all cursor-pointer ${realityLevel === "angry" ? "bg-white text-amber-600 shadow-xs" : "text-slate-500"}`}
            >
              매운맛
            </button>
            <button 
              onClick={() => setRealityLevel("fact")}
              className={`px-2 py-1 rounded transition-all cursor-pointer ${realityLevel === "fact" ? "bg-red-500 text-white shadow-xs" : "text-slate-500"}`}
            >
              불닭팩폭
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {activePrescription.scenarios.map((sc) => (
            <div 
              key={sc.id}
              onClick={() => setActiveSolutionId(activeSolutionId === sc.id ? null : sc.id)}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                activeSolutionId === sc.id 
                  ? "bg-red-50 border-red-400 shadow-sm ring-1 ring-red-400/20" 
                  : "bg-[#fbfaf6] border-[#dfd8c2] hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-black text-slate-800">{sc.title}</span>
                <span className="text-[9px] font-mono text-red-600">{sc.dangerScore}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">실행 난이도 지표</p>
              
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs">
                {activeSolutionId === sc.id ? (
                  <div className="space-y-2 animate-fade-in text-slate-700 leading-relaxed font-sans">
                    <div className="p-2.5 bg-[#fbfaf6] rounded border border-red-200 text-[11px]">
                      {realityLevel === "mild" && "그나마 다치지 않는 가벼운 완곡화 조치: 그냥 약간의 쿨 타임을 가져도 좋습니다."}
                      {realityLevel === "angry" && "관계 재정립 공격수: 상대방이 무관심하다는 점을 확실히 인지하고, 밀당 전술을 수립하여 반격하십시오."}
                      {realityLevel === "fact" && `[무보정 피의 사발] ${sc.effect}`}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 font-bold flex items-center justify-between">
                    <span>클릭하여 구체적인 처방 전술 열기</span>
                    <span>▼</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Deep Detail Grid */}
      <div id="participant-analytical-matrix" className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-slate-500" />
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest font-mono">
            대화 참여 대원 상세 수치 대조
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {participants.slice(0, 2).map((person, index) => {
            const theme = activeTheme.participants[index] || activeTheme.participants[0];
            return (
              <div 
                id={`participant-card-${person.sender}`}
                key={person.sender} 
                className={`rounded-xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm ${activeTheme.cardBg}`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center font-black text-xs ${theme.iconBg}`}>
                        {person.sender.substring(0, 1)}
                      </div>
                      <div>
                        <span className="text-sm font-black text-slate-800 font-mono block">
                          {person.sender} 님
                        </span>
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block mt-0.5">
                          {person.styleTag}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold border border-slate-200">
                      점유 {person.messageCount} 건
                    </span>
                  </div>

                  {/* Blunt Character details */}
                  <div className="text-xs text-slate-705 leading-relaxed bg-slate-50 border border-slate-200 p-3.5 rounded font-sans">
                    <div className="text-[9px] font-black text-red-650 uppercase tracking-wider mb-1">인물 상태 진단 요약</div>
                    <p className="leading-relaxed">
                      {person.detailedDescription}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {person.traits.map((trObj, idx) => (
                      <span key={idx} className="text-[9px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">
                        #{trObj}
                      </span>
                    ))}
                    <span className="text-[9px] bg-slate-200/50 border border-slate-300/40 text-slate-600 px-2 py-0.5 rounded font-bold">
                      ⏰ {person.dominantTimeLabel}
                    </span>
                  </div>
                </div>

                {/* Analytical progress list */}
                <div className="mt-5 pt-4 border-t border-slate-200 space-y-3.5 text-[11px] font-mono">
                  <div>
                    <div className="flex justify-between items-center text-slate-500 mb-1">
                      <span>말수 점유 비중</span>
                      <span className="font-extrabold text-slate-800">{person.messageRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${theme.barBg}`} style={{ width: `${person.messageRate}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-slate-400 mb-1">
                      <span>질문 빈도 (주도적 호기심 비율)</span>
                      <span className="font-extrabold text-slate-200">{person.questionRate}% ({person.questionCount}회)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full ${theme.barBg}`} style={{ width: `${Math.min(100, person.questionRate * 3.3)}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-slate-400 mb-1">
                      <span>평균 답장 길이</span>
                      <span className="font-extrabold text-slate-200">{person.avgCharCount} 글자</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full ${theme.barBg}`} style={{ width: `${Math.min(100, person.avgCharCount * 2.5)}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-slate-400 mb-1">
                      <span>선톡 개시 성공 기여도</span>
                      <span className="font-extrabold text-slate-200">{person.initiateRate}% ({person.initiateCount}회)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full ${theme.barBg}`} style={{ width: `${person.initiateRate}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Hourly Distribution Line Chart */}
      <div id="hourly-activity-distribution" className="bg-[#faf6ec] border border-[#dfd8c2] rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-600 shrink-0" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest font-mono">
                하루 시간대별 대화 기류 분포
              </h3>
            </div>
            <p className="text-[11px] text-slate-500">
              상대방과 나의 대화 에너지가 교차하며 격접하는 시간대를 정밀 시계열 분포 모델로 가독합니다.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] sm:text-xs">
            {participants.slice(0, 2).map((person, index) => {
              const theme = activeTheme.participants[index] || activeTheme.participants[0];
              return (
                <span key={person.sender} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: theme.stroke }}></span>
                  <span className="text-slate-700 font-semibold">{person.sender}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* SVG Area Line Chart Container with Refined Light Styling */}
        <div className={`relative w-full overflow-hidden pt-3 rounded-lg max-h-[140px] ${activeTheme.chartBg}`}>
          <svg 
            id="hourly-svg-canvas"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="rgba(0,0,0,0.04)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1={chartHeight - 10} x2={chartWidth} y2={chartHeight - 10} stroke="rgba(0,0,0,0.08)" strokeWidth="1" />

            {/* Render Area shapes & paths */}
            {participants.slice(0, 2).map((person, index) => {
              const theme = activeTheme.participants[index] || activeTheme.participants[0];
              const coords = getSvgCoordinates(person.hourlyDistribution);
              const areaCoords = `0,${chartHeight} ${coords} ${chartWidth},${chartHeight}`;
              return (
                <g key={person.sender}>
                  <polygon points={areaCoords} fill={theme.fill} />
                  <polyline points={coords} fill="none" stroke={theme.stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {person.hourlyDistribution.map((val, hIdx) => {
                     const maxVal = Math.max(...person.hourlyDistribution, 1);
                     if (val === maxVal && val > 0) {
                       const cx = (hIdx / 23) * chartWidth;
                       const cy = chartHeight - (val / maxVal) * (chartHeight - 20) - 10;
                       return (
                         <circle key={hIdx} cx={cx} cy={cy} r="3.5" fill="#ffffff" stroke={theme.stroke} strokeWidth="2" />
                       );
                     }
                     return null;
                  })}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex justify-between mt-2.5 px-1 text-[9px] text-slate-500 font-bold uppercase tracking-widest border-t border-slate-100 pt-2 font-mono">
          <span>00:00 새벽</span>
          <span>06:00 오전</span>
          <span>12:00 정오</span>
          <span>18:00 오후</span>
          <span>24:00 자정</span>
        </div>
      </div>

      {/* 7. Mutually Supplementary Visual Matrix Grid */}
      <div id="supplementary-matrix" className="bg-[#faf6ec] border border-[#dfd8c2] rounded-xl p-5 space-y-4 shadow-sm">
        <div id="matrix-header" className="flex items-center gap-1.5">
          <ArrowRightLeft className="w-4 h-4 text-slate-650" />
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
            소통 파고 및 주도권 대치 구역
          </h4>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed font-sans">
          서로가 투여하는 대화 에너지의 상대 배율을 100% 비율로 환산한 정량적 대조선입니다. 한쪽이 기괴하게 길다면 밸런스가 파탄 난 상태를 반증합니다.
        </p>

        {participants.length >= 2 && (
          <div id="matrix-comparison-items" className="space-y-4 pt-1 text-xs">
            
            {/* Item 1: Topics / Questions */}
            <div className={`space-y-1.5 px-4 py-3 border rounded ${activeTheme.matrixContainerClass}`}>
              <div className="flex justify-between text-[11px] font-bold text-slate-700">
                <span>💡 질문 및 대화 유도 영역 ({p1.sender} 님)</span>
                <span>🗣️ 수동형 동지애 영역 ({p2.sender} 님)</span>
              </div>
              <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div 
                  className={`transition-all duration-500 ${activeTheme.matrixP1Bg}`} 
                  style={{ width: `${Math.max(15, Math.min(85, (p1.questionRate / (p1.questionRate + p2.questionRate || 1)) * 100))}%` }}
                ></div>
                <div className={`flex-1 transition-all duration-500 ${activeTheme.matrixP2Bg}`}></div>
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono font-bold tracking-wider pt-0.5">
                <span>{p1.sender} ({p1.questionRate}%)</span>
                <span>{p2.sender} ({p2.questionRate}%)</span>
              </div>
            </div>

            {/* Item 2: Starters / Initiations */}
            <div className={`space-y-1.5 px-4 py-3 border rounded ${activeTheme.matrixContainerClass}`}>
              <div className="flex justify-between text-[11px] font-bold text-slate-700">
                <span>🚀 선톡 시동 개시 영역 ({p1.sender} 님)</span>
                <span>🤝 수동 반응 및 흐름 수렴 ({p2.sender} 님)</span>
              </div>
              <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div 
                  className={`transition-all duration-500 ${activeTheme.matrixP1Bg}`} 
                  style={{ width: `${Math.max(15, Math.min(85, (p1.initiateRate / (p1.initiateRate + p2.initiateRate || 1)) * 100))}%` }}
                ></div>
                <div className={`flex-1 transition-all duration-500 ${activeTheme.matrixP2Bg}`}></div>
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono font-bold tracking-wider pt-0.5">
                <span>{p1.sender} ({p1.initiateRate}%)</span>
                <span>{p2.sender} ({p2.initiateRate}%)</span>
              </div>
            </div>

          </div>
        )}
      </div>

      <Disclaimer variant="full" />
    </div>
  );
}
