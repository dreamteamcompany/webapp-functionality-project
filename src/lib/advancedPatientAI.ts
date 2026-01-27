import { CustomScenario } from '@/types/customScenario';
import { DialogueContextManager } from './dialogueContext';

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
  patientBehaviorModel?: PatientBehaviorModel;
  conversationScenarios?: ConversationScenario[];
  deepInsights?: DeepInsight[];
}

export interface PatientBehaviorModel {
  trustLevel: number;
  cooperationLevel: number;
  anxietyLevel: number;
  informationAbsorption: number;
  decisionReadiness: number;
  primaryConcerns: string[];
  unresolvedDouBts: string[];
  emotionalTriggers: string[];
}

export interface ConversationScenario {
  scenarioType: 'ideal' | 'actual' | 'alternative';
  description: string;
  keyMoments: KeyMoment[];
  outcome: string;
  patientResponse: string;
}

export interface KeyMoment {
  turn: number;
  what: string;
  impact: 'positive' | 'negative' | 'neutral';
  satisfactionChange: number;
}

export interface DeepInsight {
  category: 'communication' | 'empathy' | 'professionalism' | 'clarity' | 'trust';
  insight: string;
  evidence: string[];
  recommendation: string;
}

interface ConversationContext {
  topicsDiscussed: Set<string>;
  emotionalJourney: string[];
  empathyShown: number;
  questionsAsked: number;
  clarityLevel: number;
  lastUserSentiment: 'positive' | 'negative' | 'neutral';
  keyMoments: KeyMoment[];
  trustBuilding: number[];
  anxietyLevels: number[];
  adminMistakes: string[];
  adminSuccesses: string[];
}

export class AdvancedPatientAI {
  private scenario: CustomScenario;
  private conversationHistory: Array<{ role: 'user' | 'ai', content: string }> = [];
  private currentSatisfaction = 50;
  private currentEmotionalState: string;
  private context: ConversationContext;
  private responseVariations: Map<string, string[]> = new Map();
  private usedPhrases: Set<string> = new Set();
  private dialogueContext: DialogueContextManager;
  private sessionId: string;
  private randomObjectionChance = 0.25; // 25% шанс случайного возражения

  constructor(scenario: CustomScenario) {
    this.scenario = scenario;
    this.currentEmotionalState = scenario.aiPersonality.emotionalState || 'neutral';
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Загружаем историю из localStorage
    this.loadHistoryFromStorage();
    
    // Инициализация системы контекстной памяти
    this.dialogueContext = new DialogueContextManager(this.sessionId, {
      concerns: scenario.aiPersonality.concerns || [],
      emotionalState: scenario.aiPersonality.emotionalState || 'neutral'
    });
    
    this.context = {
      topicsDiscussed: new Set(),
      emotionalJourney: [scenario.aiPersonality.emotionalState || 'neutral'],
      empathyShown: 0,
      questionsAsked: 0,
      clarityLevel: 0,
      lastUserSentiment: 'neutral',
      keyMoments: [],
      trustBuilding: [50],
      anxietyLevels: [this.getAnxietyLevel(scenario.aiPersonality.emotionalState || 'neutral')],
      adminMistakes: [],
      adminSuccesses: []
    };
    this.initializeResponseVariations();
  }

  private getAnxietyLevel(emotionalState: string): number {
    const anxietyMap: Record<string, number> = {
      'scared': 90,
      'anxious': 70,
      'neutral': 50,
      'trusting': 30,
      'relieved': 20,
      'satisfied': 10
    };
    return anxietyMap[emotionalState] || 50;
  }

  /**
   * Сохранение истории диалога в localStorage
   */
  private saveHistoryToStorage(): void {
    try {
      const historyData = {
        sessionId: this.sessionId,
        conversationHistory: this.conversationHistory,
        currentSatisfaction: this.currentSatisfaction,
        currentEmotionalState: this.currentEmotionalState,
        context: {
          topicsDiscussed: Array.from(this.context.topicsDiscussed),
          emotionalJourney: this.context.emotionalJourney,
          empathyShown: this.context.empathyShown,
          questionsAsked: this.context.questionsAsked,
          clarityLevel: this.context.clarityLevel,
          lastUserSentiment: this.context.lastUserSentiment,
          keyMoments: this.context.keyMoments,
          trustBuilding: this.context.trustBuilding,
          anxietyLevels: this.context.anxietyLevels,
          adminMistakes: this.context.adminMistakes,
          adminSuccesses: this.context.adminSuccesses
        },
        timestamp: Date.now()
      };
      localStorage.setItem('history', JSON.stringify(historyData));
    } catch (error) {
      console.warn('Failed to save history to localStorage:', error);
    }
  }

  /**
   * Загрузка истории диалога из localStorage
   */
  private loadHistoryFromStorage(): void {
    try {
      const stored = localStorage.getItem('history');
      if (!stored) return;

      const historyData = JSON.parse(stored);
      
      // Проверяем, не устарела ли история (старше 24 часов)
      const age = Date.now() - (historyData.timestamp || 0);
      if (age > 24 * 60 * 60 * 1000) {
        // История устарела, очищаем
        localStorage.removeItem('history');
        return;
      }

      // Восстанавливаем состояние
      if (historyData.conversationHistory) {
        this.conversationHistory = historyData.conversationHistory;
      }
      if (historyData.currentSatisfaction !== undefined) {
        this.currentSatisfaction = historyData.currentSatisfaction;
      }
      if (historyData.currentEmotionalState) {
        this.currentEmotionalState = historyData.currentEmotionalState;
      }
      if (historyData.context) {
        this.context = {
          topicsDiscussed: new Set(historyData.context.topicsDiscussed || []),
          emotionalJourney: historyData.context.emotionalJourney || [],
          empathyShown: historyData.context.empathyShown || 0,
          questionsAsked: historyData.context.questionsAsked || 0,
          clarityLevel: historyData.context.clarityLevel || 0,
          lastUserSentiment: historyData.context.lastUserSentiment || 'neutral',
          keyMoments: historyData.context.keyMoments || [],
          trustBuilding: historyData.context.trustBuilding || [50],
          anxietyLevels: historyData.context.anxietyLevels || [50],
          adminMistakes: historyData.context.adminMistakes || [],
          adminSuccesses: historyData.context.adminSuccesses || []
        };
      }
    } catch (error) {
      console.warn('Failed to load history from localStorage:', error);
    }
  }

  /**
   * Очистка истории из localStorage
   */
  clearHistory(): void {
    try {
      localStorage.removeItem('history');
      this.conversationHistory = [];
      this.currentSatisfaction = 50;
      this.currentEmotionalState = this.scenario.aiPersonality.emotionalState || 'neutral';
      this.context = {
        topicsDiscussed: new Set(),
        emotionalJourney: [this.scenario.aiPersonality.emotionalState || 'neutral'],
        empathyShown: 0,
        questionsAsked: 0,
        clarityLevel: 0,
        lastUserSentiment: 'neutral',
        keyMoments: [],
        trustBuilding: [50],
        anxietyLevels: [this.getAnxietyLevel(this.scenario.aiPersonality.emotionalState || 'neutral')],
        adminMistakes: [],
        adminSuccesses: []
      };
    } catch (error) {
      console.warn('Failed to clear history:', error);
    }
  }

  private initializeResponseVariations(): void {
    this.responseVariations.set('empathy_positive', [
      'Спасибо, что понимаете меня. Мне правда легче стало.',
      'Да, вы правы... Приятно, что вы слышите мои переживания.',
      'Спасибо за поддержку. Я чувствую, что вы на моей стороне.',
      'Вы меня успокоили. Действительно, не всё так страшно.',
      'Благодарю за понимание. Теперь мне не так тревожно.'
    ]);

    this.responseVariations.set('empathy_nervous', [
      'Да, я очень переживаю... Спасибо, что понимаете.',
      'Вы правы, мне страшно. Но раз вы так говорите...',
      'Приятно слышать такие слова. Но всё равно волнуюсь.',
      'Спасибо... Хотя беспокойство никуда не делось.'
    ]);

    this.responseVariations.set('confusion', [
      'Извините, я не совсем понял. Можете проще объяснить?',
      'Что-то сложно для меня... Расскажите попроще?',
      'А можно без медицинских терминов? Я запутался.',
      'Простите, не уловил. Что именно вы имеете в виду?',
      'Это как-то слишком научно звучит. Объясните простыми словами?'
    ]);

    this.responseVariations.set('agreement', [
      'Понял, спасибо за объяснение.',
      'Да, теперь ясно. Спасибо.',
      'Хорошо, я понял суть.',
      'Ясно, благодарю за разъяснение.',
      'Понятно. Спасибо, что объяснили.'
    ]);

    this.responseVariations.set('concern', [
      'А это точно безопасно?',
      'Меня беспокоит, не будет ли осложнений?',
      'А вдруг что-то пойдёт не так?',
      'Скажите честно, какие риски?',
      'Я переживаю... А если будут проблемы?'
    ]);

    this.responseVariations.set('question_how', [
      'А как это будет проходить?',
      'Расскажите, пожалуйста, как всё будет?',
      'Объясните, что именно вы будете делать?',
      'Как это происходит на практике?',
      'Опишите процедуру, пожалуйста.'
    ]);

    this.responseVariations.set('question_why', [
      'А зачем это нужно?',
      'Почему именно такое лечение?',
      'Объясните, для чего это делается?',
      'В чём смысл этой процедуры?',
      'А можно узнать обоснование?'
    ]);

    this.responseVariations.set('pain_fear', [
      'А больно будет?',
      'Мне страшно, что будет больно...',
      'Это не больная процедура?',
      'Скажите честно, насколько больно?',
      'Я боюсь боли... Это терпимо?'
    ]);

    this.responseVariations.set('cost_concern', [
      'А сколько это будет стоить?',
      'Это дорогая процедура?',
      'Можно узнать о стоимости?',
      'Во что мне это обойдётся?',
      'Есть варианты подешевле?'
    ]);

    this.responseVariations.set('time_concern', [
      'Сколько времени это займёт?',
      'Как долго придётся ждать результата?',
      'Когда я смогу вернуться к обычной жизни?',
      'А это быстро делается?',
      'Сколько визитов потребуется?'
    ]);

    this.responseVariations.set('gratitude', [
      'Спасибо вам большое!',
      'Благодарю за помощь.',
      'Спасибо, что уделили время.',
      'Очень благодарен вам.',
      'Спасибо за вашу работу!'
    ]);

    this.responseVariations.set('relief', [
      'Фух, легче стало слышать это.',
      'Вы меня успокоили, честно.',
      'Ну, теперь не так страшно.',
      'Спасибо, мне правда полегчало.',
      'Хорошо, что вы так подробно объяснили.'
    ]);

    this.responseVariations.set('alternatives', [
      'А есть какие-то альтернативы?',
      'Может, есть другие варианты?',
      'Расскажите про другие методы.',
      'А если попробовать что-то ещё?',
      'Какие ещё есть возможности?'
    ]);

    this.responseVariations.set('experience', [
      'А у вас большой опыт таких процедур?',
      'Вы часто это делаете?',
      'Как часто у вас бывают такие случаи?',
      'У вас много пациентов с такой проблемой?',
      'Вы давно этим занимаетесь?'
    ]);

    this.responseVariations.set('results', [
      'А какой будет результат?',
      'Что я получу в итоге?',
      'Насколько это эффективно?',
      'А помогает ли это всем?',
      'Какие шансы на успех?'
    ]);

    this.responseVariations.set('side_effects', [
      'А какие могут быть побочные эффекты?',
      'Есть ли какие-то риски?',
      'Что может пойти не так?',
      'Расскажите о возможных осложнениях.',
      'А безопасно ли это?'
    ]);
  }

  getScenario(): CustomScenario {
    return this.scenario;
  }

  getGreeting(): string {
    // Генерируем уникальное естественное приветствие на основе сценария
    return this.generateNaturalInitialMessage();
  }

  /**
   * Генерация уникального естественного первичного сообщения
   * Каждый раз пациент формулирует запрос по-новому
   */
  private generateNaturalInitialMessage(): string {
    const concerns = this.scenario.aiPersonality.concerns || [];
    const concern = concerns.length > 0 ? concerns[0] : 'общая консультация';
    const emotionalState = this.scenario.aiPersonality.emotionalState || 'neutral';
    const parts: string[] = [];

    // 1. ПРИВЕТСТВИЕ (вариативное)
    const greetings = [
      'Здравствуйте',
      'Добрый день',
      'Привет',
      'Здравствуйте, я к вам по записи',
      'День добрый',
      'Извините, что беспокою',
      'Добрый вечер'
    ];
    parts.push(this.selectUnusedFromArray(greetings));

    // 2. ОПИСАНИЕ ПРОБЛЕМЫ (естественное, вариативное)
    const problemDescriptions = this.generateProblemDescription(concern, emotionalState);
    parts.push(problemDescriptions);

    // 3. ЭМОЦИОНАЛЬНЫЙ КОНТЕКСТ (опционально, зависит от состояния)
    const emotionalContext = this.generateEmotionalContext(emotionalState);
    if (emotionalContext && Math.random() > 0.3) {
      parts.push(emotionalContext);
    }

    // 4. ВОПРОС/ПРОСЬБА (вариативный)
    const request = this.generateInitialRequest(emotionalState);
    parts.push(request);

    return parts.join(' ');
  }

  /**
   * Генерация описания проблемы (уникальное каждый раз)
   */
  private generateProblemDescription(concern: string, emotionalState: string): string {
    const concernLower = concern.toLowerCase();

    // Паттерны для разных типов проблем
    if (concernLower.includes('боль') || concernLower.includes('болит')) {
      return this.selectUnusedFromArray([
        `у меня ${concern.toLowerCase()}, уже не могу терпеть`,
        `вот такая проблема: ${concern.toLowerCase()}`,
        `${concern}, и это очень мешает жить`,
        `меня беспокоит ${concern.toLowerCase()}`,
        `у меня проблема — ${concern.toLowerCase()}, что делать?`,
        `${concern} уже давно, надоело терпеть`,
        `помогите, ${concern.toLowerCase()}, сил нет`,
        `такая ситуация: ${concern.toLowerCase()}`
      ]);
    }

    if (concernLower.includes('косметическ') || concernLower.includes('внешн')) {
      return this.selectUnusedFromArray([
        `я хочу улучшить внешний вид, ${concern.toLowerCase()}`,
        `давно хотел(а) решить вопрос с ${concern.toLowerCase()}`,
        `меня не устраивает ${concern.toLowerCase()}`,
        `хочу сделать что-то с ${concern.toLowerCase()}`,
        `интересует ${concern}, можно ли что-то сделать?`,
        `${concern} — это реально исправить?`
      ]);
    }

    if (concernLower.includes('консультаци') || concernLower.includes('проверк')) {
      return this.selectUnusedFromArray([
        `хочу проконсультироваться по поводу ${concern.toLowerCase()}`,
        `мне нужна помощь с ${concern.toLowerCase()}`,
        `я слышал про ${concern.toLowerCase()}, хочу узнать подробнее`,
        `интересует вопрос: ${concern}`,
        `можно ли у вас ${concern.toLowerCase()}?`
      ]);
    }

    // Общий паттерн
    return this.selectUnusedFromArray([
      `у меня такая проблема: ${concern.toLowerCase()}`,
      `меня беспокоит ${concern.toLowerCase()}`,
      `я по поводу ${concern.toLowerCase()}`,
      `хочу решить вопрос с ${concern.toLowerCase()}`,
      `${concern} — вы можете помочь?`,
      `слушайте, у меня ${concern.toLowerCase()}, что делать?`
    ]);
  }

  /**
   * Генерация эмоционального контекста
   */
  private generateEmotionalContext(emotionalState: string): string | null {
    const contexts: Record<string, string[]> = {
      scared: [
        'Честно говоря, я очень боюсь...',
        'Мне страшновато, если честно.',
        'Я раньше никогда такого не делал(а), волнуюсь.',
        'Очень переживаю, не знаю что ждать.',
        'Жутко нервничаю, простите.'
      ],
      anxious: [
        'Немного переживаю, конечно...',
        'Волнуюсь, честно сказать.',
        'Не скрою, есть опасения.',
        'Тревожно как-то, не знаю почему.',
        'Беспокоюсь немного.'
      ],
      angry: [
        'Уже устал(а) с этим мучиться!',
        'Надоело это всё, честно.',
        'Замучился(ась) совсем.',
        'Сил больше нет терпеть.',
        'Достало уже, нужно решать.'
      ],
      confused: [
        'Не знаю даже, с чего начать...',
        'Запутался(ась) совсем.',
        'Столько информации, голова кругом.',
        'Не могу разобраться сам(а).'
      ],
      sad: [
        'Это очень портит мне жизнь...',
        'Из-за этого столько проблем...',
        'Это угнетает меня.',
        'Настроение постоянно плохое из-за этого.'
      ]
    };

    const stateContexts = contexts[emotionalState];
    if (!stateContexts) return null;

    return this.selectUnusedFromArray(stateContexts);
  }

  /**
   * Генерация финального вопроса/просьбы
   */
  private generateInitialRequest(emotionalState: string): string {
    const scared_requests = [
      'Вы можете мне помочь? Только объясните всё подробно, пожалуйста.',
      'Скажите, что мне делать? И насколько это страшно?',
      'Помогите разобраться, я не знаю с чего начать...',
      'Что вы посоветуете? Мне правда нужна помощь.'
    ];

    const angry_requests = [
      'Что вы можете предложить? Нужно что-то решать уже.',
      'Давайте быстрее к делу, что делать будем?',
      'Скажите сразу — это решаемо или нет?',
      'Можете помочь или тоже ничего не сделаете?'
    ];

    const neutral_requests = [
      'Что вы можете мне посоветовать?',
      'Расскажите, какие варианты есть?',
      'Помогите, пожалуйста, разобраться.',
      'Что мне делать в такой ситуации?',
      'Какие у меня варианты решения?',
      'Посоветуйте, как быть?'
    ];

    if (emotionalState === 'scared' || emotionalState === 'anxious') {
      return this.selectUnusedFromArray(scared_requests);
    } else if (emotionalState === 'angry') {
      return this.selectUnusedFromArray(angry_requests);
    } else {
      return this.selectUnusedFromArray(neutral_requests);
    }
  }

  async getResponse(userMessage: string): Promise<AIResponse> {
    // Добавляем сообщение администратора в контекстную память
    this.dialogueContext.addAdminMessage(userMessage);
    
    this.conversationHistory.push({ role: 'user', content: userMessage });

    const analysis = this.analyzeUserMessage(userMessage);
    this.updateContext(analysis);

    // Получаем контекст для генерации ответа
    const responseContext = this.dialogueContext.getResponseContext();
    
    // Генерируем ответ на основе полного контекста диалога
    const responseText = this.generateContextualResponse(userMessage, analysis, responseContext);
    
    this.conversationHistory.push({ role: 'ai', content: responseText });
    
    // Сохраняем ответ пациента в контекстную память
    this.dialogueContext.addPatientMessage(responseText);

    const satisfactionDelta = this.calculateSatisfactionChange(analysis);
    const trustDelta = this.calculateTrustChange(analysis);
    
    this.updateEmotionalState(analysis);
    this.updateSatisfaction(analysis);
    
    // Обновляем состояние пациента в контекстной памяти
    this.dialogueContext.updatePatientState(
      satisfactionDelta, 
      trustDelta, 
      this.currentEmotionalState
    );

    // Сохраняем всю историю в localStorage
    this.saveHistoryToStorage();

    return {
      message: responseText,
      emotionalState: this.currentEmotionalState,
      satisfaction: this.currentSatisfaction
    };
  }

  private analyzeUserMessage(message: string): any {
    const lower = message.toLowerCase();
    
    const analysis: any = {
      hasEmpathy: false,
      hasQuestion: false,
      isSimple: false,
      isTechnical: false,
      sentiment: 'neutral',
      topics: [],
      intent: 'general'
    };

    const empathyPatterns = [
      'понимаю', 'переживаете', 'волнуетесь', 'беспокоитесь', 
      'не волнуйтесь', 'не переживайте', 'всё будет хорошо',
      'я вас слышу', 'я на вашей стороне', 'поддерживаю'
    ];
    analysis.hasEmpathy = empathyPatterns.some(p => lower.includes(p));

    const questionPatterns = ['как', 'что', 'почему', 'зачем', 'когда', 'где', 'сколько', '?'];
    analysis.hasQuestion = questionPatterns.some(p => lower.includes(p));

    const simplePatterns = ['простыми словами', 'попроще', 'без терминов', 'объясните понятно'];
    analysis.isSimple = simplePatterns.some(p => lower.includes(p));

    const technicalWords = [
      'диагноз', 'патология', 'этиология', 'симптоматика', 'клиническая картина',
      'противопоказания', 'анамнез', 'терапия', 'профилактика'
    ];
    analysis.isTechnical = technicalWords.filter(w => lower.includes(w)).length >= 2;

    if (lower.includes('расскаж') || lower.includes('объясн')) {
      analysis.topics.push('explanation');
    }
    if (lower.includes('симптом') || lower.includes('боль') || lower.includes('болит')) {
      analysis.topics.push('symptoms');
    }
    if (lower.includes('лечен') || lower.includes('процедур') || lower.includes('операц')) {
      analysis.topics.push('treatment');
    }
    if (lower.includes('больно') || lower.includes('больная')) {
      analysis.topics.push('pain');
    }
    if (lower.includes('стоимость') || lower.includes('цена') || lower.includes('сколько стоит')) {
      analysis.topics.push('cost');
    }
    if (lower.includes('время') || lower.includes('долго') || lower.includes('когда')) {
      analysis.topics.push('time');
    }

    const positiveWords = ['хорошо', 'отлично', 'понятно', 'ясно', 'спасибо', 'благодарю'];
    const negativeWords = ['плохо', 'непонятно', 'сложно', 'страшно', 'боюсь'];
    
    const positiveCount = positiveWords.filter(w => lower.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lower.includes(w)).length;
    
    if (positiveCount > negativeCount) analysis.sentiment = 'positive';
    else if (negativeCount > positiveCount) analysis.sentiment = 'negative';

    if (analysis.hasQuestion && analysis.topics.includes('treatment')) {
      analysis.intent = 'ask_treatment';
    } else if (analysis.hasQuestion && analysis.topics.includes('pain')) {
      analysis.intent = 'ask_pain';
    } else if (analysis.hasQuestion && analysis.topics.includes('cost')) {
      analysis.intent = 'ask_cost';
    } else if (analysis.hasQuestion && analysis.topics.includes('time')) {
      analysis.intent = 'ask_time';
    } else if (analysis.hasEmpathy) {
      analysis.intent = 'empathy';
    } else if (analysis.topics.includes('explanation')) {
      analysis.intent = 'request_explanation';
    }

    return analysis;
  }

