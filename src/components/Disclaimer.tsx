/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Info, AlertCircle } from "lucide-react";

export interface DisclaimerProps {
  className?: string;
  variant?: "full" | "compact";
}

export default function Disclaimer({ className = "", variant = "full" }: DisclaimerProps) {
  if (variant === "compact") {
    return (
      <div 
        id="disclaimer-info-compact"
        className={`flex items-start gap-2 p-3 bg-[#fbfaf6] border border-[#dfd8c2] rounded-lg text-xs text-slate-500 leading-relaxed ${className}`}
      >
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p>
          본 분석은 입력된 텍스트만을 토대로 도출된 경향성이며, 실제 인물의 감정이나 다정한 관계의 진정성을 의미하는 절대적인 척도가 아닙니다. 상황적 맥락을 고려한 참고용으로만 활용해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div 
      id="disclaimer-info-full"
      className={`relative p-5 bg-indigo-900 border border-indigo-950 text-white rounded-lg shadow-md leading-relaxed ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-indigo-300 shrink-0" />
        <h4 className="font-bold text-indigo-100 uppercase tracking-widest text-xs">해석 안전장치 안내 (Disclaimer)</h4>
      </div>
      <p className="text-xs text-indigo-100 opacity-90 leading-relaxed">
        본 분석 결과는 입력된 텍스트 데이터만을 바탕으로 한 대화 패턴 분석으로, <strong>실제 인물의 감정이나 관계의 깊이를 완벽히 대변하지 않습니다.</strong> 
        대화의 상황(업무 협업 기간, 바쁜 업무 시간대, 주말 휴식 여부) 및 주제적 맥락에 따라 소통 패턴은 언제든지 수시로 달라질 수 있으므로, 
        우열이나 평가가 아닌 <strong>서로 다른 소통 방식의 흐름과 다양성을 쾌적하게 이해하고 배려하는 긍정적 지침서(참고자료)</strong>로만 소중히 활용해 주시기 바랍니다.
      </p>
    </div>
  );
}
