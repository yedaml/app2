/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  UploadCloud, 
  Clipboard, 
  RefreshCw,
  Eye,
  ShieldCheck,
  Heart,
  Users,
  Briefcase,
  PenTool,
  Check,
  Skull,
  Zap,
  Flame,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { parseChatLog, analyzeChatData } from "./utils/chatParser";
import { ParticipantMetrics } from "./types";
import ReportView from "./components/ReportView";
import SavedReports from "./components/SavedReports";
import Disclaimer from "./components/Disclaimer";

export default function App() {
  const [rawText, setRawText] = useState("");
  const [activeTitle, setActiveTitle] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedParticipants, setAnalyzedParticipants] = useState<ParticipantMetrics[]>([]);
  const [activeReportId, setActiveReportId] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState("");

  // Mode Selection States
  const [selectedMode, setSelectedMode] = useState<"couple" | "team" | "work" | "custom">("couple");
  const [customModeText, setCustomModeText] = useState("");

  const modeStyles = {
    couple: {
      accentText: "text-rose-500",
      accentBg: "bg-rose-50",
      buttonBg: "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-650 focus:ring-rose-450 shadow-md",
      pulseBorder: "border-rose-100 border-t-rose-500",
      iconColor: "text-rose-505",
      textareaFocus: "focus:border-rose-400/80 border-slate-250",
      logoClass: "bg-rose-500 shadow-sm",
      activeBorder: "border-rose-400 bg-rose-50 text-rose-700",
      inactiveBorder: "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
    },
    team: {
      accentText: "text-emerald-650",
      accentBg: "bg-emerald-50",
      buttonBg: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-650 focus:ring-emerald-450 shadow-md",
      pulseBorder: "border-emerald-100 border-t-emerald-550",
      iconColor: "text-emerald-555",
      textareaFocus: "focus:border-emerald-400/80 border-slate-250",
      logoClass: "bg-emerald-550 shadow-sm",
      activeBorder: "border-emerald-450 bg-emerald-50 text-emerald-700",
      inactiveBorder: "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
    },
    work: {
      accentText: "text-blue-600",
      accentBg: "bg-blue-50",
      buttonBg: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-650 focus:ring-blue-450 shadow-md",
      pulseBorder: "border-blue-100 border-t-blue-550",
      iconColor: "text-blue-555",
      textareaFocus: "focus:border-blue-400/80 border-slate-250",
      logoClass: "bg-blue-550 shadow-sm",
      activeBorder: "border-blue-450 bg-blue-50 text-blue-700",
      inactiveBorder: "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
    },
    custom: {
      accentText: "text-purple-600",
      accentBg: "bg-purple-50",
      buttonBg: "bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-650 focus:ring-purple-450 shadow-md",
      pulseBorder: "border-purple-100 border-t-purple-550",
      iconColor: "text-purple-555",
      textareaFocus: "focus:border-purple-400/80 border-slate-250",
      logoClass: "bg-purple-550 shadow-sm",
      activeBorder: "border-purple-450 bg-purple-50 text-purple-705",
      inactiveBorder: "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
    }
  };

  const currentStyle = modeStyles[selectedMode];

  // Loading steps for the analysis simulation (Brutified)
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    "🔒 대화 데이터를 통째로 흡수해 가식적 단어들을 필터링 중...",
    "✂️ 상대방이 보낸 'ㅇㅇ', '바빠서' 등 성의 없는 회절 검출 중...",
    "📊 질문 전송 주도권 및 메시지 비대칭 비율을 고정밀 계산 중...",
    "🔥 관계 맥락에 맞춘 솔루션 및 처방 팩폭 해설서를 주조하는 중..."
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnalyzing) {
      if (loadingStep < loadingSteps.length - 1) {
        timer = setTimeout(() => {
          setLoadingStep(prev => prev + 1);
        }, 600); // Snappy but highly readable step progress
      } else {
        timer = setTimeout(() => {
          setIsAnalyzing(false);
          const messages = parseChatLog(rawText);
          const result = analyzeChatData(messages, selectedMode, customModeText);
          setAnalyzedParticipants(result);
        }, 500);
      }
    }
    return () => clearTimeout(timer);
  }, [isAnalyzing, loadingStep, rawText, selectedMode, customModeText]);

  // Drag & drop file handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setFileError("");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
        setFileError("⚠️ 텍스트(.txt) 카카오톡 대화방 백업 파일만 수입할 수 있습니다.");
        return;
      }
      readFileContent(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
        setFileError("⚠️ 텍스트(.txt) 카카오톡 대화방 백업 파일만 수입할 수 있습니다.");
        return;
      }
      readFileContent(file);
    }
  };

  const readFileContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === "string") {
        setRawText(event.target.result);
        setActiveTitle(`📂 ${file.name.replace(".txt", "")}`);
        setAnalyzedParticipants([]);
        setActiveReportId("");
      }
    };
    reader.onerror = () => {
      setFileError("❌ 대화 파일을 적재하는 수치 작업에 오류가 났습니다.");
    };
    reader.readAsText(file);
  };

  // Run Local Analysis Trigger
  const handleRunAnalysis = () => {
    if (!rawText.trim()) return;
    setLoadingStep(0);
    setIsAnalyzing(true);
  };

  // Load report from Local Storage history
  const handleLoadArchiveReport = (participants: ParticipantMetrics[], text: string, title: string) => {
    setRawText(text);
    setActiveTitle(title);
    setAnalyzedParticipants(participants);
    setFileError("");
  };

  // Reset text/analyses
  const handleReset = () => {
    setRawText("");
    setActiveTitle("");
    setAnalyzedParticipants([]);
    setActiveReportId("");
    setFileError("");
  };

  // Helper labels for UI display
  const getModeTitle = () => {
    if (selectedMode === "couple") return "연인 & 짝사랑 모드";
    if (selectedMode === "team") return "팀플 기여도 모드";
    if (selectedMode === "work") return "비즈니스 기밀 모드";
    return customModeText ? `맞춤: ${customModeText}` : "직접 입력 모드";
  };

  return (
    <div className="min-h-screen bg-[#f4efe3] text-slate-800 antialiased font-sans flex flex-col justify-between relative overflow-hidden">
      
      {/* Decorative colored grid mesh backdrops so it's beautifully colored instead of black or white */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-purple-100/40 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-rose-100/40 rounded-full filter blur-[150px] pointer-events-none"></div>
      
      {/* Top Header Menu Bar */}
      <header className="h-16 px-6 sm:px-8 flex items-center justify-between border-b border-slate-200 bg-[#faf8f2]/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 ${currentStyle.logoClass} rounded-lg flex items-center justify-center text-white font-black transition-all duration-300`}>
              <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                대화분석기
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-rose-600 border border-rose-100 py-1 px-3 rounded-full bg-rose-50 font-black tracking-tight">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-550" />
              <span>온디바이스 보안 분석</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Workspace */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start relative z-10">
        
        {/* Left Control Column (5 cols) */}
        <div id="left-sidebar-controls" className="lg:col-span-5 space-y-6">
          
          {/* Welcome Card & Paradigm */}
          <div className="bg-[#faf6ec] border border-[#dfd8c2] p-5 rounded-xl shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <h2 className="text-xs font-black text-slate-550 uppercase tracking-widest">대화분석기</h2>
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">좋게 포장하지 않는 정밀 상호 핑퐁 해부</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                대등하게 에너지를 나누지 않는 소통은 한 사람의 소모적 도피일 뿐입니다. 서로가 투입하는 소통 가치 데이터를 수학적으로 진단합니다.
              </p>
            </div>
          </div>

          {/* Interactive Relationship Mode Picker (선택 모드) */}
          <div className="bg-[#faf6ec] border border-[#dfd8c2] p-5 rounded-xl shadow-sm space-y-4">
            <div>
              <span className="text-xs font-black text-slate-650 uppercase tracking-widest block mb-1">Step 1. 대칭 기류 모드 설정</span>
              <p className="text-[11px] text-slate-500">누구와 소통하느냐에 따라 분석이 맞춤 극대화됩니다.</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              
              {/* 연인 모드 */}
              <button
                id="mode-picker-couple"
                type="button"
                onClick={() => {
                  setSelectedMode("couple");
                  setAnalyzedParticipants([]);
                }}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-[88px] cursor-pointer ${
                  selectedMode === "couple" 
                    ? "border-rose-300 bg-rose-50/70 text-rose-700 shadow-xs" 
                    : "border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-350 hover:bg-slate-50/80"
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <Heart className={`w-4 h-4 ${selectedMode === "couple" ? "text-rose-500" : "text-slate-400"}`} />
                  {selectedMode === "couple" && <Check className="w-3.5 h-3.5 text-rose-500" />}
                </div>
                <div>
                  <span className="text-xs font-extrabold block">연인 & 짝사랑</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">상처 해독, 짝사랑 팩폭</span>
                </div>
              </button>

              {/* 팀플 모드 */}
              <button
                id="mode-picker-team"
                type="button"
                onClick={() => {
                  setSelectedMode("team");
                  setAnalyzedParticipants([]);
                }}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-[88px] cursor-pointer ${
                  selectedMode === "team" 
                    ? "border-emerald-300 bg-emerald-50/70 text-emerald-800 shadow-xs" 
                    : "border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-350 hover:bg-slate-50/80"
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <Users className={`w-4 h-4 ${selectedMode === "team" ? "text-emerald-500" : "text-slate-400"}`} />
                  {selectedMode === "team" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div>
                  <span className="text-xs font-extrabold block">모임 & 팀플</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">무임승차 처단, 기여도</span>
                </div>
              </button>

              {/* 직장 모드 */}
              <button
                id="mode-picker-work"
                type="button"
                onClick={() => {
                  setSelectedMode("work");
                  setAnalyzedParticipants([]);
                }}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-[88px] cursor-pointer ${
                  selectedMode === "work" 
                    ? "border-blue-300 bg-blue-50/70 text-blue-800 shadow-xs" 
                    : "border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-350 hover:bg-slate-50/80"
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <Briefcase className={`w-4 h-4 ${selectedMode === "work" ? "text-blue-500" : "text-slate-400"}`} />
                  {selectedMode === "work" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div>
                  <span className="text-xs font-extrabold block">비즈니스</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">기계적 예의, 퇴근 차단</span>
                </div>
              </button>

              {/* 직접 입력 */}
              <button
                id="mode-picker-custom"
                type="button"
                onClick={() => {
                  setSelectedMode("custom");
                  setAnalyzedParticipants([]);
                }}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-[88px] cursor-pointer ${
                  selectedMode === "custom" 
                    ? "border-purple-300 bg-purple-50/70 text-purple-805 shadow-xs" 
                    : "border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-350 hover:bg-slate-50/80"
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <PenTool className={`w-4 h-4 ${selectedMode === "custom" ? "text-purple-500" : "text-slate-400"}`} />
                  {selectedMode === "custom" && <Check className="w-3.5 h-3.5 text-purple-650" />}
                </div>
                <div>
                  <span className="text-xs font-extrabold block">지정 맞춤 설정</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">가족, 사교 친구, 페어</span>
                </div>
              </button>

            </div>

            {/* Custom Mode Type Input */}
            <AnimatePresence>
              {selectedMode === "custom" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label htmlFor="custom-mode-input" className="text-[10px] font-black text-slate-500 block uppercase tracking-wider">
                    대상 관계명 레이블 지정:
                  </label>
                  <input
                    id="custom-mode-input"
                    type="text"
                    value={customModeText}
                    onChange={(e) => {
                      setCustomModeText(e.target.value);
                      setAnalyzedParticipants([]);
                    }}
                    placeholder="예: 지독하게 엮인 전남친, 무성이 극한의 조장"
                    className="w-full text-xs p-2.5 border border-[#dfd8c2] bg-[#fbfaf6] text-slate-800 rounded-lg focus:outline-hidden focus:border-purple-400 font-bold placeholder-[#a8a192]"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Upload and Text Area Panel */}
          <div className="bg-[#faf6ec] border border-[#dfd8c2] p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-650 uppercase tracking-widest block">Step 2. 카카오톡 대화방 TXT 투여</span>
              {rawText && (
                <button
                  id="btn-reset-inputs"
                  type="button"
                  onClick={handleReset}
                  className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-0.5 font-bold"
                >
                  <RefreshCw className="w-3 h-3" />
                  로그 비우기
                </button>
              )}
            </div>

            {/* Drag and Drop File Target */}
            <div
              id="file-drop-target"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                dragActive 
                  ? "border-red-400 bg-red-50" 
                  : "border-[#dfd8c2] bg-[#fbfaf6] hover:border-[#b5a68c]"
              }`}
            >
              <input
                id="file-upload-input"
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer block space-y-2">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-700">카톡 백업 TXT 끌어넣거나 클릭</p>
                  <p className="text-[10px] text-slate-500 leading-normal">채팅방 설정 &gt; 대화 내보내기 &gt; 파일로 저장한 .txt 파일을 넣어 수입합니다.</p>
                </div>
              </label>
            </div>

            {fileError && <p className="text-red-505 font-extrabold text-[11px]" id="upload-error-msg">{fileError}</p>}

            {/* Paste Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between shrink-0">
                <label htmlFor="chat-paste-textarea" className="text-xs font-bold text-slate-650 flex items-center gap-1.5">
                  <Clipboard className="w-3.5 h-3.5 text-slate-500" />
                  카톡 내용 직접 복사해서 날것 붙여넣기
                </label>
                <span className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest bg-[#f4efe3] px-1.5 py-0.5 rounded border border-[#dfd8c2]">
                  {rawText.length.toLocaleString()} 자 입력됨
                </span>
              </div>
              <textarea
                id="chat-paste-textarea"
                rows={5}
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  if (e.target.value.trim() && !activeTitle) {
                    setActiveTitle(`✍️ 복사한 대화 로그 (${getModeTitle()})`);
                  }
                }}
                placeholder={`카카오톡에서 복사하여 아래처럼 적당히 붙여넣어도 정밀 검출됩니다:
2026. 6. 13. 오후 4:10, 민우 : 혹시 오늘 자료 기여 언제 보내시나요...?
2026. 6. 13. 오후 11:21, 지혜 : 아 제가 바빠서 이따 밤에 보낼게요`}
                className={`w-full text-xs p-3.5 border bg-[#fbfaf6] text-slate-800 border-[#dfd8c2] rounded-lg focus:outline-hidden font-mono leading-relaxed resize-y ${currentStyle.textareaFocus} placeholder-[#a69d8d]`}
              />
            </div>

            {/* Run Analysis Button */}
            <button
              id="btn-trigger-analysis"
              type="button"
              onClick={handleRunAnalysis}
              disabled={!rawText.trim() || isAnalyzing}
              className={`w-full py-3 px-4 text-xs font-black rounded-lg tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                !rawText.trim() || isAnalyzing
                  ? "bg-[#eae4d4] text-slate-400 border border-[#dfd8c2] cursor-not-allowed shadow-none"
                  : `${currentStyle.buttonBg} text-white`
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  대화방 속마음 전두엽 해체 중...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-white" />
                  데이터 해커 팩폭 리포트 주조
                </>
              )}
            </button>
          </div>

          {/* Local Archive List Shelf */}
          <SavedReports 
            currentParticipants={analyzedParticipants}
            rawText={rawText}
            onLoadReport={handleLoadArchiveReport}
            activeId={activeReportId}
            accentTextClass={currentStyle.accentText}
            buttonBgClass={currentStyle.buttonBg}
          />

        </div>

        {/* Right Dynamic Report Display Column (7 cols) */}
        <div id="right-report-display" className="lg:col-span-7 bg-[#faf6ec] border border-[#dfd8c2] rounded-xl p-4 sm:p-6 min-h-[500px] shadow-sm flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              /* Simulated Step Loading Screen */
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col items-center justify-center py-24 text-center space-y-6 flex-1"
                id="loading-simulation-screen"
              >
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full border-2 ${currentStyle.pulseBorder} animate-spin`}></div>
                  <div className={`absolute inset-0 flex items-center justify-center ${currentStyle.accentText}`}>
                    <Skull className="w-5 h-5 animate-pulse text-red-500" />
                  </div>
                </div>
                
                <div className="space-y-3 max-w-sm">
                  <p className="font-black text-slate-800 tracking-widest text-xs uppercase">상대 속마음 분석 가동 데이터 수집 중</p>
                  <p className={`text-xs ${currentStyle.accentText} bg-slate-50 border border-slate-200 py-2.5 px-4 rounded-lg font-bold block animate-pulse leading-relaxed`}>
                    {loadingSteps[loadingStep]}
                  </p>
                </div>
              </motion.div>
            ) : analyzedParticipants.length > 0 ? (
              /* Final Qualitative Report View */
              <motion.div
                key="report"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ReportView 
                  participants={analyzedParticipants} 
                  title={activeTitle || `${getModeTitle()} 연산 결과`} 
                  mode={selectedMode}
                  customModeText={customModeText}
                />
              </motion.div>
            ) : (
              /* Beautiful Home Welcome Area */
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center py-20 px-4 space-y-8 flex-1"
                id="placeholder-empty-screen"
              >
                <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 shadow-xs relative animate-pulse">
                  <span className="absolute inset-0 rounded-full bg-rose-500/5 blur-md"></span>
                  <Sparkles className="w-6 h-6 text-rose-500 relative z-10" />
                </div>
                
                <div className="space-y-2.5 max-w-md">
                  <h3 className="font-black text-slate-800 tracking-tight text-base uppercase">대화 상대 성의 측정</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    왼편 대기판에서 <strong className="text-red-550">대화 상대에 알맞은 관계 모드</strong>를 선택하신 후, <strong className="text-indigo-600">카카오톡 백업 로그(.txt) 파일</strong>이나 <strong className="text-emerald-600">직접 복사한 내용</strong>을 입력 칸에 투여해 주세요.
                  </p>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    본 시스템은 데이터를 외부망이나 원격 서버로 절대 반출하지 않습니다. 오직 귀하의 브라우저 로컬 가용 가상 메모리에서만 순수 연산되어 안전하게 보호됩니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg pt-6 border-t border-[#dfd8c2] text-[10px] text-slate-600 leading-relaxed text-left">
                  <div className="p-3 bg-[#fbfaf6] border border-[#dfd8c2] rounded-lg space-y-1">
                    <span className="font-extrabold text-red-650 flex items-center gap-1">
                      <Skull className="w-3 h-3" /> 팩트 번역기 장착
                    </span>
                    <span>상투어 이면에 숨겨진 단답형, 무시형 무성의 신호를 수학 통계 필터로 여과 없이 해저 번역합니다.</span>
                  </div>
                  <div className="p-3 bg-[#fbfaf6] border border-[#dfd8c2] rounded-lg space-y-1">
                    <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> 꼬리물기 5개 다각 지표
                    </span>
                    <span>시간대 분포도, 시동 비율, 점유 편차를 완벽 대차대조하여 소통 기류의 온도를 팩트체크합니다.</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Corporate design bottom line footer */}
      <footer className="h-14 px-6 sm:px-8 flex items-center justify-between border-t border-slate-200 bg-[#faf8f2] text-[9px] text-slate-500 shrink-0 relative z-25">
        <div className="font-bold tracking-widest uppercase">대화분석기 CLIENT ANALYSIS ENGINE V3.0</div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1 font-bold text-red-500"><div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div> ON-DEVICE CRYPTO SECURE</span>
          <span className="font-mono text-slate-400">LAST BUILT: 2026.06.14</span>
        </div>
      </footer>
    </div>
  );
}
