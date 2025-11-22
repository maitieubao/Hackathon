import React, { useState, useRef } from 'react';

interface VerificationInputProps {
  onAnalyze: (data: { type: 'text' | 'url' | 'image', content: string, mimeType?: string }) => void;
  isAnalyzing: boolean;
}

const VerificationInput: React.FC<VerificationInputProps> = ({ onAnalyze, isAnalyzing }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'link' | 'image'>('text');
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to process file from Input or Paste
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
        alert("Vui lòng chỉ dán hoặc chọn file hình ảnh.");
        return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (activeTab !== 'image' || isAnalyzing) return;
    
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processFile(file);
          e.preventDefault();
          return;
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnalyzing) return;

    if (activeTab === 'text' && textContent.trim()) {
      onAnalyze({ type: 'text', content: textContent });
    } else if (activeTab === 'link' && urlContent.trim()) {
      onAnalyze({ type: 'url', content: urlContent });
    } else if (activeTab === 'image' && selectedImage && imagePreview) {
        // Strip base64 prefix for the API
        const base64Data = imagePreview.split(',')[1];
        onAnalyze({ type: 'image', content: base64Data, mimeType: selectedImage.type });
    }
  };

  const isSubmitDisabled = () => {
    if (isAnalyzing) return true;
    if (activeTab === 'text') return !textContent.trim();
    if (activeTab === 'link') return !urlContent.trim();
    if (activeTab === 'image') return !selectedImage;
    return true;
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'text' ? 'text-teal-600 bg-white border-b-2 border-teal-500' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Văn Bản
        </button>
        <button
          onClick={() => setActiveTab('link')}
          className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'link' ? 'text-teal-600 bg-white border-b-2 border-teal-500' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Đường Dẫn (Link)
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'image' ? 'text-teal-600 bg-white border-b-2 border-teal-500' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Hình Ảnh
        </button>
      </div>

      {/* Content Area */}
      <div className="p-8">
        <form onSubmit={handleSubmit}>
          {activeTab === 'text' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Sao chép nội dung tin tuyển dụng từ Facebook, Zalo... và dán vào đây.</p>
              <textarea
                className="w-full h-48 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none bg-gray-50 transition-all text-gray-700 placeholder-gray-400"
                placeholder="Tuyển nhân viên phục vụ..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>
          )}

          {activeTab === 'link' && (
            <div className="space-y-4">
              <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg border border-blue-100 flex gap-2 items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Lưu ý: Một số link Facebook hoặc Nhóm kín không thể truy cập trực tiếp. Nếu gặp lỗi, vui lòng sao chép nội dung và dùng tab <strong>Văn Bản</strong>.</p>
              </div>
              <div className="relative">
                <input
                    type="url"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                    placeholder="https://facebook.com/..."
                    value={urlContent}
                    onChange={(e) => setUrlContent(e.target.value)}
                    disabled={isAnalyzing}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Tải lên ảnh chụp màn hình tin tuyển dụng. AI sẽ đọc nội dung trong ảnh.</p>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                onPaste={handlePaste}
                tabIndex={0}
                className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer transition-all outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    imagePreview ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'
                }`}
              >
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full object-contain rounded-lg p-2" />
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-500 text-sm font-medium">Nhấn để chọn hoặc dán ảnh (Ctrl+V)</span>
                    </>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    disabled={isAnalyzing}
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitDisabled()}
              className={`px-8 py-3 rounded-xl font-bold text-white transition-all transform shadow-lg ${
                isSubmitDisabled()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:scale-105 hover:shadow-teal-500/30'
              }`}
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang Xử Lý...
                </span>
              ) : (
                'Xác Thực & Phân Tích'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerificationInput;