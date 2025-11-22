import React, { useState } from 'react';
import { JobListing } from '../types';
import DefaultLogo from './DefaultLogo';

interface JobCardProps {
  job: JobListing;
  onApply: (job: JobListing) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply }) => {
  const [imgError, setImgError] = useState(false);
  const shouldShowImage = job.logo && !imgError;

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 p-5 hover:border-green-500 hover:shadow-lg transition-all duration-300 ease-out flex flex-col sm:flex-row gap-4 items-start">
      
      {/* Logo Section */}
      <div className="flex-shrink-0">
        {shouldShowImage ? (
             <img 
                src={job.logo} 
                alt={job.company} 
                onError={() => setImgError(true)}
                className="w-20 h-20 rounded-lg object-contain border border-gray-100 shadow-sm bg-white p-1" 
             />
        ) : (
            <div className="w-20 h-20">
                <DefaultLogo />
            </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-grow min-w-0 space-y-2">
        <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors truncate leading-tight" title={job.title}>
            {job.title}
            </h3>
            <p className="text-gray-500 font-medium text-sm truncate mt-1">{job.company}</p>
        </div>
        
        {/* Meta Tags Row */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1 font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {job.salary}
          </span>
          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {job.location}
          </span>
        </div>
      </div>

      {/* Action Button (Visible on mobile, hidden on desktop hover effect usually handles this but we keep it for clarity) */}
      <div className="flex-shrink-0 hidden sm:block self-center">
        <button
          onClick={() => onApply(job)}
          className="px-5 py-2 bg-green-50 text-green-600 font-semibold rounded-lg hover:bg-green-600 hover:text-white transition-all text-sm border border-green-200"
        >
          Chi tiết
        </button>
      </div>

      {/* HOVER TOOLTIP - TopCV Style */}
      {/* Using opacity transition for smoothness instead of conditional rendering */}
      <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 p-5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          {/* Arrow pointing up */}
          <div className="absolute -top-2 left-10 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>

          <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-gray-900 text-base line-clamp-1">{job.title}</h4>
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {job.source}
                  </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                      <p className="text-gray-400 text-xs mb-1">Mức lương</p>
                      <p className="font-semibold text-green-600">{job.salary}</p>
                  </div>
                  <div>
                      <p className="text-gray-400 text-xs mb-1">Địa điểm</p>
                      <p className="font-semibold text-gray-700 truncate" title={job.location}>{job.location}</p>
                  </div>
                  <div>
                      <p className="text-gray-400 text-xs mb-1">Hình thức</p>
                      <p className="font-semibold text-gray-700">Bán thời gian</p>
                  </div>
                  <div>
                      <p className="text-gray-400 text-xs mb-1">Cập nhật</p>
                      <p className="font-semibold text-gray-700">Mới nhất</p>
                  </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-1">Mô tả công việc</p>
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {job.description || "Chi tiết công việc sẽ được trao đổi cụ thể khi phỏng vấn..."}
                  </p>
              </div>

              <div className="flex gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onApply(job); }}
                    className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700 transition-colors shadow-md text-sm"
                  >
                      Phân tích & Ứng tuyển ngay
                  </button>
                  {job.link && (
                      <a 
                        href={job.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 py-2.5 border border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
                      >
                          Xem gốc
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default JobCard;