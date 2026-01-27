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

interface AdminMessageAnalysis {
  hasEmpathy: boolean;
  empathyLevel: number;
  hasQuestion: boolean;
  questionType: string | null;
  isDetailed: boolean;
  providesSpecifics: boolean;
  usesSimpleLanguage: boolean;
  usesMedicalTerms: boolean;
  topics: string[];
  addressesConcerns: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  offersAction: boolean;
  wordCount: number;
  isTooShort: boolean;
}

interface DialogueContext {
  stage: 'initial' | 'exploration' | 'negotiation' | 'closing';
  discussedTopics: Set<string>;
  unresolvedQuestions: string[];
  adminApproach: {
    showsEmpathy: boolean;
    asksQuestions: boolean;
    providesInfo: boolean;
    usesSimpleLanguage: boolean;
  };
  patientNeeds: {
    needsReassurance: boolean;
    needsMoreInfo: boolean;
    needsClarification: boolean;
    readyToDecide: boolean;
  };
}

export class CustomAI {
  private scenario: CustomScenario;
  private conversationHistory: Array<{ role: 'user' | 'ai', content: string }> = [];
  private currentSatisfaction = 50;
  private messageCount = 0;
  private currentEmotionalState: string;
  private context: DialogueContext;
  private usedPhrases: Set<string> = new Set();

  constructor(scenario: CustomScenario) {
    this.scenario = scenario;
    this.currentEmotionalState = scenario.aiPersonality.emotionalState;
    this.context = {
      stage: 'initial',
      discussedTopics: new Set(),
      unresolvedQuestions: [],
      adminApproach: {
        showsEmpathy: false,
        asksQuestions: false,
        providesInfo: false,
        usesSimpleLanguage: true
      },
      patientNeeds: {
        needsReassurance: scenario.aiPersonality.emotionalState === 'scared' || scenario.aiPersonality.emotionalState === 'nervous',
        needsMoreInfo: true,
        needsClarification: false,
        readyToDecide: false
      }
    };
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

    // Анализ сообщения администратора
    const analysis = this.analyzeAdminMessage(userMessage);
    
    // Обновление контекста диалога
    this.updateDialogueContext(analysis);
    
    // Генерация контекстуального ответа
    const response = this.createContextualResponse(userMessage, analysis);
    
    this.conversationHistory.push({ role: 'ai', content: response.message });
    this.currentEmotionalState = response.emotionalState;
    this.currentSatisfaction = response.satisfaction;

    return response;
  }

  private analyzeAdminMessage(message: string): AdminMessageAnalysis {
    const lower = message.toLowerCase();
    const words = message.split(/\s+/).filter(w => w.length > 2);

    return {
      // Эмпатия
      hasEmpathy: this.detectEmpathy(lower),
      empathyLevel: this.calculateEmpathyLevel(lower),
      
      // Вопросы
      hasQuestion: /[?？]/.test(message) || ['как', 'что', 'почему', 'когда', 'где', 'сколько', 'можете'].some(q => lower.includes(q)),
      questionType: this.detectQuestionType(lower),
      
      // Информативность
      isDetailed: words.length >= 15,
      providesSpecifics: this.detectSpecifics(lower),
      
      // Ясность
      usesSimpleLanguage: this.detectSimpleLanguage(lower, words),
      usesMedicalTerms: this.detectMedicalTerms(lower),
      
      // Темы
      topics: this.extractTopics(lower),
      
      // Адресация опасений
      addressesConcerns: this.detectAddressedConcerns(lower),
      
      // Тональность
      sentiment: this.detectSentiment(lower),
      
      // Действия
      offersAction: this.detectActionOffer(lower),
      
      // Длина и качество
      wordCount: words.length,
      isTooShort: words.length < 5 && this.messageCount > 1
    };
  }

  private detectEmpathy(text: string): boolean {
    const empathyPhrases = [
      'понимаю', 'понимаю вас', 'понимаю ваши переживания',
      'не волнуйтесь', 'не переживайте', 'не беспокойтесь',
      'помогу', 'я вам помогу', 'я помогу вам',
      'это нормально', 'это естественно',
      'многие пациенты', 'вы не одиноки',
      'я на вашей стороне', 'я с вами'
    ];
    return empathyPhrases.some(phrase => text.includes(phrase));
  }

  private calculateEmpathyLevel(text: string): number {
    let level = 0;
    if (text.includes('понимаю ваши переживания')) level += 15;
    else if (text.includes('понимаю вас')) level += 10;
    else if (text.includes('понимаю')) level += 5;
    
    if (text.includes('не волнуйтесь') || text.includes('не переживайте')) level += 10;
    if (text.includes('помогу')) level += 8;
    if (text.includes('это нормально')) level += 7;
    
    return level;
  }

  private detectQuestionType(text: string): string | null {
    if (text.includes('как') && (text.includes('себя') || text.includes('чувству'))) return 'feeling';
    if (text.includes('что') && text.includes('беспокоит')) return 'concern';
    if (text.includes('расскаж')) return 'open';
    if (text.includes('можете') || text.includes('можно')) return 'capability';
    return null;
  }

  private detectSpecifics(text: string): boolean {
    // Проверка на конкретику: цифры, даты, цены, сроки
    return /\d+/.test(text) || 
           ['рублей', 'дней', 'недел', 'месяц', 'минут', 'час', '%'].some(unit => text.includes(unit));
  }

  private detectSimpleLanguage(text: string, words: string[]): boolean {
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / Math.max(words.length, 1);
    const hasManyLongWords = words.filter(w => w.length > 12).length > words.length * 0.2;
    return avgWordLength < 7 && !hasManyLongWords;
  }

  private detectMedicalTerms(text: string): boolean {
    const medicalTerms = [
      'диагноз', 'патология', 'этиология', 'симптоматика', 'анамнез',
      'терапия', 'противопоказан', 'клиническ', 'пародонт', 'имплант',
      'резекция', 'протезирование', 'ортопедическ'
    ];
    const foundTerms = medicalTerms.filter(term => text.includes(term)).length;
    return foundTerms >= 2;
  }

  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    
    const topicKeywords = {
      treatment: ['лечение', 'процедура', 'операция', 'терапия', 'лечить'],
      pain: ['боль', 'больно', 'болит', 'болезненн', 'дискомфорт', 'анестезия'],
      cost: ['стоимость', 'цена', 'оплата', 'рассрочка', 'стоит', 'дорог'],
      time: ['время', 'долго', 'быстро', 'срок', 'дата', 'когда', 'длительность'],
      safety: ['безопасн', 'опасн', 'риск', 'осложнения', 'последствия'],
      results: ['результат', 'эффект', 'поможет', 'гарантия'],
      process: ['как', 'этапы', 'процесс', 'происходит']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(kw => text.includes(kw))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  private detectAddressedConcerns(text: string): string[] {
    const addressed: string[] = [];
    const challenges = this.scenario.challenges || [];
    
    for (const challenge of challenges) {
      const challengeWords = challenge.toLowerCase().split(' ').filter(w => w.length > 3);
      if (challengeWords.some(word => text.includes(word))) {
        addressed.push(challenge);
      }
    }
    
    return addressed;
  }

  private detectSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['хорошо', 'отлично', 'прекрасно', 'замечательно', 'конечно', 'да', 'помогу', 'решим'];
    const negativeWords = ['нет', 'не могу', 'невозможно', 'сложно', 'проблема', 'к сожалению'];
    
    const posCount = positiveWords.filter(w => text.includes(w)).length;
    const negCount = negativeWords.filter(w => text.includes(w)).length;
    
    if (posCount > negCount) return 'positive';
    if (negCount > posCount) return 'negative';
    return 'neutral';
  }

  private detectActionOffer(text: string): boolean {
    const actionPhrases = [
      'предлагаю', 'давайте', 'можем', 'запишем', 'назначим',
      'начнем', 'сделаем', 'проведем'
    ];
    return actionPhrases.some(phrase => text.includes(phrase));
  }

