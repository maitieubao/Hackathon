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
            text: "Đây là hình ảnh một tin tuyển dụng. Hãy trích xuất toàn bộ nội dung văn bản có trong ảnh. Nếu có các chi tiết hình ảnh đáng ngờ (ví dụ: logo bị lỗi, phông chữ cẩu thả, hình ảnh cắt ghép), hãy mô tả chúng kèm theo nội dung văn bản. QUAN TRỌNG: Trả về văn bản thuần túy, KHÔNG dùng định dạng markdown (như **đậm**, *nghiêng*)."
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
      5. IMPORTANT: Return plain text only, NO markdown formatting (no **bold**, no *italics*).
         
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
      Link: [Direct URL to the job posting. If not found, leave blank]
      
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
      const linkMatch = raw.match(/Link:\s*(.+)/);

      if (titleMatch) {
        const companyName = companyMatch ? companyMatch[1].trim() : "Đang cập nhật";
        const domain = domainMatch ? domainMatch[1].trim() : "";
        
        // Logo Strategy:
        // 1. Try Clearbit API if we have a domain
        // 2. Fallback to DefaultLogo (empty string)
        let logoUrl = "";
        if (domain && domain.length > 3 && !domain.includes("facebook.com") && !domain.includes("google.com")) {
             logoUrl = `https://logo.clearbit.com/${domain}`;
        } else {
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
          link: linkMatch ? linkMatch[1].trim() : "",
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

// 2. Deep Scam Analysis (Flash - Replaced Thinking Model for Stability)
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
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ScamAnalysis;
    }
    throw new Error("Model returned empty text");
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
        
        Nhiệm vụ:
        1. Tìm kiếm tên công ty/người tuyển dụng trên Google.
        2. Kiểm tra xem có phốt lừa đảo nào liên quan đến số điện thoại hoặc địa chỉ này không.
        3. Tìm địa chỉ trên Google Maps xem có tồn tại thực tế không.
        
        Trả về một đoạn văn tổng hợp kết quả xác minh (ngắn gọn, súc tích).
      `,
      config: {
        tools: [{ googleSearch: locationConfig }]
      }
    });

    // Extract grounding metadata
    const searchChunks: GroundingSource[] = [];
    const mapChunks: GroundingSource[] = [];
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach(chunk => {
        if (chunk.web) {
            searchChunks.push({ uri: chunk.web.uri || '', title: chunk.web.title || 'Web Source' });
        }
        // Basic heuristic for map/place results (Gemini grounding structure varies)
        // For now, we treat all web sources as search chunks.
        // If the title indicates a map or address, we could categorize it.
      });
    }

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
         - Facebook cá nhân hay Fanpage chính thức?
      
      Tin tuyển dụng: "${text}"
      
      Trả về JSON gồm:
      - suitability: { skillsRequired: string[], pros: string[], cons: string[], contactRisks: string[], advice: string }
      - draft: string (Mẫu đơn ứng tuyển chuyên nghiệp, lịch sự, KHÔNG dùng markdown)
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        suitability: {
          type: Type.OBJECT,
          properties: {
            skillsRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
            contactRisks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách các rủi ro cụ thể về SĐT, Email, Link." },
            advice: { type: Type.STRING }
          },
          required: ["skillsRequired", "pros", "cons", "contactRisks", "advice"]
        },
        draft: { type: Type.STRING }
      },
      required: ["suitability", "draft"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as { suitability: SuitabilityAnalysis, draft: string };
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

// 4.5 Generate Draft Only
export const generateDraft = async (jobDescription: string): Promise<string> => {
  try {
    const ai = getAI();
    const prompt = `
      Hãy viết một mẫu tin nhắn/email xin việc thật chuyên nghiệp, lịch sự và ấn tượng cho công việc sau:
      "${jobDescription}"
      
      Yêu cầu:
      - Tiêu đề (Subject): Rõ ràng.
      - Nội dung: Lời chào, giới thiệu ngắn, lý do ứng tuyển, lời kết.
      - Giọng văn: Cầu thị, nghiêm túc.
      - KHÔNG dùng các ký hiệu markdown như ** hay ## trong nội dung email, chỉ dùng văn bản thuần túy để người dùng dễ copy.
      
      Trả về nội dung email/tin nhắn hoàn chỉnh.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text || "Không thể tạo bản nháp. Vui lòng thử lại.";
  } catch (error) {
    console.error("Draft generation failed:", error);
    return "Lỗi khi tạo bản nháp.";
  }
};

// 5. CV Matching Analysis (Flash)
export const analyzeCVMatching = async (jobDescription: string, cvData: { type: 'text' | 'file', content: string, mimeType?: string }): Promise<CVAnalysis> => {
  try {
    const ai = getAI();
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        matchScore: { type: Type.INTEGER, description: "Điểm số phù hợp (0-100)" },
        pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Điểm mạnh khớp với JD" },
        missingSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Kỹ năng còn thiếu" },
        advice: { type: Type.STRING, description: "Lời khuyên cải thiện CV" }
      },
      required: ["matchScore", "pros", "missingSkills", "advice"]
    };

    let requestContent;

    if (cvData.type === 'file' && cvData.mimeType) {
        requestContent = {
            contents: [
                { role: 'user', parts: [
                    { text: `Bạn là chuyên gia tuyển dụng. Hãy so sánh CV (trong file đính kèm) với JD dưới đây.

JD: "${jobDescription}"

Phân tích độ phù hợp, điểm mạnh, điểm yếu và lời khuyên.` },
                    { inlineData: { mimeType: cvData.mimeType, data: cvData.content } }
                ]}
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        };
    } else {
        requestContent = {
            contents: `Bạn là một chuyên gia tuyển dụng (HR Manager). Hãy so sánh CV dưới đây với yêu cầu công việc (JD) và đánh giá độ phù hợp.

JD: "${jobDescription}"

CV: "${cvData.content}"

Hãy trả về kết quả JSON gồm điểm số, điểm mạnh, điểm yếu và lời khuyên cụ thể.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        };
    }

    // @ts-ignore
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      ...requestContent
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