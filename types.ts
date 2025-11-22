export interface JobEntity {
  jobTitle: string;
  companyName: string;
  salary: string;
  location: string;
}

export interface ScamAnalysis {
  score: number;
  riskLevel: "An Toàn" | "Cảnh Báo" | "Nguy Hiểm";
  reasons: string[];
  verdict: string;
}

export interface SuitabilityAnalysis {
  skillsRequired: string[];
  pros: string[];
  cons: string[];
  contactRisks: string[]; // New field for specific contact info risks
  advice: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface GroundingData {
  verificationText: string;
  searchChunks: GroundingSource[];
  mapChunks: GroundingSource[];
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
  link?: string; // Direct link to job posting
}

export interface SearchCriteria {
  keyword: string;
  city: string;
  district: string;
  jobCategory: string;
}

export interface CVAnalysis {
  matchScore: number;
  pros: string[];
  missingSkills: string[];
  advice: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface AnalysisResult {
  entities: JobEntity;
  scamAnalysis: ScamAnalysis;
  grounding: GroundingData;
  suitability: SuitabilityAnalysis;
  applicationDraft: string;
}