  private updateDialogueContext(analysis: AdminMessageAnalysis): void {
    // Обновление подхода администратора
    if (analysis.hasEmpathy) this.context.adminApproach.showsEmpathy = true;
    if (analysis.hasQuestion) this.context.adminApproach.asksQuestions = true;
    if (analysis.isDetailed) this.context.adminApproach.providesInfo = true;
    if (analysis.usesSimpleLanguage) this.context.adminApproach.usesSimpleLanguage = true;

    // Добавление обсужденных тем
    analysis.topics.forEach(topic => this.context.discussedTopics.add(topic));

    // Определение стадии диалога
    if (this.messageCount <= 2) {
      this.context.stage = 'initial';
    } else if (this.messageCount <= 6) {
      this.context.stage = 'exploration';
    } else if (this.currentSatisfaction >= 80 || (this.messageCount >= 10 && this.currentSatisfaction >= 70)) {
      this.context.stage = 'closing';
    } else if (this.currentSatisfaction >= 60 || this.messageCount > 6) {
      this.context.stage = 'negotiation';
    }

    // Обновление потребностей пациента
    if (analysis.empathyLevel >= 10) {
      this.context.patientNeeds.needsReassurance = false;
    }
    if (analysis.topics.length >= 2 && analysis.isDetailed) {
      this.context.patientNeeds.needsMoreInfo = false;
    }
    if (analysis.usesMedicalTerms && this.scenario.aiPersonality.knowledge === 'low') {
      this.context.patientNeeds.needsClarification = true;
    }
    if (this.currentSatisfaction >= 70 && this.context.discussedTopics.size >= 3) {
      this.context.patientNeeds.readyToDecide = true;
    }
  }

  private createContextualResponse(userMessage: string, analysis: AdminMessageAnalysis): AIResponse {
    let satisfaction = this.currentSatisfaction;
    let emotionalState = this.currentEmotionalState;

    // Расчет изменения удовлетворенности
    satisfaction += this.calculateSatisfactionDelta(analysis);
    satisfaction = Math.max(0, Math.min(100, satisfaction));

    // Обновление эмоционального состояния
    emotionalState = this.updateEmotionalState(analysis, satisfaction);

    // Генерация сообщения на основе контекста
    const messageParts: string[] = [];

    // 1. Реакция на качество ответа администратора
    const reaction = this.generateReaction(analysis, emotionalState);
    if (reaction) messageParts.push(reaction);

    // 2. Ответ на вопрос (если был задан)
    if (analysis.hasQuestion) {
      const answer = this.generateAnswerToQuestion(analysis.questionType, emotionalState);
      if (answer) messageParts.push(answer);
    }

    // 3. Комментарий к информации
    if (analysis.topics.length > 0) {
      const comment = this.generateTopicComment(analysis.topics, analysis);
      if (comment) messageParts.push(comment);
    }

    // 4. Новый вопрос или проблема
    const followUp = this.generateFollowUp(analysis, emotionalState);
    if (followUp) messageParts.push(followUp);

    // 5. Финальная стадия - готовность к решению
    if (this.context.stage === 'closing' && satisfaction >= 75) {
      const closing = this.generateClosingStatement(satisfaction);
      messageParts.push(closing);
    }

    const message = messageParts.join(' ').trim() || this.generateFallback(emotionalState);

    return {
      message,
      emotionalState,
      satisfaction
    };
  }

  private calculateSatisfactionDelta(analysis: AdminMessageAnalysis): number {
    let delta = 0;

    // Позитивные факторы
    if (analysis.hasEmpathy) delta += analysis.empathyLevel;
    if (analysis.hasQuestion) delta += 8;
    if (analysis.isDetailed) delta += 10;
    if (analysis.usesSimpleLanguage) delta += 7;
    if (analysis.providesSpecifics) delta += 12;
    if (analysis.addressesConcerns.length > 0) delta += 15;
    if (analysis.sentiment === 'positive') delta += 5;

    // Негативные факторы
    if (analysis.isTooShort) delta -= 15;
    if (analysis.usesMedicalTerms && this.scenario.aiPersonality.knowledge === 'low') delta -= 20;
    if (analysis.sentiment === 'negative') delta -= 12;
    if (!analysis.hasQuestion && !analysis.hasEmpathy && this.messageCount <= 3) delta -= 10;

    return delta;
  }

