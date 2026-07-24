export type ScreenState = 'landing' | 'questionnaire' | 'login' | 'home' | 'journey' | 'journal' | 'cbt' | 'career-advisor' | 'profile';

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
