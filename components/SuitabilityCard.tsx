import React from 'react';
import { SuitabilityAnalysis } from '../types';

interface SuitabilityCardProps {
  suitability: SuitabilityAnalysis;
}

const SuitabilityCard: React.FC<SuitabilityCardProps> = ({ suitability }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 h-full flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Đánh Giá & Lời Khuyên
      </h3>

      <div className="space-y-5 flex-grow">
        {/* Contact Risks - MOST IMPORTANT */}
        {suitability.contactRisks && suitability.contactRisks.length > 0 && (
          <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
            <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              ⚠️ Rủi ro về thông tin liên lạc
            </h4>
            <ul className="space-y-2">
              {suitability.contactRisks.map((risk, i) => (
                <li key={i} className="text-sm text-red-700 flex items-start gap-2 leading-relaxed">
                  <span className="text-red-500 font-bold mt-0.5">•</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pros */}
        {suitability.pros && suitability.pros.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Ưu điểm
            </h4>
            <ul className="space-y-1.5">
              {suitability.pros.slice(0, 3).map((p, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cons */}
        {suitability.cons && suitability.cons.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              {/* Header Icon: Warning Triangle */}
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Cần cân nhắc
            </h4>
            <ul className="space-y-1.5">
              {suitability.cons.slice(0, 3).map((c, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  {/* List Item Icon: Exclamation Circle (Changed to avoid duplication) */}
                  <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Advice - Bottom */}
      {suitability.advice && (
        <div className="mt-5 pt-4 border-t-2 border-gray-100">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lời khuyên
            </p>
            <p className="text-sm text-blue-700 italic leading-relaxed">"{suitability.advice}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuitabilityCard;