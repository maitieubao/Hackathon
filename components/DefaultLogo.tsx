import React from 'react';

const DefaultLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <div className={`${className} rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200 shadow-sm`}>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1/2 w-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  </div>
);

export default DefaultLogo;
