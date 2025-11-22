import { GoogleGenAI, Type, Schema } from "@google/genai";
import { JobEntity, ScamAnalysis, SuitabilityAnalysis, GroundingData, GroundingSource, JobListing, SearchCriteria, CVAnalysis } from "../types";

// Lazy initialization to prevent crash on load if env var is missing
const getAI = () => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your .env file.");
  }
  return new GoogleGenAI({ apiKey });
};

// --- HELPER: INPUT PROCESSING ---

// Extract text from an image (Screenshot of job posting)
export const extractContentFromImage = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Đây là hình ảnh một tin tuyển dụng. Hãy trích xuất toàn bộ nội dung văn bản có trong ảnh. Nếu có các chi tiết hình ảnh đáng ngờ (ví dụ: logo bị lỗi, phông chữ cẩu thả, hình ảnh cắt ghép), hãy mô tả chúng kèm theo nội dung văn bản."
          }
        ]
      }
    });
    return response.text || "Không thể đọc được nội dung từ ảnh.";
  } catch (error) {
    console.error("Image extraction failed:", error);
    return "Lỗi: Không thể xử lý ảnh (Vui lòng kiểm tra API Key hoặc thử lại).";
  }
};

// Extract content from a URL using Google Search grounding
export const extractContentFromUrl = async (url: string): Promise<string> => {
  try {
    const ai = getAI();
    const prompt = `
      Analyze the content of this URL: "${url}"
      
      Goal: Extract the full job posting content.
      
      Instructions:
      1. Use Google Search to find the page content.
      2. **CRITICAL FOR SOCIAL MEDIA (Facebook, LinkedIn)**: 
         - These pages are often private or require login. 
         - You MUST look at the **Search Snippets**, **Page Titles**, and **Cached Text** in the search results to reconstruct the job details.
         - DO NOT just say "Login required". Try to find the content from the public preview.
      3. If it is a JOB BOARD (TopCV, VietnamWorks):
         - Extract Title, Company, Salary, Location, and Description.
      4. ALSO: Look for any scam warnings or "bóc phốt" related to this specific URL in the search results.
         
      **OUTPUT RULE**: 
      - If you find RELEVANT job information, return the full text description.
      - If the link is dead, purely private (no snippets found), or you strictly cannot find any job details, return exactly: "ERROR_CANNOT_READ_LINK"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    const text = response.text || "";
    // Double check if the response is just a generic "I cannot access" message
    if (text.includes("ERROR_CANNOT_READ_LINK") || text.length < 50) {
        return "ERROR_CANNOT_READ_LINK";
    }
    return text;

  } catch (error) {
    console.error("URL extraction failed:", error);
    return "ERROR_CANNOT_READ_LINK";
  }
};

// --- MAIN FEATURES ---

// 0. Search Jobs (New Feature)
// Finds jobs using Google Search and parses them into a structured list.
export const searchJobs = async (criteria: SearchCriteria, userLocation?: GeolocationCoordinates): Promise<{ jobs: JobListing[], sources: GroundingSource[] }> => {
  try {
    const ai = getAI();
    const locationContext = userLocation 
      ? `(Context: User is at Latitude ${userLocation.latitude}, Longitude ${userLocation.longitude})` 
      : '';

    // Construct a targeted query based on filters
    let query = `việc làm part-time cho sinh viên ${criteria.keyword}`;
    if (criteria.district) query += ` tại ${criteria.district}`;
    if (criteria.city) query += ` ở ${criteria.city}`;
    if (criteria.jobCategory) query += ` lĩnh vực ${criteria.jobCategory}`;

    const prompt = `
      Help me find a comprehensive list of RECENT part-time job recruitments for students in Vietnam based on this query: "${query}". ${locationContext}
      
      You MUST use Google Search to find real, active listings. 
      FIND AS MANY JOBS AS POSSIBLE (Target at least 10-12 distinct jobs).
      
      After searching, format the output strictly as a list where each job is separated by "---JOB_SEPARATOR---".
      For each job, use this exact format:
      
      Title: [Job Title]
      Company: [Company Name]
      Domain: [Company Website Domain, e.g., 'vinamilk.com.vn', 'shopee.vn', 'highlandscoffee.com.vn'. If not found, leave blank]
      Location: [Location]
      Salary: [Salary]
      Description: [Short summary of the job (approx 2 sentences)]
      Source: [Source Name]
      
      ---JOB_SEPARATOR---
      
      (Repeat for all found jobs)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "";
    const sources: GroundingSource[] = [];
    
    // Extract grounding chunks for sources
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
        chunks.forEach(chunk => {
            if (chunk.web) {
                sources.push({ uri: chunk.web.uri || '', title: chunk.web.title || 'Web Source' });
            }
        });
    }

    // Parse text into JobListing objects
    const jobs: JobListing[] = [];
    const rawJobs = text.split("---JOB_SEPARATOR---");

    rawJobs.forEach((raw, index) => {
      if (!raw.trim()) return;

      const titleMatch = raw.match(/Title:\s*(.+)/);
      const companyMatch = raw.match(/Company:\s*(.+)/);
      const domainMatch = raw.match(/Domain:\s*(.+)/);
      const locationMatch = raw.match(/Location:\s*(.+)/);
      const salaryMatch = raw.match(/Salary:\s*(.+)/);
      const descMatch = raw.match(/Description:\s*(.+)/);
      const sourceMatch = raw.match(/Source:\s*(.+)/);

      if (titleMatch) {
        const companyName = companyMatch ? companyMatch[1].trim() : "Đang cập nhật";
        const domain = domainMatch ? domainMatch[1].trim() : "";
        
        // Logo Strategy:
        // 1. Try Clearbit API if we have a domain
        // 2. Fallback to UI Avatars if no domain
        let logoUrl = "";
        if (domain && domain.length > 3 && !domain.includes("facebook.com") && !domain.includes("google.com")) {
             logoUrl = `https://logo.clearbit.com/${domain}`;
        } else {
             // Use empty string to trigger DefaultLogo in JobCard
             logoUrl = ""; 
        }

        jobs.push({
          id: `job-${index}-${Date.now()}`,
          title: titleMatch[1].trim(),
          company: companyName,
          location: locationMatch ? locationMatch[1].trim() : criteria.city || "Việt Nam",
          salary: salaryMatch ? salaryMatch[1].trim() : "Thỏa thuận",
          description: descMatch ? descMatch[1].trim() : "",
          source: sourceMatch ? sourceMatch[1].trim() : "Google Search",
          logo: logoUrl
        });
      }
    });

    return { jobs, sources };

  } catch (error) {
    console.error("Job search failed:", error);
    return { jobs: [], sources: [] };
  }
};

