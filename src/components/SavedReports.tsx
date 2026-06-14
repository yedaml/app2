/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { FolderHeart, Archive, Trash2, Calendar, Users, ChevronRight, Save } from "lucide-react";
import { ParticipantMetrics, SavedAnalysis } from "../types";

interface SavedReportsProps {
  currentParticipants: ParticipantMetrics[];
  rawText: string;
  onLoadReport: (participants: ParticipantMetrics[], rawText: string, title: string) => void;
  activeId?: string;
  accentTextClass?: string;
  buttonBgClass?: string;
}

export default function SavedReports({ 
  currentParticipants, 
  rawText, 
  onLoadReport,
  activeId,
  accentTextClass = "text-rose-400",
  buttonBgClass = "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500"
}: SavedReportsProps) {
  const [savedReports, setSavedReports] = useState<SavedAnalysis[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [showSaveBox, setShowSaveBox] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("chat_analyzer_reports");
      if (stored) {
        setSavedReports(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved reports", e);
    }
  }, []);

  // Save current analysis
  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || currentParticipants.length === 0) return;

    const newReport: SavedAnalysis = {
      id: "report_" + Date.now(),
      title: newTitle.trim(),
      createdAt: new Date().toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      rawText,
      participants: currentParticipants,
      totalMessages: currentParticipants.reduce((sum, p) => sum + p.messageCount, 0)
    };

    const updated = [newReport, ...savedReports];
    setSavedReports(updated);
    localStorage.setItem("chat_analyzer_reports", JSON.stringify(updated));
    setNewTitle("");
    setShowSaveBox(false);
  };

  // Delete a saved analysis
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid loading it
    const updated = savedReports.filter(r => r.id !== id);
    setSavedReports(updated);
    localStorage.setItem("chat_analyzer_reports", JSON.stringify(updated));
  };

  return (
    <div id="saved-reports-container" className="space-y-4">
      {/* Save Button for active analysis */}
      {currentParticipants.length > 0 && (
        <div id="active-save-section" className="bg-[#faf6ec] border border-[#dfd8c2] rounded-xl p-4 shadow-sm">
          {!showSaveBox ? (
            <button
              id="btn-show-save"
              type="button"
              onClick={() => setShowSaveBox(true)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 text-white font-black rounded-lg text-xs transition-all focus:outline-hidden ring-1 ring-white/10 ${buttonBgClass}`}
            >
              <Save className="w-4 h-4 text-white" />
              현재 분석한 가치리포트 보관함에 저장하기
            </button>
          ) : (
            <form onSubmit={handleSaveCurrent} className="space-y-3">
              <label htmlFor="save-title-input" className="block text-xs font-bold text-slate-700">
                💾 분석 결과를 보관할 고유 별칭이나 키워드를 지정하세요:
              </label>
              <div className="flex gap-2">
                <input
                  id="save-title-input"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예) 수습 불가능 우리 조, 수동적인 그 애"
                  className="flex-1 py-2 px-3 bg-[#fbfaf6] text-slate-800 text-xs border border-[#dfd8c2] rounded-lg focus:border-red-400 focus:outline-hidden"
                  required
                />
                <button
                  id="btn-confirm-save"
                  type="submit"
                  className={`py-2 px-3.5 text-white text-xs font-black rounded-lg transition-all ${buttonBgClass}`}
                >
                  보관
                </button>
                <button
                  id="btn-cancel-save"
                  type="button"
                  onClick={() => setShowSaveBox(false)}
                  className="py-2 px-2.5 bg-[#f4efe3] hover:bg-[#eae4d4] text-slate-700 text-xs font-bold rounded-lg border border-[#dfd8c2]"
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* History Archive Shelf */}
      <div id="history-shelf" className="bg-[#faf6ec] border border-[#dfd8c2] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Archive className={`w-5 h-5 ${accentTextClass}`} />
          <h3 className="font-extrabold text-slate-800 tracking-tight text-xs sm:text-sm uppercase">📁 온디바이스 암호화 보관함</h3>
        </div>

        {savedReports.length === 0 ? (
          <div id="empty-archive" className="text-center py-6 px-4 bg-[#fbfaf6] border border-dashed border-[#dfd8c2] rounded-lg">
            <FolderHeart className="w-8 h-8 text-slate-550 mx-auto mb-2 animate-pulse" />
            <p className="text-xs text-slate-650">
              보관된 데이터가 없습니다. <br />대화를 끌어넣어 돌려본 뒤 팩트 리포트를 보관하세요.
            </p>
          </div>
        ) : (
          <div id="reports-grid" className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
            {savedReports.map((report) => {
              const isActive = activeId === report.id;
              return (
                <div
                  id={`saved-item-${report.id}`}
                  key={report.id}
                  onClick={() => onLoadReport(report.participants, report.rawText, report.title)}
                  className={`group relative flex items-center justify-between p-3 rounded-lg text-left cursor-pointer border transition-all ${
                    isActive 
                      ? "bg-[#eae4d4] border-[#dfd8c2] shadow-sm text-slate-800 font-bold" 
                      : "bg-[#fbfaf6] hover:bg-[#eae4d4]/40 border-[#dfd8c2] text-slate-700"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-xs font-extrabold text-slate-800 truncate mb-1">{report.title}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-550 font-mono">
                      <span className="flex items-center gap-0.5">
                        <Users className="w-3 h-3" />
                        {report.participants.length}명 대칭분석
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {report.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id={`btn-del-${report.id}`}
                      type="button"
                      onClick={(e) => handleDelete(report.id, e)}
                      title="보관함에서 삭제"
                      className="p-1 text-slate-500 hover:text-rose-500 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-550 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
