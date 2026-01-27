import { CustomScenario } from '@/types/customScenario';

interface MessageAnalysis {
  hasEmpathy: boolean;
  hasQuestion: boolean;
  isSimple: boolean;
  isTechnical: boolean;
  sentiment: 'positive' | 'negative' | 'neutral';
  topics: string[];
  intent: string;
  addressedConcerns: string[];
  providedInformation: string[];
  responseQuality: number;
}

interface ConversationMemory {
  adminPromises: string[];
  discussedTopics: Map<string, number>; // topic -> depth of discussion
  unresolvedQuestions: string[];
  positivePoints: string[];
  negativePoints: string[];
  adminPersonality: {
    empathyLevel: number;
    professionalismLevel: number;
    clarityLevel: number;
    patienceLevel: number;
  };
}

interface ResponseContext {
  shouldAskQuestion: boolean;
  shouldExpressConcern: boolean;
  shouldShowGratitude: boolean;
  shouldChallenge: boolean;
  emotionalIntensity: number;
}

/**
 * Контекстуальный AI-пациент с автономной логикой
 * Генерирует уникальные ответы на основе анализа контекста диалога
 */
export class ContextualPatientAI {
  private scenario: CustomScenario;
  private conversationHistory: Array<{ role: 'user' | 'ai'; content: string }> = [];
  private memory: ConversationMemory;
  private currentSatisfaction: number = 50;
  private currentEmotionalState: string;
  private anxietyLevel: number;
  private trustLevel: number;
  private understandingLevel: number;

  constructor(scenario: CustomScenario) {
    this.scenario = scenario;
    this.currentEmotionalState = scenario.aiPersonality.emotionalState;
    this.anxietyLevel = this.emotionToAnxiety(scenario.aiPersonality.emotionalState);
    this.trustLevel = 50;
    this.understandingLevel = 0;

    this.memory = {
      adminPromises: [],
      discussedTopics: new Map(),
      unresolvedQuestions: [],
      positivePoints: [],
      negativePoints: [],
      adminPersonality: {
        empathyLevel: 0,
        professionalismLevel: 0,
        clarityLevel: 0,
        patienceLevel: 0
      }
    };
  }

  private emotionToAnxiety(emotion: string): number {
    const map: Record<string, number> = {
      'scared': 90,
      'angry': 70,
      'nervous': 60,
      'confused': 55,
      'sad': 50,
      'calm': 30,
      'relieved': 20,
      'happy': 10
    };
    return map[emotion] || 50;
  }