// 1. Fast Extraction (Flash)
// Extract basic info extremely fast to show the user we understood the input.
export const quickExtractEntities = async (text: string): Promise<JobEntity> => {
  try {
    const ai = getAI();
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        jobTitle: { type: Type.STRING },
        companyName: { type: Type.STRING },
        salary: { type: Type.STRING },
        location: { type: Type.STRING },
      },
      required: ["jobTitle", "companyName", "salary", "location"],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract the job title, company name, salary range, and location from this job posting text. If not found, use "Không rõ". Text: ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as JobEntity;
    }
    throw new Error("Empty response from model");
  } catch (error) {
    console.error("Entity extraction failed:", error);
    return { jobTitle: "Unknown", companyName: "Unknown", salary: "Unknown", location: "Unknown" };
  }
};

// 2. Deep Scam Analysis (Thinking Model)
// Use heavy reasoning to detect subtle scam patterns.
export const analyzeScamRisk = async (text: string): Promise<ScamAnalysis> => {
  try {
    const ai = getAI();
    const prompt = `
      Bạn là một chuyên gia an ninh mạng và bảo vệ người lao động. Hãy phân tích tin tuyển dụng dưới đây để tìm dấu hiệu lừa đảo (scam).
      
      Hãy suy nghĩ kỹ về:
      1. Ngôn ngữ: Có sai chính tả, dùng từ ngữ lôi kéo thái quá, hay urgency giả tạo không?
      2. Lợi ích: Lương có cao bất thường so với yêu cầu không? "Việc nhẹ lương cao"?
      3. Yêu cầu tiền: Có yêu cầu đóng phí, đặt cọc, mua đồng phục trước không?
      4. Thông tin liên hệ: Email cá nhân (gmail, yahoo) thay vì email doanh nghiệp, chỉ liên hệ qua Zalo/Telegram?
      
      Tin tuyển dụng: "${text}"
      
      Trả về kết quả dạng JSON.
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: "Điểm an toàn từ 0 đến 100. 100 là rất an toàn." },
        riskLevel: { type: Type.STRING, enum: ["An Toàn", "Cảnh Báo", "Nguy Hiểm"] },
        reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
        verdict: { type: Type.STRING, description: "Kết luận chi tiết về độ an toàn." },
      },
      required: ["score", "riskLevel", "reasons", "verdict"],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro with Thinking for deep analysis
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // High thinking budget for safety
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ScamAnalysis;
    }
    throw new Error("Thinking model returned empty text");
  } catch (error) {
    console.error("Scam analysis failed:", error);
    return {
      score: 50,
      riskLevel: "Cảnh Báo",
      reasons: ["Không thể phân tích chi tiết do lỗi hệ thống (hoặc thiếu API Key)."],
      verdict: "Vui lòng tự kiểm tra kỹ lưỡng."
    };
  }
};

// 3. Verification & Social Reputation Check (Flash + Tools)
// Verify company existence and check reputation on Forums/Social Media.
export const verifyCompany = async (text: string, userLocation?: GeolocationCoordinates): Promise<GroundingData> => {
  try {
    const ai = getAI();
    const locationConfig = userLocation ? {
      retrievalConfig: {
        latLng: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        }
      }
    } : undefined;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Hãy thực hiện xác minh đa chiều cho tin tuyển dụng này:
        "${text}"

        Nhiệm vụ tìm kiếm:
        1. **Xác minh cơ bản**: Công ty có tồn tại không? Địa chỉ có thật trên Google Maps không?
        2. **Kiểm tra Uy Tín Cộng Đồng (Rất Quan Trọng)**: Hãy tìm kiếm trên các DIỄN ĐÀN (Voz, Tinh tế, ReviewCongTy) và MẠNG XÃ HỘI (Facebook Groups tuyển dụng).
           - Tìm kiếm các từ khóa: "Tên công ty + lừa đảo", "Tên công ty + phốt", "SĐT + lừa đảo".
           - Tìm các đánh giá tiêu cực hoặc cảnh báo từ cộng đồng.
        
        Trả về kết quả dưới dạng văn bản Markdown rõ ràng:
        - **Xác thực công ty**: (Có thật không, địa chỉ ở đâu)
        - **Đánh giá cộng đồng**: (Tóm tắt thái độ của mọi người: Có bài "bóc phốt" nào không? Có ai cảnh báo không?)
        - **Kết luận**: Đáng tin hay Đáng ngờ.
      `,
      config: {
        tools: [
          { googleSearch: {} },
          { googleMaps: {} }
        ],
        toolConfig: locationConfig
      }
    });

    const searchChunks: GroundingSource[] = [];
    const mapChunks: GroundingSource[] = [];

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (chunks) {
      chunks.forEach(chunk => {
        if (chunk.web) {
          searchChunks.push({ uri: chunk.web.uri || '', title: chunk.web.title || 'Nguồn Web' });
        }
        if (chunk.maps) {
            const uri = chunk.maps.uri || '';
            const title = chunk.maps.title || 'Địa điểm Maps';
            mapChunks.push({ uri, title });
        }
      });
    }

    // Clean citation markers from text (e.g., [1, 2 in search 1])
    const rawText = response.text || "Không tìm thấy thông tin xác minh cụ thể trên mạng.";
    const cleanText = rawText.replace(/\[.*?in search.*?\]/g, '');

    return {
      verificationText: cleanText,
      searchChunks,
      mapChunks
    };

  } catch (error) {
    console.error("Verification failed:", error);
    return { verificationText: "Lỗi khi kết nối hệ thống xác minh (hoặc thiếu API Key).", searchChunks: [], mapChunks: [] };
  }
};