  private generateNaturalResponse(userMessage: string, analysis: any): string {
    const parts: string[] = [];
    const messageCount = this.conversationHistory.length;

    // Проверка на бессмысленный ответ
    if (this.isNonsenseMessage(userMessage)) {
      return this.generateNonsenseReaction();
    }

    // Проверка на слишком короткий ответ
    if (userMessage.trim().length < 10 && messageCount > 1) {
      return this.generateShortAnswerReaction();
    }

    // Быстрое и качественное решение
    if (messageCount <= 4 && this.currentSatisfaction >= 75 && analysis.hasEmpathy) {
      return this.generateQuickSuccessReaction();
    }

    // Контекстная генерация на основе истории диалога
    const contextualResponse = this.generateContextAwareResponse(userMessage, analysis);
    if (contextualResponse) {
      return contextualResponse;
    }

    // Эмпатия - всегда ценится
    if (analysis.hasEmpathy && this.currentSatisfaction < 70) {
      const empathyResponse = this.getRandomUnusedPhrase(
        this.currentEmotionalState === 'scared' || this.currentEmotionalState === 'nervous'
          ? 'empathy_nervous'
          : 'empathy_positive'
      );
      parts.push(empathyResponse);
      this.context.empathyShown++;
    } else if (analysis.sentiment === 'positive') {
      if (Math.random() > 0.5) {
        parts.push(this.getRandomUnusedPhrase('agreement'));
      } else {
        parts.push(this.getRandomUnusedPhrase('relief'));
      }
    }

    // Реакция на сложную терминологию
    if (analysis.isTechnical && this.scenario.aiPersonality.knowledge === 'low') {
      parts.push(this.getRandomUnusedPhrase('confusion'));
    }

    // Раздражение при длительном неэффективном диалоге
    if (messageCount > 8 && this.currentSatisfaction < 40) {
      return this.generateFrustrationReaction();
    }

    // Благодарность при успешном решении
    if (messageCount > 4 && this.currentSatisfaction > 75) {
      parts.push(this.getRandomUnusedPhrase('gratitude'));
      if (messageCount > 6) {
        return parts.join(' ') + ' ' + this.generateReadyToBookResponse();
      }
      return parts.join(' ').trim();
    }

    const shouldAskQuestion = messageCount <= 2 || Math.random() > 0.3;
    
    if (shouldAskQuestion) {
      const questionType = this.selectQuestionType(analysis);
      parts.push(this.generateQuestionByType(questionType));
    } else if (this.currentSatisfaction < 40) {
      parts.push(this.generateDissatisfactionPhrase());
    } else if (parts.length === 0) {
      parts.push(this.generateContextBasedResponse(analysis));
    }

    return parts.join(' ').trim();
  }

  /**
   * Генерация ответа на основе полного контекста диалога из файла
   * Учитывает историю, паттерны поведения админа и стратегию ответа
   */
  private generateContextualResponse(userMessage: string, analysis: any, responseContext: any): string {
    const parts: string[] = [];
    const messageCount = this.conversationHistory.length;

    // Проверка на бессмысленный ответ
    if (this.isNonsenseMessage(userMessage)) {
      return this.generateNonsenseReaction();
    }

    // Проверка на слишком короткий ответ
    if (userMessage.trim().length < 10 && messageCount > 1) {
      return this.generateShortAnswerReaction();
    }

    // Анализ личности администратора из контекста
    const adminProfile = responseContext.adminProfile;
    const strategy = responseContext.strategy;
    const phase = responseContext.phase;
    
    // Получаем последние сообщения для прямого цитирования
    const lastAdminMessages = this.conversationHistory
      .filter(m => m.role === 'user')
      .slice(-3)
      .map(m => m.content);
    const lastAdminMessage = lastAdminMessages[lastAdminMessages.length - 1] || '';

    // 1. СЛУЧАЙНЫЕ ВОЗРАЖЕНИЯ (как в продажах) - спонтанные сомнения без видимых причин
    const randomObjection = this.generateRandomObjection(messageCount, adminProfile);
    if (randomObjection) {
      parts.push(randomObjection);
      // Случайное возражение заменяет эмоциональную реакцию, чтобы не перегружать ответ
      return parts.join(' ').trim();
    }

    // 2. ЕСТЕСТВЕННАЯ ЭМОЦИОНАЛЬНАЯ РЕАКЦИЯ НА ПОВЕДЕНИЕ АДМИНИСТРАТОРА
    const emotionalReaction = this.generateEmotionalReactionToAdmin(adminProfile, analysis, messageCount);
    if (emotionalReaction) {
      parts.push(emotionalReaction);
    }

    // 2a. РЕАКЦИЯ НА ОСНОВЕ ФАЗЫ РАЗГОВОРА
    if (phase === 'initial' && messageCount <= 2) {
      // Начальная фаза - пациент осторожен
      if (analysis.hasEmpathy) {
        parts.push('Спасибо, что пытаетесь понять мою ситуацию.');
      }
      parts.push(this.generateInitialPhaseQuestion(responseContext.discussedTopics));
    } else if (phase === 'exploration') {
      // Фаза исследования - пациент активно задаёт вопросы
      if (strategy.topicToExplore) {
        parts.push(this.generateTopicQuestion(strategy.topicToExplore));
      } else {
        parts.push(this.generateFollowUpBasedOnHistory(responseContext.history));
      }
    } else if (phase === 'negotiation') {
      // Фаза переговоров - пациент взвешивает решение
      if (this.currentSatisfaction > 60) {
        parts.push(this.selectUnusedFromArray([
          'Знаете, я начинаю склоняться к тому, чтобы согласиться...',
          'Вы меня почти убедили, но есть ещё пара моментов.',
          'Хорошо, давайте обсудим детали записи.'
        ]));
      } else {
        parts.push(this.selectUnusedFromArray([
          'У меня всё ещё есть сомнения... Не уверен, что готов.',
          'Что-то мне подсказывает, что надо ещё подумать.',
          'Может, мне лучше посоветоваться с кем-то ещё?'
        ]));
      }
    } else if (phase === 'decision') {
      // Фаза решения - пациент готов
      parts.push(this.generateReadyToBookResponse());
    } else if (phase === 'closing') {
      // Завершение - либо согласие, либо отказ
      if (this.currentSatisfaction >= 70) {
        return 'Отлично! Я готов записаться. Когда мне можно прийти?';
      } else {
        return 'Спасибо за информацию, но я пока не готов принять решение. Мне нужно время подумать.';
      }
    }

    // 3. ПРЯМОЕ ЦИТИРОВАНИЕ И РЕАКЦИЯ НА КОНКРЕТНЫЕ ФРАЗЫ АДМИНА
    const directReaction = this.generateDirectReactionToAdmin(userMessage, lastAdminMessage, analysis);
    if (directReaction) {
      parts.push(directReaction);
    }

    // 4. УЧЁТ НЕРЕШЁННЫХ ВОПРОСОВ
    if (responseContext.unresolvedQuestions.length > 0 && Math.random() > 0.5) {
      const unresolved = responseContext.unresolvedQuestions[0];
      parts.push(`Кстати, я всё ещё жду ответа на мой вопрос: "${unresolved.substring(0, 80)}..."`);
    }

    // 5. РЕАКЦИЯ НА КОНКРЕТНЫЕ ТЕМЫ ИЗ СООБЩЕНИЯ
    if (analysis.topics.includes('cost') && !responseContext.discussedTopics.includes('cost')) {
      parts.push(this.selectUnusedFromArray([
        'Хорошо, что вы затронули тему стоимости. Это важно для меня.',
        'Спасибо, что сказали про цены. Мне нужно было это услышать.',
        'А можно подробнее про оплату? Есть ли какие-то варианты?'
      ]));
    }

    if (analysis.topics.includes('pain') && this.currentEmotionalState === 'scared') {
      parts.push(this.selectUnusedFromArray([
        'Да, боль - это то, чего я больше всего боюсь...',
        'Вы уверены, что будет не больно? Мне правда страшно.',
        'А что если анестезия не подействует? Такое бывает?'
      ]));
    }

    // 6. ПРОТИВОРЕЧИЯ В ОТВЕТАХ АДМИНИСТРАТОРА
    const contradiction = this.detectContradictions(lastAdminMessages);
    if (contradiction) {
      parts.push(contradiction);
    }

    // 7. СТРАТЕГИЧЕСКИЕ ЭЛЕМЕНТЫ ОТВЕТА
    if (strategy.shouldShowGratitude && parts.length === 0) {
      parts.push(this.selectUnusedFromArray([
        'Спасибо за ваше терпение.',
        'Благодарю за подробное объяснение.',
        'Вы мне очень помогли разобраться.'
      ]));
    }

    if (strategy.shouldAskQuestion && parts.length < 2) {
      if (strategy.topicToExplore) {
        parts.push(this.generateTopicQuestion(strategy.topicToExplore));
      }
    }

    if (strategy.shouldChallenge) {
      parts.push(this.selectUnusedFromArray([
        'А вы уверены в этом? Я читал другую информацию...',
        'Хм, а почему тогда в интернете пишут по-другому?',
        'У меня есть сомнения насчёт этого подхода.'
      ]));
    }

    // 8. ЕСЛИ НИЧЕГО НЕ СГЕНЕРИРОВАНО - БАЗОВЫЙ ОТВЕТ
    if (parts.length === 0) {
      parts.push(this.generateContextBasedResponse(analysis));
    }

    return parts.join(' ').trim();
  }