  /**
   * Глубокий анализ сообщения администратора с контекстом
   */
  private analyzeMessage(message: string): MessageAnalysis {
    const lower = message.toLowerCase();
    const words = message.split(/\s+/).filter(w => w.length > 2);

    const analysis: MessageAnalysis = {
      hasEmpathy: false,
      hasQuestion: false,
      isSimple: false,
      isTechnical: false,
      sentiment: 'neutral',
      topics: [],
      intent: 'general',
      addressedConcerns: [],
      providedInformation: [],
      responseQuality: 50
    };

    // Анализ эмпатии (многослойный)
    const empathyPhrases = [
      { phrase: 'понимаю ваши переживания', weight: 15 },
      { phrase: 'понимаю', weight: 10 },
      { phrase: 'не волнуйтесь', weight: 12 },
      { phrase: 'я вам помогу', weight: 13 },
      { phrase: 'это нормально', weight: 11 },
      { phrase: 'многие пациенты', weight: 10 },
      { phrase: 'я на вашей стороне', weight: 14 }
    ];

    let empathyScore = 0;
    empathyPhrases.forEach(({ phrase, weight }) => {
      if (lower.includes(phrase)) empathyScore += weight;
    });
    analysis.hasEmpathy = empathyScore > 0;
    analysis.responseQuality += empathyScore;

    // Анализ вопросов
    const questionWords = ['как', 'что', 'почему', 'зачем', 'когда', 'где', 'сколько', 'можете', 'расскажите'];
    analysis.hasQuestion = questionWords.some(q => lower.includes(q)) || message.includes('?');
    if (analysis.hasQuestion) analysis.responseQuality += 10;

    // Анализ ясности (простота объяснения)
    const complexWords = lower.match(/[а-яё]{10,}/g) || [];
    const technicalTerms = [
      'диагностика', 'патология', 'симптоматика', 'терапия', 'анамнез',
      'противопоказания', 'резекция', 'имплантация', 'пародонтоз'
    ];
    
    const techCount = technicalTerms.filter(t => lower.includes(t)).length;
    analysis.isTechnical = techCount >= 2;
    analysis.isSimple = complexWords.length <= 2 && techCount === 0;
    
    if (analysis.isSimple) analysis.responseQuality += 10;
    if (analysis.isTechnical) analysis.responseQuality -= 15;

    // Извлечение тем из контекста
    const topicKeywords = {
      treatment: ['лечение', 'процедура', 'операция', 'удаление', 'имплант', 'протез'],
      pain: ['боль', 'больно', 'дискомфорт', 'анестезия', 'обезболивание'],
      cost: ['стоимость', 'цена', 'оплата', 'рассрочка', 'скидка'],
      time: ['время', 'долго', 'быстро', 'срок', 'длительность', 'когда'],
      safety: ['безопасно', 'опасно', 'риск', 'осложнения', 'последствия'],
      quality: ['качество', 'результат', 'эффективность', 'гарантия'],
      alternatives: ['альтернатива', 'другой', 'замена', 'вариант']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(kw => lower.includes(kw))) {
        analysis.topics.push(topic);
        this.memory.discussedTopics.set(topic, (this.memory.discussedTopics.get(topic) || 0) + 1);
      }
    });

    // Анализ обращения к опасениям пациента
    this.scenario.aiPersonality.concerns.forEach(concern => {
      const concernKeywords = concern.toLowerCase().split(' ').filter(w => w.length > 3);
      if (concernKeywords.some(kw => lower.includes(kw))) {
        analysis.addressedConcerns.push(concern);
        analysis.responseQuality += 15;
      }
    });

    // Определение намерения с учётом контекста
    if (analysis.topics.includes('treatment') && analysis.hasQuestion) {
      analysis.intent = 'explain_treatment';
    } else if (analysis.topics.includes('pain')) {
      analysis.intent = 'address_pain_concerns';
    } else if (analysis.topics.includes('cost')) {
      analysis.intent = 'discuss_pricing';
    } else if (analysis.hasEmpathy) {
      analysis.intent = 'provide_support';
    } else if (analysis.topics.length === 0 && words.length < 5) {
      analysis.intent = 'insufficient_info';
    }

    // Анализ тональности
    const positiveWords = ['хорошо', 'отлично', 'понятно', 'да', 'конечно', 'помогу', 'решим'];
    const negativeWords = ['нет', 'невозможно', 'сложно', 'проблема', 'дорого'];
    
    const posCount = positiveWords.filter(w => lower.includes(w)).length;
    const negCount = negativeWords.filter(w => lower.includes(w)).length;
    
    if (posCount > negCount) {
      analysis.sentiment = 'positive';
      analysis.responseQuality += 5;
    } else if (negCount > posCount) {
      analysis.sentiment = 'negative';
      analysis.responseQuality -= 10;
    }

    // Проверка на конкретность ответа
    if (words.length >= 10) {
      analysis.responseQuality += 10;
    } else if (words.length < 5) {
      analysis.responseQuality -= 15;
    }

    return analysis;
  }

  /**
   * Генерация контекстуального ответа на основе памяти и анализа
   */
  private generateContextualResponse(userMessage: string, analysis: MessageAnalysis): string {
    const context = this.determineResponseContext(analysis);
    const parts: string[] = [];

    // 1. Эмоциональная реакция на качество ответа
    if (analysis.responseQuality < 30) {
      parts.push(this.generateFrustrationResponse(analysis));
      return parts.join(' ');
    } else if (analysis.responseQuality > 70) {
      parts.push(this.generatePositiveReaction(analysis));
    }

    // 2. Реакция на обращение к опасениям
    if (analysis.addressedConcerns.length > 0) {
      parts.push(this.generateConcernAcknowledgment(analysis.addressedConcerns[0]));
    }

    // 3. Комментарий к полученной информации
    if (analysis.topics.length > 0) {
      parts.push(this.generateTopicResponse(analysis.topics, analysis));
    }

    // 4. Новый вопрос или выражение мнения
    if (context.shouldAskQuestion) {
      parts.push(this.generateContextualQuestion(analysis));
    } else if (context.shouldExpressConcern) {
      parts.push(this.generateContextualConcern());
    }

    // 5. Если удовлетворённость высокая - готовность к записи
    if (this.currentSatisfaction >= 75 && this.conversationHistory.length >= 5) {
      parts.push(this.generateReadinessStatement());
    }

    return parts.filter(p => p.length > 0).join(' ').trim() || this.generateFallbackResponse();
  }

  private determineResponseContext(analysis: MessageAnalysis): ResponseContext {
    const messageCount = this.conversationHistory.length;
    
    return {
      shouldAskQuestion: messageCount <= 15 && Math.random() > 0.4,
      shouldExpressConcern: this.anxietyLevel > 50 && Math.random() > 0.6,
      shouldShowGratitude: analysis.hasEmpathy || analysis.responseQuality > 70,
      shouldChallenge: this.currentSatisfaction < 40 && messageCount > 6,
      emotionalIntensity: this.anxietyLevel / 100
    };
  }

  private generateFrustrationResponse(analysis: MessageAnalysis): string {
    if (analysis.intent === 'insufficient_info') {
      const responses = [
        'Извините, но я не очень понял ваш ответ. Можете пояснить подробнее?',
        'Хм, это слишком коротко. Расскажите, пожалуйста, больше.',
        'Мне нужно больше информации, чтобы принять решение.'
      ];
      return this.selectRandom(responses);
    }

    const responses = [
      'Честно говоря, я всё ещё не до конца понимаю...',
      'Мне кажется, вы не ответили на мой главный вопрос.',
      'Я запутался. Давайте попробуем по-другому?'
    ];
    return this.selectRandom(responses);
  }

  private generatePositiveReaction(analysis: MessageAnalysis): string {
    const reactions = [
      'Спасибо, это очень помогло!',
      'Ага, теперь понятно!',
      'Отлично, что вы так подробно объяснили.',
      'Вы меня успокоили, спасибо.'
    ];
    return this.selectRandom(reactions);
  }

  private generateConcernAcknowledgment(concern: string): string {
    const templates = [
      `Да, меня именно это и волновало - ${concern}.`,
      `Хорошо, что вы подняли тему ${concern}.`,
      `Спасибо, что затронули вопрос про ${concern}.`
    ];
    return this.selectRandom(templates).replace('${concern}', concern.toLowerCase());
  }

  private generateTopicResponse(topics: string[], analysis: MessageAnalysis): string {
    const topic = topics[0];
    const discussionDepth = this.memory.discussedTopics.get(topic) || 0;

    if (discussionDepth === 1) {
      return this.generateFirstTimeTopicResponse(topic);
    } else if (discussionDepth >= 3) {
      return this.generateDeeperUnderstanding(topic);
    }

    return '';
  }

  private generateFirstTimeTopicResponse(topic: string): string {
    const responses: Record<string, string[]> = {
      treatment: [
        'Хорошо, с лечением немного разобрались.',
        'Понял основные моменты про процедуру.'
      ],
      pain: [
        'Про боль стало яснее, спасибо.',
        'Ну ладно, с обезболиванием понятно.'
      ],
      cost: [
        'Со стоимостью более-менее ясно.',
        'Хорошо, по цене я понял.'
      ],
      time: [
        'По срокам стало понятнее.',
        'Окей, теперь я знаю сколько времени это займёт.'
      ]
    };

    return this.selectRandom(responses[topic] || ['Понятно.']);
  }

  private generateDeeperUnderstanding(topic: string): string {
    return `Теперь я полностью понимаю ситуацию с этим. Спасибо за терпение!`;
  }

  private generateContextualQuestion(analysis: MessageAnalysis): string {
    // Генерируем вопрос на основе того, что НЕ обсуждалось
    const unmentionedTopics = ['treatment', 'pain', 'cost', 'time', 'safety']
      .filter(t => !this.memory.discussedTopics.has(t));

    if (unmentionedTopics.length > 0) {
      const topic = unmentionedTopics[0];
      return this.generateTopicQuestion(topic);
    }

    // Иначе углубляемся в уже обсуждённую тему
    const mostDiscussed = Array.from(this.memory.discussedTopics.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (mostDiscussed) {
      return this.generateFollowUpQuestion(mostDiscussed[0]);
    }

    return 'А что вы ещё можете рассказать?';
  }

  private generateTopicQuestion(topic: string): string {
    const questions: Record<string, string[]> = {
      treatment: [
        'А как именно будет проходить лечение?',
        'Расскажите подробнее, что вы будете делать?',
        'Какие этапы лечения?'
      ],
      pain: [
        'Скажите честно, это больно?',
        'А как насчёт боли? Это терпимо?',
        'Я очень боюсь боли... Как это будет?'
      ],
      cost: [
        'А сколько это будет стоить?',
        'Давайте поговорим о стоимости.',
        'Можете сказать примерную цену?'
      ],
      time: [
        'Сколько времени займёт лечение?',
        'Как долго мне придётся ходить?',
        'Когда можно ждать результата?'
      ],
      safety: [
        'А это безопасно?',
        'Какие могут быть риски?',
        'Расскажите про возможные осложнения.'
      ]
    };

    return this.selectRandom(questions[topic] || ['Расскажите подробнее?']);
  }

  private generateFollowUpQuestion(topic: string): string {
    const followUps: Record<string, string[]> = {
      treatment: [
        'А есть альтернативные варианты лечения?',
        'Что если мне не подойдёт эта процедура?'
      ],
      pain: [
        'А после процедуры долго будет болеть?',
        'Что делать, если анестезия не подействует?'
      ],
      cost: [
        'А можно оплатить в рассрочку?',
        'Есть какие-то акции или скидки?'
      ],
      time: [
        'А как скоро я смогу вернуться к обычной жизни?',
        'Через сколько можно будет работать?'
      ]
    };

    return this.selectRandom(followUps[topic] || ['Хочу уточнить ещё один момент...']);
  }

  private generateContextualConcern(): string {
    const unaddressedConcerns = this.scenario.aiPersonality.concerns.filter(concern => 
      !this.memory.positivePoints.some(p => p.includes(concern))
    );

    if (unaddressedConcerns.length > 0) {
      const concern = unaddressedConcerns[0];
      return `Меня всё ещё беспокоит ${concern.toLowerCase()}...`;
    }

    return '';
  }

  private generateReadinessStatement(): string {
    const statements = [
      'Знаете, я готов записаться! Когда можно прийти?',
      'Отлично, давайте определимся с датой записи.',
      'Вы меня убедили. Хочу записаться на приём.',
      'Супер! Как мне записаться?'
    ];
    return this.selectRandom(statements);
  }

  private generateFallbackResponse(): string {
    const responses = [
      'Хорошо, продолжайте.',
      'Слушаю вас.',
      'Понятно. И что дальше?',
      'Расскажите ещё.'
    ];
    return this.selectRandom(responses);
  }

  private selectRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Обновление памяти о личности администратора
   */
  private updateAdminPersonality(analysis: MessageAnalysis): void {
    if (analysis.hasEmpathy) {
      this.memory.adminPersonality.empathyLevel += 10;
    }
    if (analysis.isSimple) {
      this.memory.adminPersonality.clarityLevel += 10;
    }
    if (analysis.hasQuestion) {
      this.memory.adminPersonality.professionalismLevel += 5;
    }
    if (analysis.responseQuality > 60) {
      this.memory.adminPersonality.patienceLevel += 5;
    }
  }

  /**
   * Динамическое обновление эмоционального состояния
   */
  private updateEmotionalState(analysis: MessageAnalysis): void {
    const prevState = this.currentEmotionalState;

    // Логика переходов между эмоциями
    if (analysis.hasEmpathy && this.anxietyLevel > 50) {
      this.anxietyLevel = Math.max(20, this.anxietyLevel - 15);
      
      if (this.currentEmotionalState === 'scared') this.currentEmotionalState = 'nervous';
      else if (this.currentEmotionalState === 'nervous') this.currentEmotionalState = 'calm';
      else if (this.currentEmotionalState === 'angry') this.currentEmotionalState = 'calm';
    }

    if (analysis.responseQuality >= 75) {
      this.trustLevel = Math.min(100, this.trustLevel + 15);
      this.currentEmotionalState = 'happy';
    }

    if (analysis.responseQuality < 30) {
      this.trustLevel = Math.max(0, this.trustLevel - 20);
      this.anxietyLevel = Math.min(100, this.anxietyLevel + 15);
      
      if (this.currentEmotionalState !== 'angry') {
        this.currentEmotionalState = 'confused';
      } else {
        // Остаётся злым
      }
    }

    if (this.conversationHistory.length > 8 && this.currentSatisfaction < 35) {
      this.currentEmotionalState = 'angry';
    }

    if (this.currentEmotionalState !== prevState) {
      console.log(`Emotion changed: ${prevState} → ${this.currentEmotionalState}`);
    }
  }

  /**
   * Публичный метод получения ответа
   */
  async getResponse(userMessage: string): Promise<{
    message: string;
    emotionalState: string;
    satisfaction: number;
  }> {
    this.conversationHistory.push({ role: 'user', content: userMessage });

    const analysis = this.analyzeMessage(userMessage);
    this.updateAdminPersonality(analysis);

    const responseText = this.generateContextualResponse(userMessage, analysis);
    
    this.conversationHistory.push({ role: 'ai', content: responseText });

    // Обновление состояния
    this.currentSatisfaction = Math.max(0, Math.min(100, 
      this.currentSatisfaction + (analysis.responseQuality - 50) / 10
    ));

    this.understandingLevel += analysis.topics.length * 5;
    this.updateEmotionalState(analysis);

    return {
      message: responseText,
      emotionalState: this.currentEmotionalState,
      satisfaction: Math.round(this.currentSatisfaction)
    };
  }

  getGreeting(): string {
    const greeting = `Здравствуйте! ${this.scenario.context.situation}`;
    
    const concerns = this.scenario.aiPersonality.concerns.slice(0, 2);
    const concernText = concerns.length > 0 
      ? ` Меня больше всего волнует ${concerns[0].toLowerCase()}.`
      : '';

    const question = this.generateTopicQuestion('treatment');

    return `${greeting}${concernText} ${question}`;
  }

  getCurrentSatisfaction(): number {
    return Math.round(this.currentSatisfaction);
  }

  getCurrentEmotionalState(): string {
    return this.currentEmotionalState;
  }

  analyzeConversation(): any {
    // Используем метод из AdvancedPatientAI для совместимости
    return {
      alignmentScore: Math.round(this.trustLevel),
      communicationScore: Math.round(this.currentSatisfaction),
      goalProgressScore: Math.round(this.understandingLevel),
      overallScore: Math.round((this.trustLevel + this.currentSatisfaction + this.understandingLevel) / 3),
      recommendations: [],
      goodPoints: this.memory.positivePoints,
      missedOpportunities: this.memory.negativePoints
    };
  }
}