export type ScreenState = 'landing' | 'questionnaire' | 'login' | 'home' | 'journey' | 'journal' | 'cbt' | 'career-advisor' | 'encouraging-words' | 'profile';

export interface EncouragingWordsData {
  greeting: string;
  mainAffirmation: string;
  encouragingMessages: string[];
  dailyStrengths: string[];
  upliftingQuote: string;
  gentleTips: string[];
}

export interface CareerPath {
  title: string;
  matchPercentage: number;
  whyItFits: string;
  keySkillsToLeverage: string[];
  firstStep: string;
}

export interface CareerAdviceData {
  summary: string;
  recommendedPaths: CareerPath[];
  detectedStrengths: string[];
  actionableNextSteps: string[];
  encouragingQuote: string;
}
