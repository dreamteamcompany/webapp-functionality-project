/**
 * Система управления контекстом диалога с AI-пациентом
 * Сохраняет историю, анализирует паттерны и формирует осмысленные ответы
 */

export interface DialogueTurn {
  role: 'admin' | 'patient';
  content: string;
  timestamp: number;
  analysisData?: {
    topics: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    keyPoints: string[];
    addressedConcerns: string[];
    emotionalTone: string;
  };
}

export interface DialogueContext {
  sessionId: string;
  patientProfile: {
    mainConcern: string;
    emotionalState: string;
    satisfactionLevel: number;
    trustLevel: number;
  };
  conversationHistory: DialogueTurn[];
  extractedKnowledge: {
    adminPromises: string[];
    discussedTopics: Map<string, number>; // topic -> глубина обсуждения
    unresolvedQuestions: string[];
    adminPersonalityTraits: {
      empathyLevel: number;
      professionalismLevel: number;
      clarityLevel: number;
      responsivenessLevel: number;
    };
    patientReactions: {
      positiveReactions: string[];
      negativeReactions: string[];
      confusionPoints: string[];
    };
  };
  nextResponseStrategy: {
    shouldAskQuestion: boolean;
    shouldExpressConcern: boolean;
    shouldShowGratitude: boolean;
    shouldChallenge: boolean;
    topicToExplore: string | null;
    emotionalIntensity: number;
  };
  conversationPhase: 'initial' | 'exploration' | 'negotiation' | 'decision' | 'closing';
  lastUpdated: number;
}

/**
 * Менеджер контекста диалога с персистентным хранением
 */
export class DialogueContextManager {
  private static readonly STORAGE_PREFIX = 'dialogue_context_';
  private context: DialogueContext;

  constructor(sessionId: string, initialPatientProfile: any) {
    const storedContext = this.loadFromStorage(sessionId);
    
    if (storedContext) {
      this.context = storedContext;
      this.context.extractedKnowledge.discussedTopics = new Map(
        Object.entries(storedContext.extractedKnowledge.discussedTopics || {})
      );
    } else {
      this.context = this.createNewContext(sessionId, initialPatientProfile);
    }
  }

  private createNewContext(sessionId: string, profile: any): DialogueContext {
    return {
      sessionId,
      patientProfile: {
        mainConcern: profile.concerns?.[0] || 'Неопределённая проблема',
        emotionalState: profile.emotionalState || 'neutral',
        satisfactionLevel: 50,
        trustLevel: 30
      },
      conversationHistory: [],
      extractedKnowledge: {
        adminPromises: [],
        discussedTopics: new Map(),
        unresolvedQuestions: [],
        adminPersonalityTraits: {
          empathyLevel: 0,
          professionalismLevel: 0,
          clarityLevel: 0,
          responsivenessLevel: 0
        },
        patientReactions: {
          positiveReactions: [],
          negativeReactions: [],
          confusionPoints: []
        }
      },
      nextResponseStrategy: {
        shouldAskQuestion: true,
        shouldExpressConcern: true,
        shouldShowGratitude: false,
        shouldChallenge: false,
        topicToExplore: null,
        emotionalIntensity: 0.5
      },
      conversationPhase: 'initial',
      lastUpdated: Date.now()
    };
  }

  /**
   * Добавление нового сообщения администратора с полным анализом
   */
  addAdminMessage(message: string): void {
    const analysis = this.analyzeAdminMessage(message);
    
    const turn: DialogueTurn = {
      role: 'admin',
      content: message,
      timestamp: Date.now(),
      analysisData: analysis
    };

    this.context.conversationHistory.push(turn);
    this.updateKnowledgeBase(message, analysis);
    this.updateAdminPersonality(analysis);
    this.updateNextResponseStrategy();
    this.updateConversationPhase();
    this.saveToStorage();
  }