  /**
   * СИСТЕМА СЛУЧАЙНЫХ ВОЗРАЖЕНИЙ (как в симуляторе продаж)
   * Пациент иногда сомневается без видимых причин
   */
  private generateRandomObjection(messageCount: number, adminProfile: any): string | null {
    // Не генерируем возражения в первых 2-х сообщениях
    if (messageCount < 3) return null;
    
    // Не генерируем возражения, если администратор отлично работает
    if (adminProfile.empathyLevel > 75 && adminProfile.responsivenessLevel > 70) {
      return null;
    }

    // Случайный шанс возражения
    if (Math.random() > this.randomObjectionChance) return null;

    const objectionTypes = [
      'price_doubt',
      'time_doubt', 
      'trust_doubt',
      'alternative_seeking',
      'comparison_doubt',
      'fear_based',
      'procrastination',
      'third_party_opinion'
    ];

    const type = objectionTypes[Math.floor(Math.random() * objectionTypes.length)];
    return this.getObjectionByType(type);
  }

  /**
   * Получить возражение определённого типа
   */
  private getObjectionByType(type: string): string {
    const objections: Record<string, string[]> = {
      price_doubt: [
        'Знаете, мне кажется это дороговато... Может, есть что-то попроще?',
        'А правда ли это стоит таких денег? Я видел в других местах дешевле...',
        'Хм, цена кусается. Может, подождать какую-нибудь акцию?',
        'Честно говоря, я не уверен что готов столько заплатить сейчас.',
        'А точно нужно всё это делать? Может, можно обойтись меньшими тратами?'
      ],
      time_doubt: [
        'Слушайте, а может это слишком долго? У меня нет столько времени...',
        'Мне кажется, это займёт больше времени чем вы говорите.',
        'А нет способа быстрее? Я не могу так долго ждать результата.',
        'Честно говоря, я думал будет быстрее. Может, поищу другие варианты?',
        'Столько времени... А оно точно того стоит?'
      ],
      trust_doubt: [
        'А вы точно в этом уверены? Просто я слышал разные мнения...',
        'Хм, звучит хорошо, но как-то слишком хорошо... Есть подвох?',
        'Извините за недоверие, но откуда такая уверенность в результате?',
        'Я не хочу вас обидеть, но вы не первый кто мне это обещает...',
        'А можно как-то подтвердить ваши слова? Может, отзывы или что-то?'
      ],
      alternative_seeking: [
        'А если я просто подожду? Может, само пройдёт?',
        'Может, попробовать сначала что-то попроще, народное средство?',
        'Я слышал про другой метод лечения, может он лучше?',
        'А что если я сначала почитаю в интернете про другие способы?',
        'Может, стоит получить второе мнение у другого специалиста?'
      ],
      comparison_doubt: [
        'Знаете, у вас цены выше чем в соседней клинике...',
        'А почему у конкурентов этот же сервис дешевле?',
        'Мне друг посоветовал другое место, там говорят лучше...',
        'Я сравнивал несколько клиник, и честно говоря, сомневаюсь...',
        'В отзывах про другое место пишут лучше. Чем вы отличаетесь?'
      ],
      fear_based: [
        'А вдруг не поможет? Тогда деньги зря потрачу...',
        'Мне страшно, что может что-то пойти не так...',
        'А если мне станет хуже после этого?',
        'Вы говорите всё хорошо, но я всё равно боюсь осложнений.',
        'А что если я один из тех, кому это не помогает?'
      ],
      procrastination: [
        'Может, я ещё подумаю пару дней?',
        'Знаете, я бы хотел посоветоваться с семьей сначала...',
        'Давайте я вернусь к этому вопросу через недельку?',
        'Мне нужно время всё обдумать, это серьёзное решение...',
        'Я пока не готов принять решение, дайте мне подумать.'
      ],
      third_party_opinion: [
        'Я должен посоветоваться с женой/мужем, без неё/него не решу.',
        'Мне нужно спросить у родителей, что они думают...',
        'Давайте я сначала у своего доктора спрошу, что он скажет?',
        'Мой знакомый врач, я хочу с ним посоветоваться сначала.',
        'Я обещал близким, что не буду принимать решение сам.'
      ]
    };

    const variants = objections[type] || objections.trust_doubt;
    return this.selectUnusedFromArray(variants);
  }

  /**
   * Вопрос на начальной фазе диалога
   */
  private generateInitialPhaseQuestion(discussedTopics: string[]): string {
    const possibleTopics = ['treatment', 'pain', 'cost'];
    const notDiscussed = possibleTopics.filter(t => !discussedTopics.includes(t));
    
    if (notDiscussed.length > 0) {
      return this.generateTopicQuestion(notDiscussed[0]);
    }
    
    return 'Расскажите, пожалуйста, как это будет проходить?';
  }

  /**
   * Естественная эмоциональная реакция на качество общения администратора
   * Как в симуляторе продаж - живые, человеческие реакции
   */
  private generateEmotionalReactionToAdmin(
    adminProfile: any, 
    analysis: any, 
    messageCount: number
  ): string | null {
    const empathy = adminProfile.empathyLevel;
    const responsiveness = adminProfile.responsivenessLevel;
    const clarity = adminProfile.clarityLevel;
    const professionalism = adminProfile.professionalismLevel;

    // РЕАКЦИЯ НА ОТЛИЧНОЕ ОБСЛУЖИВАНИЕ (эмпатия + отзывчивость)
    if (empathy > 70 && responsiveness > 60) {
      return this.selectUnusedFromArray([
        'Вау, как приятно с вами общаться! Чувствую, что вы действительно понимаете мою ситуацию.',
        'Спасибо огромное за такое отношение! Редко встретишь настолько внимательного человека.',
        'Знаете, я очень ценю вашу заботу. Вы реально помогаете, а не просто отвечаете.',
        'Вы прямо душу греете своим вниманием! Спасибо, что так серьёзно отнеслись к моей проблеме.',
        'Ух ты, какой профессионализм! И при этом так по-человечески всё объясняете.'
      ]);
    }

    // РЕАКЦИЯ НА ХАЛАТНОСТЬ (низкая эмпатия + низкая отзывчивость)
    if (empathy < 30 && responsiveness < 40 && messageCount > 3) {
      return this.selectUnusedFromArray([
        'Извините, но у меня ощущение, что вам всё равно на мою проблему...',
        'Слушайте, а вы вообще слушаете, что я говорю? Или просто отписываетесь?',
        'Знаете что, мне кажется вы не очень хотите помочь. Может, к другому специалисту обратиться?',
        'Хм... Как-то холодно вы общаетесь. Я же к вам за помощью пришёл(ла), а не просто так.',
        'Ощущение, что вам лишь бы отделаться от меня. Это нормально вообще?',
        'Простите, но вы могли бы проявить хоть немного участия? Мне правда нужна помощь.'
      ]);
    }

    // РЕАКЦИЯ НА НЕВНЯТНЫЕ ОБЪЯСНЕНИЯ (низкая ясность)
    if (clarity < 40 && messageCount > 2) {
      return this.selectUnusedFromArray([
        'Извините, но я вообще ничего не понял(а) из того, что вы сказали...',
        'Можно попроще? А то я совсем запутался(лась) в ваших объяснениях.',
        'Стоп-стоп-стоп... Давайте ещё раз, но понятными словами?',
        'Вы извините, но для меня это всё как на китайском... Объясните по-человечески, пожалуйста.',
        'Я не медик, мне нужно чтобы было понятно. А то я вообще ничего не улавливаю.'
      ]);
    }

    // РЕАКЦИЯ НА БЫСТРЫЕ ОТПИСКИ (низкая отзывчивость, короткие ответы)
    if (responsiveness < 35 && messageCount > 4) {
      return this.selectUnusedFromArray([
        'А можно подробнее? Вы так коротко отвечаете, что я не успеваю понять...',
        'Ну хоть немного поясните, пожалуйста! Мне правда важно разобраться.',
        'Слушайте, у меня куча вопросов, а вы отвечаете буквально двумя словами...',
        'Не торопитесь, пожалуйста! Расскажите нормально, что к чему.',
        'Такое ощущение, что вы спешите куда-то. Можно чуть подробнее?'
      ]);
    }

    // РЕАКЦИЯ НА ПРОФЕССИОНАЛИЗМ БЕЗ ЭМПАТИИ (высокий профессионализм, низкая эмпатия)
    if (professionalism > 60 && empathy < 35 && messageCount > 3) {
      return this.selectUnusedFromArray([
        'Вы, конечно, знаете своё дело, но хотелось бы чуть больше человечности...',
        'Всё понятно по делу, спасибо. Но как-то очень формально всё.',
        'Информация хорошая, но чувствую себя как номерок в очереди, а не как человек...',
        'Может, я не прав(а), но ощущение что вы робот, а не живой человек.'
      ]);
    }

    // РЕАКЦИЯ НА ХОРОШУЮ ЯСНОСТЬ (высокая ясность)
    if (clarity > 75 && messageCount > 2) {
      return this.selectUnusedFromArray([
        'О, теперь понятно! Спасибо, что так доходчиво объяснили.',
        'Вот это я понимаю - ясно и по делу! Спасибо большое.',
        'Супер, как вы объясняете! Всё сразу разложилось по полочкам в голове.',
        'Ага, теперь дошло! Вы классно объясняете, без лишней воды.'
      ]);
    }

    return null;
  }