  private updateEmotionalState(analysis: AdminMessageAnalysis, satisfaction: number): string {
    let newState = this.currentEmotionalState;

    // Позитивные переходы
    if (analysis.empathyLevel >= 15 && satisfaction >= 60) {
      if (newState === 'scared') newState = 'nervous';
      else if (newState === 'nervous') newState = 'calm';
      else if (newState === 'angry') newState = 'calm';
    }

    if (satisfaction >= 80) {
      newState = 'happy';
    }

    // Негативные переходы
    if (analysis.isTooShort || (analysis.usesMedicalTerms && this.scenario.aiPersonality.knowledge === 'low')) {
      if (newState === 'calm') newState = 'confused';
      else if (newState === 'nervous') newState = 'confused';
    }

    if (this.messageCount >= 8 && satisfaction < 40) {
      newState = 'angry';
    }

    // Переходы от замешательства к ясности
    if (analysis.usesSimpleLanguage && analysis.isDetailed && newState === 'confused') {
      newState = 'calm';
    }

    return newState;
  }

  private generateReaction(analysis: AdminMessageAnalysis, emotionalState: string): string | null {
    // Реакция на отличный ответ
    if (analysis.empathyLevel >= 15 && analysis.isDetailed) {
      return this.selectUnused([
        'Спасибо большое! Вы очень внимательны, это важно для меня.',
        'Как приятно! Вы действительно понимаете мою ситуацию.',
        'Благодарю за такое отношение! Мне уже легче стало.'
      ]);
    }

    // Реакция на слишком короткий ответ
    if (analysis.isTooShort) {
      return this.selectUnused([
        'Хм, это всё? Мне нужно больше информации...',
        'Можете пояснить подробнее? Я не совсем понял.',
        'И всё? А можно узнать детали?'
      ]);
    }

    // Реакция на сложную терминологию
    if (analysis.usesMedicalTerms && this.scenario.aiPersonality.knowledge === 'low') {
      return this.selectUnused([
        'Простите, но я не понимаю медицинских терминов. Объясните попроще, пожалуйста.',
        'Это слишком сложно для меня. Можете сказать обычными словами?',
        'Извините, я запутался в ваших терминах. Давайте проще?'
      ]);
    }

    // Реакция на обращение к опасениям
    if (analysis.addressesConcerns.length > 0) {
      const concern = analysis.addressesConcerns[0];
      return `Да, именно ${concern.toLowerCase()} меня и волновало! Спасибо, что затронули эту тему.`;
    }

    return null;
  }

  private generateAnswerToQuestion(questionType: string | null, emotionalState: string): string | null {
    const lastAiMessage = this.conversationHistory
      .filter(m => m.role === 'ai')
      .slice(-1)[0]?.content || '';

    // Ответ на вопрос о самочувствии/ощущениях
    if (questionType === 'feeling') {
      if (emotionalState === 'scared') {
        return this.selectUnused([
          'Честно говоря, я очень переживаю и боюсь...',
          'Мне страшно, если честно. Никогда раньше такого не делал.',
          'Волнуюсь сильно. Боюсь боли и осложнений.'
        ]);
      } else if (emotionalState === 'nervous') {
        return this.selectUnused([
          'Немного нервничаю, конечно. Но это normal, наверное.',
          'Есть опасения, не скрою. Но пытаюсь взять себя в руки.',
          'Волнуюсь, но понимаю, что надо что-то делать.'
        ]);
      } else if (emotionalState === 'calm' || emotionalState === 'happy') {
        return this.selectUnused([
          'Сейчас уже спокойнее себя чувствую. Вы меня успокоили.',
          'Намного лучше стало! Теперь всё понятнее.',
          'Хорошо, спасибо что спросили. Уже не так волнуюсь.'
        ]);
      }
    }

    // Ответ на вопрос об опасениях
    if (questionType === 'concern') {
      const challenges = this.scenario.challenges || [];
      const mainConcern = challenges.length > 0 ? challenges[0] : 'общая ситуация';
      return `Больше всего меня беспокоит ${mainConcern.toLowerCase()}. Это можно как-то решить?`;
    }

    // Ответ на открытый вопрос
    if (questionType === 'open') {
      if (lastAiMessage.includes('?')) {
        const context = this.scenario.context.situation;
        return `Ну, ${context.slice(0, 100)}... Вот такая ситуация.`;
      }
    }

    return null;
  }

