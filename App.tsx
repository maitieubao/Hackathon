import React, { useState, useEffect } from 'react';
import JobSearch from './components/JobSearch';
import JobCard from './components/JobCard';
import VerificationInput from './components/VerificationInput';
import SafetyScore from './components/SafetyScore';
import SuitabilityCard from './components/SuitabilityCard';
import GroundingInfo from './components/GroundingInfo';
import ApplicationDraft from './components/ApplicationDraft';
import CVMatcher from './components/CVMatcher';
import DefaultLogo from './components/DefaultLogo';
import MarkdownRenderer from './components/MarkdownRenderer';
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
  const [logoError, setLogoError] = useState(false);
  
  // View Mode determines if we are showing list/input or results within the current AppMode
  const [viewMode, setViewMode] = useState<'INPUT' | 'RESULT'>('INPUT');

  useEffect(() => {
    setLogoError(false);
  }, [selectedJob]);

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
         description: 'Đang xử lý dữ liệu đầu vào...',
         source: 'User Input',
         logo: '' // Empty logo triggers default icon
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
    <div className="min-h-screen pb-12 bg-gray-50 font-sans text-gray-900">
      {/* Header & Navigation - Added Gradient */}
      <header className="bg-gradient-to-r from-teal-600 to-blue-600 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setAppMode('FIND_JOBS'); setViewMode('INPUT'); }}>
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Part-time Pal</h1>
                        <p className="text-xs text-teal-100 hidden sm:block">Trợ lý việc làm thông minh</p>
                    </div>
                </div>

                {/* Mode Toggle Tabs */}
                <div className="flex bg-white/10 p-1 rounded-lg backdrop-blur-sm">
                    <button 
                        onClick={() => { setAppMode('FIND_JOBS'); setViewMode('INPUT'); setError(null); }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            appMode === 'FIND_JOBS' 
                            ? 'bg-white text-teal-700 shadow-sm' 
                            : 'text-teal-100 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        Tìm Việc
                    </button>
                    <button 
                        onClick={() => { setAppMode('VERIFY_JOB'); setViewMode('INPUT'); setError(null); }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            appMode === 'VERIFY_JOB' 
                            ? 'bg-white text-teal-700 shadow-sm' 
                            : 'text-teal-100 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        Check Scam
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
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent"></div>
                                <p className="mt-4 text-gray-500">Đang tìm kiếm...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6 text-center">
                                {error}
                            </div>
                        )}

                        {searchResults.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Kết quả tìm kiếm</h3>
                                    <span className="text-sm text-gray-500">Tìm thấy {searchResults.length} công việc</span>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    {searchResults.map((job) => (
                                      <JobCard key={job.id} job={job} onApply={handleAnalyzeJobFromList} />
                                    ))}
                                </div>

                                {searchSources.length > 0 && (
                                    <div className="mt-8 p-4 bg-gray-100 rounded-xl">
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
                            <div className="text-center py-16 opacity-40">
                                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <p>Nhập từ khóa để bắt đầu tìm việc</p>
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
          /* Analysis View (Redesigned - Vertical Layout) */
          <div className="animate-fade-in-up max-w-4xl mx-auto">
             <button 
                onClick={handleBack}
                className="mb-6 text-gray-500 hover:text-teal-600 font-medium flex items-center gap-2 transition-colors"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại
             </button>

             <div className="space-y-8">
                {/* 1. Job Header & Description (Full Width) */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            {selectedJob?.logo && !logoError ? (
                                <img 
                                    src={selectedJob.logo} 
                                    alt={selectedJob.company} 
                                    className="w-20 h-20 rounded-xl object-contain border border-gray-100 shadow-sm bg-white" 
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <DefaultLogo className="w-20 h-20" />
                            )}
                        </div>
                        
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
                                {result?.entities?.jobTitle || selectedJob?.title || "Đang tải..."}
                            </h2>
                            <p className="text-xl text-teal-600 font-semibold mb-4">
                                {result?.entities?.companyName || selectedJob?.company}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 text-gray-600 text-sm mb-6">
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {result?.entities?.location || selectedJob?.location}
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {result?.entities?.salary || selectedJob?.salary}
                                </div>
                            </div>

                            <div className="prose prose-sm max-w-none text-gray-600">
                                <MarkdownRenderer content={selectedJob?.description || "Đang phân tích chi tiết..."} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Analysis Cards (Grid) */}
                {status === AnalysisStatus.ANALYZING ? (
                     <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center">
                         <div className="inline-block relative mb-4">
                            <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
                         </div>
                         <h3 className="text-lg font-medium text-gray-900">AI đang phân tích...</h3>
                         <p className="text-gray-500 mt-1">Đang kiểm tra lừa đảo, xác thực công ty và đánh giá mức độ phù hợp.</p>
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

                        {/* CV Matcher Feature */}
                        {selectedJob && selectedJob.description && (
                             <CVMatcher jobDescription={selectedJob.description} />
                        )}
                    </>
                ) : null}
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;