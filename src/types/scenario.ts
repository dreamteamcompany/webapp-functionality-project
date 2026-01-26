export interface CustomScenario {
  id: string;
  name: string;
  description: string;
  context: {
    role: string;
    situation: string;
    goal: string;
  };
  aiPersonality: {
    character: string;
    emotionalState: 'calm' | 'nervous' | 'angry' | 'scared' | 'happy' | 'sad' | 'confused' | 'excited';
    knowledge: 'low' | 'medium' | 'high';
    communicationStyle: 'formal' | 'casual' | 'professional' | 'friendly' | 'aggressive';
  };
  initialMessage: string;
  objectives?: string[];
  challenges?: string[];
  responsePatterns?: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  createdAt: number;
  updatedAt: number;
  category?: string;
  tags?: string[];
}

export interface ScenarioCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}
