import React from 'react';
import { GroundingData } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface GroundingInfoProps {
  data: GroundingData;
}

const GroundingInfo: React.FC<GroundingInfoProps> = ({ data }) => {
  
  // Clean citation markers from text
  const cleanCitations = (text: string): string => {
    if (!text) return '';
    
    // Remove various citation formats:
    // [First tool output], [Second tool output: 1, 2, 3], [in search 1], etc.
    return text
      .replace(/\[First tool output[^\]]*\]/g, '')
      .replace(/\[Second tool output[^\]]*\]/g, '')
      .replace(/\[Third tool output[^\]]*\]/g, '')
      .replace(/\[.*?in search.*?\]/g, '')
      .replace(/\[\d+(?:,\s*\d+)*\]/g, '') // Remove [1, 2, 3]
      .trim();
  };

  // Deduplicate map chunks based on URI
  const uniqueMapChunks = Array.from(new Map(data.mapChunks.map(chunk => [chunk.uri, chunk])).values());

  // Clean the verification text
  const cleanedText = cleanCitations(data.verificationText);

  // Check if we have meaningful data to display
  const hasVerificationText = cleanedText && cleanedText.length > 20;
  const hasSearchChunks = data.searchChunks && data.searchChunks.length > 0;
  const hasMapChunks = uniqueMapChunks && uniqueMapChunks.length > 0;

  // Don't render if there's no meaningful data at all
  if (!hasVerificationText && !hasSearchChunks && !hasMapChunks) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <div className="p-2 bg-indigo-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        Xác Minh & Kiểm Tra Cộng Đồng
      </h3>

      {/* Main Verification Text - Only show if exists */}
      {hasVerificationText && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100 mb-6">
           <MarkdownRenderer content={cleanedText} className="text-sm text-gray-700 leading-relaxed" />
        </div>
      )}

      {/* Show placeholder if no verification text but have other data */}
      {!hasVerificationText && (hasSearchChunks || hasMapChunks) && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100 mb-6">
          <p className="text-sm text-gray-500 italic">Thông tin xác minh hạn chế. Vui lòng kiểm tra nguồn bên dưới.</p>
        </div>
      )}

      {/* Sources Grid */}
      {(hasSearchChunks || hasMapChunks) && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Web Sources (Forums, Socials, Job Boards) */}
        {hasSearchChunks && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Nguồn Dữ Liệu (Web/MXH)
            </h4>
            <ul className="space-y-2">
              {data.searchChunks.slice(0, 4).map((chunk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400 text-xs mt-1">•</span>
                  <a 
                    href={chunk.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 text-sm truncate block underline decoration-indigo-200 hover:decoration-indigo-500 transition-all"
                    title={chunk.title}
                  >
                    {chunk.title || chunk.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Maps Locations */}
        {hasMapChunks && (
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <h4 className="text-xs font-bold text-emerald-700 uppercase mb-3 flex items-center gap-1">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Địa Điểm Thực Tế
            </h4>
            <ul className="space-y-2">
              {uniqueMapChunks.slice(0, 3).map((chunk, i) => (
                <li key={i} className="flex items-start gap-2">
                   <span className="text-emerald-400 text-xs mt-1">•</span>
                  <a 
                    href={chunk.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-800 text-sm truncate block underline decoration-emerald-200 hover:decoration-emerald-500 transition-all"
                  >
                    {chunk.title || 'Xem trên Google Maps'}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default GroundingInfo;