  /**
   * Прямая реакция на конкретные фразы администратора (цитирование)
   */
  private generateDirectReactionToAdmin(userMessage: string, lastAdminMessage: string, analysis: any): string | null {
    const lower = userMessage.toLowerCase();
    const lastLower = lastAdminMessage.toLowerCase();

    // Если админ упомянул конкретные цифры - запомнить их
    const priceMatch = userMessage.match(/(\d+[\s]*(рубл|тысяч|₽))/);
    if (priceMatch && analysis.topics.includes('cost')) {
      const variants = [
        `Так, ${priceMatch[0]}... Это много для меня. А нет вариантов подешевле?`,
        `${priceMatch[0]}? Хм, я думал будет дороже. Это за всё лечение?`,
        `${priceMatch[0]}... Мне нужно подумать, смогу ли я себе это позволить.`,
        `Вы сказали ${priceMatch[0]}? А что входит в эту стоимость?`
      ];
      return this.selectUnusedFromArray(variants);
    }

    // Если админ назвал срок лечения
    const timeMatch = userMessage.match(/(\d+\s*(день|недел|месяц|час|минут))/);
    if (timeMatch && analysis.topics.includes('time')) {
      const variants = [
        `${timeMatch[0]}? Это довольно долго для меня...`,
        `${timeMatch[0]}... Хорошо, это приемлемо. А результат когда будет?`,
        `Подождите, ${timeMatch[0]}? Я не смогу столько времени уделить...`,
        `${timeMatch[0]} - это быстрее, чем я думал. Отлично!`
      ];
      return this.selectUnusedFromArray(variants);
    }

    // Если админ использовал слово "гарантия"
    if (lower.includes('гарантир') || lower.includes('обещаю')) {
      const variants = [
        'Вы гарантируете? Это важно, хочу быть уверен.',
        'Хорошо, что вы это гарантируете. Это меня успокаивает.',
        'А если гарантия не сработает? Что тогда?',
        'Спасибо за гарантии, но всё равно немного волнуюсь...'
      ];
      return this.selectUnusedFromArray(variants);
    }

    // Если админ сказал "безопасно"
    if (lower.includes('безопасн') && this.currentEmotionalState === 'scared') {
      const variants = [
        'Вы говорите "безопасно", но я всё равно боюсь...',
        'Безопасно - это хорошо слышать. Но всё же, какие риски?',
        'Спасибо, что сказали про безопасность. Мне полегче стало.',
        'Понятно, что безопасно. А болезненно?'
      ];
      return this.selectUnusedFromArray(variants);
    }

    // Если админ использовал медицинские термины
    const medicalTerms = ['диагноз', 'патология', 'симптоматика', 'этиология', 'терапия'];
    const patientKnowledge = this.scenario.aiPersonality.knowledge || 'medium';
    if (medicalTerms.some(term => lower.includes(term)) && patientKnowledge === 'low') {
      const usedTerm = medicalTerms.find(t => lower.includes(t));
      return this.selectUnusedFromArray([
        `Простите, вы сказали "${usedTerm}"... Что это значит?`,
        `Стоп, "${usedTerm}"? Объясните попроще, пожалуйста.`,
        `Я не понял это слово - "${usedTerm}". Можно без терминов?`
      ]);
    }

    // Если админ ответил на прямой вопрос пациента
    const lastPatientMessage = this.conversationHistory
      .filter(m => m.role === 'ai')
      .slice(-1)[0]?.content || '';
    
    if (lastPatientMessage.includes('?')) {
      const questionTopic = lastPatientMessage.toLowerCase();
      if (questionTopic.includes('больно') && (lower.includes('больно') || lower.includes('боль'))) {
        return this.selectUnusedFromArray([
          'Спасибо, что ответили про боль. Теперь понятнее.',
          'Хорошо, что вы прояснили насчёт боли. Это главное для меня.',
          'Понял насчёт боли. А после процедуры как будет?'
        ]);
      }
      
      if (questionTopic.includes('стоимост') && (lower.includes('стоимост') || lower.includes('цен'))) {
        return this.selectUnusedFromArray([
          'Спасибо за информацию о ценах. Буду думать.',
          'Понятно насчёт стоимости. А оплатить можно частями?',
          'Хорошо, что озвучили цены сразу. Это честно.'
        ]);
      }
    }

    return null;
  }

  /**
   * Обнаружение противоречий в ответах администратора
   */
  private detectContradictions(lastAdminMessages: string[]): string | null {
    if (lastAdminMessages.length < 2) return null;

    const messages = lastAdminMessages.map(m => m.toLowerCase());
    
    // Противоречие в стоимости
    const hasCheap = messages.some(m => m.includes('недорог') || m.includes('доступн'));
    const hasExpensive = messages.some(m => m.includes('дорог') || m.includes('дорогост'));
    if (hasCheap && hasExpensive) {
      return 'Подождите, вы сначала говорили что недорого, а теперь про дороговизну... Что же правда?';
    }

    // Противоречие во времени
    const hasQuick = messages.some(m => m.includes('быстро') || m.includes('недолго'));
    const hasSlow = messages.some(m => m.includes('долго') || m.includes('длительн'));
    if (hasQuick && hasSlow) {
      return 'Извините, но вы говорили что быстро, а сейчас про долгий срок. Уточните, пожалуйста?';
    }

    return null;
  }

  /**
   * Генерация вопроса на основе истории диалога
   */
  private generateFollowUpBasedOnHistory(history: string[]): string {
    const lastAdmin = history.filter(h => h.startsWith('Администратор')).slice(-1)[0];
    
    if (!lastAdmin) {
      return 'Можете рассказать подробнее?';
    }

    // Если администратор упомянул конкретные детали - спросить про них
    if (lastAdmin.includes('процедур') || lastAdmin.includes('лечен')) {
      return this.selectUnusedFromArray([
        'А сколько по времени займёт весь процесс?',
        'Как часто нужно будет приходить на процедуры?',
        'И когда можно ждать результата?'
      ]);
    }

    if (lastAdmin.includes('стоимост') || lastAdmin.includes('цен')) {
      return this.selectUnusedFromArray([
        'А можно как-то в рассрочку оплатить?',
        'Есть ли какие-то дополнительные расходы?',
        'Это окончательная цена или будут ещё доплаты?'
      ]);
    }

    return 'Понятно. А что дальше?';
  }

  /**
   * Расчёт изменения удовлетворённости
   */
  private calculateSatisfactionChange(analysis: any): number {
    let delta = 0;
    
    if (analysis.hasEmpathy) delta += 10;
    if (analysis.hasQuestion) delta += 5;
    if (analysis.isSimple) delta += 8;
    if (analysis.sentiment === 'positive') delta += 5;
    if (analysis.sentiment === 'negative') delta -= 10;
    if (analysis.isTechnical) delta -= 15;
    
    return delta;
  }

  /**
   * Расчёт изменения доверия
   */
  private calculateTrustChange(analysis: any): number {
    let delta = 0;
    
    if (analysis.hasEmpathy) delta += 8;
    if (analysis.hasQuestion) delta += 6;
    if (analysis.topics.length > 2) delta += 10; // Администратор охватил много тем
    if (analysis.sentiment === 'negative') delta -= 12;
    
    return delta;
  }

  private isNonsenseMessage(message: string): boolean {
    const trimmed = message.trim().toLowerCase();
    
    // Слишком короткое
    if (trimmed.length < 3) return true;

    // Только цифры или символы
    if (/^[0-9\s\.,!?;:]+$/.test(trimmed)) return true;

    // Повторяющиеся символы
    if (/(.)\1{4,}/.test(trimmed)) return true;

    // Случайный набор букв (мало гласных)
    const vowels = (trimmed.match(/[аеёиоуыэюяaeiou]/gi) || []).length;
    const consonants = (trimmed.match(/[бвгджзклмнпрстфхцчшщbcdfghjklmnpqrstvwxyz]/gi) || []).length;
    if (consonants > 0 && vowels / consonants < 0.2) return true;

    // Известные бессмысленные паттерны
    const nonsensePatterns = [
      /^[qwertyuiop]+$/i,
      /^[asdfghjkl]+$/i,
      /^[йцукенгшщзхъ]+$/i,
      /^[фывапролджэ]+$/i,
      /test|тест|проверка|hello|hi/i
    ];
    
    return nonsensePatterns.some(pattern => pattern.test(trimmed));
  }

  private generateNonsenseReaction(): string {
    const reactions = [
      'Извините, я вас не понял. Вы можете объяснить по-другому?',
      'Что-то я не понимаю, что вы имеете в виду... Повторите, пожалуйста.',
      'Мне кажется, вы написали что-то непонятное. Скажите это другими словами?',
      'Простите, но я не могу разобрать ваш ответ. Давайте начнём сначала?',
      'Э... Вы серьёзно? Я не понимаю, что вы хотите сказать.',
      'Извините, но это какая-то белиберда. Объясните нормально, пожалуйста.'
    ];
    
    this.currentSatisfaction = Math.max(0, this.currentSatisfaction - 20);
    this.currentEmotionalState = 'confused';
    
    return this.selectUnusedFromArray(reactions);
  }

  private generateShortAnswerReaction(): string {
    const reactions = [
      'Хм... Это всё, что вы можете сказать? Мне нужно больше информации.',
      'И? Расскажите подробнее, пожалуйста.',
      'Слишком коротко. Я не понимаю, что вы предлагаете.',
      'Окей... А можно поподробнее? Мне важно понять.',
      'Это хорошо, но объясните, пожалуйста, что это значит для меня?'
    ];
    
    this.currentSatisfaction = Math.max(0, this.currentSatisfaction - 10);
    
    return this.selectUnusedFromArray(reactions);
  }

  private generateQuickSuccessReaction(): string {
    const reactions = [
      'Ого, как быстро вы всё объяснили! Спасибо огромное, мне уже намного спокойнее. Вы молодец!',
      'Вау! Вы так понятно всё рассказали! Я даже не ожидал, что так быстро разберёмся. Огромное спасибо!',
      'Отлично! Вы прямо сняли камень с души! Теперь всё понятно. Вы профессионал, это видно!',
      'Спасибо большое! Вы так быстро ответили на все мои вопросы! Чувствую себя гораздо увереннее.',
      'Какое облегчение! Спасибо, что так терпеливо и быстро всё объяснили. Я готов начать!',
      'Супер! Теперь мне всё ясно. Вы реально помогли! Давайте записываться?'
    ];
    
    this.currentSatisfaction = Math.min(100, this.currentSatisfaction + 15);
    this.currentEmotionalState = 'happy';
    
    return this.selectUnusedFromArray(reactions);
  }

  private generateFrustrationReaction(): string {
    const reactions = [
      'Слушайте, мы уже долго говорим, а я всё ещё не понимаю... Может, мне лучше в другую клинику обратиться?',
      'Я устал. Вы так и не ответили толком на мои вопросы. Давайте я подумаю...',
      'Знаете что, я запутался окончательно. Вы сами понимаете, что говорите?',
      'Мне кажется, мы ходим по кругу. Я так и не понял толком, что вы предлагаете.',
      'Честно говоря, я ожидал большего от вашей клиники. Вы меня не убедили.',
      'Всё, хватит. Я лучше почитаю отзывы и подумаю. Спасибо, но это не то, что мне нужно.'
    ];
    
    this.currentSatisfaction = Math.max(0, this.currentSatisfaction - 15);
    this.currentEmotionalState = 'angry';
    
    return this.selectUnusedFromArray(reactions);
  }

  private generateReadyToBookResponse(): string {
    const responses = [
      'Я готов записаться! Когда можно прийти?',
      'Отлично, давайте определимся с датой и временем!',
      'Понятно, записывайте меня! На какое время есть свободное окно?',
      'Хорошо, я убедился. Хочу записаться к вам на приём.',
      'Супер! Можно я завтра приду? Или когда удобнее?',
      'Вы меня убедили! Как мне записаться на процедуру?'
    ];
    
    return this.selectUnusedFromArray(responses);
  }

