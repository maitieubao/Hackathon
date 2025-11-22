import React, { useState } from 'react';
import { JobListing } from '../types';

interface JobCardProps {
  job: JobListing;
  onApply: (job: JobListing) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply }) => {
  const [imgError, setImgError] = useState(false);

  // Default Logo Component (Building Icon) - Used when no logo is available
  const DefaultLogo = () => (
    <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200 shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    </div>
  );

  // Determine if we should show the image
  // Show image if: job.logo exists AND no error has occurred
  // Note: We no longer fallback to UI Avatars. We fallback to DefaultLogo.
  const shouldShowImage = job.logo && !imgError;

  return (
    <div className="group bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 items-start">
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
    </div>
  );
};

export default JobCard;