  private generateTopicComment(topics: string[], analysis: AdminMessageAnalysis): string | null {
    const topic = topics[0];
    const isFirstTime = this.context.discussedTopics.has(topic) && 
                        this.conversationHistory.filter(m => 
                          m.role === 'user' && 
                          this.extractTopics(m.content.toLowerCase()).includes(topic)
                        ).length === 1;

    if (topic === 'cost' && analysis.providesSpecifics) {
      return this.selectUnused([
        'Понятно насчёт стоимости. Мне нужно подумать, смогу ли я себе это позволить.',
        'Хорошо, что сразу сказали про цены. Это честно.',
        'С ценой ясно. А можно как-то в рассрочку оплатить?'
      ]);
    }

    if (topic === 'pain') {
      if (this.currentEmotionalState === 'scared') {
        return this.selectUnused([
          'Вы говорите, что не больно, но мне всё равно страшно...',
          'Ладно, про обезболивание понял. Но всё же волнуюсь.',
          'А что если анестезия не подействует? Такое ведь бывает?'
        ]);
      } else {
        return this.selectUnused([
          'Хорошо, что будет обезболивание. Это главное для меня.',
          'Понятно про боль. Спасибо, что объяснили подробно.',
          'Ладно, с болью разобрались. Это меня успокаивает.'
        ]);
      }
    }

    if (topic === 'treatment' && isFirstTime) {
      return this.selectUnused([
        'Хорошо, с лечением немного разобрались.',
        'Понял основные моменты про процедуру.',
        'Ясно. А сколько времени это всё займёт?'
      ]);
    }

    return null;
  }

  private generateFollowUp(analysis: AdminMessageAnalysis, emotionalState: string): string | null {
    // Если администратор предложил действие и удовлетворённость высокая
    if (analysis.offersAction && this.currentSatisfaction >= 70) {
      return this.selectUnused([
        'Давайте! Когда можно записаться?',
        'Хорошо, я готов. Что дальше?',
        'Договорились. Как нам действовать?'
      ]);
    }

    // Генерация вопроса по необсуждённой теме
    const allTopics = ['treatment', 'pain', 'cost', 'time', 'safety', 'results'];
    const undiscussed = allTopics.filter(t => !this.context.discussedTopics.has(t));

    if (undiscussed.length > 0 && this.messageCount <= 10) {
      const topic = undiscussed[0];
      return this.generateTopicQuestion(topic);
    }

    // Если нужна дополнительная информация
    if (this.context.patientNeeds.needsMoreInfo && this.messageCount <= 8) {
      return this.selectUnused([
        'А можете рассказать подробнее про этапы?',
        'Что ещё мне нужно знать?',
        'Расскажите, пожалуйста, как всё будет происходить?'
      ]);
    }

    // Если остались сомнения
    if (this.currentSatisfaction < 60 && this.messageCount >= 5) {
      return this.selectUnused([
        'У меня всё ещё есть сомнения...',
        'Не знаю, не уверен пока.',
        'Мне нужно ещё подумать над этим.'
      ]);
    }

    return null;
  }

