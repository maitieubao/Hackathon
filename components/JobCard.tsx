import React, { useState } from 'react';
import { JobListing } from '../types';
import DefaultLogo from './DefaultLogo';

interface JobCardProps {
  job: JobListing;
  onApply: (job: JobListing) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply }) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const shouldShowImage = job.logo && !imgError;

  return (
    <div 
      className="group relative bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 items-start"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className="flex-shrink-0">
        {shouldShowImage ? (
             <img 
                src={job.logo} 
                alt={job.company} 
                onError={() => setImgError(true)}
                className="w-16 h-16 rounded-lg object-contain border border-gray-100 shadow-sm bg-white" 
             />
        ) : (
            <DefaultLogo />
        )}
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate" title={job.title}>
          {job.title}
        </h3>
        <p className="text-gray-600 font-medium text-sm mb-2 truncate">{job.company}</p>
        
        {/* Meta Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">
            💰 {job.salary}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            📍 {job.location}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            🕒 Part-time
          </span>
        </div>

        {/* Description Snippet */}
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {job.description || "Mô tả công việc đang được cập nhật. Nhấn xem chi tiết để biết thêm thông tin..."}
        </p>
      </div>

      {/* Action Button */}
      <div className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
        <button
          onClick={() => onApply(job)}
          className="w-full sm:w-auto px-6 py-2 bg-blue-50 text-blue-600 font-semibold rounded-md border border-blue-100 hover:bg-blue-600 hover:text-white transition-all text-sm"
        >
          Xem chi tiết
        </button>
      </div>

      {/* Hover Preview Tooltip */}
      {isHovered && (
           <div className="absolute z-50 left-0 top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 p-4 animate-fade-in-up pointer-events-none md:pointer-events-auto">
               <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold text-gray-900 text-sm">{job.title}</h4>
                   {job.link && (
                       <a 
                         href={job.link} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 flex-shrink-0 bg-blue-50 px-2 py-1 rounded"
                         onClick={(e) => e.stopPropagation()} 
                       >
                           Nguồn gốc
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                           </svg>
                       </a>
                   )}
               </div>
               <p className="text-xs text-gray-600 line-clamp-4 leading-relaxed mb-2">{job.description}</p>
               <div className="text-xs text-gray-400">Nguồn: {job.source}</div>
           </div>
       )}
    </div>
  );
};

export default JobCard;