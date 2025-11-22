import React, { useState } from 'react';
import { SearchCriteria } from '../types';

interface JobSearchProps {
  onSearch: (criteria: SearchCriteria) => void;
  isSearching: boolean;
}

const CITIES = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Bình Dương", "Đồng Nai", "Khác"];

const JOB_CATEGORIES = [
  { id: 'all', label: 'Tất cả lĩnh vực' },
  { id: 'ban-hang', label: 'Bán hàng' },
  { id: 'phuc-vu', label: 'Phục vụ F&B' },
  { id: 'gia-su', label: 'Gia sư' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'van-phong', label: 'Văn phòng' },
  { id: 'giao-hang', label: 'Giao hàng' },
  { id: 'khac', label: 'Khác' }
];

const WORK_SHIFTS = [
  { id: 'morning', label: 'Sáng (6h-12h)' },
  { id: 'afternoon', label: 'Chiều (12h-18h)' },
  { id: 'evening', label: 'Tối (18h-23h)' },
  { id: 'weekend', label: 'Cuối tuần' },
  { id: 'flexible', label: 'Linh hoạt' }
];

const SALARY_RANGES = [
  { min: 0, max: 3000000, label: '< 3 triệu' },
  { min: 3000000, max: 5000000, label: '3 - 5 triệu' },
  { min: 5000000, max: 8000000, label: '5 - 8 triệu' },
  { min: 8000000, max: 15000000, label: '8 - 15 triệu' },
  { min: 15000000, max: 999999999, label: '> 15 triệu' }
];

const JobSearch: React.FC<JobSearchProps> = ({ onSearch, isSearching }) => {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('Hà Nội');
  const [district, setDistrict] = useState('');
  const [jobCategory, setJobCategory] = useState('all');
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState<{ min: number; max: number } | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSearch({ 
        keyword, 
        city, 
        district,
        jobCategory: jobCategory !== 'all' ? jobCategory : undefined,
        workShift: selectedShifts.length > 0 ? selectedShifts : undefined,
        salaryRange
      });
    }
  };

  const toggleShift = (shiftId: string) => {
    setSelectedShifts(prev => 
      prev.includes(shiftId) ? prev.filter(s => s !== shiftId) : [...prev, shiftId]
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
          Tìm việc làm part-time
        </h1>
        <p className="text-gray-500 text-lg">
          Trợ lý AI giúp bạn tìm và đánh giá công việc phù hợp nhất.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10">
        {/* Main Search Bar - Gemini Style */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-focus-within:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <input
            type="text"
            className="w-full pl-16 pr-32 py-5 bg-white border border-gray-200 rounded-full shadow-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg text-gray-800 placeholder-gray-400 outline-none"
            placeholder="Bạn muốn tìm việc gì? (VD: Gia sư, Bán hàng...)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            disabled={isSearching}
          />

          <div className="absolute inset-y-0 right-2 flex items-center">
            <button
              type="submit"
              disabled={isSearching || !keyword.trim()}
              className={`p-3 rounded-full transition-all ${
                isSearching || !keyword.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800 shadow-md'
              }`}
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Filters Bar - Minimalist */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {/* City Dropdown */}
          <div className="relative">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer transition-colors"
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <svg className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={jobCategory}
              onChange={(e) => setJobCategory(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer transition-colors"
            >
              {JOB_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <svg className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>

          {/* Toggle Advanced Filters */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${
              showFilters || selectedShifts.length > 0 || salaryRange
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Bộ lọc
          </button>
        </div>

        {/* Expanded Filters Area */}
        {showFilters && (
          <div className="mt-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Shifts */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ca làm việc</h3>
                <div className="flex flex-wrap gap-2">
                  {WORK_SHIFTS.map(shift => (
                    <button
                      key={shift.id}
                      type="button"
                      onClick={() => toggleShift(shift.id)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        selectedShifts.includes(shift.id)
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {shift.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Mức lương</h3>
                <div className="flex flex-wrap gap-2">
                  {SALARY_RANGES.map((range, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSalaryRange(salaryRange?.min === range.min ? undefined : range)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        salaryRange?.min === range.min
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* District Input inside filters */}
            <div className="mt-6 pt-6 border-t border-gray-100">
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quận/Huyện cụ thể</label>
               <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 outline-none text-sm"
                  placeholder="VD: Cầu Giấy, Quận 1..."
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
               />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default JobSearch;