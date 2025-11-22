import React, { useState } from 'react';
import { generateDraft } from '../services/geminiService';

interface ApplicationDraftProps {
  draft: string;
  jobDescription?: string;
}

const ApplicationDraft: React.FC<ApplicationDraftProps> = ({ draft, jobDescription }) => {
  const [currentDraft, setCurrentDraft] = useState(draft);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Update local state if prop changes (new job selected)
  React.useEffect(() => {
      setCurrentDraft(draft);
  }, [draft]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
      if (!jobDescription) return;
      setIsRegenerating(true);
      const newDraft = await generateDraft(jobDescription);
      setCurrentDraft(newDraft);
      setIsRegenerating(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Gợi ý tin nhắn ứng tuyển
        </h3>
        <div className="flex gap-2">
            {jobDescription && (
                <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                >
                    {isRegenerating ? (
                        <span className="animate-spin">↻</span>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    )}
                    Tạo lại
                </button>
            )}
            <button
            onClick={handleCopy}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                copied ? 'bg-green-100 text-green-700' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
            }`}
            >
            {copied ? (
                <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Đã sao chép
                </>
            ) : (
                <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Sao chép
                </>
            )}
            </button>
        </div>
      </div>
      
      <div className="relative">
        <textarea
          className="w-full h-64 p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 text-sm leading-relaxed focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none font-mono"
          value={currentDraft}
          onChange={(e) => setCurrentDraft(e.target.value)}
        />
        <div className="absolute bottom-4 right-4 text-xs text-gray-400 pointer-events-none">
          Bạn có thể chỉnh sửa trực tiếp
        </div>
      </div>
    </div>
  );
};

export default ApplicationDraft;