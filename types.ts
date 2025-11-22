export interface JobEntity {
  jobTitle: string;
  companyName: string;
  salary: string;
  location: string;
}

export interface SearchCriteria {
  keyword: string;
  city: string;
  district: string;
  jobCategory?: string;
  workShift?: string[];
  salaryRange?: { min: number; max: number };
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  source: string;
  logo?: string; // URL to company logo
}

export interface ScamAnalysis {
  score: number; // 0-100, where 100 is safe, 0 is scam
  riskLevel: 'An Toàn' | 'Cảnh Báo' | 'Nguy Hiểm';
  reasons: string[];
  verdict: string;
}

export interface SuitabilityAnalysis {
  skillsRequired: string[];
  pros: string[];
  cons: string[];
  contactRisks: string[]; // Phân tích về links, SDT, email đáng ngờ
  advice: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface GroundingData {
  searchChunks: GroundingSource[];
  mapChunks: GroundingSource[];
  verificationText: string;
}

export interface AnalysisResult {
  entities: JobEntity;
  scamAnalysis: ScamAnalysis;
  suitability: SuitabilityAnalysis;
  grounding: GroundingData;
  applicationDraft?: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}