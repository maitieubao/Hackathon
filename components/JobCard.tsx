import React from 'react';
import { JobListing } from '../types';

interface JobCardProps {
  job: JobListing;
  onAnalyze: (job: JobListing) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onAnalyze }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{job.title}</h3>
          <p className="text-sm text-gray-500 font-medium flex items-center gap-1 mt-1">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
             {job.company}
          </p>
        </div>
        <span className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-teal-100">
          {job.salary}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 flex items-start gap-2 mb-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
           {job.location}
        </p>
        <p className="text-sm text-gray-600 line-clamp-2">
          {job.description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
         <span className="text-xs text-gray-400 truncate max-w-[150px]">
           Nguồn: {job.source}
         </span>
         <button 
           onClick={() => onAnalyze(job)}
           className="text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all flex items-center gap-1"
         >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           Phân Tích An Toàn
         </button>
      </div>
    </div>
  );
};

export default JobCard;