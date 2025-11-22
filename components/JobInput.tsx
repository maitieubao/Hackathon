import React, { useState } from 'react';

interface JobInputProps {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
}

const JobInput: React.FC<JobInputProps> = ({ onAnalyze, isAnalyzing }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAnalyze(text);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Nhập thông tin việc làm
      </h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full h-48 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none bg-gray-50 transition-all text-gray-700 placeholder-gray-400"
          placeholder="Dán nội dung tin tuyển dụng vào đây (Ví dụ: Tuyển nhân viên phục vụ, lương 30k/h...)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isAnalyzing}
        />
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={isAnalyzing || !text.trim()}
            className={`px-8 py-3 rounded-xl font-semibold text-white transition-all transform shadow-lg ${
              isAnalyzing || !text.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:scale-105 hover:shadow-teal-500/30'
            }`}
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang phân tích...
              </span>
            ) : (
              'Phân Tích Ngay'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobInput;