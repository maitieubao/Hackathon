import { GoogleGenAI, Type, Schema } from "@google/genai";
import { JobEntity, ScamAnalysis, SuitabilityAnalysis, GroundingData, GroundingSource, JobListing, SearchCriteria } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- HELPER: INPUT PROCESSING ---

// Extract text from an image (Screenshot of job posting)
export const extractContentFromImage = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
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
    return "Lỗi khi xử lý hình ảnh. Vui lòng thử lại hoặc nhập văn bản thủ công.";
  }
};

// Extract content from a URL using Google Search grounding
export const extractContentFromUrl = async (url: string): Promise<string> => {
  try {
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
    const locationContext = userLocation 
      ? `(Context: User is at Latitude ${userLocation.latitude}, Longitude ${userLocation.longitude})` 
      : '';

    // Construct a targeted query based on filters
    let query = `việc làm part-time cho sinh viên ${criteria.keyword}`;
    if (criteria.district) query += ` tại ${criteria.district}`;
    if (criteria.city) query += ` ở ${criteria.city}`;

    const prompt = `
      Help me find a comprehensive list of RECENT part-time job recruitments for students in Vietnam based on this query: "${query}". ${locationContext}
      
      You MUST use Google Search to find real, active listings. 
      FIND AS MANY JOBS AS POSSIBLE (Target at least 10-12 distinct jobs).
      
      After searching, format the output strictly as a list where each job is separated by "---JOB_SEPARATOR---".
      For each job, use this exact format:
      
      Title: [Job Title]
      Company: [Company Name]
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
      const locationMatch = raw.match(/Location:\s*(.+)/);
      const salaryMatch = raw.match(/Salary:\s*(.+)/);
      const descMatch = raw.match(/Description:\s*(.+)/);
      const sourceMatch = raw.match(/Source:\s*(.+)/);

      if (titleMatch) {
        jobs.push({
          id: `job-${index}-${Date.now()}`,
          title: titleMatch[1].trim(),
          company: companyMatch ? companyMatch[1].trim() : "Đang cập nhật",
          location: locationMatch ? locationMatch[1].trim() : criteria.city || "Việt Nam",
          salary: salaryMatch ? salaryMatch[1].trim() : "Thỏa thuận",
          description: descMatch ? descMatch[1].trim() : "",
          source: sourceMatch ? sourceMatch[1].trim() : "Google Search"
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
      reasons: ["Không thể phân tích chi tiết do lỗi hệ thống."],
      verdict: "Vui lòng tự kiểm tra kỹ lưỡng."
    };
  }
};

// 3. Verification & Social Reputation Check (Flash + Tools)
// Verify company existence and check reputation on Forums/Social Media.
export const verifyCompany = async (text: string, userLocation?: GeolocationCoordinates): Promise<GroundingData> => {
  try {
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

    return {
      verificationText: response.text || "Không tìm thấy thông tin xác minh cụ thể trên mạng.",
      searchChunks,
      mapChunks
    };

  } catch (error) {
    console.error("Verification failed:", error);
    return { verificationText: "Lỗi khi kết nối hệ thống xác minh.", searchChunks: [], mapChunks: [] };
  }
};

// 4. Suitability & Application Draft (Flash)
// Standard generation task.
export const analyzeSuitabilityAndDraft = async (text: string): Promise<{ suitability: SuitabilityAnalysis, draft: string }> => {
  try {
    // Combined prompt for efficiency
    const prompt = `
      Phân tích tin tuyển dụng này dưới góc độ phù hợp cho sinh viên (part-time).
      Sau đó viết một tin nhắn xin việc mẫu ngắn gọn, lịch sự, chuyên nghiệp bằng tiếng Việt.
      
      Tin tuyển dụng: "${text}"
      
      Trả về JSON.
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        suitability: {
            type: Type.OBJECT,
            properties: {
                matchScore: { type: Type.INTEGER },
                skillsRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                advice: { type: Type.STRING }
            }
        },
        draft: { type: Type.STRING }
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
          suitability: { matchScore: 0, skillsRequired: [], pros: [], cons: [], advice: "Lỗi phân tích" },
          draft: ""
      }
  }
};