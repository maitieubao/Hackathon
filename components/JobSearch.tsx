import React, { useState, useEffect, useRef } from 'react';
import { SearchCriteria } from '../types';

interface JobSearchProps {
  onSearch: (criteria: SearchCriteria) => void;
  isSearching: boolean;
}

// Full list of 63 provinces/cities in Vietnam
const CITIES = [
  "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
  "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
  "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
  "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
  "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
  "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu",
  "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định",
  "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên",
  "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị",
  "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên",
  "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang",
  "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
].sort();

const JOB_CATEGORIES = [
  { id: 'all', label: 'Tất cả lĩnh vực' },
  { id: 'ban-hang', label: 'Bán hàng / Thu ngân' },
  { id: 'phuc-vu', label: 'Phục vụ / Pha chế (F&B)' },
  { id: 'gia-su', label: 'Gia sư / Trợ giảng' },
  { id: 'marketing', label: 'Marketing / Content / Design' },
  { id: 'van-phong', label: 'Hành chính / Văn phòng / Nhập liệu' },
  { id: 'giao-hang', label: 'Giao hàng / Kho vận' },
  { id: 'cskh', label: 'CSKH / Telesale' },
  { id: 'su-kien', label: 'PG / PB / Sự kiện' },
  { id: 'it', label: 'Thực tập sinh IT / Lập trình' },
  { id: 'du-lich', label: 'Hướng dẫn viên / Du lịch' },
  { id: 'khac', label: 'Khác' }
];

const WORK_SHIFTS = [
  { id: 'morning', label: 'Sáng (6h - 12h)' },
  { id: 'afternoon', label: 'Chiều (12h - 18h)' },
  { id: 'evening', label: 'Tối (18h - 23h)' },
  { id: 'night', label: 'Ca đêm (22h - 6h)' },
  { id: 'part-time-fixed', label: 'Part-time cố định' },
  { id: 'part-time-xoay', label: 'Part-time xoay ca' },
  { id: 'weekend', label: 'Chỉ làm cuối tuần' },
  { id: 'wfh', label: 'Làm việc tại nhà (Online)' }
];

// Reusable Combobox Component
const Combobox = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  icon 
}: { 
  options: { label: string, value: string }[], 
  value: string, 
  onChange: (val: string) => void, 
  placeholder: string,
  icon?: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Initialize search with current value label if exists
  useEffect(() => {
    const selected = options.find(o => o.value === value);
    if (selected && !isOpen) {
      setSearch(selected.label);
    }
  }, [value, options, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search to selected value on close
        const selected = options.find(o => o.value === value);
        if (selected) setSearch(selected.label);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef, value, options]);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors placeholder-gray-400"
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            // If user clears input, maybe reset value? Or keep previous? 
            // Let's keep previous until explicit selection or strict match logic.
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearch(''); // Clear on focus to show all options or allow fresh typing? 
            // Actually better UX: Select all text on focus so user can overwrite easily
          }}
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </div>
        <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <div
                key={opt.value}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${value === opt.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                onClick={() => {
                  onChange(opt.value);
                  setSearch(opt.label);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-400 italic">Không tìm thấy kết quả</div>
          )}
        </div>
      )}
    </div>
  );
};

const JobSearch: React.FC<JobSearchProps> = ({ onSearch, isSearching }) => {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('Hà Nội');
  const [district, setDistrict] = useState('');
  const [jobCategory, setJobCategory] = useState('all');
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  // Salary Range: min salary
  const [minSalary, setMinSalary] = useState<number>(0);
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
        salaryRange: minSalary > 0 ? { min: minSalary, max: 999999999 } : undefined
      });
    }
  };

  const toggleShift = (shiftId: string) => {
    setSelectedShifts(prev => 
      prev.includes(shiftId) ? prev.filter(s => s !== shiftId) : [...prev, shiftId]
    );
  };

  const formatCurrency = (val: number) => {
    if (val === 0) return "Thỏa thuận";
    if (val >= 1000000) return `${(val / 1000000).toFixed(1).replace('.0', '')} triệu+`;
    return `${(val / 1000).toFixed(0)}k+`;
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
        {/* Main Search Bar */}
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

        {/* Filters Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {/* City Combobox */}
          <div className="w-48">
             <Combobox 
                options={CITIES.map(c => ({ label: c, value: c }))}
                value={city}
                onChange={setCity}
                placeholder="Chọn Tỉnh/Thành"
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
             />
          </div>

          {/* Category Combobox */}
          <div className="w-64">
             <Combobox 
                options={JOB_CATEGORIES.map(c => ({ label: c.label, value: c.id }))}
                value={jobCategory}
                onChange={setJobCategory}
                placeholder="Chọn Lĩnh vực"
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
             />
          </div>

          {/* Toggle Advanced Filters */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${
              showFilters || selectedShifts.length > 0 || minSalary > 0
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Bộ lọc nâng cao
          </button>
        </div>

        {/* Expanded Filters Area */}
        {showFilters && (
          <div className="mt-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Shifts */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ca làm việc & Hình thức</h3>
                <div className="flex flex-wrap gap-2">
                  {WORK_SHIFTS.map(shift => (
                    <button
                      key={shift.id}
                      type="button"
                      onClick={() => toggleShift(shift.id)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors border ${
                        selectedShifts.includes(shift.id)
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {shift.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary Slider */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Mức lương tối thiểu mong muốn</h3>
                <div className="px-2 py-4">
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-sm font-medium text-gray-500">Mọi mức lương</span>
                     <span className="text-lg font-bold text-green-600">{formatCurrency(minSalary)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="20000000" 
                    step="500000" 
                    value={minSalary}
                    onChange={(e) => setMinSalary(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>0đ</span>
                    <span>5 triệu</span>
                    <span>10 triệu</span>
                    <span>15 triệu</span>
                    <span>20 triệu+</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* District Input inside filters */}
            <div className="mt-6 pt-6 border-t border-gray-100">
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quận/Huyện cụ thể (Tùy chọn)</label>
               <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 outline-none text-sm"
                  placeholder="VD: Cầu Giấy, Quận 1, Thủ Đức..."
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