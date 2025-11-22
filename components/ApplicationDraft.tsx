import React, { useState } from 'react';

interface ApplicationDraftProps {
  draft: string;
}

const ApplicationDraft: React.FC<ApplicationDraftProps> = ({ draft }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Gợi Ý Ứng Tuyển
        </h3>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 backdrop-blur-sm"
        >
          {copied ? (
             <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Đã sao chép
             </>
          ) : (
            <>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Sao chép
            </>
          )}
        </button>
      </div>
      
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-white/90">
          {draft}
        </pre>
      </div>
    </div>
  );
};

export default ApplicationDraft;