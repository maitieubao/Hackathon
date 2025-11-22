import React, { useState, useEffect } from 'react';
import JobSearch from './components/JobSearch';
import JobCard from './components/JobCard';
import VerificationInput from './components/VerificationInput';
import SafetyScore from './components/SafetyScore';
import SuitabilityCard from './components/SuitabilityCard';
import GroundingInfo from './components/GroundingInfo';
import ApplicationDraft from './components/ApplicationDraft';
import { AnalysisStatus, AnalysisResult, JobListing, GroundingSource, SearchCriteria } from './types';
import { 
  searchJobs, 
  quickExtractEntities, 
  analyzeScamRisk, 
  verifyCompany, 
  analyzeSuitabilityAndDraft, 
  extractContentFromImage, 
  extractContentFromUrl 
} from './services/geminiService';

type AppMode = 'FIND_JOBS' | 'VERIFY_JOB';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('FIND_JOBS');
  
  // Analysis State
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [searchResults, setSearchResults] = useState<JobListing[]>([]);
  const [searchSources, setSearchSources] = useState<GroundingSource[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<GeolocationCoordinates | undefined>(undefined);
  
  // View Mode determines if we are showing list/input or results within the current AppMode
  const [viewMode, setViewMode] = useState<'INPUT' | 'RESULT'>('INPUT');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position.coords),
        (err) => console.log("Geolocation permission denied or error:", err)
      );
    }
  }, []);

  const handleSearch = async (criteria: SearchCriteria) => {
    setStatus(AnalysisStatus.SEARCHING);
    setSearchResults([]);
    setError(null);
    setViewMode('INPUT'); // Stay on input/list view but with loading
    setSelectedJob(null);
    setResult(null);

    try {
      const { jobs, sources } = await searchJobs(criteria, location);
      if (jobs.length === 0) {
         setError("Không tìm thấy công việc phù hợp. Hãy thử thay đổi từ khóa hoặc địa điểm.");
         setStatus(AnalysisStatus.IDLE);
      } else {
         setSearchResults(jobs);
         setSearchSources(sources);
         setStatus(AnalysisStatus.IDLE);
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi khi tìm kiếm việc làm.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleAnalyzeJobFromList = async (job: JobListing) => {
    setSelectedJob(job);
    const fullText = `Tiêu đề: ${job.title}. Công ty: ${job.company}. Địa điểm: ${job.location}. Lương: ${job.salary}. Mô tả: ${job.description}`;
    await runAnalysis(fullText);
  };

  const handleVerifyInput = async (data: { type: 'text' | 'url' | 'image', content: string, mimeType?: string }) => {
     setStatus(AnalysisStatus.ANALYZING);
     setError(null);
     setResult(null);

     // Create a temporary job object for UI context
     setSelectedJob({
         id: 'verify-' + Date.now(),
         title: 'Đang phân tích...',
         company: 'Đang phân tích...',
         location: '...',
         salary: '...',
         description: 'Đang xử lý dữ liệu đầu vào...'
     });

     let textToAnalyze = "";

     try {
        // Pre-process input
        if (data.type === 'image' && data.mimeType) {
            textToAnalyze = await extractContentFromImage(data.content, data.mimeType);
        } else if (data.type === 'url') {
            textToAnalyze = await extractContentFromUrl(data.content);
            if (textToAnalyze === "ERROR_CANNOT_READ_LINK") {
                throw new Error("Không thể đọc nội dung từ link này (do quyền riêng tư hoặc chưa được Google lập chỉ mục). Vui lòng COPY NỘI DUNG và dùng tab 'Văn Bản' để AI phân tích chính xác.");
            }
        } else {
            textToAnalyze = data.content;
        }

        if (!textToAnalyze || textToAnalyze.length < 10) {
            throw new Error("Nội dung quá ngắn hoặc không đủ thông tin để phân tích.");
        }

        // Update UI with extracted text preview if possible (optional)
        setSelectedJob(prev => prev ? { ...prev, description: textToAnalyze.substring(0, 150) + "..." } : null);
        
        // Run main analysis
        await runAnalysis(textToAnalyze);

     } catch (err: any) {
         console.error(err);
         setError(err.message || "Không thể xử lý dữ liệu đầu vào. Vui lòng thử lại.");
         setStatus(AnalysisStatus.ERROR);
     }
  };

  const runAnalysis = async (text: string) => {
    setViewMode('RESULT');
    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    setResult(null);

    try {
      const entitiesPromise = quickExtractEntities(text);
      const scamPromise = analyzeScamRisk(text);
      const groundingPromise = verifyCompany(text, location);
      const suitabilityPromise = analyzeSuitabilityAndDraft(text);

      const [entities, scamAnalysis, grounding, suitabilityData] = await Promise.all([
        entitiesPromise,
        scamPromise,
        groundingPromise,
        suitabilityPromise
      ]);

      setResult({
        entities,
        scamAnalysis,
        grounding,
        suitability: suitabilityData.suitability,
        applicationDraft: suitabilityData.draft
      });
      setStatus(AnalysisStatus.COMPLETE);

    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra trong quá trình phân tích.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleBack = () => {
    setViewMode('INPUT');
    setResult(null);
    setSelectedJob(null);
    setStatus(AnalysisStatus.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-b from-teal-50 to-white font-sans">
      {/* Header & Navigation */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-teal-400 to-blue-500 p-2 rounded-lg shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Part-time Pal</h1>
                        <p className="text-xs text-gray-500 hidden sm:block">Trợ lý việc làm thông minh</p>
                    </div>
                </div>

                {/* Mode Toggle Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button 
                        onClick={() => { setAppMode('FIND_JOBS'); setViewMode('INPUT'); setError(null); }}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            appMode === 'FIND_JOBS' 
                            ? 'bg-white text-teal-700 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Tìm Việc
                    </button>
                    <button 
                        onClick={() => { setAppMode('VERIFY_JOB'); setViewMode('INPUT'); setError(null); }}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            appMode === 'VERIFY_JOB' 
                            ? 'bg-white text-teal-700 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Kiểm Tra & Xác Thực
                    </button>
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        
        {viewMode === 'INPUT' && (
            <div className="animate-fade-in-up">
                {appMode === 'FIND_JOBS' ? (
                    <>
                         <JobSearch onSearch={handleSearch} isSearching={status === AnalysisStatus.SEARCHING} />
                         
                         {status === AnalysisStatus.SEARCHING && (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
                                <p className="mt-4 text-gray-500">Đang tìm kiếm việc làm phù hợp...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6 text-center">
                                {error}
                            </div>
                        )}

                        {searchResults.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <h3 className="text-xl font-bold text-gray-800">Kết quả tìm kiếm</h3>
                                    <span className="text-sm text-gray-500">Tìm thấy {searchResults.length} công việc</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {searchResults.map((job) => (
                                    <JobCard key={job.id} job={job} onAnalyze={handleAnalyzeJobFromList} />
                                    ))}
                                </div>
                                {searchSources.length > 0 && (
                                    <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Nguồn dữ liệu</p>
                                        <div className="flex flex-wrap gap-2">
                                            {searchSources.slice(0, 5).map((source, idx) => (
                                                <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline bg-white px-2 py-1 rounded border border-gray-200">{source.title}</a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                         
                        {/* Initial Empty State Hint */}
                        {searchResults.length === 0 && status !== AnalysisStatus.SEARCHING && !error && (
                            <div className="text-center py-16 opacity-50">
                                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <p>Nhập từ khóa và địa điểm để tìm việc làm</p>
                            </div>
                        )}
                    </>
                ) : (
                    /* VERIFY JOB MODE */
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Xác Thực Tin Tuyển Dụng</h2>
                            <p className="text-gray-500">AI sẽ phân tích nội dung, kiểm tra lừa đảo và đánh giá độ tin cậy cho bạn.</p>
                        </div>
                        <VerificationInput onAnalyze={handleVerifyInput} isAnalyzing={status === AnalysisStatus.ANALYZING} />
                        
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl border-l-4 border-red-500 mt-6 text-center shadow-sm">
                                <div className="font-bold mb-1">Đã xảy ra lỗi</div>
                                {error}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

        {viewMode === 'RESULT' && (
          /* Analysis View (Shared) */
          <div className="animate-fade-in-up">
             <button 
                onClick={handleBack}
                className="mb-6 text-gray-500 hover:text-teal-600 font-medium flex items-center gap-2 transition-colors"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại {appMode === 'FIND_JOBS' ? 'tìm kiếm' : 'nhập liệu'}
             </button>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Col: Job Details */}
                <div className="lg:col-span-5 space-y-6">
                   <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                         <div>
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                                {result?.entities?.jobTitle || selectedJob?.title || "Đang tải..."}
                            </h2>
                            <p className="text-lg text-teal-600 font-medium mt-1">
                                {result?.entities?.companyName || selectedJob?.company}
                            </p>
                         </div>
                      </div>
                      
                      <div className="space-y-3 text-gray-600 mb-6">
                         <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {result?.entities?.location || selectedJob?.location}
                         </div>
                         <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {result?.entities?.salary || selectedJob?.salary}
                         </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 leading-relaxed border border-gray-200">
                         {selectedJob?.description || "Đang phân tích chi tiết..."}
                      </div>
                   </div>

                   {/* Tips */}
                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Lời khuyên an toàn
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
                            <li>Tuyệt đối không nộp phí đặt cọc, phí hồ sơ.</li>
                            <li>Ưu tiên các chuỗi cửa hàng lớn, có địa chỉ rõ ràng.</li>
                            <li>Cẩn thận với các việc làm "CTV online tại nhà".</li>
                        </ul>
                    </div>
                </div>

                {/* Right Col: Analysis Results */}
                <div className="lg:col-span-7 space-y-6">
                    {status === AnalysisStatus.ANALYZING ? (
                         <div className="h-full flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl shadow-sm border border-gray-100">
                             <div className="relative">
                                <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-teal-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                             </div>
                             <p className="mt-6 text-lg font-medium text-gray-600">Đang phân tích độ an toàn...</p>
                             <p className="text-sm text-gray-400 mt-2">Kiểm tra lừa đảo • Xác minh địa chỉ • Đánh giá phù hợp</p>
                         </div>
                    ) : result ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SafetyScore analysis={result.scamAnalysis} />
                                <SuitabilityCard suitability={result.suitability} />
                            </div>
                            <GroundingInfo data={result.grounding} />
                            {result.applicationDraft && (
                                <ApplicationDraft draft={result.applicationDraft} />
                            )}
                        </>
                    ) : null}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;