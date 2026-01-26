import { CustomScenario } from '@/types/customScenario';

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

export class CustomPatientAI {
  private scenario: CustomScenario;
  private conversationHistory: Array<{ role: 'user' | 'ai', content: string }> = [];
  private currentSatisfaction = 50;
  private messageCount = 0;
  private objectivesMet: string[] = [];
  private currentEmotionalState: string;

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

  async getResponse(userMessage: string): Promise<AIResponse> {
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

    const positiveKeywords = ['да', 'хорошо', 'согласен', 'понятно', 'спасибо', 'отлично', 'помогите', 'расскажите', 'объясните'];
    const negativeKeywords = ['нет', 'не хочу', 'не понимаю', 'сложно', 'дорого', 'долго', 'проблема', 'плохо'];
    const questionKeywords = ['как', 'что', 'почему', 'когда', 'где', 'можно', 'а если', 'а вдруг'];
    const empathyKeywords = ['понимаю', 'волнуетесь', 'переживаете', 'беспокоитесь', 'страшно', 'боитесь'];

    if (empathyKeywords.some(kw => lowerMessage.includes(kw))) {
      satisfaction += 15;
      responseType = 'positive';
      if (emotionalState === 'nervous') emotionalState = 'calm';
      if (emotionalState === 'angry') emotionalState = 'nervous';
      if (emotionalState === 'scared') emotionalState = 'calm';
    } else if (positiveKeywords.some(kw => lowerMessage.includes(kw))) {
      satisfaction += 10;
      responseType = 'positive';
      if (emotionalState === 'nervous') emotionalState = 'calm';
      if (emotionalState === 'angry') emotionalState = 'nervous';
    } else if (negativeKeywords.some(kw => lowerMessage.includes(kw))) {
      satisfaction -= 10;
      responseType = 'negative';
      if (emotionalState === 'calm') emotionalState = 'nervous';
      if (emotionalState === 'nervous') emotionalState = 'angry';
    }

    if (questionKeywords.some(kw => lowerMessage.includes(kw))) {
      responseType = 'neutral';
      satisfaction += 5;
    }

    satisfaction = Math.max(0, Math.min(100, satisfaction));

    const patterns = responsePatterns || {
      positive: ['Спасибо за понимание!', 'Отлично, это здорово!', 'Да, именно так!', 'Вы меня успокоили.'],
      negative: ['Я не уверен в этом...', 'Мне это не подходит.', 'Нет, так не пойдет.', 'Мне страшно...'],
      neutral: ['Расскажите подробнее?', 'А что вы имеете в виду?', 'Интересно, объясните.', 'Как это работает?']
    };

    const availablePatterns = patterns[responseType] || patterns.neutral;
    const baseResponse = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];

    let message = this.enhanceResponse(baseResponse, userMessage, emotionalState, aiPersonality.communicationStyle);

    if (this.messageCount === 1 && aiPersonality.character) {
      message = `${aiPersonality.character} ${message}`;
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
      nervous: ['Э-э-э...', 'Ну...', 'Я немного волнуюсь, но...', 'Не знаю...'],
      angry: ['Послушайте!', 'Вы не понимаете!', 'Это возмутительно!', 'Я уже устал ждать!'],
      scared: ['Мне страшно...', 'Я боюсь, что...', 'А вдруг...', 'Ой, только не это...'],
      happy: ['Замечательно!', 'Как здорово!', 'Отлично!', 'Рад слышать!'],
      sad: ['К сожалению...', 'Грустно, но...', 'Мне печально...', 'Тяжело об этом говорить...'],
      confused: ['Я не совсем понимаю...', 'Запутался...', 'Странно...', 'Подождите...'],
      excited: ['Ух ты!', 'Невероятно!', 'Это потрясающе!', 'Вау!'],
      calm: ['Понимаю.', 'Хорошо.', 'Ясно.', 'Да.']
    };

    const styleSuffixes: Record<string, string[]> = {
      formal: ['Благодарю за внимание.', 'С уважением.', 'Прошу прощения.'],
      casual: ['Ок!', 'Круто!', 'Понял, спасибо!', 'Хорошо-хорошо.'],
      professional: ['Давайте обсудим детали.', 'Предлагаю рассмотреть варианты.', 'Когда начнём?'],
      friendly: ['Рад помочь!', 'Всегда пожалуйста!', 'Обращайтесь!', 'Вы очень помогли!'],
      aggressive: ['И точка!', 'Без вариантов!', 'Так и только так!', 'Хватит уже!']
    };

    const prefix = emotionPrefixes[emotion]?.[Math.floor(Math.random() * emotionPrefixes[emotion].length)] || '';
    const suffix = styleSuffixes[style]?.[Math.floor(Math.random() * styleSuffixes[style].length)] || '';

    if (Math.random() > 0.5) {
      return `${prefix} ${base}`.trim();
    } else {
      return `${base} ${suffix}`.trim();
    }
  }

  analyzeConversation(): ConversationAnalysis {
    const { objectives = [], context } = this.scenario;
    
    let alignmentScore = 0;
    const communicationScore = this.currentSatisfaction;
    let goalProgressScore = 0;

    const userMessages = this.conversationHistory.filter(m => m.role === 'user');
    
    if (context.goal) {
      const goalKeywords = context.goal.toLowerCase().split(' ').filter(w => w.length > 3);
      const mentioned = userMessages.some(m => 
        goalKeywords.some(kw => m.content.toLowerCase().includes(kw))
      );
      alignmentScore += mentioned ? 50 : 0;
    }

    if (objectives.length > 0) {
      const metObjectives = objectives.filter(obj => 
        userMessages.some(m => {
          const objKeywords = obj.toLowerCase().split(' ').filter(w => w.length > 3);
          return objKeywords.some(kw => m.content.toLowerCase().includes(kw));
        })
      );
      this.objectivesMet = metObjectives;
      goalProgressScore = (metObjectives.length / objectives.length) * 100;
    } else {
      goalProgressScore = this.messageCount >= 3 ? 70 : 40;
    }

    alignmentScore += this.messageCount >= 3 ? 50 : 25;

    const recommendations: string[] = [];
    const goodPoints: string[] = [];
    const missedOpportunities: string[] = [];

    if (this.currentSatisfaction >= 70) {
      goodPoints.push('Успешно установлен контакт с пациентом');
      goodPoints.push('Пациент доверяет вам');
    } else if (this.currentSatisfaction < 40) {
      recommendations.push('Проявите больше эмпатии к переживаниям пациента');
      missedOpportunities.push('Недостаточно внимания к эмоциональному состоянию');
    }

    if (goalProgressScore < 50) {
      missedOpportunities.push(`Цель разговора: "${context.goal}" - не достигнута`);
      recommendations.push('Направьте разговор к достижению основной цели');
    } else if (goalProgressScore >= 80) {
      goodPoints.push('Отлично! Цель разговора достигнута');
    }

    if (this.messageCount < 3) {
      recommendations.push('Продолжите диалог для лучшей оценки навыков');
    }

    if (objectives.length > 0) {
      const missedObjectives = objectives.filter(obj => !this.objectivesMet.includes(obj));
      if (missedObjectives.length > 0) {
        missedOpportunities.push(`Не выполнены задачи: ${missedObjectives.slice(0, 2).join(', ')}`);
      }
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
