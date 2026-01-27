import { CustomScenario } from '@/types/scenario';

export interface AIResponse {
  message: string;
  emotionalState: string;
  satisfaction: number;
}

export interface ConversationAnalysis {
  alignmentScore: number;
  communicationScore: number;
  goalProgressScore: number;
  overallScore: number;
  recommendations: string[];
  goodPoints: string[];
  missedOpportunities: string[];
}

export class CustomAI {
  private scenario: CustomScenario;
  private conversationHistory: Array<{ role: 'user' | 'ai', content: string }> = [];
  private currentSatisfaction = 50;
  private messageCount = 0;
  private objectivesMet: string[] = [];
  private currentEmotionalState: string;
  private readonly maxMessages = 15;

  constructor(scenario: CustomScenario) {
    this.scenario = scenario;
    this.currentEmotionalState = scenario.aiPersonality.emotionalState;
  }

  getScenario(): CustomScenario {
    return this.scenario;
  }

  getGreeting(): string {
    return this.scenario.initialMessage;
  }

  async generateResponse(userMessage: string): Promise<AIResponse> {
    this.conversationHistory.push({ role: 'user', content: userMessage });
    this.messageCount++;

    const response = this.createContextualResponse(userMessage);
    
    this.conversationHistory.push({ role: 'ai', content: response.message });
    this.currentEmotionalState = response.emotionalState;
    this.currentSatisfaction = response.satisfaction;

    return response;
  }

  private createContextualResponse(userMessage: string): AIResponse {
    const lowerMessage = userMessage.toLowerCase();
    const { aiPersonality, responsePatterns, objectives = [], challenges = [] } = this.scenario;

    let satisfaction = this.currentSatisfaction;
    let emotionalState = this.currentEmotionalState;
    let responseType: 'positive' | 'negative' | 'neutral' = 'neutral';

    const positiveKeywords = ['да', 'хорошо', 'согласен', 'понятно', 'спасибо', 'отлично', 'помогите'];
    const negativeKeywords = ['нет', 'не хочу', 'не понимаю', 'сложно', 'дорого', 'долго', 'проблема'];
    const questionKeywords = ['как', 'что', 'почему', 'когда', 'где', 'можно', 'расскажите'];

    if (positiveKeywords.some(kw => lowerMessage.includes(kw))) {
      satisfaction += 10;
      responseType = 'positive';
      if (emotionalState === 'nervous') emotionalState = 'calm';
      if (emotionalState === 'angry') emotionalState = 'nervous';
      if (emotionalState === 'scared') emotionalState = 'nervous';
    } else if (negativeKeywords.some(kw => lowerMessage.includes(kw))) {
      satisfaction -= 10;
      responseType = 'negative';
      if (emotionalState === 'calm') emotionalState = 'nervous';
    }

    if (questionKeywords.some(kw => lowerMessage.includes(kw))) {
      responseType = 'neutral';
    }

    satisfaction = Math.max(0, Math.min(100, satisfaction));

    const patterns = responsePatterns || {
      positive: ['Спасибо за понимание!', 'Отлично, это здорово!', 'Да, именно так!'],
      negative: ['Я не уверен в этом...', 'Мне это не подходит.', 'Нет, так не пойдет.'],
      neutral: ['Расскажите подробнее?', 'А что вы имеете в виду?', 'Интересно, объясните.']
    };

    const availablePatterns = patterns[responseType] || patterns.neutral;
    const baseResponse = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];

    let message = this.enhanceResponse(baseResponse, userMessage, emotionalState, aiPersonality.communicationStyle);

    if (this.messageCount === 1 && aiPersonality.character) {
      message = `${aiPersonality.character}. ${message}`;
    }

