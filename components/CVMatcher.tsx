import React, { useState } from 'react';
import { analyzeCVMatching } from '../services/geminiService';
import { CVAnalysis } from '../types';

interface CVMatcherProps {
  jobDescription: string;
}

const CVMatcher: React.FC<CVMatcherProps> = ({ jobDescription }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cvText, setCvText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CVAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!cvText.trim()) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeCVMatching(jobDescription, cvText);
      setResult(analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Đánh giá độ phù hợp với CV của bạn
      </button>
    );
  }

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-purple-100 animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          Phân Tích CV & Độ Phù Hợp
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {!result ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Dán nội dung CV của bạn vào bên dưới để AI phân tích mức độ phù hợp với công việc này.
          </p>
          <textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Kinh nghiệm làm việc: ... Kỹ năng: ..."
            className="w-full h-40 p-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none text-sm"
          />
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !cvText.trim()}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
              isAnalyzing || !cvText.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isAnalyzing ? 'Đang phân tích...' : 'Bắt đầu phân tích'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Score Circle */}
          <div className="flex flex-col items-center justify-center py-4">
             <div className="relative w-32 h-32">
               <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={result.matchScore > 70 ? "#10B981" : result.matchScore > 40 ? "#F59E0B" : "#EF4444"}
                    strokeWidth="3"
                    strokeDasharray={`${result.matchScore}, 100`}
                    className="animate-[spin_1s_ease-out_reverse]"
                  />
               </svg>
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                 <span className={`text-3xl font-bold ${result.matchScore > 70 ? "text-green-600" : result.matchScore > 40 ? "text-amber-600" : "text-red-600"}`}>
                   {result.matchScore}%
                 </span>
                 <span className="block text-xs text-gray-500 font-medium">Phù hợp</span>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pros */}
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <h4 className="text-sm font-bold text-green-800 mb-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Điểm mạnh
              </h4>
              <ul className="space-y-1">
                {result.pros.map((item, i) => (
                  <li key={i} className="text-xs text-green-700 flex items-start gap-1">
                    <span>•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing */}
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Cần cải thiện
              </h4>
              <ul className="space-y-1">
                {result.missingSkills.map((item, i) => (
                  <li key={i} className="text-xs text-red-700 flex items-start gap-1">
                    <span>•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Advice */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 className="text-sm font-bold text-blue-800 mb-2">💡 Lời khuyên từ AI</h4>
            <p className="text-sm text-blue-700 italic leading-relaxed">
              {result.advice}
            </p>
          </div>
          
          <button onClick={() => setResult(null)} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 underline">
            Phân tích lại
          </button>
        </div>
      )}
    </div>
  );
};

export default CVMatcher;