// 4. Suitability & Application Draft (Flash)
// Focus on contact risk analysis and practical advice
export const analyzeSuitabilityAndDraft = async (text: string): Promise<{ suitability: SuitabilityAnalysis, draft: string }> => {
  try {
    const ai = getAI();
    const prompt = `
      Phân tích tin tuyển dụng cho sinh viên part-time.
      
      **PHÂN TÍCH QUAN TRỌNG - THÔNG TIN LIÊN LẠC:**
      1. **Số điện thoại**: 
         - Format số có bình thường không? (nhiều số lặp = đáng ngờ)
         - Có xuất hiện nhiều SĐT khác nhau không?
      2. **Email**:
         - Email doanh nghiệp (@công-ty.com) hay email miễn phí (gmail, yahoo)?
         - Email có khớp với tên công ty?
      3. **Links/Website**:
         - Link rút gọn (bit.ly, tinyurl) - RẤT NGUY HIỂM
         - Facebook cá nhân vs Fanpage chính thức?
         - Website công ty có tồn tại?
      4. **Địa chỉ**:
         - Có địa chỉ văn phòng cụ thể?
         - Hay chỉ hẹn gặp tại quán cà phê?
      
      **YÊU CẦU VỀ DRAFT XIN VIỆC (QUAN TRỌNG):**
      Hãy viết một mẫu tin nhắn/email xin việc thật chuyên nghiệp, lịch sự và ấn tượng.
      - **Tiêu đề (Subject):** Rõ ràng, ví dụ "Ứng tuyển vị trí [Tên vị trí] - [Tên bạn]".
      - **Nội dung:**
        - Lời chào trang trọng.
        - Giới thiệu ngắn gọn: Tên, sinh viên trường nào (để trống cho user điền), chuyên ngành.
        - Lý do ứng tuyển: Thể hiện sự quan tâm và phù hợp với kỹ năng yêu cầu.
        - Lời kết và thông tin liên hệ.
      - Giọng văn: Cầu thị, nghiêm túc nhưng không quá cứng nhắc.

      Tin tuyển dụng: "${text}"
      
      Trả về JSON với phân tích chi tiết.
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        suitability: {
            type: Type.OBJECT,
            properties: {
                skillsRequired: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING }, 
                  description: "Kỹ năng cần thiết"
                },
                pros: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING }, 
                  description: "Ưu điểm của công việc"
                },
                cons: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING }, 
                  description: "Nhược điểm cần cân nhắc"
                },
                contactRisks: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING }, 
                  description: "QUAN TRỌNG NHẤT: Phân tích chi tiết rủi ro về SĐT, email, link, địa chỉ đáng ngờ. Nếu không có rủi ro, trả về mảng rỗng []"
                },
                advice: { 
                  type: Type.STRING, 
                  description: "Lời khuyên tổng hợp về an toàn và quyết định"
                }
            },
            required: ["skillsRequired", "pros", "cons", "contactRisks", "advice"]
        },
        draft: { type: Type.STRING, description: "Tin nhắn xin việc mẫu ngắn gọn" }
      }
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (response.text) {
        const data = JSON.parse(response.text);
        return { suitability: data.suitability, draft: data.draft };
    }
    throw new Error("Suitability analysis failed");
  } catch (e) {
      console.error(e);
      return {
          suitability: { 
            skillsRequired: [], 
            pros: [], 
            cons: [], 
            contactRisks: ["Lỗi phân tích - vui lòng kiểm tra thủ công tất cả thông tin liên lạc"], 
            advice: "Không thể phân tích tự động. Vui lòng kiểm tra RẤT KỸ số điện thoại, email, link trước khi ứng tuyển." 
          },
          draft: ""
      }
  }
};

// 5. CV Matching Analysis (Flash)
export const analyzeCVMatching = async (jobDescription: string, cvContent: string): Promise<CVAnalysis> => {
  try {
    const ai = getAI();
    const prompt = `
      Bạn là một chuyên gia tuyển dụng (HR Manager). Hãy so sánh CV của ứng viên với Mô tả công việc (JD) dưới đây để đánh giá mức độ phù hợp.

      **Mô tả công việc (JD):**
      "${jobDescription}"

      **Nội dung CV của ứng viên:**
      "${cvContent}"

      **Yêu cầu phân tích:**
      1. **Chấm điểm phù hợp (Match Score):** Từ 0 đến 100.
      2. **Điểm mạnh (Pros):** Những kỹ năng/kinh nghiệm trong CV khớp với JD.
      3. **Điểm thiếu sót (Missing Skills):** Những yêu cầu quan trọng trong JD mà CV chưa có hoặc chưa làm nổi bật.
      4. **Lời khuyên (Advice):** Lời khuyên cụ thể để ứng viên cải thiện CV hoặc cách trả lời phỏng vấn để lấp đầy khoảng trống kỹ năng.

      Trả về kết quả dưới dạng JSON.
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        matchScore: { type: Type.INTEGER, description: "Điểm số phù hợp (0-100)" },
        pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Điểm mạnh khớp với JD" },
        missingSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Kỹ năng còn thiếu" },
        advice: { type: Type.STRING, description: "Lời khuyên cải thiện" }
      },
      required: ["matchScore", "pros", "missingSkills", "advice"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CVAnalysis;
    }
    throw new Error("CV Analysis failed");
  } catch (error) {
    console.error("CV Analysis error:", error);
    return {
      matchScore: 0,
      pros: [],
      missingSkills: ["Lỗi phân tích. Vui lòng thử lại."],
      advice: "Không thể phân tích CV lúc này."
    };
  }
};