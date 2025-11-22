import React, { useState } from 'react';
import { SearchCriteria } from '../types';

interface JobSearchProps {
  onSearch: (criteria: SearchCriteria) => void;
  isSearching: boolean;
}

const CITIES = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Bình Dương",
  "Đồng Nai",
  "Khác"
];

const JobSearch: React.FC<JobSearchProps> = ({ onSearch, isSearching }) => {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('Hà Nội');
  const [district, setDistrict] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSearch({ keyword, city, district });
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Tìm Việc Làm Thêm</h2>
        <p className="text-gray-500">Hàng ngàn công việc uy tín dành cho sinh viên đang chờ bạn.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Keyword Input */}
          <div className="flex-grow-[2]">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Từ khóa</label>
            <div className="relative group">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all text-gray-800 placeholder-gray-400"
                placeholder="Nhân viên bán hàng, Gia sư, Marketing..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={isSearching}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* City Select */}
          <div className="flex-grow-[1] md:min-w-[180px]">
             <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Thành phố</label>
             <div className="relative">
               <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none cursor-pointer"
                  disabled={isSearching}
               >
                 {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
             </div>
          </div>

          {/* District Input */}
          <div className="flex-grow-[1]">
             <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Quận/Huyện (Tùy chọn)</label>
             <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all text-gray-800 placeholder-gray-400"
                placeholder="Cầu Giấy, Quận 1..."
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={isSearching}
              />
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSearching || !keyword.trim()}
              className={`w-full md:w-auto h-[50px] px-8 rounded-xl font-bold text-white transition-all transform flex items-center justify-center gap-2 ${
                isSearching || !keyword.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 hover:scale-105 shadow-lg hover:shadow-teal-500/30'
              }`}
            >
              {isSearching ? 'Đang tìm...' : 'Tìm Ngay'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default JobSearch;