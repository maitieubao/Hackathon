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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        Mức Độ Phù Hợp
      </h3>

      <div className="flex items-end gap-2 mb-6">
        <span className="text-4xl font-bold text-gray-800">{suitability.matchScore}</span>
        <span className="text-gray-500 pb-1">/ 100</span>
      </div>

      <div className="space-y-4 flex-grow">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Ưu điểm</h4>
          <ul className="space-y-1">
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

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Cần cân nhắc</h4>
          <ul className="space-y-1">
            {suitability.cons.slice(0, 3).map((c, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
         <p className="text-xs text-gray-500 italic">"{suitability.advice}"</p>
      </div>
    </div>
  );
};

export default SuitabilityCard;