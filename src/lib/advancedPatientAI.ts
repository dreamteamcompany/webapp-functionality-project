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

interface ConversationContext {
  topicsDiscussed: Set<string>;
  emotionalJourney: string[];
  empathyShown: number;
  questionsAsked: number;
  clarityLevel: number;
  lastUserSentiment: 'positive' | 'negative' | 'neutral';
}

export class AdvancedPatientAI {
  private scenario: CustomScenario;
  private conversationHistory: Array<{ role: 'user' | 'ai', content: string }> = [];
  private currentSatisfaction = 50;
  private currentEmotionalState: string;
  private context: ConversationContext;
  private responseVariations: Map<string, string[]> = new Map();
  private usedPhrases: Set<string> = new Set();

  constructor(scenario: CustomScenario) {
    this.scenario = scenario;
    this.currentEmotionalState = scenario.aiPersonality.emotionalState;
    this.context = {
      topicsDiscussed: new Set(),
      emotionalJourney: [scenario.aiPersonality.emotionalState],
      empathyShown: 0,
      questionsAsked: 0,
      clarityLevel: 0,
      lastUserSentiment: 'neutral'
    };
    this.initializeResponseVariations();
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
    const baseGreeting = this.scenario.initialMessage;
    const followUpQuestions = [
      'Что вы можете мне посоветовать?',
      'Как мне быть?',
      'Скажите, что мне делать?',
      'Вы можете мне помочь?',
      'Что вы думаете об этом?'
    ];
    
    const followUp = followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)];
    return `${baseGreeting} ${followUp}`;
  }

  async getResponse(userMessage: string): Promise<AIResponse> {
    this.conversationHistory.push({ role: 'user', content: userMessage });

    const analysis = this.analyzeUserMessage(userMessage);
    this.updateContext(analysis);

    const responseText = this.generateNaturalResponse(userMessage, analysis);
    
    this.conversationHistory.push({ role: 'ai', content: responseText });

    this.updateEmotionalState(analysis);
    this.updateSatisfaction(analysis);

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

    if (analysis.isTechnical && this.scenario.aiPersonality.knowledge === 'low') {
      parts.push(this.getRandomUnusedPhrase('confusion'));
    }

    if (messageCount > 10 && this.currentSatisfaction > 70) {
      parts.push(this.getRandomUnusedPhrase('gratitude'));
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
    }

    if (analysis.isSimple || !analysis.isTechnical) {
      this.context.clarityLevel++;
    } else if (analysis.isTechnical) {
      this.context.clarityLevel = Math.max(0, this.context.clarityLevel - 1);
    }
  }

  private updateEmotionalState(analysis: any): void {
    const currentEmotion = this.currentEmotionalState;

    if (analysis.hasEmpathy && this.context.empathyShown >= 2) {
      if (currentEmotion === 'scared') this.currentEmotionalState = 'nervous';
      else if (currentEmotion === 'nervous') this.currentEmotionalState = 'calm';
      else if (currentEmotion === 'angry') this.currentEmotionalState = 'nervous';
    }

    if (analysis.isTechnical && this.scenario.aiPersonality.knowledge === 'low') {
      if (currentEmotion === 'calm') this.currentEmotionalState = 'confused';
      else if (currentEmotion === 'nervous') this.currentEmotionalState = 'confused';
    }

    if (this.context.clarityLevel >= 3 && currentEmotion === 'confused') {
      this.currentEmotionalState = 'calm';
    }

    if (this.conversationHistory.length > 10 && this.currentSatisfaction > 75) {
      this.currentEmotionalState = 'happy';
    }

    if (this.currentEmotionalState !== currentEmotion) {
      this.context.emotionalJourney.push(this.currentEmotionalState);
    }
  }

  private updateSatisfaction(analysis: any): void {
    let change = 0;

    if (analysis.hasEmpathy) change += 15;
    if (analysis.hasQuestion) change += 10;
    if (analysis.isSimple) change += 10;
    if (analysis.sentiment === 'positive') change += 5;
    if (analysis.sentiment === 'negative') change -= 5;
    if (analysis.isTechnical && this.scenario.aiPersonality.knowledge === 'low') change -= 20;

    if (this.conversationHistory.length > 5) {
      change += 5;
    }

    this.currentSatisfaction = Math.max(0, Math.min(100, this.currentSatisfaction + change));
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