  private generateTopicQuestion(topic: string): string {
    const questions: Record<string, string[]> = {
      treatment: [
        'А как именно будет проходить лечение?',
        'Расскажите подробнее про процедуру?',
        'Что конкретно вы будете делать?'
      ],
      pain: [
        'Скажите честно, это больно?',
        'А как насчёт боли? Это терпимо?',
        'Мне страшно, что будет больно...'
      ],
      cost: [
        'А сколько это будет стоить?',
        'Можете сказать примерную цену?',
        'Давайте поговорим о стоимости.'
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
      ]
    };

    return this.selectUnused(questions[topic] || ['Расскажите подробнее?']);
  }

  private generateClosingStatement(satisfaction: number): string {
    if (satisfaction >= 80) {
      return this.selectUnused([
        'Отлично! Я готов записаться. Когда мне можно прийти?',
        'Вы меня убедили! Давайте определимся с датой.',
        'Супер! Записывайте меня на приём.',
        'Прекрасно! Я принял решение. Хочу записаться.'
      ]);
    } else {
      return this.selectUnused([
        'Спасибо за информацию. Я подумаю и перезвоню.',
        'Хорошо, мне нужно время всё обдумать.',
        'Благодарю. Я посоветуюсь с близкими и вернусь к этому вопросу.'
      ]);
    }
  }

  private generateFallback(emotionalState: string): string {
    const fallbacks: Record<string, string[]> = {
      scared: ['Мне страшно...', 'Я боюсь...', 'А вдруг что-то не так?'],
      nervous: ['Ну, не знаю...', 'Хм...', 'Волнуюсь, честно говоря.'],
      angry: ['Это не то, что я ожидал.', 'Слушайте, я не понимаю.', 'Что-то не так.'],
      confused: ['Я не понимаю...', 'Запутался...', 'Объясните ещё раз?'],
      calm: ['Понятно.', 'Хорошо.', 'Слушаю вас.'],
      happy: ['Отлично!', 'Замечательно!', 'Хорошо!'],
      sad: ['Грустно это слышать...', 'Жаль...', 'Печально.'],
      excited: ['Ух ты!', 'Интересно!', 'Круто!']
    };

    return this.selectUnused(fallbacks[emotionalState] || ['Понятно.', 'Хорошо.', 'Слушаю.']);
  }

  private selectUnused(options: string[]): string {
    const unused = options.filter(opt => !this.usedPhrases.has(opt));
    
    if (unused.length === 0) {
      this.usedPhrases.clear();
      return options[Math.floor(Math.random() * options.length)];
    }

    const selected = unused[Math.floor(Math.random() * unused.length)];
    this.usedPhrases.add(selected);
    return selected;
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
      goalProgressScore = this.context.discussedTopics.size * 20;
      goalProgressScore = Math.min(100, goalProgressScore);
    }

    alignmentScore += Math.min(50, this.context.discussedTopics.size * 15);

    const recommendations: string[] = [];
    const goodPoints: string[] = [];
    const missedOpportunities: string[] = [];

    if (this.context.adminApproach.showsEmpathy) {
      goodPoints.push('Проявлена эмпатия к пациенту');
    } else {
      recommendations.push('Попробуйте проявить больше эмпатии и понимания');
    }

    if (this.context.adminApproach.asksQuestions) {
      goodPoints.push('Заданы уточняющие вопросы');
    }

    if (this.context.discussedTopics.size >= 3) {
      goodPoints.push('Обсуждены основные темы разговора');
    } else {
      missedOpportunities.push('Не все важные темы были затронуты');
      recommendations.push('Обсудите стоимость, сроки и процесс лечения');
    }

    if (this.currentSatisfaction >= 70) {
      goodPoints.push('Успешно установлен контакт с пациентом');
    } else {
      recommendations.push('Уделите больше внимания опасениям пациента');
    }

    if (goalProgressScore < 50) {
      missedOpportunities.push(`Цель разговора: "${context.goal}" - не достигнута`);
      recommendations.push('Направьте разговор к достижению поставленной цели');
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