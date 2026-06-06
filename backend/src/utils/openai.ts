import OpenAI from "openai";
import { config } from "../config/index.js";
import { logger } from "./logger.js";

let openaiClient: OpenAI | null = null;

if (!config.openai.useMock) {
  try {
    openaiClient = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    logger.info("OpenAI client initialized successfully.");
  } catch (error) {
    logger.error("Failed to initialize OpenAI client. Using heuristic generator.", error);
    config.openai.useMock = true;
  }
} else {
  logger.info("OpenAI API key missing or set to mock. Using heuristic generators.");
}

export interface TwinGenerationResult {
  employabilityScore: number;
  confidenceScore: number;
  portfolioStrengthScore: number;
  careerPredictions: any[];
  skillGaps: string[];
  growthForecast: any[];
}

export interface InterviewDialogResponse {
  message: string;
  isEnd: boolean;
  score?: number;
  feedback?: string;
  skillGaps?: string[];
  roadmap?: string[];
}

export interface BattleResponse {
  matchingScore: number;
  technicalScore: number;
  communicationScore: number;
  culturalFitScore: number;
  hiringDecision: boolean;
  feedback: string;
}

export const aiClient = {
  /**
   * Generates AI Twin predictions
   */
  async generateEmployabilityTwin(studentData: any): Promise<TwinGenerationResult> {
    if (config.openai.useMock || !openaiClient) {
      // Offline heuristic generator based on user skills, experience, and chaos score
      const skillCount = studentData.skills ? studentData.skills.length : 0;
      const projectCount = studentData.projectSubmissions ? studentData.projectSubmissions.length : 0;
      const chaosScore = studentData.chaosScore || 0;
      
      // Calculate scores dynamically
      let employabilityScore = 50 + skillCount * 3 + projectCount * 4 + Math.round(chaosScore * 0.2);
      employabilityScore = Math.min(100, Math.max(0, employabilityScore));

      const confidenceScore = Math.min(0.99, 0.4 + (employabilityScore / 200) + Math.random() * 0.1);
      const portfolioStrengthScore = Math.min(0.99, 0.3 + (projectCount * 0.15) + Math.random() * 0.1);

      const careerPredictions = [
        { path: "Full-Stack Web Architect", likelihood: Math.round(employabilityScore * 0.9) },
        { path: "AI Integrations Engineer", likelihood: Math.round(employabilityScore * 0.75) },
        { path: "Technical Product Owner", likelihood: Math.round(employabilityScore * 0.6) }
      ];

      const allPossibleGaps = ["System Architecture Design", "Docker & Kubernetes Orchestration", "CI/CD Pipeline Setup", "Advanced TypeScript Patterns", "Distributed Caching", "API Gateway Management"];
      const studentSkillsUpper = (studentData.skills || []).map((s: string) => s.toUpperCase());
      const skillGaps = allPossibleGaps.filter(gap => {
        return !studentSkillsUpper.some((s: string) => gap.toUpperCase().includes(s));
      }).slice(0, 3);

      const growthForecast = [
        { month: "Current", score: employabilityScore },
        { month: "Month 2", score: Math.min(100, employabilityScore + 4) },
        { month: "Month 4", score: Math.min(100, employabilityScore + 9) },
        { month: "Month 6", score: Math.min(100, employabilityScore + 15) }
      ];

      return {
        employabilityScore,
        confidenceScore,
        portfolioStrengthScore,
        careerPredictions,
        skillGaps,
        growthForecast
      };
    }

    try {
      const response = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are the SkillOS AI Engine. Analyze the student's profile and return a JSON object strictly matching this schema: { employabilityScore: number (0-100), confidenceScore: number (0.0-1.0), portfolioStrengthScore: number (0.0-1.0), careerPredictions: Array<{path: string, likelihood: number}>, skillGaps: Array<string>, growthForecast: Array<{month: string, score: number}> }."
          },
          {
            role: "user",
            content: JSON.stringify(studentData)
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || "{}") as TwinGenerationResult;
    } catch (error) {
      logger.error("OpenAI call failed, falling back to mock predictions.", error);
      return this.generateEmployabilityTwin(studentData); // Fallback to mock logic recursively
    }
  },

  /**
   * Generates dynamic responses for the hiring simulator
   */
  async simulateInterviewDialog(
    history: { role: string; content: string }[],
    type: string
  ): Promise<InterviewDialogResponse> {
    if (config.openai.useMock || !openaiClient) {
      // Heuristic chatbot
      const messageIndex = history.length;
      
      if (messageIndex === 0) {
        return {
          message: `Welcome to your ${type} Interview. Let's start by introducing yourself and sharing your experience.`,
          isEnd: false
        };
      }

      if (messageIndex >= 7) {
        // Complete simulation
        return {
          message: "Thank you for sharing your thoughts. We have completed the interview. Here is my evaluation.",
          isEnd: true,
          score: 75 + Math.round(Math.random() * 20),
          feedback: "Great communication and problem-solving mindset. Demonstrated solid theoretical understanding with some room for practical scalability knowledge.",
          skillGaps: ["System Scalability", "Rate Limiting Architectures"],
          roadmap: ["Review microservice scaling", "Study Redis caching policies"]
        };
      }

      // Next questions based on message count
      const technicalQuestions = [
        "How do you handle database migration and schema updates in a production environment?",
        "Can you explain the difference between SQL and NoSQL and how you choose between them?",
        "What is your approach to handling CORS issues and protecting your APIs from DDoS attacks?",
        "How do you optimize slow endpoint performance in an Express application?"
      ];

      const hrQuestions = [
        "Why do you want to join this project ecosystem?",
        "Tell me about a time you had a conflict in a team project and how you resolved it.",
        "What is your preferred working style: fully independent or highly collaborative?",
        "Where do you see yourself technically in the next three years?"
      ];

      const pool = type === "TECHNICAL" ? technicalQuestions : hrQuestions;
      const question = pool[Math.floor(messageIndex / 2) % pool.length];

      return {
        message: question,
        isEnd: false
      };
    }

    try {
      const messages = [
        {
          role: "system",
          content: `You are simulating an interviewer conducting a ${type} interview. Keep your questions and responses concise. Perform the assessment. If this is the end (after 3-4 rounds of questions), set 'isEnd' to true and return 'score' (0-100), 'feedback', 'skillGaps' (array), and 'roadmap' (array). Else, 'isEnd' is false and return 'message'. Output JSON: { message: string, isEnd: boolean, score?: number, feedback?: string, skillGaps?: string[], roadmap?: string[] }`
        },
        ...history
      ];
      
      const response = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages as any,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || "{}") as InterviewDialogResponse;
    } catch (error) {
      logger.error("OpenAI simulation call failed. Returning heuristic.", error);
      return this.simulateInterviewDialog(history, type);
    }
  },

  /**
   * Simulates Student Twin vs Company Recruiter AI Battle
   */
  async battleAITwins(studentTwin: any, recruiterProfile: any): Promise<BattleResponse> {
    if (config.openai.useMock || !openaiClient) {
      // Heuristic battle engine
      const baseScore = studentTwin.employabilityScore || 60;
      
      const matchingScore = Math.min(100, Math.max(40, baseScore + Math.round(Math.random() * 10 - 5)));
      const technicalScore = Math.min(100, Math.max(45, baseScore + Math.round(Math.random() * 14 - 7)));
      const communicationScore = Math.min(100, Math.max(50, baseScore + Math.round(Math.random() * 12 - 6)));
      const culturalFitScore = Math.min(100, Math.max(40, baseScore + Math.round(Math.random() * 16 - 8)));
      
      const avg = (matchingScore + technicalScore + communicationScore + culturalFitScore) / 4;
      const hiringDecision = avg >= 70;

      const feedback = hiringDecision
        ? "The Student's AI Twin demonstrated superior competency profiles matching the company's core technology stacks. Technical competence exceeded the benchmark, and cultural values align closely. Strongly recommended for fast-track recruitment."
        : "The Twin matches standard expectations, but shows gaps in advanced DevOps practices and system design. Recommend completing a targeted project learning path to increase cultural/tech fit scores before re-engaging.";

      return {
        matchingScore,
        technicalScore,
        communicationScore,
        culturalFitScore,
        hiringDecision,
        feedback
      };
    }

    try {
      const response = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are the AI vs AI Battle Arena Arbiter. Evaluate the student twin details against the recruiter's hiring demands and return a JSON match assessment: { matchingScore: number (0-100), technicalScore: number (0-100), communicationScore: number (0-100), culturalFitScore: number (0-100), hiringDecision: boolean, feedback: string }"
          },
          {
            role: "user",
            content: JSON.stringify({ studentTwin, recruiterProfile })
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || "{}") as BattleResponse;
    } catch (error) {
      logger.error("OpenAI battle arbiter failed. Running local fallback.", error);
      return this.battleAITwins(studentTwin, recruiterProfile);
    }
  }
};