  /**
   * Контекстная генерация на основе анализа истории диалога
   */
  private generateContextAwareResponse(userMessage: string, analysis: any): string | null {
    const messageCount = this.conversationHistory.length;
    const previousUserMessages = this.conversationHistory
      .filter(m => m.role === 'user')
      .map(m => m.content);

    // Анализ того, на что администратор ответил
    const discussedTopics = Array.from(this.context.topicsDiscussed);
    
    // Если администратор обратился к опасениям
    const addressedConcerns = this.scenario.aiPersonality.concerns.filter(concern => {
      const concernWords = concern.toLowerCase().split(' ').filter(w => w.length > 3);
      return concernWords.some(w => userMessage.toLowerCase().includes(w));
    });

    if (addressedConcerns.length > 0 && messageCount >= 2) {
      const concern = addressedConcerns[0];
      const responses = [
        `Да, именно ${concern.toLowerCase()} меня и волновал больше всего. Спасибо, что прояснили!`,
        `Хорошо, что вы подняли вопрос про ${concern.toLowerCase()}. Теперь понятнее.`,
        `Отлично! Вы как раз ответили на мой главный вопрос про ${concern.toLowerCase()}.`
      ];
      
      const response = this.selectUnusedFromArray(responses);
      
      // Добавляем уточняющий вопрос
      const undiscussedTopics = ['лечение', 'стоимость', 'время', 'результат']
        .filter(t => !discussedTopics.some(dt => dt.includes(t)));
      
      if (undiscussedTopics.length > 0 && Math.random() > 0.3) {
        const followUp = this.generateTopicSpecificQuestion(undiscussedTopics[0]);
        return `${response} ${followUp}`;
      }
      
      return response;
    }

    // Если администратор задал вопрос - даём развёрнутый ответ
    if (analysis.hasQuestion && messageCount >= 2) {
      const responses = this.generatePatientAnswer(analysis);
      if (responses) return responses;
    }

    // Если администратор использовал эмпатию несколько раз подряд
    const recentEmpathy = previousUserMessages.slice(-2).every(msg => 
      this.detectsEmpathy(msg)
    );

    if (recentEmpathy && this.context.empathyShown >= 2) {
      return this.generateDeepGratitudeResponse();
    }

    // Если информации стало достаточно
    if (discussedTopics.length >= 3 && this.currentSatisfaction >= 70) {
      return this.generateInformedDecisionResponse();
    }

    return null; // Продолжаем обычную логику
  }

  private detectsEmpathy(message: string): boolean {
    const empathyWords = ['понимаю', 'переживаете', 'волнуетесь', 'помогу', 'поддержу'];
    return empathyWords.some(w => message.toLowerCase().includes(w));
  }

  private generateTopicSpecificQuestion(topic: string): string {
    const questions: Record<string, string[]> = {
      'лечение': [
        'А как именно будет проходить процедура?',
        'Расскажите поподробнее про этапы лечения?',
        'Что конкретно вы будете делать?'
      ],
      'стоимость': [
        'А сколько примерно это будет стоить?',
        'Можете назвать цену?',
        'Есть ли варианты оплаты?'
      ],
      'время': [
        'Сколько времени займёт весь процесс?',
        'Как скоро я увижу результат?',
        'Как часто нужно будет приходить?'
      ],
      'результат': [
        'А какой будет эффект?',
        'Насколько это эффективно?',
        'Что я получу в итоге?'
      ]
    };

    const topicQuestions = questions[topic] || ['Расскажите подробнее?'];
    return this.selectUnusedFromArray(topicQuestions);
  }