  /**
   * Глубокий анализ сообщения администратора
   */
  private analyzeAdminMessage(message: string): DialogueTurn['analysisData'] {
    const lower = message.toLowerCase();
    const words = message.split(/\s+/).filter(w => w.length > 2);

    // Извлечение тем
    const topics: string[] = [];
    const topicKeywords = {
      treatment: ['лечение', 'процедура', 'операция', 'метод', 'терапия'],
      pain: ['боль', 'больно', 'дискомфорт', 'анестезия', 'обезболивание'],
      cost: ['стоимость', 'цена', 'оплата', 'рассрочка', 'скидка', 'бюджет'],
      time: ['время', 'долго', 'быстро', 'срок', 'продолжительность', 'когда'],
      safety: ['безопасно', 'риск', 'осложнения', 'последствия', 'гарантия'],
      results: ['результат', 'эффект', 'эффективность', 'итог', 'улучшение'],
      experience: ['опыт', 'практика', 'случаи', 'пациенты', 'статистика']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(kw => lower.includes(kw))) {
        topics.push(topic);
      }
    });

    // Анализ тональности
    const positiveWords = ['хорошо', 'отлично', 'понятно', 'помогу', 'решим', 'не волнуйтесь', 'легко', 'просто'];
    const negativeWords = ['сложно', 'проблема', 'невозможно', 'дорого', 'долго', 'больно'];
    
    const posCount = positiveWords.filter(w => lower.includes(w)).length;
    const negCount = negativeWords.filter(w => lower.includes(w)).length;
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (posCount > negCount) sentiment = 'positive';
    else if (negCount > posCount) sentiment = 'negative';

    // Извлечение ключевых моментов
    const keyPoints: string[] = [];
    
    // Обещания
    if (/я (помогу|сделаю|организую|назначу|запишу)/i.test(message)) {
      keyPoints.push('Администратор пообещал помочь');
    }
    
    // Объяснения
    if (/(это означает|другими словами|проще говоря|то есть)/i.test(message)) {
      keyPoints.push('Дал разъяснение');
    }
    
    // Вопросы к пациенту
    if (/\?|что вас|расскажите|как вы|какие у вас/i.test(message)) {
      keyPoints.push('Задал уточняющий вопрос');
    }

    // Эмоциональный тон
    let emotionalTone = 'neutral';
    if (/понимаю|переживаю|сочувствую|поддержу/i.test(lower)) {
      emotionalTone = 'empathetic';
    } else if (/должны|необходимо|обязательно|нужно/i.test(lower)) {
      emotionalTone = 'directive';
    } else if (/может|возможно|попробуем|посмотрим/i.test(lower)) {
      emotionalTone = 'flexible';
    }

    // Обращение к опасениям пациента
    const addressedConcerns: string[] = [];
    const concernWords = this.context.patientProfile.mainConcern.toLowerCase().split(' ');
    if (concernWords.some(word => word.length > 3 && lower.includes(word))) {
      addressedConcerns.push(this.context.patientProfile.mainConcern);
    }

    return {
      topics,
      sentiment,
      keyPoints,
      addressedConcerns,
      emotionalTone
    };
  }

  /**
   * Обновление базы знаний на основе анализа
   */
  private updateKnowledgeBase(message: string, analysis: DialogueTurn['analysisData']): void {
    if (!analysis) return;

    // Обновление обсуждённых тем
    analysis.topics.forEach(topic => {
      const currentDepth = this.context.extractedKnowledge.discussedTopics.get(topic) || 0;
      this.context.extractedKnowledge.discussedTopics.set(topic, currentDepth + 1);
    });

    // Сохранение обещаний
    if (analysis.keyPoints.includes('Администратор пообещал помочь')) {
      this.context.extractedKnowledge.adminPromises.push(
        `"${message.substring(0, 100)}..." (${new Date().toLocaleTimeString()})`
      );
    }

    // Обновление реакций
    if (analysis.sentiment === 'positive') {
      this.context.extractedKnowledge.patientReactions.positiveReactions.push(
        `Позитивный тон на сообщение ${this.context.conversationHistory.length}`
      );
    } else if (analysis.sentiment === 'negative') {
      this.context.extractedKnowledge.patientReactions.negativeReactions.push(
        `Негативный тон на сообщение ${this.context.conversationHistory.length}`
      );
    }

    // Сохранение нерешённых вопросов
    if (analysis.keyPoints.includes('Задал уточняющий вопрос')) {
      // Администратор спрашивает - пациент должен запомнить, что на это нужно ответить
      const recentPatientQuestions = this.getRecentPatientQuestions();
      if (recentPatientQuestions.length > 0) {
        // Если пациент задавал вопрос, а админ переспросил - вопрос ещё не решён
        this.context.extractedKnowledge.unresolvedQuestions = recentPatientQuestions;
      }
    }
  }

  /**
   * Получение недавних вопросов пациента
   */
  private getRecentPatientQuestions(): string[] {
    return this.context.conversationHistory
      .filter(turn => turn.role === 'patient' && turn.content.includes('?'))
      .slice(-3)
      .map(turn => turn.content);
  }

  /**
   * Обновление профиля администратора
   */
  private updateAdminPersonality(analysis: DialogueTurn['analysisData']): void {
    if (!analysis) return;

    const traits = this.context.extractedKnowledge.adminPersonalityTraits;

    // Эмпатия
    if (analysis.emotionalTone === 'empathetic') {
      traits.empathyLevel = Math.min(100, traits.empathyLevel + 15);
    }

    // Профессионализм
    if (analysis.keyPoints.includes('Дал разъяснение')) {
      traits.professionalismLevel = Math.min(100, traits.professionalismLevel + 10);
    }

    // Ясность
    const wordCount = analysis.topics.length;
    if (wordCount > 0 && analysis.sentiment !== 'negative') {
      traits.clarityLevel = Math.min(100, traits.clarityLevel + 8);
    }

    // Отзывчивость
    if (analysis.keyPoints.includes('Задал уточняющий вопрос')) {
      traits.responsivenessLevel = Math.min(100, traits.responsivenessLevel + 12);
    }
  }

  /**
   * Стратегия следующего ответа на основе контекста
   */
  private updateNextResponseStrategy(): void {
    const messageCount = this.context.conversationHistory.length;
    const traits = this.context.extractedKnowledge.adminPersonalityTraits;
    const discussedTopics = Array.from(this.context.extractedKnowledge.discussedTopics.keys());

    // Должен ли задать вопрос?
    this.context.nextResponseStrategy.shouldAskQuestion = 
      messageCount < 12 && discussedTopics.length < 5;

    // Должен ли выразить опасение?
    this.context.nextResponseStrategy.shouldExpressConcern = 
      this.context.patientProfile.satisfactionLevel < 60 && 
      this.context.extractedKnowledge.unresolvedQuestions.length > 0;

    // Должен ли поблагодарить?
    this.context.nextResponseStrategy.shouldShowGratitude = 
      traits.empathyLevel > 50 || traits.responsivenessLevel > 60;

    // Должен ли оспорить?
    this.context.nextResponseStrategy.shouldChallenge = 
      this.context.patientProfile.trustLevel < 40 && messageCount > 5;

    // Какую тему исследовать дальше?
    const allTopics = ['treatment', 'pain', 'cost', 'time', 'safety', 'results', 'experience'];
    const unexploredTopics = allTopics.filter(t => !discussedTopics.includes(t));
    this.context.nextResponseStrategy.topicToExplore = 
      unexploredTopics.length > 0 ? unexploredTopics[0] : null;

    // Эмоциональная интенсивность
    this.context.nextResponseStrategy.emotionalIntensity = 
      Math.max(0.2, Math.min(1, this.context.patientProfile.satisfactionLevel / 100));
  }

  /**
   * Определение фазы разговора
   */
  private updateConversationPhase(): void {
    const messageCount = this.context.conversationHistory.length;
    const satisfaction = this.context.patientProfile.satisfactionLevel;
    const trust = this.context.patientProfile.trustLevel;

    if (messageCount <= 2) {
      this.context.conversationPhase = 'initial';
    } else if (messageCount <= 6) {
      this.context.conversationPhase = 'exploration';
    } else if (messageCount <= 10) {
      this.context.conversationPhase = 'negotiation';
    } else if (satisfaction > 70 && trust > 60) {
      this.context.conversationPhase = 'decision';
    } else if (messageCount > 12) {
      this.context.conversationPhase = 'closing';
    }
  }

  /**
   * Добавление ответа пациента
   */
  addPatientMessage(message: string): void {
    const turn: DialogueTurn = {
      role: 'patient',
      content: message,
      timestamp: Date.now()
    };

    this.context.conversationHistory.push(turn);
    this.context.lastUpdated = Date.now();
    this.saveToStorage();
  }

  /**
   * Получение контекста для генерации ответа
   */
  getResponseContext(): {
    history: string[];
    strategy: DialogueContext['nextResponseStrategy'];
    phase: string;
    adminProfile: DialogueContext['extractedKnowledge']['adminPersonalityTraits'];
    discussedTopics: string[];
    unresolvedQuestions: string[];
  } {
    return {
      history: this.context.conversationHistory.slice(-5).map(t => 
        `${t.role === 'admin' ? 'Администратор' : 'Пациент'}: ${t.content}`
      ),
      strategy: this.context.nextResponseStrategy,
      phase: this.context.conversationPhase,
      adminProfile: this.context.extractedKnowledge.adminPersonalityTraits,
      discussedTopics: Array.from(this.context.extractedKnowledge.discussedTopics.keys()),
      unresolvedQuestions: this.context.extractedKnowledge.unresolvedQuestions
    };
  }

  /**
   * Обновление состояния пациента
   */
  updatePatientState(satisfactionDelta: number, trustDelta: number, newEmotionalState?: string): void {
    this.context.patientProfile.satisfactionLevel = Math.max(0, Math.min(100, 
      this.context.patientProfile.satisfactionLevel + satisfactionDelta
    ));
    
    this.context.patientProfile.trustLevel = Math.max(0, Math.min(100,
      this.context.patientProfile.trustLevel + trustDelta
    ));

    if (newEmotionalState) {
      this.context.patientProfile.emotionalState = newEmotionalState;
    }

    this.saveToStorage();
  }

  /**
   * Получение полного контекста
   */
  getFullContext(): DialogueContext {
    return { ...this.context };
  }

  /**
   * Сохранение в localStorage
   */
  private saveToStorage(): void {
    try {
      const serialized = {
        ...this.context,
        extractedKnowledge: {
          ...this.context.extractedKnowledge,
          discussedTopics: Object.fromEntries(this.context.extractedKnowledge.discussedTopics)
        }
      };
      
      const key = `${DialogueContextManager.STORAGE_PREFIX}${this.context.sessionId}`;
      localStorage.setItem(key, JSON.stringify(serialized));
    } catch (error) {
      console.warn('Не удалось сохранить контекст диалога:', error);
    }
  }

  /**
   * Загрузка из localStorage
   */
  private loadFromStorage(sessionId: string): DialogueContext | null {
    try {
      const key = `${DialogueContextManager.STORAGE_PREFIX}${sessionId}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Не удалось загрузить контекст диалога:', error);
    }
    
    return null;
  }

  /**
   * Очистка контекста
   */
  clear(): void {
    const key = `${DialogueContextManager.STORAGE_PREFIX}${this.context.sessionId}`;
    localStorage.removeItem(key);
  }

  /**
   * Экспорт контекста для анализа
   */
  exportContext(): string {
    return JSON.stringify(this.context, null, 2);
  }
}
