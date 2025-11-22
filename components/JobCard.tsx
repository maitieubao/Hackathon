import React from 'react';
import { JobListing } from '../types';

interface JobCardProps {
  job: JobListing;
  onApply: (job: JobListing) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply }) => {
  // Generate a random color for the logo placeholder based on company name
  const getLogoColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-teal-500', 'bg-rose-500', 'bg-orange-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const logoColor = getLogoColor(job.company);
  const initial = job.company.charAt(0).toUpperCase();

  return (
    <div className="group bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 items-start">
      {/* Logo */}
      <div className="flex-shrink-0">
        {job.logo ? (
             <img src={job.logo} alt={job.company} className="w-16 h-16 rounded-lg object-contain border border-gray-100 shadow-sm bg-white" />
        ) : (
            <div className={`w-16 h-16 rounded-lg ${logoColor} flex items-center justify-center text-white font-bold text-2xl shadow-sm`}>
                {initial}
            </div>
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