import React from 'react';
import { ScamAnalysis } from '../types';

interface SafetyScoreProps {
  analysis: ScamAnalysis;
}

const SafetyScore: React.FC<SafetyScoreProps> = ({ analysis }) => {
  
  const getRiskColor = (level: string) => {
    if (level === 'An Toàn') return 'text-green-800 bg-green-50 border-green-200';
    if (level === 'Nguy Hiểm') return 'text-red-800 bg-red-50 border-red-200';
    return 'text-yellow-800 bg-yellow-50 border-yellow-200'; // Cảnh Báo
  };

  // Helper to clean text
  const clean = (text: string) => text.replace(/\*\*/g, '').replace(/\*/g, '').trim();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Đánh Giá An Toàn
      </h3>
      
      {/* Risk Level Text Badge (Replaces Numeric Score) */}
      <div className="mb-4">
         <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold border ${getRiskColor(analysis.riskLevel)}`}>
            Mức độ: {analysis.riskLevel}
         </span>
      </div>

      <div className="space-y-4">
        <p className="text-base text-gray-800 leading-relaxed font-medium">
            {clean(analysis.verdict)}
        </p>
        
        {analysis.reasons.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-500 font-bold mb-3 uppercase tracking-wider flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Chi tiết phân tích
                </p>
                <ul className="space-y-2">
                    {analysis.reasons.map((reason, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></span>
                            {clean(reason)}
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
};

export default SafetyScore;