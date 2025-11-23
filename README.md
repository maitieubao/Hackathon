# Part-time Pal

An AI-powered job search assistant designed to help students and young professionals find safe and suitable part-time jobs in Vietnam.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [AI Features](#ai-features)
- [Contributing](#contributing)
- [License](#license)

## Overview

Part-time Pal is an intelligent job search platform that leverages Google's Gemini AI to help users find, analyze, and apply for part-time jobs safely. The application focuses on protecting users from scam job postings while providing personalized job recommendations and application assistance.

**Key Goals:**
- Protect job seekers from fraudulent job postings
- Provide intelligent job matching based on user skills and preferences
- Simplify the job application process with AI-generated cover letters
- Verify company legitimacy using Google Search integration

## Features

### Core Functionality

**1. Smart Job Search**
- Search for part-time jobs using keywords and location
- Filter results based on salary, location, and job type
- Integration with multiple job boards (TopCV, VietnamWorks, LinkedIn, Facebook)
- Real-time search results with Google Search grounding

**2. Scam Detection**
- AI-powered analysis of job posting legitimacy
- Risk scoring from 0-100 for each job posting
- Detection of common scam indicators (unrealistic salaries, suspicious contact info)
- Warnings for dangerous links and suspicious contact methods

**3. Company Verification**
- Google Search integration to verify company existence
- Check for scam reports and negative reviews
- Map verification to confirm physical addresses

**4. Job Suitability Analysis**
- Match job requirements with user skills
- Identify pros and cons for each position
- Analyze contact information risks (personal emails, shortened links)
- Provide personalized advice for each application

**5. Application Assistance**
- AI-generated professional cover letters
- CV analysis and matching with job descriptions
- Personalized recommendations for improvement

**6. Multi-input Support**
- Paste job posting text directly
- Upload job posting images (OCR extraction)
- Provide job posting URLs (automatic content extraction)

## Technology Stack

### Frontend
- React 18.3.1 with TypeScript
- Vite for fast build and development
- React Router for navigation
- Lucide React for icons

### AI & Backend
- Google Gemini AI (gemini-2.0-flash-exp, gemini-2.5-flash)
- Google GenAI SDK (@google/genai)
- Google Search Grounding for verification

### Development Tools
- TypeScript 5.6.2
- ESLint for code quality
- Vite plugin for React SWC

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Hackathon
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add your Gemini API key:
```
VITE_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:5173
```

### Building for Production

To create a production build:
```bash
npm run build
```

The build output will be in the `dist` directory.

## Project Structure

```
Hackathon/
├── src/
│   ├── components/        # React components
│   │   ├── JobCard.tsx   # Individual job display
│   │   ├── SearchBar.tsx # Job search interface
│   │   └── ...
│   ├── services/         # API and service layers
│   │   └── geminiService.ts  # Gemini AI integration
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts     # Shared types and interfaces
│   ├── App.tsx          # Main application component
│   ├── index.css        # Global styles
│   └── main.tsx         # Application entry point
├── public/              # Static assets
├── .env                 # Environment variables (not committed)
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## How It Works

### Job Search Flow

1. **User Input**: User enters job search criteria (keyword, location)
2. **AI Processing**: Gemini AI constructs optimized search queries
3. **Search Execution**: Google Search grounding finds relevant job postings
4. **Result Filtering**: AI filters results for relevance and recency
5. **Display**: Results shown with key information extracted

### Scam Detection Process

1. **Text Analysis**: AI analyzes job posting language and structure
2. **Pattern Recognition**: Identifies common scam indicators
3. **Risk Assessment**: Calculates safety score (0-100)
4. **Warning Generation**: Provides specific reasons for any concerns

### Company Verification

1. **Search Integration**: Queries Google for company information
2. **Cross-referencing**: Checks multiple sources for consistency
3. **Scam Reports**: Searches for fraud reports and complaints
4. **Location Verification**: Verifies addresses via Google Maps

## Environment Variables

Required environment variables for the application:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_KEY` | Google Gemini API key | Yes |

To obtain a Gemini API key:
1. Visit [Google AI Studio](https://ai.google.dev/aistudio)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## AI Features

### Models Used

**1. Gemini 2.0 Flash Exp**
- Job search and filtering
- Fast response times for real-time searches

**2. Gemini 2.5 Flash**
- Scam analysis and risk assessment
- Company verification
- Suitability analysis
- Draft generation
- CV analysis
- Image OCR for job postings
- URL content extraction

### Key AI Capabilities

**Structured Output**: Uses JSON schema for consistent, typed responses

**Google Search Grounding**: Integrates real-time web search for:
- Job discovery
- Company verification
- Scam report checking
- Address validation

**Multimodal Processing**: Handles:
- Text input
- Image uploads (job posting screenshots)
- URL content extraction

**Context-aware Analysis**: Considers:
- Vietnamese job market specifics
- Student and part-time worker needs
- Local scam patterns
- Cultural communication norms

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project was created for educational purposes as part of a hackathon.

---

**Note**: This application uses Google's Gemini AI. Make sure to comply with [Google's API terms of service](https://ai.google.dev/gemini-api/terms) when using the application.

**Disclaimer**: While Part-time Pal uses AI to detect potential scams, users should always exercise caution and verify job postings independently before sharing personal information or money.