    return {
      message,
      emotionalState,
      satisfaction
    };
  }

  private enhanceResponse(
    base: string, 
    userMessage: string, 
    emotion: string, 
    style: string
  ): string {
    const emotionPrefixes: Record<string, string[]> = {
      nervous: ['Э-э-э...', 'Ну...', 'Я немного волнуюсь, но...'],
      angry: ['Послушайте!', 'Вы не понимаете!', 'Это возмутительно!'],
      scared: ['Мне страшно...', 'Я боюсь, что...', 'А вдруг...'],
      happy: ['Замечательно!', 'Как здорово!', 'Отлично!'],
      sad: ['К сожалению...', 'Грустно, но...', 'Мне печально...'],
      confused: ['Я не совсем понимаю...', 'Запутался...', 'Странно...'],
      excited: ['Ух ты!', 'Невероятно!', 'Это потрясающе!'],
      calm: ['Понимаю.', 'Хорошо.', 'Ясно.']
    };

    const styleSuffixes: Record<string, string[]> = {
      formal: ['Благодарю за внимание.', 'С уважением.', 'Прошу прощения.'],
      casual: ['Ок!', 'Круто!', 'Понял, спасибо!'],
      professional: ['Давайте обсудим детали.', 'Предлагаю рассмотреть варианты.'],
      friendly: ['Рад помочь!', 'Всегда пожалуйста!', 'Обращайтесь!'],
      aggressive: ['И точка!', 'Без вариантов!', 'Так и только так!']
    };

    const prefix = emotionPrefixes[emotion]?.[Math.floor(Math.random() * emotionPrefixes[emotion].length)] || '';
    const suffix = styleSuffixes[style]?.[Math.floor(Math.random() * styleSuffixes[style].length)] || '';

    return `${prefix} ${base} ${suffix}`.trim();
  }

  analyzeConversation(): ConversationAnalysis {
    const { objectives = [], context } = this.scenario;
    
    let alignmentScore = 0;
    const communicationScore = this.currentSatisfaction;
    let goalProgressScore = 0;

    const userMessages = this.conversationHistory.filter(m => m.role === 'user');
    
    if (context.goal) {
      const goalKeywords = context.goal.toLowerCase().split(' ');
      const mentioned = userMessages.some(m => 
        goalKeywords.some(kw => m.content.toLowerCase().includes(kw))
      );
      alignmentScore += mentioned ? 50 : 0;
    }

    if (objectives.length > 0) {
      const metObjectives = objectives.filter(obj => 
        userMessages.some(m => m.content.toLowerCase().includes(obj.toLowerCase()))
      );
      goalProgressScore = (metObjectives.length / objectives.length) * 100;
    } else {
      goalProgressScore = this.messageCount >= 3 ? 70 : 40;
    }

    alignmentScore += this.messageCount >= 3 ? 50 : 25;

    const recommendations: string[] = [];
    const goodPoints: string[] = [];
    const missedOpportunities: string[] = [];

    if (this.currentSatisfaction >= 70) {
      goodPoints.push('Успешно установлен контакт с собеседником');
    } else {
      recommendations.push('Попробуйте быть более внимательным к эмоциям собеседника');
    }

    if (goalProgressScore < 50) {
      missedOpportunities.push(`Цель разговора: "${context.goal}" - не достигнута`);
      recommendations.push('Направьте разговор к достижению цели');
    } else {
      goodPoints.push('Прогресс в достижении цели разговора');
    }

    if (this.messageCount < 3) {
      recommendations.push('Продолжите диалог для лучшей оценки');
    }

    const overallScore = Math.round(
      (alignmentScore * 0.3 + communicationScore * 0.4 + goalProgressScore * 0.3)
    );

    return {
      alignmentScore: Math.round(alignmentScore),
      communicationScore: Math.round(communicationScore),
      goalProgressScore: Math.round(goalProgressScore),
      overallScore,
      recommendations,
      goodPoints,
      missedOpportunities
    };
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  getCurrentSatisfaction(): number {
    return this.currentSatisfaction;
  }

  getCurrentEmotionalState(): string {
    return this.currentEmotionalState;
  }
}