  /**
   * Генерация вопроса по теме (используется в новой контекстной системе)
   */
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
      ],
      results: [
        'А какой будет результат?',
        'Насколько это эффективно?',
        'Что я получу в итоге?'
      ],
      experience: [
        'А у вас большой опыт таких процедур?',
        'Вы часто это делаете?',
        'У вас много пациентов с такой проблемой?'
      ]
    };

    return this.selectUnusedFromArray(questions[topic] || ['Расскажите подробнее?']);
  }

  private generatePatientAnswer(analysis: any): string | null {
    // Если администратор спросил про симптомы
    if (analysis.topics.includes('symptoms') || analysis.topics.includes('pain')) {
      const symptoms = this.scenario.aiPersonality.concerns
        .filter(c => c.includes('боль') || c.includes('дискомфорт'))
        .slice(0, 2);
      
      if (symptoms.length > 0) {
        return `У меня ${symptoms[0].toLowerCase()}. ${symptoms.length > 1 ? `Ещё ${symptoms[1].toLowerCase()}.` : ''} Как с этим быть?`;
      }
    }

    // Если администратор спросил про опасения
    if (analysis.intent === 'ask_concerns') {
      const concerns = this.scenario.aiPersonality.concerns.slice(0, 2);
      return `Больше всего меня волнует ${concerns.join(' и ')}. Вы можете помочь с этим?`;
    }

    return null;
  }

  private generateDeepGratitudeResponse(): string {
    const responses = [
      'Вы очень внимательны, спасибо за такое отношение! Мне правда стало легче.',
      'Приятно, что вы так искренне пытаетесь помочь. Я чувствую вашу заботу.',
      'Спасибо, что уделяете мне столько времени и внимания. Это очень важно для меня.',
      'Редко встретишь такого чуткого специалиста. Вы действительно профессионал!'
    ];

    return this.selectUnusedFromArray(responses);
  }

  private generateInformedDecisionResponse(): string {
    const responses = [
      'Знаете что, я получил всю нужную информацию. Теперь могу принять решение. Давайте запишемся!',
      'Отлично! Мы всё обсудили, что мне было важно. Я готов начать. Когда можно?',
      'Супер! Вы ответили на все мои вопросы. Записывайте меня на приём!',
      'Прекрасно! Теперь всё понятно. Хочу к вам записаться.'
    ];

    return this.selectUnusedFromArray(responses);
  }

  private selectQuestionType(analysis: any): string {
    const messageCount = this.conversationHistory.length;
    const topicsDiscussed = Array.from(this.context.topicsDiscussed);

    if (messageCount <= 2) {
      const initialQuestions = ['treatment', 'pain', 'how', 'concern'];
      return initialQuestions[Math.floor(Math.random() * initialQuestions.length)];
    }

    const weights: Record<string, number> = {
      treatment: topicsDiscussed.includes('treatment') ? 0.05 : 0.2,
      pain: topicsDiscussed.includes('pain') ? 0.05 : 0.15,
      cost: topicsDiscussed.includes('cost') ? 0.03 : 0.12,
      time: topicsDiscussed.includes('time') ? 0.03 : 0.12,
      how: 0.1,
      why: 0.1,
      concern: this.currentSatisfaction < 60 ? 0.15 : 0.08,
      alternatives: 0.08,
      experience: 0.06,
      results: 0.1,
      side_effects: this.currentEmotionalState === 'scared' ? 0.15 : 0.08
    };

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (const [type, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) return type;
    }

    return 'how';
  }

  private generateQuestionByType(type: string): string {
    switch (type) {
      case 'treatment':
        return this.generateTreatmentQuestion();
      case 'pain':
        return this.generatePainConcern();
      case 'cost':
        return this.generateCostQuestion();
      case 'time':
        return this.generateTimeQuestion();
      case 'how':
        return this.getRandomUnusedPhrase('question_how');
      case 'why':
        return this.getRandomUnusedPhrase('question_why');
      case 'concern':
        return this.getRandomUnusedPhrase('concern');
      case 'alternatives':
        return this.getRandomUnusedPhrase('alternatives');
      case 'experience':
        return this.getRandomUnusedPhrase('experience');
      case 'results':
        return this.getRandomUnusedPhrase('results');
      case 'side_effects':
        return this.getRandomUnusedPhrase('side_effects');
      default:
        return this.generateTreatmentQuestion();
    }
  }

  private generateTreatmentQuestion(): string {
    const questions = [
      'А как именно будет проходить лечение?',
      'Расскажите подробнее о процедуре.',
      'Что конкретно вы будете делать?',
      'Опишите, пожалуйста, этапы лечения.',
      'А есть альтернативные варианты лечения?',
      'Какие шаги предстоит пройти?'
    ];
    return this.selectUnusedFromArray(questions);
  }

  private generatePainConcern(): string {
    const concerns = [
      'Скажите честно, это больно?',
      'Я очень боюсь боли... Насколько это терпимо?',
      'А анестезия точно подействует?',
      'Мне страшно, что будет больно...',
      'Можно как-то уменьшить боль?',
      'После процедуры долго будет болеть?'
    ];
    return this.selectUnusedFromArray(concerns);
  }

  private generateCostQuestion(): string {
    const questions = [
      'А во сколько мне это обойдётся?',
      'Сколько примерно стоит такое лечение?',
      'Можно узнать о ценах?',
      'Есть какие-то варианты подешевле?',
      'А можно оплатить в рассрочку?',
      'Это дорогая процедура?'
    ];
    return this.selectUnusedFromArray(questions);
  }

  private generateTimeQuestion(): string {
    const questions = [
      'Сколько времени займёт лечение?',
      'Как долго придётся ходить на процедуры?',
      'Когда можно ждать результата?',
      'А это быстро делается?',
      'Сколько визитов потребуется?',
      'Как скоро я смогу вернуться к обычной жизни?'
    ];
    return this.selectUnusedFromArray(questions);
  }

  private generateContextualQuestion(analysis: any): string {
    if (this.context.questionsAsked < 2) {
      return this.getRandomUnusedPhrase('question_how');
    } else {
      return this.getRandomUnusedPhrase('question_why');
    }
  }

  private generateContextBasedResponse(analysis: any): string {
    const messageCount = this.conversationHistory.length;

    if (messageCount <= 2) {
      const responses = [
        'Да, именно так...',
        'Вы правы.',
        'Понял вас.',
        'Хорошо...',
        'Слушаю вас внимательно.'
      ];
      return this.selectUnusedFromArray(responses);
    }

    if (messageCount > 10) {
      if (this.currentSatisfaction > 70) {
        const responses = [
          'Спасибо вам огромное за помощь!',
          'Вы очень помогли мне разобраться.',
          'Теперь всё понятно, благодарю!',
          'Отличный врач, спасибо за терпение.',
          'Я очень доволен нашей беседой.'
        ];
        return this.selectUnusedFromArray(responses);
      }
    }

    if (this.scenario.challenges && Math.random() > 0.7) {
      const unusedChallenges = this.scenario.challenges.filter(c => 
        !Array.from(this.context.topicsDiscussed).some(t => c.includes(t))
      );
      if (unusedChallenges.length > 0) {
        return this.generateChallengeBasedConcern(unusedChallenges[0]);
      }
    }

    const neutralResponses = [
      'Понимаю... А дальше что?',
      'Хорошо, продолжайте.',
      'Слушаю вас.',
      'Да, я с вами.',
      'Расскажите ещё.',
      'И что вы предлагаете?'
    ];
    return this.selectUnusedFromArray(neutralResponses);
  }

  private generateChallengeBasedConcern(challenge: string): string {
    if (challenge.includes('страх') || challenge.includes('боится')) {
      return 'Мне всё равно страшно... А вдруг что-то пойдёт не так?';
    }
    if (challenge.includes('недоверие')) {
      return 'А вы уверены, что это поможет?';
    }
    if (challenge.includes('время') || challenge.includes('некогда')) {
      return 'У меня сейчас совсем нет времени на долгое лечение...';
    }
    if (challenge.includes('деньги') || challenge.includes('дорого')) {
      return 'Это очень дорого для меня...';
    }
    return 'Всё равно остались сомнения...';
  }

  private generateDissatisfactionPhrase(): string {
    const phrases = [
      'Что-то я не очень понял...',
      'Вы меня не убедили.',
      'Мне кажется, вы не слышите мои опасения.',
      'Я всё равно не уверен...',
      'Нет, мне нужно подумать.'
    ];
    return this.selectUnusedFromArray(phrases);
  }

  private getRandomUnusedPhrase(category: string): string {
    const phrases = this.responseVariations.get(category) || [];
    if (phrases.length === 0) return '';

    const unusedPhrases = phrases.filter(p => !this.usedPhrases.has(p));
    
    if (unusedPhrases.length === 0) {
      this.usedPhrases.clear();
      return phrases[Math.floor(Math.random() * phrases.length)];
    }

    const selected = unusedPhrases[Math.floor(Math.random() * unusedPhrases.length)];
    this.usedPhrases.add(selected);
    return selected;
  }

  private selectUnusedFromArray(arr: string[]): string {
    // Защита от пустого массива
    if (!arr || arr.length === 0) {
      return 'Да, понимаю...'; // Fallback на случай пустого массива
    }

    const unused = arr.filter(item => !this.usedPhrases.has(item));
    
    if (unused.length === 0) {
      this.usedPhrases.clear();
      return arr[Math.floor(Math.random() * arr.length)];
    }

    const selected = unused[Math.floor(Math.random() * unused.length)];
    this.usedPhrases.add(selected);
    return selected;
  }

  private updateContext(analysis: any): void {
    this.context.lastUserSentiment = analysis.sentiment;
    
    analysis.topics.forEach((topic: string) => {
      this.context.topicsDiscussed.add(topic);
    });

    if (analysis.hasQuestion) {
      this.context.questionsAsked++;
    }

    if (analysis.hasEmpathy) {
      this.context.empathyShown++;
      this.trackKeyMoment('Проявлена эмпатия к пациенту', 'positive', 12);
      this.context.adminSuccesses.push('Использовал эмпатию');
    }

    if (analysis.isSimple || !analysis.isTechnical) {
      this.context.clarityLevel++;
      if (this.context.clarityLevel >= 2) {
        this.trackKeyMoment('Объяснение простым языком', 'positive', 8);
        this.context.adminSuccesses.push('Говорил понятно');
      }
    } else if (analysis.isTechnical) {
      this.context.clarityLevel = Math.max(0, this.context.clarityLevel - 1);
      this.trackKeyMoment('Использована сложная терминология', 'negative', -15);
      this.context.adminMistakes.push('Медицинские термины без объяснения');
    }

    if (analysis.hasQuestion && analysis.topics.includes('cost')) {
      this.trackKeyMoment('Обсудили стоимость', 'positive', 5);
    }

    if (analysis.sentiment === 'negative') {
      this.trackKeyMoment('Негативная реакция администратора', 'negative', -10);
      this.context.adminMistakes.push('Холодный или негативный тон');
    }
  }

  private trackKeyMoment(what: string, impact: 'positive' | 'negative' | 'neutral', satisfactionChange: number): void {
    this.context.keyMoments.push({
      turn: this.conversationHistory.length / 2,
      what,
      impact,
      satisfactionChange
    });

    const currentTrust = this.context.trustBuilding[this.context.trustBuilding.length - 1];
    const newTrust = Math.max(0, Math.min(100, currentTrust + satisfactionChange));
    this.context.trustBuilding.push(newTrust);

    const currentAnxiety = this.context.anxietyLevels[this.context.anxietyLevels.length - 1];
    const anxietyChange = impact === 'positive' ? -5 : (impact === 'negative' ? 8 : 0);
    const newAnxiety = Math.max(0, Math.min(100, currentAnxiety + anxietyChange));
    this.context.anxietyLevels.push(newAnxiety);
  }

  private updateEmotionalState(analysis: any): void {
    const currentEmotion = this.currentEmotionalState;
    const previousEmotion = currentEmotion;

    // Бессмысленные сообщения -> раздражение
    if (this.isNonsenseMessage(this.conversationHistory[this.conversationHistory.length - 2]?.content || '')) {
      if (currentEmotion === 'angry') {
        // Уже злой - становится ещё злее (учитывается в анализе)
      } else if (currentEmotion === 'confused' || currentEmotion === 'nervous') {
        this.currentEmotionalState = 'angry';
      } else {
        this.currentEmotionalState = 'confused';
      }
    }

    // Быстрое качественное решение -> радость
    if (this.conversationHistory.length <= 6 && this.currentSatisfaction >= 75 && analysis.hasEmpathy) {
      this.currentEmotionalState = 'happy';
    }

    // Эмпатия помогает успокоиться
    if (analysis.hasEmpathy && this.context.empathyShown >= 2) {
      if (currentEmotion === 'scared') this.currentEmotionalState = 'nervous';
      else if (currentEmotion === 'nervous') this.currentEmotionalState = 'calm';
      else if (currentEmotion === 'angry') this.currentEmotionalState = 'nervous';
    }

    // Сложная терминология -> замешательство
    if (analysis.isTechnical && this.scenario.aiPersonality.knowledge === 'low') {
      if (currentEmotion === 'calm') this.currentEmotionalState = 'confused';
      else if (currentEmotion === 'nervous') this.currentEmotionalState = 'confused';
    }

    // Ясность помогает понять
    if (this.context.clarityLevel >= 3 && currentEmotion === 'confused') {
      this.currentEmotionalState = 'calm';
    }

    // Длительный успешный диалог -> довольство
    if (this.conversationHistory.length > 8 && this.currentSatisfaction > 75) {
      this.currentEmotionalState = 'happy';
    }

    // Длительный неэффективный диалог -> гнев
    if (this.conversationHistory.length > 8 && this.currentSatisfaction < 40) {
      if (currentEmotion !== 'angry') {
        this.currentEmotionalState = 'angry';
      }
    }

    // Резкое падение удовлетворённости -> разочарование
    const satisfactionDropped = this.conversationHistory.length > 2 && 
                                 this.currentSatisfaction < 50 && 
                                 (currentEmotion === 'calm' || currentEmotion === 'happy');
    if (satisfactionDropped) {
      this.currentEmotionalState = 'sad';
    }

    // Постепенное улучшение -> облегчение
    if (this.currentSatisfaction >= 60 && this.currentSatisfaction < 75 && 
        (currentEmotion === 'nervous' || currentEmotion === 'scared')) {
      this.currentEmotionalState = 'relieved';
    }

    // Отслеживание изменений эмоций
    if (this.currentEmotionalState !== previousEmotion) {
      this.context.emotionalJourney.push(this.currentEmotionalState);
      this.trackKeyMoment(
        `Эмоция изменилась: ${this.emotionToRussian(previousEmotion)} → ${this.emotionToRussian(this.currentEmotionalState)}`,
        this.isPositiveEmotionChange(previousEmotion, this.currentEmotionalState) ? 'positive' : 'negative',
        this.isPositiveEmotionChange(previousEmotion, this.currentEmotionalState) ? 5 : -5
      );
    }
  }

  private emotionToRussian(emotion: string): string {
    const map: Record<string, string> = {
      'calm': 'спокойный',
      'nervous': 'нервный',
      'angry': 'злой',
      'scared': 'напуганный',
      'happy': 'довольный',
      'sad': 'грустный',
      'confused': 'растерянный',
      'excited': 'взволнованный',
      'relieved': 'облегчённый'
    };
    return map[emotion] || emotion;
  }

  private isPositiveEmotionChange(from: string, to: string): boolean {
    const emotionScore: Record<string, number> = {
      'angry': 1,
      'scared': 2,
      'confused': 3,
      'sad': 3,
      'nervous': 4,
      'calm': 6,
      'relieved': 7,
      'happy': 8
    };
    return (emotionScore[to] || 0) > (emotionScore[from] || 0);
  }

  private updateSatisfaction(analysis: any): void {
    const lastUserMessage = this.conversationHistory[this.conversationHistory.length - 2]?.content || '';
    let change = 0;

    // Бессмысленное сообщение - сильный негатив
    if (this.isNonsenseMessage(lastUserMessage)) {
      change -= 25;
      this.trackKeyMoment('Получен бессмысленный ответ', 'negative', -25);
      this.context.adminMistakes.push('Отправлен бессмысленный ответ');
    }

    // Слишком короткий ответ
    if (lastUserMessage.trim().length < 10 && this.conversationHistory.length > 2) {
      change -= 12;
      this.trackKeyMoment('Слишком короткий ответ', 'negative', -12);
      this.context.adminMistakes.push('Недостаточно информации в ответе');
    }

    // Быстрое качественное решение - большой бонус
    if (this.conversationHistory.length <= 6 && analysis.hasEmpathy) {
      change += 20;
      this.trackKeyMoment('Быстрое и качественное решение', 'positive', 20);
      this.context.adminSuccesses.push('Быстро решил вопрос пациента');
    }

    // Эмпатия всегда ценится
    if (analysis.hasEmpathy) {
      change += 15;
    }

    // Вопросы администратора - проявление интереса
    if (analysis.hasQuestion) {
      change += 10;
      this.context.adminSuccesses.push('Задал уточняющий вопрос');
    }

    // Простое объяснение
    if (analysis.isSimple) {
      change += 10;
    }

    // Позитивная/негативная тональность
    if (analysis.sentiment === 'positive') change += 5;
    if (analysis.sentiment === 'negative') {
      change -= 10;
      this.context.adminMistakes.push('Негативный тон в ответе');
    }

    // Сложная терминология для неподготовленного пациента
    if (analysis.isTechnical && this.scenario.aiPersonality.knowledge === 'low') {
      change -= 20;
    }

    // Бонус за терпение и развёрнутый диалог
    if (this.conversationHistory.length > 5 && this.currentSatisfaction > 50) {
      change += 5;
    }

    // Штраф за затягивание при низкой удовлетворённости
    if (this.conversationHistory.length > 8 && this.currentSatisfaction < 40) {
      change -= 8;
      this.context.adminMistakes.push('Не смог убедить за разумное время');
    }

    const previousSatisfaction = this.currentSatisfaction;
    this.currentSatisfaction = Math.max(0, Math.min(100, this.currentSatisfaction + change));

    // Отслеживание значительных изменений
    if (Math.abs(change) >= 15) {
      this.trackKeyMoment(
        `Удовлетворённость изменилась на ${change > 0 ? '+' : ''}${change} (${previousSatisfaction} → ${this.currentSatisfaction})`,
        change > 0 ? 'positive' : 'negative',
        change
      );
    }
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

  /**
   * Получение полного контекста диалога для анализа
   */
  getDialogueContext() {
    return this.dialogueContext.getFullContext();
  }

  /**
   * Экспорт контекста диалога в JSON для отладки
   */
  exportDialogueContext(): string {
    return this.dialogueContext.exportContext();
  }

  /**
   * Очистка контекста диалога
   */
  clearDialogueContext(): void {
    this.dialogueContext.clear();
  }

  private buildPatientBehaviorModel(): PatientBehaviorModel {
    const trustLevel = this.context.trustBuilding[this.context.trustBuilding.length - 1];
    const cooperationLevel = this.currentSatisfaction;
    const anxietyLevel = this.context.anxietyLevels[this.context.anxietyLevels.length - 1];
    const informationAbsorption = Math.min(100, this.context.clarityLevel * 20);
    const decisionReadiness = trustLevel > 60 && anxietyLevel < 40 ? 80 : 40;

    const primaryConcerns: string[] = [];
    Array.from(this.context.topicsDiscussed).forEach(topic => {
      if (topic === 'pain') primaryConcerns.push('Боль и дискомфорт');
      if (topic === 'cost') primaryConcerns.push('Стоимость лечения');
      if (topic === 'time') primaryConcerns.push('Длительность процедур');
      if (topic === 'safety') primaryConcerns.push('Безопасность методов');
    });

    const unresolvedDouBts = this.context.adminMistakes.map(mistake => 
      `Сомнение после: "${mistake}"`
    );

    const emotionalTriggers = this.context.keyMoments
      .filter(m => m.impact === 'negative')
      .map(m => m.what);

    return {
      trustLevel,
      cooperationLevel,
      anxietyLevel,
      informationAbsorption,
      decisionReadiness,
      primaryConcerns,
      unresolvedDouBts,
      emotionalTriggers
    };
  }

  private generateConversationScenarios(): ConversationScenario[] {
    const scenarios: ConversationScenario[] = [];

    scenarios.push({
      scenarioType: 'actual',
      description: 'Реальный сценарий разговора',
      keyMoments: this.context.keyMoments,
      outcome: this.getActualOutcome(),
      patientResponse: this.getPatientFinalThought()
    });

    scenarios.push({
      scenarioType: 'ideal',
      description: 'Идеальный сценарий при правильных действиях',
      keyMoments: this.generateIdealScenario(),
      outcome: 'Пациент полностью доверяет, готов к лечению, все сомнения развеяны',
      patientResponse: 'Спасибо, я всё понял и готов начать. Вы меня убедили!'
    });

    if (this.context.adminMistakes.length > 0) {
      scenarios.push({
        scenarioType: 'alternative',
        description: 'Альтернативный подход без ошибок',
        keyMoments: this.generateAlternativeScenario(),
        outcome: 'Более быстрое достижение доверия',
        patientResponse: 'Если бы так с самого начала, я бы сразу согласился'
      });
    }

    return scenarios;
  }

  private getActualOutcome(): string {
    if (this.currentSatisfaction >= 80) {
      return 'Пациент доволен, доверяет администратору, готов к записи';
    } else if (this.currentSatisfaction >= 60) {
      return 'Пациент скорее удовлетворён, но остались небольшие сомнения';
    } else if (this.currentSatisfaction >= 40) {
      return 'Пациент не уверен, требуется дополнительное убеждение';
    } else {
      return 'Пациент разочарован, скорее всего откажется от записи';
    }
  }

  private getPatientFinalThought(): string {
    const anxiety = this.context.anxietyLevels[this.context.anxietyLevels.length - 1];
    const trust = this.context.trustBuilding[this.context.trustBuilding.length - 1];

    if (trust >= 80 && anxiety < 30) {
      return 'Мне всё понятно, я доверяю этой клинике. Запишусь обязательно!';
    } else if (trust >= 60) {
      return 'Вроде всё неплохо объяснили, но хотелось бы ещё подумать...';
    } else if (anxiety > 60) {
      return 'Мне всё ещё страшно, не уверен, что готов...';
    } else {
      return 'Что-то не очень убедительно. Посмотрю другие клиники.';
    }
  }

  private generateIdealScenario(): KeyMoment[] {
    return [
      {
        turn: 1,
        what: 'Администратор проявил эмпатию к переживаниям',
        impact: 'positive',
        satisfactionChange: 15
      },
      {
        turn: 2,
        what: 'Объяснил процедуру простым языком',
        impact: 'positive',
        satisfactionChange: 12
      },
      {
        turn: 3,
        what: 'Ответил на все вопросы про стоимость и время',
        impact: 'positive',
        satisfactionChange: 10
      },
      {
        turn: 4,
        what: 'Рассказал про опыт врача и отзывы',
        impact: 'positive',
        satisfactionChange: 10
      },
      {
        turn: 5,
        what: 'Предложил комфортные условия записи',
        impact: 'positive',
        satisfactionChange: 8
      }
    ];
  }

  private generateAlternativeScenario(): KeyMoment[] {
    const mistakes = this.context.adminMistakes;
    return mistakes.map((mistake, index) => ({
      turn: index + 1,
      what: `Исправить: ${mistake}`,
      impact: 'positive' as const,
      satisfactionChange: 10
    }));
  }

  private generateDeepInsights(): DeepInsight[] {
    const insights: DeepInsight[] = [];

    if (this.context.empathyShown < 2) {
      insights.push({
        category: 'empathy',
        insight: 'Недостаточно эмпатии в общении',
        evidence: [
          `Эмпатия проявлена ${this.context.empathyShown} раз(а)`,
          'Пациент чувствует, что его переживания игнорируют'
        ],
        recommendation: 'Используйте фразы: "Я понимаю ваше беспокойство", "Многие пациенты чувствуют то же самое"'
      });
    }

    if (this.context.clarityLevel <= 1) {
      insights.push({
        category: 'clarity',
        insight: 'Слишком сложные объяснения для пациента',
        evidence: [
          'Использовалась профессиональная терминология',
          `Уровень понимания: ${this.context.clarityLevel}/5`
        ],
        recommendation: 'Объясняйте как другу, без медицинских терминов. Приводите примеры из жизни.'
      });
    }

    const trustChange = this.context.trustBuilding[this.context.trustBuilding.length - 1] - this.context.trustBuilding[0];
    if (trustChange < 20) {
      insights.push({
        category: 'trust',
        insight: 'Доверие пациента выросло недостаточно',
        evidence: [
          `Рост доверия: ${trustChange} пунктов`,
          'Пациент не чувствует уверенности в клинике'
        ],
        recommendation: 'Расскажите о достижениях врача, покажите сертификаты, упомяните отзывы'
      });
    }

    if (this.context.adminSuccesses.length > 3) {
      insights.push({
        category: 'professionalism',
        insight: 'Отличная коммуникация! Пациент чувствует профессионализм',
        evidence: this.context.adminSuccesses,
        recommendation: 'Продолжайте в том же духе! Ваш подход работает.'
      });
    }

    if (this.context.questionsAsked < 2 && this.conversationHistory.length > 6) {
      insights.push({
        category: 'communication',
        insight: 'Мало вопросов к пациенту',
        evidence: [
          `Задано вопросов: ${this.context.questionsAsked}`,
          'Монолог вместо диалога'
        ],
        recommendation: 'Задавайте открытые вопросы: "Что вас больше всего беспокоит?", "Расскажите подробнее"'
      });
    }

    return insights;
  }

  /**
   * Получить глубокий анализ диалога (алиас для analyzeConversation)
   */
  getAnalysis(): ConversationAnalysis {
    return this.analyzeConversation();
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
      const metObjectives = objectives.filter(obj => {
        const objKeywords = obj.toLowerCase().split(' ').filter(w => w.length > 3);
        return userMessages.some(m => 
          objKeywords.some(kw => m.content.toLowerCase().includes(kw))
        );
      });
      goalProgressScore = (metObjectives.length / objectives.length) * 100;
    } else {
      goalProgressScore = Math.min(this.conversationHistory.length * 10, 100);
    }

    if (this.context.empathyShown > 0) alignmentScore += 30;
    if (this.context.clarityLevel > 2) alignmentScore += 20;

    const recommendations: string[] = [];
    const goodPoints: string[] = [];
    const missedOpportunities: string[] = [];

    if (this.currentSatisfaction >= 70) {
      goodPoints.push('Успешно установлен контакт с пациентом');
    } else if (this.currentSatisfaction < 40) {
      recommendations.push('Проявляйте больше эмпатии и внимания к пациенту');
      missedOpportunities.push('Недостаточно внимания к эмоциям пациента');
    }

    if (this.context.empathyShown >= 2) {
      goodPoints.push('Проявили эмпатию и понимание');
    } else if (this.context.empathyShown === 0) {
      recommendations.push('Используйте фразы "Я понимаю ваши переживания", "Не волнуйтесь"');
      missedOpportunities.push('Не проявили эмпатию');
    }

    if (this.context.clarityLevel >= 3) {
      goodPoints.push('Объясняли простым языком');
    } else if (this.context.clarityLevel <= 0) {
      recommendations.push('Избегайте медицинских терминов, объясняйте проще');
      missedOpportunities.push('Использовали сложную терминологию');
    }

    if (this.conversationHistory.length >= 7) {
      goodPoints.push(`Провели подробную беседу (${this.conversationHistory.length / 2} сообщений)`);
    } else if (this.conversationHistory.length < 4) {
      recommendations.push('Продлите разговор, задайте больше вопросов');
    }

    if (goalProgressScore < 50) {
      missedOpportunities.push(`Цель "${context.goal}" не достигнута`);
      recommendations.push('Направьте беседу к достижению основной цели');
    } else if (goalProgressScore >= 80) {
      goodPoints.push('Отлично! Цель разговора достигнута');
    }

    const emotionalProgress = this.context.emotionalJourney;
    if (emotionalProgress.length > 1) {
      const improved = 
        (emotionalProgress[0] === 'scared' && emotionalProgress[emotionalProgress.length - 1] === 'calm') ||
        (emotionalProgress[0] === 'nervous' && emotionalProgress[emotionalProgress.length - 1] === 'calm') ||
        (emotionalProgress[0] === 'angry' && emotionalProgress[emotionalProgress.length - 1] !== 'angry');
      
      if (improved) {
        goodPoints.push('Успешно улучшили эмоциональное состояние пациента');
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
      missedOpportunities,
      patientBehaviorModel: this.buildPatientBehaviorModel(),
      conversationScenarios: this.generateConversationScenarios(),
      deepInsights: this.generateDeepInsights()
    };
  }
}