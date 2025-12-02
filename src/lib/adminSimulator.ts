export interface SimulatorScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  patientName: string;
  situation: string;
  initialMessage: string;
  correctBehaviors: string[];
  wrongBehaviors: string[];
  targetParameters: {
    empathy: number;
    professionalism: number;
    efficiency: number;
    salesSkill: number;
    conflictResolution: number;
  };
}

export interface DialogueChoice {
  id: number;
  text: string;
  type: 'good' | 'neutral' | 'bad';
  impact: {
    empathy?: number;
    professionalism?: number;
    efficiency?: number;
    salesSkill?: number;
    conflictResolution?: number;
  };
  patientResponse: string;
  explanation?: string;
}

export interface SimulatorState {
  scenario: SimulatorScenario;
  currentStep: number;
  parameters: {
    empathy: number;
    professionalism: number;
    efficiency: number;
    salesSkill: number;
    conflictResolution: number;
  };
  dialogue: Array<{
    speaker: 'admin' | 'patient';
    text: string;
    timestamp: number;
  }>;
  isCompleted: boolean;
  finalScore?: number;
}

export const SIMULATOR_SCENARIOS: SimulatorScenario[] = [
  {
    id: 'first_call',
    title: 'Первый звонок пациента',
    description: 'Пациент звонит впервые, хочет записаться на консультацию',
    difficulty: 'easy',
    patientName: 'Мария Ивановна',
    situation: 'Женщина 45 лет звонит впервые, беспокоит зуб, но не знает к какому врачу нужно',
    initialMessage: 'Добрый день! У меня зуб болит... Подскажите, что мне делать?',
    correctBehaviors: [
      'Поздороваться и представиться',
      'Задать уточняющие вопросы о боли',
      'Проявить эмпатию',
      'Предложить запись к нужному специалисту',
      'Уточнить удобное время'
    ],
    wrongBehaviors: [
      'Сразу перевести на другого сотрудника',
      'Начать говорить о ценах без выяснения проблемы',
      'Быть безразличным к проблеме',
      'Давить на срочность без понимания ситуации'
    ],
    targetParameters: {
      empathy: 80,
      professionalism: 70,
      efficiency: 60,
      salesSkill: 40,
      conflictResolution: 50
    }
  },
  {
    id: 'price_objection',
    title: 'Возражение по цене',
    description: 'Пациент считает лечение слишком дорогим',
    difficulty: 'medium',
    patientName: 'Андрей Петрович',
    situation: 'Мужчина 38 лет, нужна имплантация, но цена его не устраивает',
    initialMessage: 'Вы серьёзно? 80 тысяч за один зуб?! Это же грабёж! У конкурентов на 20 тысяч дешевле!',
    correctBehaviors: [
      'Сохранять спокойствие',
      'Выяснить бюджет пациента',
      'Объяснить из чего складывается цена',
      'Предложить варианты (рассрочка, этапы)',
      'Показать ценность услуги'
    ],
    wrongBehaviors: [
      'Обижаться или защищаться',
      'Сразу давать скидку',
      'Критиковать конкурентов',
      'Говорить "если дорого - идите к другим"'
    ],
    targetParameters: {
      empathy: 60,
      professionalism: 85,
      efficiency: 70,
      salesSkill: 90,
      conflictResolution: 80
    }
  },
  {
    id: 'angry_patient',
    title: 'Конфликтный пациент',
    description: 'Пациент недоволен долгим ожиданием',
    difficulty: 'hard',
    patientName: 'Виктор Сергеевич',
    situation: 'Мужчина 52 года ждёт приёма уже 40 минут, очень раздражён',
    initialMessage: 'Я жду уже ЧАС! Что за безобразие?! У меня дела, я не могу тут весь день торчать! Вызовите администратора!',
    correctBehaviors: [
      'Искренне извиниться',
      'Выяснить причину задержки',
      'Предложить конкретное решение',
      'Не оправдываться, а действовать',
      'Предложить компенсацию'
    ],
    wrongBehaviors: [
      'Говорить "все так ждут"',
      'Винить врача при пациенте',
      'Игнорировать эмоции',
      'Отправить жаловаться выше'
    ],
    targetParameters: {
      empathy: 85,
      professionalism: 90,
      efficiency: 80,
      salesSkill: 50,
      conflictResolution: 95
    }
  },
  {
    id: 'upsell_cleaning',
    title: 'Допродажа услуг',
    description: 'Пациент пришёл на чистку, можно предложить отбеливание',
    difficulty: 'medium',
    patientName: 'Елена Викторовна',
    situation: 'Женщина 32 года, регулярная пациентка, интересуется красивой улыбкой',
    initialMessage: 'Спасибо! Чистка прошла отлично. Зубы такие гладкие стали! Правда, цвет всё равно не идеальный...',
    correctBehaviors: [
      'Похвалить за регулярность ухода',
      'Задать вопросы о желаемом результате',
      'Рассказать про отбеливание естественно',
      'Показать фото до/после',
      'Не давить, а заинтересовать'
    ],
    wrongBehaviors: [
      'Агрессивно продавать',
      'Говорить "у вас желтые зубы"',
      'Называть только цену без объяснений',
      'Игнорировать сигнал интереса'
    ],
    targetParameters: {
      empathy: 70,
      professionalism: 80,
      efficiency: 75,
      salesSkill: 90,
      conflictResolution: 50
    }
  },
  {
    id: 'scared_child',
    title: 'Испуганный ребёнок',
    description: 'Родитель с ребёнком, который очень боится стоматолога',
    difficulty: 'medium',
    patientName: 'Ольга Андреевна (мама Саши)',
    situation: 'Мама с сыном 7 лет, мальчик плачет и отказывается заходить в кабинет',
    initialMessage: 'Саша, ну перестань! Извините, он очень боится... В прошлый раз в другой клинике был кошмар. Может, не получится сегодня?',
    correctBehaviors: [
      'Успокоить и маму, и ребёнка',
      'Предложить познакомиться с врачом',
      'Рассказать про детский подход',
      'Не торопить события',
      'Создать комфорт'
    ],
    wrongBehaviors: [
      'Говорить "все дети так себя ведут"',
      'Настаивать на срочности лечения',
      'Игнорировать страх ребёнка',
      'Перекладывать ответственность на маму'
    ],
    targetParameters: {
      empathy: 95,
      professionalism: 75,
      efficiency: 60,
      salesSkill: 40,
      conflictResolution: 85
    }
  },
  {
    id: 'vip_patient',
    title: 'VIP-пациент',
    description: 'Требовательный пациент с высокими ожиданиями',
    difficulty: 'hard',
    patientName: 'Михаил Константинович',
    situation: 'Бизнесмен 48 лет, готов платить, но ожидает исключительного сервиса',
    initialMessage: 'Мне нужно срочно попасть к лучшему ортопеду. Завтра в 10 утра. Я готов доплатить за срочность. Это возможно?',
    correctBehaviors: [
      'Уважительный тон',
      'Быстро проверить возможность',
      'Предложить варианты',
      'Подчеркнуть индивидуальный подход',
      'Зафиксировать договорённости'
    ],
    wrongBehaviors: [
      'Сразу сказать "нет"',
      'Тянуть с ответом',
      'Пообещать невозможное',
      'Быть слишком фамильярным'
    ],
    targetParameters: {
      empathy: 70,
      professionalism: 95,
      efficiency: 90,
      salesSkill: 85,
      conflictResolution: 75
    }
  },
  {
    id: 'payment_issue',
    title: 'Проблема с оплатой',
    description: 'Пациент не может оплатить лечение прямо сейчас',
    difficulty: 'medium',
    patientName: 'Наталья Владимировна',
    situation: 'Женщина 41 год, закончила лечение, но забыла карту дома',
    initialMessage: 'Ой, я карту дома забыла! А наличных нет... Что делать? Я могу завтра привезти деньги?',
    correctBehaviors: [
      'Сохранять спокойствие',
      'Предложить альтернативы (СБП, перевод)',
      'Уточнить когда сможет оплатить',
      'Оформить документы правильно',
      'Сохранить хорошее отношение'
    ],
    wrongBehaviors: [
      'Обвинять в безответственности',
      'Паниковать',
      'Требовать оставить документы',
      'Создавать неловкую ситуацию'
    ],
    targetParameters: {
      empathy: 75,
      professionalism: 85,
      efficiency: 80,
      salesSkill: 60,
      conflictResolution: 70
    }
  }
];

export class AdminSimulator {
  private state: SimulatorState;
  private dialogueTree: Map<number, DialogueChoice[]> = new Map();

  constructor(scenarioId: string) {
    const scenario = SIMULATOR_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }

    this.state = {
      scenario,
      currentStep: 0,
      parameters: {
        empathy: 50,
        professionalism: 50,
        efficiency: 50,
        salesSkill: 50,
        conflictResolution: 50
      },
      dialogue: [{
        speaker: 'patient',
        text: scenario.initialMessage,
        timestamp: Date.now()
      }],
      isCompleted: false
    };

    this.buildDialogueTree(scenarioId);
  }

  private buildDialogueTree(scenarioId: string): void {
    const trees: Record<string, Map<number, DialogueChoice[]>> = {
      first_call: this.buildFirstCallTree(),
      price_objection: this.buildPriceObjectionTree(),
      angry_patient: this.buildAngryPatientTree(),
      upsell_cleaning: this.buildUpsellTree(),
      scared_child: this.buildScaredChildTree(),
      vip_patient: this.buildVipPatientTree(),
      payment_issue: this.buildPaymentIssueTree()
    };

    this.dialogueTree = trees[scenarioId] || new Map();
  }

  private buildFirstCallTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    // Шаг 0: Начало разговора
    tree.set(0, [
      {
        id: 1,
        text: 'Добрый день! Меня зовут Анна, я администратор клиники "Жемчужина". Расскажите, пожалуйста, что вас беспокоит?',
        type: 'good',
        impact: { empathy: +8, professionalism: +8 },
        patientResponse: 'Ой, спасибо! У меня вот верхний зуб справа болит, особенно когда холодное пью. Уже дня три так...',
        explanation: 'Отлично! Вы представились, проявили участие и задали открытый вопрос.'
      },
      {
        id: 2,
        text: 'Слушаю вас. К какому врачу хотите записаться?',
        type: 'neutral',
        impact: { professionalism: +3, efficiency: +3 },
        patientResponse: 'Ну... я не знаю, к какому... У меня просто зуб болит.',
        explanation: 'Профессионально, но суховато. Лучше сначала выяснить проблему.'
      },
      {
        id: 3,
        text: 'Да-да, слушаю. Что у вас там?',
        type: 'bad',
        impact: { empathy: -8, professionalism: -5 },
        patientResponse: 'Эм... У меня зуб болит... Вы меня вообще слушаете?',
        explanation: 'Слишком небрежно. Пациент почувствовал, что вы не заинтересованы.'
      }
    ]);

    // Шаг 1: Уточнение симптомов
    tree.set(1, [
      {
        id: 4,
        text: 'Понимаю, это неприятно. Скажите, боль постоянная или только при контакте с холодным? Может, что-то ещё беспокоит?',
        type: 'good',
        impact: { empathy: +7, professionalism: +6 },
        patientResponse: 'В основном от холодного. И ещё иногда при жевании немного ноет. Пломба там старая стоит...',
        explanation: 'Отлично! Вы задаёте уточняющие вопросы — это помогает врачу.'
      },
      {
        id: 5,
        text: 'Хорошо, запишу вас к врачу. Когда удобно?',
        type: 'neutral',
        impact: { efficiency: +4 },
        patientResponse: 'Подождите, а к какому именно? И что мне делать до приёма, терпеть?',
        explanation: 'Слишком быстрый переход к записи без уточнения деталей.'
      }
    ]);

    // Шаг 2: Продолжение после хороших вопросов
    tree.set(2, [
      {
        id: 100,
        text: 'Ага, а какой врач мне нужен? Я в этом не разбираюсь совсем...',
        type: 'neutral',
        impact: {},
        patientResponse: 'Ага, а какой врач мне нужен? Я в этом не разбираюсь совсем...',
        explanation: ''
      }
    ]);

    // Шаг 4: Выбор врача и рекомендации
    tree.set(4, [
      {
        id: 6,
        text: 'Судя по симптомам, вам нужен стоматолог-терапевт. Возможно, под пломбой развился кариес. До приёма избегайте холодного и жевания на эту сторону. Когда вам удобно прийти?',
        type: 'good',
        impact: { empathy: +7, professionalism: +8, efficiency: +6 },
        patientResponse: 'О, спасибо за совет! А можно сегодня или завтра? А то я уже измучилась...',
        explanation: 'Превосходно! Вы объяснили, дали рекомендации и перешли к записи.'
      },
      {
        id: 7,
        text: 'Вам к терапевту. У нас ближайшее окно через 5 дней.',
        type: 'bad',
        impact: { empathy: -7, efficiency: -6 },
        patientResponse: 'Через 5 дней?! Но мне же больно! Неужели раньше нельзя?!',
        explanation: 'Вы не учли срочность. При боли нужно искать ближайшее время.'
      }
    ]);

    // Шаг 5: Плохой вариант - пациент расстроен
    tree.set(5, [
      {
        id: 101,
        text: 'А к терапевту когда можно попасть?',
        type: 'neutral',
        impact: {},
        patientResponse: 'А к терапевту когда можно попасть?',
        explanation: ''
      }
    ]);

    tree.set(101, [
      {
        id: 102,
        text: 'Понимаю вашу ситуацию. Сейчас проверю все варианты...',
        type: 'good',
        impact: { empathy: +5, efficiency: +5 },
        patientResponse: 'Ну пожалуйста, а то я правда не могу так ходить...',
        explanation: 'Хорошо, что вы показали понимание.'
      }
    ]);

    tree.set(102, [
      {
        id: 8,
        text: 'Есть окно сегодня в 18:00 или завтра утром в 9:30. Оба варианта у опытного терапевта. Что удобнее?',
        type: 'good',
        impact: { efficiency: +8, professionalism: +7 },
        patientResponse: 'Завтра в 9:30 идеально! А сколько это будет стоить примерно?',
        explanation: 'Отлично! Конкретные варианты и выбор для пациента.'
      }
    ]);

    // Шаг 6: Обсуждение цены
    tree.set(6, [
      {
        id: 8,
        text: 'Сейчас проверю расписание... Есть окно сегодня в 18:00 или завтра в 9:30. Что вам удобнее?',
        type: 'good',
        impact: { efficiency: +7, professionalism: +6 },
        patientResponse: 'Завтра в 9:30 отлично! А сколько это будет стоить примерно?',
        explanation: 'Отлично! Вы предложили конкретные варианты и дали выбор.'
      },
      {
        id: 9,
        text: 'Приходите завтра утром, постараемся принять',
        type: 'neutral',
        impact: { empathy: +3, efficiency: -4 },
        patientResponse: 'А во сколько конкретно? У меня работа, мне нужно точное время...',
        explanation: 'Слишком расплывчато. Пациенту нужна конкретика.'
      }
    ]);

    // Шаг 7: Плохой путь возвращается
    tree.set(7, [
      {
        id: 103,
        text: 'Сейчас ещё раз посмотрю, может освободится окно...',
        type: 'good',
        impact: { empathy: +6, efficiency: +5 },
        patientResponse: 'Буду очень благодарна!',
        explanation: 'Хорошо, что продолжаете искать варианты.'
      }
    ]);

    tree.set(103, [
      {
        id: 8,
        text: 'Отлично! Нашла окно на завтра в 9:30. Записать вас?',
        type: 'good',
        impact: { efficiency: +6, professionalism: +5 },
        patientResponse: 'Да, конечно! А сколько это будет стоить?',
        explanation: 'Вы нашли решение, молодец!'
      }
    ]);

    // Шаг 8: Объяснение цены
    tree.set(8, [
      {
        id: 10,
        text: 'Первичный осмотр и консультация — 1500 рублей. Врач осмотрит, сделает снимок если нужно, и озвучит план лечения с точными ценами. Вас устроит?',
        type: 'good',
        impact: { professionalism: +7, salesSkill: +7 },
        patientResponse: 'Да, хорошо, понятно. А снимок входит в эту цену?',
        explanation: 'Отлично! Вы честно назвали цену и объяснили, что входит.'
      },
      {
        id: 11,
        text: 'Зависит от лечения, может от 3 до 25 тысяч',
        type: 'bad',
        impact: { professionalism: -8, salesSkill: -10 },
        patientResponse: 'ЧТО?! 25 тысяч?! Я думала это тысячи 3-4 максимум... Мне нужно подумать...',
        explanation: 'Вы напугали пациента диапазоном без объяснений.'
      }
    ]);

    // Шаг 9: Нейтральный путь корректируется
    tree.set(9, [
      {
        id: 104,
        text: 'Мне нужно в 9:30, это возможно?',
        type: 'neutral',
        impact: {},
        patientResponse: 'Мне нужно в 9:30, это возможно?',
        explanation: ''
      }
    ]);

    tree.set(104, [
      {
        id: 8,
        text: 'Да, на 9:30 завтра есть место. Записываю вас. Теперь про стоимость...',
        type: 'good',
        impact: { efficiency: +6, professionalism: +5 },
        patientResponse: 'Да, сколько это будет стоить?',
        explanation: 'Хорошо, уточнили время и переходите к цене.'
      }
    ]);

    // Шаг 10: Уточнение про снимок
    tree.set(10, [
      {
        id: 12,
        text: 'Снимок оплачивается отдельно — 500 рублей, если врач решит, что он необходим. Но возможно он и не понадобится. Записать вас на завтра в 9:30?',
        type: 'good',
        impact: { professionalism: +7, efficiency: +6 },
        patientResponse: 'Да, записывайте! Что с собой нужно взять?',
        explanation: 'Честно и понятно объяснили. Пациент доволен.'
      },
      {
        id: 13,
        text: 'Да, всё включено',
        type: 'bad',
        impact: { professionalism: -6, efficiency: -5 },
        patientResponse: 'Точно всё включено? А то потом доплачивать не хочу...',
        explanation: 'Не стоит обещать то, в чём не уверены. Это создаст проблемы.'
      }
    ]);

    // Шаг 11: Плохой путь - испуганный пациент
    tree.set(11, [
      {
        id: 105,
        text: 'Подождите! Я имела в виду максимум, если понадобится сложное лечение. А консультация всего 1500. Врач всё объяснит и вы ничего не будете делать без согласия!',
        type: 'good',
        impact: { empathy: +8, salesSkill: +8, conflictResolution: +7 },
        patientResponse: 'Ааа, ну это другое дело! Я просто испугалась... Ладно, записывайте на завтра',
        explanation: 'Отлично спасли ситуацию! Быстро объяснили и успокоили.'
      },
      {
        id: 106,
        text: 'Ну если дорого, можете в другие клиники посмотреть',
        type: 'bad',
        impact: { empathy: -10, salesSkill: -12, conflictResolution: -8 },
        patientResponse: 'Вот так? Ну ладно, посмотрю в других местах. Досвидания.',
        explanation: 'Катастрофа! Вы потеряли пациента.'
      }
    ]);

    // Шаг 12: Финальное оформление записи
    tree.set(12, [
      {
        id: 14,
        text: 'Паспорт и полис ОМС, если есть. Ещё запишите адрес: ул. Ленина, 15, 3 этаж. Приходите за 5 минут, заполните анкету. Вам на номер придёт SMS-напоминание. Что-то ещё уточнить?',
        type: 'good',
        impact: { professionalism: +8, efficiency: +7 },
        patientResponse: 'Нет, всё понятно! А парковка там есть?',
        explanation: 'Превосходно! Вы дали всю необходимую информацию чётко и структурировано.'
      },
      {
        id: 15,
        text: 'Паспорт возьмите. Адрес вышлю в SMS',
        type: 'neutral',
        impact: { efficiency: +3 },
        patientResponse: 'А адрес какой? И во сколько точно прийти?',
        explanation: 'Слишком кратко. Пациенту нужна полная информация сразу.'
      }
    ]);

    // Шаг 13: Путь после неудачного ответа про снимок
    tree.set(13, [
      {
        id: 107,
        text: 'Простите, уточню у врача про снимок точно. Сейчас позвоню... Да, снимок отдельно 500р, если понадобится.',
        type: 'good',
        impact: { professionalism: +6, empathy: +5 },
        patientResponse: 'Хорошо, спасибо что уточнили. Записывайте тогда.',
        explanation: 'Хорошо, что исправили ситуацию и дали точную информацию.'
      }
    ]);

    tree.set(107, [
      {
        id: 14,
        text: 'Отлично! Завтра в 9:30. Что с собой взять?',
        type: 'neutral',
        impact: {},
        patientResponse: 'Паспорт, наверное? А адрес какой?',
        explanation: ''
      }
    ]);

    // Шаг 14: Вопрос про парковку
    tree.set(14, [
      {
        id: 16,
        text: 'Да, есть своя парковка во дворе, бесплатная для пациентов. Въезд с улицы Гагарина. Жду вас завтра в 9:30! Выздоравливайте!',
        type: 'good',
        impact: { empathy: +7, professionalism: +8 },
        patientResponse: 'Супер, спасибо большое! До завтра!',
        explanation: 'Идеально! Ответили на все вопросы, создали приятное впечатление.'
      },
      {
        id: 17,
        text: 'Да, где-то рядом есть',
        type: 'neutral',
        impact: { professionalism: -3 },
        patientResponse: 'А точнее? Просто я на машине приеду...',
        explanation: 'Расплывчатый ответ. Нужно давать конкретную информацию.'
      }
    ]);

    // Шаг 15: Доп вопросы после краткого ответа
    tree.set(15, [
      {
        id: 108,
        text: 'Адрес: ул. Ленина 15, третий этаж. Приходите к 9:25, чтобы заполнить анкету. Хорошо?',
        type: 'good',
        impact: { professionalism: +6, efficiency: +5 },
        patientResponse: 'Да, понятно. А парковка есть?',
        explanation: 'Дали нужные детали.'
      }
    ]);

    tree.set(108, [
      {
        id: 16,
        text: 'Есть парковка во дворе, бесплатная. Въезд с ул. Гагарина. До встречи!',
        type: 'good',
        impact: { professionalism: +6 },
        patientResponse: 'Отлично, спасибо! До завтра!',
        explanation: 'Хорошо завершили разговор.'
      }
    ]);

    // Шаг 17: Уточнение про парковку
    tree.set(17, [
      {
        id: 109,
        text: 'Есть своя парковка во дворе дома, въезд с улицы Гагарина. Для пациентов бесплатно!',
        type: 'good',
        impact: { professionalism: +5 },
        patientResponse: 'Понятно, спасибо! Тогда до завтра!',
        explanation: 'Дали точную информацию.'
      }
    ]);

    // Шаг 105: Спасли после отпугивания ценой
    tree.set(105, [
      {
        id: 110,
        text: 'Хорошо, но что мне с собой взять?',
        type: 'neutral',
        impact: {},
        patientResponse: 'Хорошо, но что мне с собой взять?',
        explanation: ''
      }
    ]);

    tree.set(110, [
      {
        id: 14,
        text: 'Паспорт и полис ОМС. Адрес: ул. Ленина 15, третий этаж. Приходите к 9:25. Ещё вопросы?',
        type: 'good',
        impact: { professionalism: +6 },
        patientResponse: 'А парковка есть?',
        explanation: 'Дали основную информацию.'
      }
    ]);

    return tree;
  }

  private buildPriceObjectionTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    // Шаг 0: Реакция на возмущение
    tree.set(0, [
      {
        id: 1,
        text: 'Андрей Петрович, я понимаю ваше удивление. Давайте я подробно расскажу, из чего складывается эта сумма?',
        type: 'good',
        impact: { empathy: +7, conflictResolution: +8, salesSkill: +6 },
        patientResponse: 'Ну давайте, интересно послушать, за что такие деньги...',
        explanation: 'Отлично! Вы сохранили спокойствие и предложили объяснить.'
      },
      {
        id: 2,
        text: 'Это включает имплант премиум-класса, работу хирурга, анестезию...',
        type: 'neutral',
        impact: { professionalism: +3 },
        patientResponse: 'Да-да, я всё это понимаю, но всё равно очень дорого!',
        explanation: 'Вы начали объяснять, но не учли эмоции пациента.'
      },
      {
        id: 3,
        text: 'Если вам дорого, то вы можете поискать клиники подешевле',
        type: 'bad',
        impact: { empathy: -12, salesSkill: -15, conflictResolution: -12 },
        patientResponse: 'Вот так вот? Понятно. Ну ладно, пойду в ту клинику тогда!',
        explanation: 'Катастрофа! Вы потеряли пациента.'
      }
    ]);

    // Шаг 1: Детальное объяснение цены
    tree.set(1, [
      {
        id: 4,
        text: 'В стоимость входит швейцарский имплант Nobel Biocare с пожизненной гарантией производителя, работа хирурга-имплантолога высшей категории с опытом 15 лет, все расходные материалы, 3D-планирование операции на современном томографе и год бесплатного наблюдения.',
        type: 'good',
        impact: { professionalism: +8, salesSkill: +10 },
        patientResponse: 'М-да, звучит серьёзно... А у конкурентов что, импланты хуже?',
        explanation: 'Отлично! Вы показали ценность через конкретику.'
      },
      {
        id: 5,
        text: 'Ну смотрите: имплант хороший, работа, материалы... В общем, всё включено',
        type: 'bad',
        impact: { professionalism: -7, salesSkill: -10 },
        patientResponse: 'Это я и сам понимаю. Вопрос — почему на 20 тысяч дороже, чем там?!',
        explanation: 'Слишком расплывчато. Не убедили.'
      }
    ]);

    // Шаг 2: Нейтральный путь возвращается
    tree.set(2, [
      {
        id: 100,
        text: 'Андрей Петрович, я понимаю вашу обеспокоенность. Могу я уточнить, с чем вы сравниваете?',
        type: 'good',
        impact: { empathy: +6, conflictResolution: +7 },
        patientResponse: 'Я же сказал — там же самое за 60 тысяч! В клинике на Садовой.',
        explanation: 'Правильно — сначала выясните, с чем сравнивают.'
      }
    ]);

    tree.set(100, [
      {
        id: 101,
        text: 'Понятно. Скажите, там вам какую систему имплантов предлагают?',
        type: 'good',
        impact: { professionalism: +6, salesSkill: +7 },
        patientResponse: 'Не помню точно... Что-то корейское, кажется. А это важно?',
        explanation: 'Отлично! Вы вышли на ключевое различие.'
      }
    ]);

    tree.set(101, [
      {
        id: 4,
        text: 'Да, очень важно! Корейские импланты — это бюджетный сегмент с гарантией 10 лет. Мы работаем с Nobel Biocare — премиум швейцарский бренд №1 в мире с пожизненной гарантией. Плюс наше оборудование и квалификация врачей.',
        type: 'good',
        impact: { professionalism: +8, salesSkill: +10 },
        patientResponse: 'Хм, то есть разница действительно есть... Но всё равно дорого для меня сейчас.',
        explanation: 'Превосходно! Вы обосновали разницу в цене.'
      }
    ]);

    // Шаг 4: Обсуждение после объяснения про импланты
    tree.set(4, [
      {
        id: 6,
        text: 'Понимаю. Скажите, какая сумма для вас была бы комфортной в месяц? Мы можем предложить рассрочку без процентов.',
        type: 'good',
        impact: { empathy: +8, salesSkill: +12 },
        patientResponse: 'Ну тысяч 5-6 в месяц я бы потянул. А на сколько рассрочка?',
        explanation: 'Отлично! Вы выяснили бюджет и предложили решение.'
      },
      {
        id: 7,
        text: 'Есть рассрочка, но условия надо уточнять',
        type: 'neutral',
        impact: { efficiency: -6 },
        patientResponse: 'То есть вы сами не знаете? Серьёзно?',
        explanation: 'Плохо. Вы должны знать условия рассрочки наизусть.'
      },
      {
        id: 8,
        text: 'Ну значит, вам лучше подойдёт бюджетный вариант в той клинике',
        type: 'bad',
        impact: { salesSkill: -15, empathy: -10 },
        patientResponse: 'Вот именно что подойдёт! Зачем я сюда вообще приехал...',
        explanation: 'Ужасно! Вы сами отправили пациента к конкурентам.'
      }
    ]);

    // Шаг 5: Плохой путь - пациент агрессивен
    tree.set(5, [
      {
        id: 102,
        text: 'Андрей Петрович, давайте я покажу вам прайс от той клиники и наш. Мы сравним что входит в стоимость?',
        type: 'good',
        impact: { professionalism: +7, conflictResolution: +8 },
        patientResponse: 'Ну давайте, раз уж я тут...',
        explanation: 'Хорошая попытка вернуть контроль над разговором.'
      }
    ]);

    tree.set(102, [
      {
        id: 103,
        text: 'Смотрите: у них в 60 тысяч НЕ входит 3D-планирование (8 тыс), формирователь десны (5 тыс), временная коронка (7 тыс), контрольные снимки (3 тыс). Итого там выйдет 83 тысячи минимум. У нас всё включено в 80.',
        type: 'good',
        impact: { salesSkill: +12, professionalism: +10 },
        patientResponse: 'А, так вот в чём подвох! Это да, меняет дело... Но мне сейчас всю сумму тяжело.',
        explanation: 'Блестяще! Вы раскрыли манипуляцию конкурентов.'
      }
    ]);

    tree.set(103, [
      {
        id: 6,
        text: 'Понимаю вас. Какая сумма в месяц была бы комфортной? У нас есть рассрочка до 18 месяцев.',
        type: 'good',
        impact: { empathy: +7, salesSkill: +9 },
        patientResponse: 'Тысяч 5-6 в месяц я потянул бы. Это реально?',
        explanation: 'Хорошо! Вы перешли к обсуждению вариантов.'
      }
    ]);

    // Шаг 6: Обсуждение рассрочки
    tree.set(6, [
      {
        id: 9,
        text: 'Да! На 18 месяцев это будет 4400 рублей в месяц без процентов, без первоначального взноса. Оформляется за 15 минут по паспорту. Устроит такой вариант?',
        type: 'good',
        impact: { salesSkill: +12, efficiency: +8, professionalism: +8 },
        patientResponse: 'О, 4400 — это вообще отлично! А какие документы нужны кроме паспорта?',
        explanation: 'Превосходно! Вы дали конкретику и сняли финансовое возражение.'
      },
      {
        id: 10,
        text: 'Рассрочка есть. От 12 до 24 месяцев, детали обсудите с менеджером',
        type: 'neutral',
        impact: { efficiency: -5 },
        patientResponse: 'А вы сами мне не можете сказать? Сколько это в месяц выйдет?',
        explanation: 'Вы теряете момент. Должны сами знать расчёты.'
      }
    ]);

    // Шаг 7: Плохой путь - не знает рассрочку
    tree.set(7, [
      {
        id: 104,
        text: 'Извините, сейчас уточню условия... На 12 месяцев — 6700р в месяц, на 18 — 4400р',
        type: 'good',
        impact: { professionalism: +5, salesSkill: +6 },
        patientResponse: '4400 мне подходит. Какие документы нужны?',
        explanation: 'Лучше поздно, чем никогда. Но нужно знать это сразу.'
      }
    ]);

    tree.set(104, [
      {
        id: 9,
        text: 'Только паспорт! Оформление за 15 минут, никаких справок. Решение одобрения сразу.',
        type: 'good',
        impact: { efficiency: +6, salesSkill: +7 },
        patientResponse: 'Удобно. А когда можно прийти на консультацию?',
        explanation: 'Хорошо! Движетесь к закрытию сделки.'
      }
    ]);

    // Шаг 9: Детали по рассрочке
    tree.set(9, [
      {
        id: 11,
        text: 'Только паспорт. Никаких справок о доходах, поручителей не нужно. Решение об одобрении получите сразу, за 5 минут. Хотите, я запишу вас на консультацию к хирургу, где он осмотрит и мы сразу оформим рассрочку?',
        type: 'good',
        impact: { salesSkill: +10, efficiency: +8, professionalism: +7 },
        patientResponse: 'Да, давайте! Когда можно прийти? Желательно ближе к вечеру.',
        explanation: 'Отлично! Вы закрываете продажу и ведёте к записи.'
      },
      {
        id: 12,
        text: 'Паспорт и всё. Приходите на консультацию',
        type: 'neutral',
        impact: { efficiency: +4 },
        patientResponse: 'Хорошо. А когда время есть?',
        explanation: 'Работает, но без энтузиазма.'
      }
    ]);

    // Шаг 10: Нейтральный путь - пациент спрашивает сам
    tree.set(10, [
      {
        id: 105,
        text: 'На 18 месяцев это будет 4440 рублей. Подойдёт?',
        type: 'good',
        impact: { salesSkill: +7 },
        patientResponse: 'Да, это нормально. Что дальше?',
        explanation: 'Дали расчёт, продвигаетесь дальше.'
      }
    ]);

    tree.set(105, [
      {
        id: 9,
        text: 'Нужен только паспорт, оформление за 15 минут. Записать вас на консультацию?',
        type: 'good',
        impact: { efficiency: +6, salesSkill: +7 },
        patientResponse: 'Да, давайте. Желательно вечером',
        explanation: 'Хорошо, ведёте к записи.'
      }
    ]);

    // Шаг 11: Запись на консультацию
    tree.set(11, [
      {
        id: 13,
        text: 'Отлично! Есть окно завтра в 18:30 или послезавтра в 19:00 у Игоря Петровича — нашего ведущего имплантолога. Он посмотрит, сделает план, и мы сразу оформим рассрочку, если вас всё устроит. Что выбираете?',
        type: 'good',
        impact: { efficiency: +8, professionalism: +7 },
        patientResponse: 'Завтра в 18:30 отлично. Записывайте!',
        explanation: 'Идеально! Даёте варианты, подчёркиваете экспертность врача.'
      },
      {
        id: 14,
        text: 'Завтра в 18:00 есть. Подойдёт?',
        type: 'neutral',
        impact: { efficiency: +4 },
        patientResponse: 'Да, подойдёт',
        explanation: 'Работает, но можно было эффектнее.'
      }
    ]);

    // Шаг 12: Альтернативный путь записи
    tree.set(12, [
      {
        id: 106,
        text: 'Завтра в 18:30 или послезавтра в 19:00 есть окна. Что удобнее?',
        type: 'good',
        impact: { efficiency: +6 },
        patientResponse: 'Завтра в 18:30',
        explanation: 'Даёте выбор, хорошо.'
      }
    ]);

    tree.set(106, [
      {
        id: 13,
        text: 'Записал вас на завтра 18:30 к Игорю Петровичу. Он лучший имплантолог клиники.',
        type: 'good',
        impact: { professionalism: +5 },
        patientResponse: 'Хорошо, что с собой взять?',
        explanation: 'Подчеркнули экспертность.'
      }
    ]);

    // Шаг 13: Финальные детали
    tree.set(13, [
      {
        id: 15,
        text: 'Возьмите паспорт, если есть — предыдущие снимки зубов. Адрес: ул. Ленина 15, кабинет 305. Приходите за 10 минут, заполните анкету. Консультация бесплатная. Отправлю вам SMS с напоминанием. Вопросы есть?',
        type: 'good',
        impact: { professionalism: +8, efficiency: +7 },
        patientResponse: 'Всё понятно. А парковка там есть?',
        explanation: 'Идеально! Вся нужная информация структурировано.'
      },
      {
        id: 16,
        text: 'Паспорт. Адрес вышлю в SMS',
        type: 'neutral',
        impact: { efficiency: +3 },
        patientResponse: 'Хорошо. А снимки брать?',
        explanation: 'Слишком кратко.'
      }
    ]);

    // Шаг 14: Запись без выбора времени
    tree.set(14, [
      {
        id: 107,
        text: 'Записал! Что с собой взять?',
        type: 'neutral',
        impact: {},
        patientResponse: 'Паспорт, наверное? Ещё что-то?',
        explanation: ''
      }
    ]);

    tree.set(107, [
      {
        id: 15,
        text: 'Паспорт обязательно. Если есть старые снимки зубов — тоже. Адрес: ул. Ленина 15, каб. 305.',
        type: 'good',
        impact: { professionalism: +5 },
        patientResponse: 'Понятно. Парковка есть?',
        explanation: 'Дали информацию.'
      }
    ]);

    // Шаг 15: Вопрос про парковку
    tree.set(15, [
      {
        id: 17,
        text: 'Да, своя парковка во дворе, бесплатная для пациентов. Въезд с улицы Гагарина, шлагбаум автоматический. До встречи завтра!',
        type: 'good',
        impact: { professionalism: +7 },
        patientResponse: 'Супер! Спасибо, что всё объяснили. До завтра!',
        explanation: 'Отлично завершили! Пациент доволен и придёт.'
      },
      {
        id: 18,
        text: 'Где-то рядом есть парковка',
        type: 'bad',
        impact: { professionalism: -5 },
        patientResponse: 'А точнее? Я же на машине...',
        explanation: 'Расплывчато. Нужна конкретика.'
      }
    ]);

    // Шаг 16: Вопрос про снимки
    tree.set(16, [
      {
        id: 108,
        text: 'Если есть старые снимки зубов — захватите, врачу будет полезно. Если нет — сделаем на месте.',
        type: 'good',
        impact: { professionalism: +5 },
        patientResponse: 'Хорошо, поищу. А парковка есть?',
        explanation: 'Дали полезную информацию.'
      }
    ]);

    tree.set(108, [
      {
        id: 15,
        text: 'Адрес: ул. Ленина 15, каб. 305. Парковка?',
        type: 'neutral',
        impact: {},
        patientResponse: 'Да, есть парковка?',
        explanation: ''
      }
    ]);

    // Шаг 18: Уточнение про парковку
    tree.set(18, [
      {
        id: 109,
        text: 'Своя парковка во дворе, въезд с ул. Гагарина. Для пациентов бесплатно!',
        type: 'good',
        impact: { professionalism: +4 },
        patientResponse: 'Отлично, спасибо! Тогда до завтра!',
        explanation: 'Дали точную информацию.'
      }
    ]);

    return tree;
  }

  private buildAngryPatientTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    // Шаг 0: Первая реакция на крик
    tree.set(0, [
      {
        id: 1,
        text: 'Виктор Сергеевич, примите мои искренние извинения! Я прямо сейчас выясню, что произошло, и решу этот вопрос. Одну минуту!',
        type: 'good',
        impact: { empathy: +10, conflictResolution: +12, professionalism: +8 },
        patientResponse: 'Ну наконец-то хоть кто-то реагирует! Узнайте, что за безобразие там творится!',
        explanation: 'Отлично! Вы взяли ответственность и показали готовность действовать.'
      },
      {
        id: 2,
        text: 'Извините, врач с предыдущим пациентом задерживается. Такое бывает.',
        type: 'bad',
        impact: { empathy: -10, conflictResolution: -12 },
        patientResponse: 'ТАКОЕ БЫВАЕТ?! Вы серьёзно?! Моё время тоже чего-то стоит!',
        explanation: 'Это звучит как оправдание, а не решение проблемы.'
      },
      {
        id: 3,
        text: 'Не кричите, пожалуйста. Все пациенты ждут.',
        type: 'bad',
        impact: { empathy: -15, conflictResolution: -18, professionalism: -10 },
        patientResponse: 'Как вы со мной разговариваете?! Позовите руководителя, НЕМЕДЛЕННО!',
        explanation: 'Катастрофа! Вы обострили конфликт.'
      }
    ]);

    // Шаг 1: После хорошего начала - выяснение причины
    tree.set(1, [
      {
        id: 4,
        text: '*через минуту* Виктор Сергеевич, я выяснила — у врача возникла сложная ситуация с предыдущим пациентом. Процедура затянулась на 25 минут. Он сможет принять вас через 15 минут.',
        type: 'good',
        impact: { professionalism: +8, empathy: +7 },
        patientResponse: 'Через 15 минут?! То есть я ещё почти час тут просижу?! Это просто неуважение!',
        explanation: 'Вы дали конкретную информацию, но пациент всё ещё зол.'
      },
      {
        id: 5,
        text: '*через минуту* Сейчас освободится, ещё чуть-чуть подождите',
        type: 'bad',
        impact: { efficiency: -8, conflictResolution: -10 },
        patientResponse: 'Вы мне уже 40 минут говорите "чуть-чуть"! Конкретное время дайте!',
        explanation: 'Размыто. Пациенту нужна определённость.'
      }
    ]);

    // Шаг 2: Плохой старт - оправдания
    tree.set(2, [
      {
        id: 100,
        text: 'Виктор Сергеевич, я вас понимаю! Давайте я сейчас узнаю точно, сколько ещё ждать.',
        type: 'good',
        impact: { empathy: +8, conflictResolution: +9 },
        patientResponse: 'Вот это правильно! Наконец-то!',
        explanation: 'Хорошая попытка исправить ситуацию.'
      },
      {
        id: 101,
        text: 'Но вы же понимаете, врач не может прервать лечение...',
        type: 'bad',
        impact: { conflictResolution: -10, empathy: -8 },
        patientResponse: 'Я ничего не понимаю! Вы должны были мне сказать заранее! Позовите администратора!',
        explanation: 'Ещё больше оправданий — хуже делаете.'
      }
    ]);

    // Шаг 3: Требование руководителя
    tree.set(3, [
      {
        id: 102,
        text: 'Простите, пожалуйста! Я и есть старший администратор. Давайте я прямо сейчас разберусь в ситуации и найду решение!',
        type: 'good',
        impact: { professionalism: +9, conflictResolution: +10, empathy: +8 },
        patientResponse: 'Ну смотрите! Быстро разбирайтесь, у меня времени нет!',
        explanation: 'Хорошо! Взяли ответственность на себя.'
      },
      {
        id: 103,
        text: 'Руководителя сейчас нет на месте',
        type: 'bad',
        impact: { conflictResolution: -12, professionalism: -10 },
        patientResponse: 'То есть мне даже не с кем поговорить?! Всё, я ухожу и напишу жалобу!',
        explanation: 'Ужасно. Вы теряете пациента.'
      }
    ]);

    // Шаг 4: После объяснения ситуации - предложение компенсации
    tree.set(4, [
      {
        id: 6,
        text: 'Виктор Сергеевич, я очень извиняюсь за ситуацию. Чтобы компенсировать ваше ожидание, мы сделаем бесплатную профессиональную гигиену полости рта на следующем визите — это 3500 рублей. Плюс я могу предложить пройти сейчас без очереди, если освободится другой врач. Согласны подождать 15 минут?',
        type: 'good',
        impact: { conflictResolution: +12, empathy: +10, professionalism: +9 },
        patientResponse: 'М-да... Ну ладно, если другой врач освободится — согласен. И про чистку бесплатную запишите.',
        explanation: 'Превосходно! Дали компенсацию и альтернативу.'
      },
      {
        id: 7,
        text: 'Понимаю ваше недовольство. Можем перенести запись на другой день?',
        type: 'neutral',
        impact: { efficiency: -5 },
        patientResponse: 'На другой день?! Я уже тут сижу час! Мне сегодня нужно!',
        explanation: 'Неудачное предложение для разгневанного пациента.'
      }
    ]);

    // Шаг 5: Плохой путь - требование конкретики
    tree.set(5, [
      {
        id: 104,
        text: 'Точно через 12 минут освободится. Обещаю, не больше!',
        type: 'good',
        impact: { professionalism: +7, conflictResolution: +8 },
        patientResponse: 'Ну смотрите! Если снова обманете — ухожу немедленно!',
        explanation: 'Дали конкретику, но рискованно обещать точное время.'
      }
    ]);

    tree.set(104, [
      {
        id: 105,
        text: 'А пока подождёте, могу предложить кофе, чай? Wi-Fi есть, если нужно поработать.',
        type: 'good',
        impact: { empathy: +7, professionalism: +6 },
        patientResponse: 'Кофе бы... Но чтобы через 12 минут, как обещали!',
        explanation: 'Создаёте комфорт, немного сглаживаете ситуацию.'
      }
    ]);

    tree.set(105, [
      {
        id: 6,
        text: 'Конечно! Принесу эспрессо. А за ожидание мы сделаем бонус — бесплатную чистку на следующий раз.',
        type: 'good',
        impact: { empathy: +8, conflictResolution: +7 },
        patientResponse: 'Ладно, приемлемо. Запишите про чистку, чтобы не забыли.',
        explanation: 'Хорошо! Предложили компенсацию.'
      }
    ]);

    // Шаг 6: Дальнейшее развитие после компенсации
    tree.set(6, [
      {
        id: 8,
        text: 'Уже записал в вашу карту — бесплатная гигиена. Сейчас принесу кофе и узнаю про других врачей. Буквально 2 минуты!',
        type: 'good',
        impact: { efficiency: +8, professionalism: +7 },
        patientResponse: 'Хорошо, жду.',
        explanation: 'Действуете быстро и конкретно.'
      },
      {
        id: 9,
        text: 'Хорошо, обязательно запишу. Подождите пока.',
        type: 'neutral',
        impact: { efficiency: -4 },
        patientResponse: 'А кофе когда?',
        explanation: 'Медленно действуете.'
      }
    ]);

    // Шаг 7: Предложение переноса отклонено
    tree.set(7, [
      {
        id: 106,
        text: 'Понял! Тогда давайте я узнаю, может кто из врачей освободится раньше. Минутку!',
        type: 'good',
        impact: { efficiency: +7, conflictResolution: +7 },
        patientResponse: 'Ну быстрее уже!',
        explanation: 'Правильная реакция — ищете альтернативу.'
      }
    ]);

    tree.set(106, [
      {
        id: 107,
        text: '*через минуту* Отличная новость! Доктор Смирнова освободилась, может принять вас прямо сейчас! Она тоже высшей категории, отличный специалист.',
        type: 'good',
        impact: { efficiency: +10, professionalism: +9 },
        patientResponse: 'Наконец-то! Веди те меня к ней!',
        explanation: 'Превосходно! Нашли решение быстро.'
      }
    ]);

    tree.set(107, [
      {
        id: 8,
        text: 'Отлично! Она в кабинете 12. А за ожидание — бонусом бесплатная чистка на следующий визит. Записал вам.',
        type: 'good',
        impact: { empathy: +8, professionalism: +7 },
        patientResponse: 'Хорошо, спасибо. В следующий раз чтобы такого не было!',
        explanation: 'Хорошо завершили — дали бонус и показали, что цените пациента.'
      }
    ]);

    // Шаг 8: Возвращение после действий
    tree.set(8, [
      {
        id: 10,
        text: '*возвращаетесь* Виктор Сергеевич, отличная новость! Доктор Смирнова освободилась и готова принять вас прямо сейчас! Она тоже опытный ортопед высшей категории. Можем пройти?',
        type: 'good',
        impact: { efficiency: +9, professionalism: +8 },
        patientResponse: 'Ну наконец-то что-то конкретное! Да, идёмте!',
        explanation: 'Отлично! Вы решили проблему быстро.'
      },
      {
        id: 11,
        text: '*возвращаетесь* Извините, другие врачи заняты. Ваш врач примет через 10 минут точно.',
        type: 'neutral',
        impact: { efficiency: -3 },
        patientResponse: 'Опять ждать?! Ладно уж, но это предел!',
        explanation: 'Не нашли альтернативу, но хоть дали точное время.'
      }
    ]);

    // Шаг 9: Медленная подача кофе
    tree.set(9, [
      {
        id: 108,
        text: 'Сейчас принесу! А пока узнаю про других врачей.',
        type: 'good',
        impact: { efficiency: +5 },
        patientResponse: 'Давайте быстрее.',
        explanation: 'Исправляете ситуацию.'
      }
    ]);

    tree.set(108, [
      {
        id: 10,
        text: '*принесли кофе* Вот ваш кофе. И хорошая новость — доктор Смирнова освободилась!',
        type: 'good',
        impact: { empathy: +6, efficiency: +7 },
        patientResponse: 'Наконец-то! Идёмте к ней.',
        explanation: 'Решили проблему.'
      }
    ]);

    // Шаг 10: Проводим к новому врачу
    tree.set(10, [
      {
        id: 12,
        text: 'Проводу вас к кабинету. И ещё раз извинитеза ожидание — это действительно редкая ситуация. За неудобства мы дарим вам бонусом профгигиену на следующий визит. Договорились?',
        type: 'good',
        impact: { empathy: +9, professionalism: +8, conflictResolution: +8 },
        patientResponse: 'Ладно, уговорили. Главное, чтобы больше таких задержек не было!',
        explanation: 'Идеально! Вы полностью разрешили конфликт.'
      },
      {
        id: 13,
        text: 'Кабинет 12, по коридору направо',
        type: 'neutral',
        impact: { professionalism: -3 },
        patientResponse: 'То есть мне самому идти? После того как я тут час просидел?',
        explanation: 'Неправильно. Нужно проводить лично.'
      }
    ]);

    // Шаг 11: Вариант без альтернативы
    tree.set(11, [
      {
        id: 109,
        text: 'Виктор Сергеевич, я очень извиняюсь. Давайте я пока принесу вам кофе, и мы дадим скидку 15% на сегодняшнее лечение за ожидание?',
        type: 'good',
        impact: { empathy: +7, conflictResolution: +8 },
        patientResponse: 'Хм, 15% — это хоть что-то... Ладно, приносите кофе.',
        explanation: 'Неплохо, предложили компенсацию.'
      }
    ]);

    tree.set(109, [
      {
        id: 110,
        text: '*приносите кофе* Вот ваш кофе. И скидку 15% я уже внесла в систему. Врач примет вас через 5-7 минут.',
        type: 'good',
        impact: { professionalism: +7, efficiency: +6 },
        patientResponse: 'Хорошо, спасибо за кофе. Жду.',
        explanation: 'Сгладили ситуацию.'
      }
    ]);

    tree.set(110, [
      {
        id: 12,
        text: '*через 7 минут* Виктор Сергеевич, врач готов вас принять! Проходите, кабинет 8.',
        type: 'good',
        impact: { efficiency: +6 },
        patientResponse: 'Ну наконец-то! В следующий раз планируйте время нормально!',
        explanation: 'Ситуация разрешена, хоть и не идеально.'
      }
    ]);

    // Шаг 12: Финал
    tree.set(12, [
      {
        id: 14,
        text: 'Обязательно учтём ваш комментарий! Спасибо за терпение. Хорошего приёма!',
        type: 'good',
        impact: { professionalism: +7, empathy: +6 },
        patientResponse: 'Спасибо. Надеюсь, больше таких ситуаций не будет.',
        explanation: 'Отлично завершили! Пациент успокоился и готов продолжить лечение.'
      },
      {
        id: 15,
        text: 'Хорошо, проходите',
        type: 'neutral',
        impact: {},
        patientResponse: '*уходит недовольный*',
        explanation: 'Слишком сухо. Нужно было завершить на позитивной ноте.'
      }
    ]);

    // Шаг 13: Плохая ситуация - пациент обиделся
    tree.set(13, [
      {
        id: 111,
        text: 'Простите, я провожу вас лично! Кабинет совсем рядом. Проходите, пожалуйста.',
        type: 'good',
        impact: { professionalism: +6, empathy: +5 },
        patientResponse: 'Ну вот так-то лучше.',
        explanation: 'Исправили ошибку.'
      }
    ]);

    tree.set(111, [
      {
        id: 12,
        text: 'Вот кабинет 12. За ожидание дарим бесплатную чистку на следующий раз. Хорошего лечения!',
        type: 'good',
        impact: { empathy: +6, professionalism: +5 },
        patientResponse: 'Хорошо, спасибо.',
        explanation: 'Неплохо завершили.'
      }
    ]);

    // Шаг 100: Попытка исправить плохой старт
    tree.set(100, [
      {
        id: 4,
        text: '*узнаёте информацию* Виктор Сергеевич, ещё 15 минут максимум. У врача сложная процедура.',
        type: 'good',
        impact: { professionalism: +6 },
        patientResponse: 'Так бы сразу и сказали! А не "такое бывает"! Ладно, жду.',
        explanation: 'Спасли ситуацию конкретикой.'
      }
    ]);

    // Шаг 101: Ещё больше оправданий
    tree.set(101, [
      {
        id: 112,
        text: 'Хорошо, я позову старшего администратора',
        type: 'neutral',
        impact: { conflictResolution: -5 },
        patientResponse: 'Быстрее зовите!',
        explanation: 'Переложили проблему на другого.'
      }
    ]);

    tree.set(112, [
      {
        id: 102,
        text: '*приходит администратор* Здравствуйте! Я старший администратор Марина. Что случилось?',
        type: 'neutral',
        impact: {},
        patientResponse: 'Я тут уже час жду! Это вообще нормально?!',
        explanation: ''
      }
    ]);

    // Шаг 102: Руководитель берёт ситуацию
    tree.set(102, [
      {
        id: 4,
        text: 'Виктор Сергеевич, примите извинения. Сейчас я всё выясню и найдём решение.',
        type: 'good',
        impact: { empathy: +7, conflictResolution: +8 },
        patientResponse: 'Вот и выясняйте быстрее!',
        explanation: 'Взяли ответственность.'
      }
    ]);

    return tree;
  }

  private buildUpsellTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    tree.set(0, [
      {
        id: 1,
        text: 'Рада, что вам понравилось! Знаете, я заметила, что у вас очень красивая улыбка. Вы когда-нибудь думали об отбеливании?',
        type: 'good',
        impact: { salesSkill: +8, empathy: +6 },
        patientResponse: 'Да вот думала... А у вас какие варианты есть?',
        explanation: 'Отлично! Вы подхватили сигнал интереса естественно.'
      },
      {
        id: 2,
        text: 'Да, цвет эмали с возрастом темнеет. Это нормально.',
        type: 'bad',
        impact: { salesSkill: -12, empathy: -8 },
        patientResponse: 'Ну да, понятно... Спасибо. До свидания.',
        explanation: 'Упустили возможность! Пациент подал сигнал интереса.'
      }
    ]);

    tree.set(1, [
      {
        id: 3,
        text: 'У нас есть профессиональное отбеливание Amazing White — даёт эффект на 7-10 тонов за 1 час. И домашнее отбеливание каппами — более мягкий вариант. Посмотрите фото результатов!',
        type: 'good',
        impact: { salesSkill: +10, professionalism: +8 },
        patientResponse: 'Ого, реально белее! А какая разница между ними? И по цене?',
        explanation: 'Отлично! Даёте выбор и показываете результаты.'
      },
      {
        id: 4,
        text: 'Ну можем отбелить зубы. Тысяч 10 стоит.',
        type: 'neutral',
        impact: { salesSkill: +3 },
        patientResponse: 'Дороговато... Я подумаю',
        explanation: 'Слишком сухо. Не продали ценность.'
      }
    ]);

    tree.set(3, [
      {
        id: 5,
        text: 'Amazing White — это кабинетное, один визит, результат сразу, 7900р по акции до конца месяца. Домашнее — каппы носите 2 недели, эффект мягче, зато 4500р. Какой вариант интереснее?',
        type: 'good',
        impact: { salesSkill: +12, professionalism: +9 },
        patientResponse: 'А по акции только до конца месяца? Хм... А безопасно это?',
        explanation: 'Превосходно! Объяснили разницу, цены, создали срочность.'
      },
      {
        id: 6,
        text: 'Кабинетное дороже, домашнее дешевле',
        type: 'bad',
        impact: { salesSkill: -8 },
        patientResponse: 'Это я поняла. Сколько конкретно?',
        explanation: 'Неконкретно. Нужны цифры и объяснения.'
      }
    ]);

    tree.set(4, [
      {
        id: 100,
        text: 'Простите, покажу вам прайс с фотографиями. Вот смотрите...',
        type: 'good',
        impact: { salesSkill: +7 },
        patientResponse: 'О, красиво получается! Сколько это стоит?',
        explanation: 'Исправили ситуацию, показав результаты.'
      }
    ]);

    tree.set(100, [
      {
        id: 5,
        text: 'Профессиональное кабинетное сейчас по акции 7900 вместо 12000. Процедура час, эффект сразу.',
        type: 'good',
        impact: { salesSkill: +9 },
        patientResponse: 'А это безопасно для эмали?',
        explanation: 'Хорошо, дали конкретику.'
      }
    ]);

    tree.set(5, [
      {
        id: 7,
        text: 'Абсолютно! Используем гель последнего поколения без перекиси водорода. Он даже укрепляет эмаль. Перед процедурой врач обязательно проверит состояние зубов. Если есть чувствительность — подберём щадящий протокол.',
        type: 'good',
        impact: { empathy: +8, professionalism: +10, salesSkill: +9 },
        patientResponse: 'Звучит хорошо! А за час реально всё сделают?',
        explanation: 'Отлично! Закрыли возражение по безопасности.'
      },
      {
        id: 8,
        text: 'Да, безопасно. Врач посмотрит',
        type: 'neutral',
        impact: { professionalism: +4 },
        patientResponse: 'Ну хорошо... А сколько по времени?',
        explanation: 'Слишком кратко. Нужно больше убедить.'
      }
    ]);

    tree.set(6, [
      {
        id: 101,
        text: 'Профессиональное кабинетное — 7900р по акции. Домашнее — 4500р.',
        type: 'good',
        impact: { salesSkill: +6 },
        patientResponse: 'А разница какая между ними?',
        explanation: 'Дали цифры.'
      }
    ]);

    tree.set(101, [
      {
        id: 5,
        text: 'Кабинетное — быстрый результат за час, эффект ярче. Домашнее — постепенное, 2 недели, мягче. Какой вариант больше подходит?',
        type: 'good',
        impact: { salesSkill: +8 },
        patientResponse: 'Кабинетное интереснее. А это безопасно?',
        explanation: 'Объяснили разницу.'
      }
    ]);

    tree.set(7, [
      {
        id: 9,
        text: 'Да! Весь процесс занимает 45-60 минут. Наносим гель, активируем LED-лампой три цикла по 15 минут. Можно музыку слушать или видео смотреть. Результат видите сразу после процедуры!',
        type: 'good',
        impact: { salesSkill: +10, professionalism: +8 },
        patientResponse: 'Вау, быстро! А эффект надолго?',
        explanation: 'Отлично! Дали детали процесса.'
      },
      {
        id: 10,
        text: 'Да, за час всё делается',
        type: 'neutral',
        impact: { efficiency: +3 },
        patientResponse: 'Хм... А на сколько хватает?',
        explanation: 'Минимум информации.'
      }
    ]);

    tree.set(8, [
      {
        id: 102,
        text: 'Процедура занимает около часа',
        type: 'neutral',
        impact: {},
        patientResponse: 'Понятно. А эффект долго держится?',
        explanation: ''
      }
    ]);

    tree.set(102, [
      {
        id: 9,
        text: 'Эффект держится от 1 до 2 лет при правильном уходе. Расскажу подробнее?',
        type: 'good',
        impact: { professionalism: +6 },
        patientResponse: 'Да, интересно!',
        explanation: 'Дали важную информацию.'
      }
    ]);

    tree.set(9, [
      {
        id: 11,
        text: 'Эффект держится 1-2 года! Зависит от ухода: если избегать красящих продуктов первую неделю и регулярно чистить зубы — результат максимальный. Можем добавить домашний набор для поддержания за 2000р. Записать вас на отбеливание?',
        type: 'good',
        impact: { salesSkill: +12, efficiency: +10 },
        patientResponse: 'Домашний набор это что?',
        explanation: 'Превосходно! Сделали апселл и ведёте к записи.'
      },
      {
        id: 12,
        text: 'Год-два держится. Хотите записаться?',
        type: 'neutral',
        impact: { salesSkill: +5 },
        patientResponse: 'А когда можно?',
        explanation: 'Быстро, но без деталей.'
      }
    ]);

    tree.set(10, [
      {
        id: 103,
        text: 'От 1 до 2 лет при правильном уходе',
        type: 'neutral',
        impact: {},
        patientResponse: 'Неплохо... А когда можно сделать?',
        explanation: ''
      }
    ]);

    tree.set(103, [
      {
        id: 13,
        text: 'У нас есть место в субботу в 11:00 или во вторник в 16:00. Что удобнее?',
        type: 'good',
        impact: { efficiency: +7 },
        patientResponse: 'Суббота подойдёт!',
        explanation: 'Хорошо, даёте варианты.'
      }
    ]);

    tree.set(11, [
      {
        id: 13,
        text: 'Это гель и каппы для домашнего применения — можно освежать белизну раз в 3-4 месяца. Но это опционально. Что скажете — записать на отбеливание? Есть места в субботу и во вторник.',
        type: 'good',
        impact: { salesSkill: +9, efficiency: +8 },
        patientResponse: 'Суббота подойдёт! Без набора пока, потом посмотрю.',
        explanation: 'Отлично! Объяснили, не давили, продвинули к записи.'
      },
      {
        id: 14,
        text: 'Домашнее поддерживающее. Нужен?',
        type: 'bad',
        impact: { salesSkill: -6 },
        patientResponse: 'Не понятно что это... Не знаю...',
        explanation: 'Слишком кратко, не объяснили ценность.'
      }
    ]);

    tree.set(12, [
      {
        id: 104,
        text: 'Есть окна в субботу утром или во вторник вечером',
        type: 'neutral',
        impact: {},
        patientResponse: 'Суббота лучше',
        explanation: ''
      }
    ]);

    tree.set(104, [
      {
        id: 13,
        text: 'Отлично! Записываю на субботу в 11:00. Это займёт час.',
        type: 'good',
        impact: { efficiency: +6 },
        patientResponse: 'Хорошо. Что с собой нужно?',
        explanation: 'Оформляете запись.'
      }
    ]);

    tree.set(13, [
      {
        id: 15,
        text: 'Замечательно! Записала вас на субботу в 11:00. Ничего с собой не нужно, только хорошее настроение! За 2 часа до процедуры не ешьте красящие продукты. После отбеливания покажем памятку по уходу. Всё ясно?',
        type: 'good',
        impact: { professionalism: +9, efficiency: +8 },
        patientResponse: 'Да, всё понятно! Спасибо большое!',
        explanation: 'Идеально! Дали все инструкции и завершили продажу.'
      },
      {
        id: 16,
        text: 'Записала. Приходите',
        type: 'bad',
        impact: { professionalism: -5 },
        patientResponse: 'А что с собой взять? Как готовиться?',
        explanation: 'Слишком сухо. Нужна инструкция.'
      }
    ]);

    tree.set(14, [
      {
        id: 105,
        text: 'Хорошо, без набора. Записываю на субботу?',
        type: 'neutral',
        impact: {},
        patientResponse: 'Да, давайте',
        explanation: ''
      }
    ]);

    tree.set(105, [
      {
        id: 15,
        text: 'Готово! Суббота 11:00. За 2 часа до процедуры не ешьте красящее. Всё остальное расскажут на месте!',
        type: 'good',
        impact: { professionalism: +6 },
        patientResponse: 'Отлично, спасибо!',
        explanation: 'Хорошо завершили.'
      }
    ]);

    tree.set(16, [
      {
        id: 106,
        text: 'Ничего особенного не нужно. За 2 часа до процедуры не ешьте ничего красящего — кофе, вино, свёклу. После дадим памятку.',
        type: 'good',
        impact: { professionalism: +5 },
        patientResponse: 'Понятно, спасибо!',
        explanation: 'Исправили, дали инструкцию.'
      }
    ]);

    return tree;
  }

  private buildScaredChildTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    tree.set(0, [
      {
        id: 1,
        text: 'Ольга Андреевна, всё хорошо! Саша, привет! Я вижу, ты немного волнуешься. Знаешь, у нас тут совсем не страшно — даже мультики показываем! Хочешь сначала посмотреть, как тут красиво?',
        type: 'good',
        impact: { empathy: +25, professionalism: +15 },
        patientResponse: 'Саша перестал плакать и выглядывает из-за мамы. Мама: "О, спасибо! Саша, слышишь, мультики будут!"',
        explanation: 'Отлично! Вы переключили внимание ребёнка и сняли напряжение.'
      },
      {
        id: 2,
        text: 'Не переживайте, наш врач умеет работать с детьми. Сейчас вызову его.',
        type: 'neutral',
        impact: { professionalism: +5 },
        patientResponse: 'НЕЕЕЕТ! Я не хочу к врачу! Мама, пойдём домой!',
        explanation: 'Вы действуете правильно, но слишком быстро переходите к делу.'
      },
      {
        id: 3,
        text: 'Ну что такое, это же не больно! Все дети лечат зубы.',
        type: 'bad',
        impact: { empathy: -20, professionalism: -15 },
        patientResponse: 'Саша плачет ещё громче. Мама: "Вы только хуже делаете! Мы уходим!"',
        explanation: 'Так нельзя! Вы обесценили страх ребёнка и потеряли доверие.'
      }
    ]);

    tree.set(1, [
      {
        id: 4,
        text: 'Саша, смотри, у нас есть волшебное кресло! Оно может подниматься и опускаться — как в ракете! Хочешь попробовать на нём покататься? А врач просто посмотрит зубки, как мама дома. Можно даже не лечить сегодня, просто познакомимся!',
        type: 'good',
        impact: { empathy: +25, professionalism: +20 },
        patientResponse: 'Саша заинтересованно смотрит. Мама: "Саша, правда, только посмотрит! Давай попробуем?"',
        explanation: 'Превосходно! Вы превратили страх в интерес и сняли давление.'
      },
      {
        id: 5,
        text: 'У врача есть специальные детские инструменты, совсем маленькие',
        type: 'neutral',
        impact: {},
        patientResponse: 'Инструменты?! НЕЕЕЕТ! (плачет)',
        explanation: 'Слово "инструменты" напугало ещё больше.'
      }
    ]);

    tree.set(4, [
      {
        id: 6,
        text: 'А ещё у нас за смелость дарят подарки! Саша, ты любишь машинки или раскраски? Заходи, покажу!',
        type: 'good',
        impact: { empathy: +20, efficiency: +15 },
        patientResponse: 'Саша: "Машинки..." Мама: "Спасибо вам огромное! Саша, пойдём посмотрим!"',
        explanation: 'Блестяще! Вы создали позитивную мотивацию и помогли семье.'
      }
    ]);

    return tree;
  }

  private buildVipPatientTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    tree.set(0, [
      {
        id: 1,
        text: 'Михаил Константинович, добрый день! Сейчас проверю возможность приёма на завтра. Один момент, буквально 30 секунд.',
        type: 'good',
        impact: { professionalism: +20, efficiency: +20 },
        patientResponse: 'Хорошо, жду.',
        explanation: 'Отлично! Вы проявили уважение и сразу начали действовать.'
      },
      {
        id: 2,
        text: 'У нас очередь на две недели вперёд, но могу попробовать найти окно...',
        type: 'bad',
        impact: { efficiency: -15, professionalism: -10 },
        patientResponse: 'То есть, даже за доплату нельзя? Странно. Я думал, у вас сервис на уровне.',
        explanation: 'Вы сразу начали с негатива. Сначала проверьте возможности!'
      }
    ]);

    tree.set(1, [
      {
        id: 3,
        text: 'Михаил Константинович, отличные новости! Наш главный ортопед, Смирнов Игорь Петрович, кандидат медицинских наук, сможет принять вас завтра в 10:30. Это будет расширенная консультация с 3D-диагностикой. Вас устроит?',
        type: 'good',
        impact: { professionalism: +25, efficiency: +20, salesSkill: +15 },
        patientResponse: 'Прекрасно! Именно то, что нужно. Записывайте.',
        explanation: 'Превосходно! Вы подчеркнули статус врача и показали ценность.'
      },
      {
        id: 4,
        text: 'Да, могу записать на завтра. У нас свободно в 10:00.',
        type: 'neutral',
        impact: { efficiency: +10 },
        patientResponse: 'А к кому конкретно? Кто лучший специалист?',
        explanation: 'Сухо. Для VIP-клиента нужно больше внимания и деталей.'
      }
    ]);

    tree.set(3, [
      {
        id: 5,
        text: 'Отлично! Запишите, пожалуйста: клиника на Тверской, 15, 3 этаж. Ваш личный менеджер Анна встретит вас в холле. Пришлю все детали на WhatsApp. Что-то ещё подготовить к визиту?',
        type: 'good',
        impact: { professionalism: +20, efficiency: +15, empathy: +10 },
        patientResponse: 'Великолепно! Очень профессионально. Жду сообщение.',
        explanation: 'Блестяще! Вы обеспечили VIP-сервис и внимание к деталям.'
      }
    ]);

    return tree;
  }

  private buildPaymentIssueTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    tree.set(0, [
      {
        id: 1,
        text: 'Наталья Владимировна, не переживайте! У нас есть СБП, можно по номеру телефона перевести. Или на карту клиники. Какой способ удобнее?',
        type: 'good',
        impact: { empathy: +15, efficiency: +20, professionalism: +10 },
        patientResponse: 'О, спасибо! СБП отлично подойдёт, у меня на телефоне всё есть!',
        explanation: 'Отлично! Вы сразу предложили решение и сняли стресс.'
      },
      {
        id: 2,
        text: 'Можете завтра привезти, мы вас знаем.',
        type: 'neutral',
        impact: { empathy: +5 },
        patientResponse: 'А документ какой-то нужен, что я должна?',
        explanation: 'Это рискованно и непрофессионально. Нужно оформить официально.'
      },
      {
        id: 3,
        text: 'Как же так? Надо было заранее проверить! Без оплаты не можем отпустить.',
        type: 'bad',
        impact: { empathy: -20, professionalism: -15, conflictResolution: -15 },
        patientResponse: 'Что?! Я что, должник какой-то?! Я постоянный клиент! Хамство!',
        explanation: 'Катастрофа! Вы обвинили пациента и создали конфликт.'
      }
    ]);

    tree.set(1, [
      {
        id: 4,
        text: 'Сейчас скажу реквизиты. Переведёте, и я сразу выбью чек. Буквально минута! *диктует номер телефона для СБП*',
        type: 'good',
        impact: { efficiency: +20, professionalism: +15 },
        patientResponse: 'Перевела! Вот, смотрите, операция прошла.',
        explanation: 'Отлично! Быстро и профессионально решили вопрос.'
      }
    ]);

    tree.set(4, [
      {
        id: 5,
        text: 'Получили, спасибо! Вот ваш чек. Наталья Владимировна, с кем не бывает! Главное, что всё решилось. Выздоравливайте!',
        type: 'good',
        impact: { empathy: +15, professionalism: +10 },
        patientResponse: 'Спасибо вам большое! Как хорошо, что всё так быстро! Вы молодец!',
        explanation: 'Превосходно! Вы превратили неловкую ситуацию в позитивный опыт.'
      }
    ]);

    return tree;
  }

  makeChoice(choiceId: number): void {
    if (this.state.isCompleted) return;

    const currentChoices = this.dialogueTree.get(this.state.currentStep);
    if (!currentChoices) return;

    const choice = currentChoices.find(c => c.id === choiceId);
    if (!choice) return;

    // Добавляем выбор администратора
    this.state.dialogue.push({
      speaker: 'admin',
      text: choice.text,
      timestamp: Date.now()
    });

    // Добавляем ответ пациента
    this.state.dialogue.push({
      speaker: 'patient',
      text: choice.patientResponse,
      timestamp: Date.now()
    });

    // Обновляем параметры
    Object.entries(choice.impact).forEach(([key, value]) => {
      const paramKey = key as keyof typeof this.state.parameters;
      this.state.parameters[paramKey] = Math.max(0, Math.min(100, 
        this.state.parameters[paramKey] + (value || 0)
      ));
    });

    // Переходим к следующему шагу
    this.state.currentStep = choice.id;

    // Проверяем завершение
    if (!this.dialogueTree.has(choice.id)) {
      this.completeScenario();
    }
  }

  private completeScenario(): void {
    this.state.isCompleted = true;
    
    // Рассчитываем итоговый балл
    const weights = {
      empathy: 0.25,
      professionalism: 0.25,
      efficiency: 0.15,
      salesSkill: 0.20,
      conflictResolution: 0.15
    };

    const targetParams = this.state.scenario.targetParameters;
    let score = 0;

    Object.entries(this.state.parameters).forEach(([key, value]) => {
      const paramKey = key as keyof typeof targetParams;
      const target = targetParams[paramKey];
      const weight = weights[paramKey];
      const paramScore = (value / target) * 100 * weight;
      score += Math.min(paramScore, weight * 100);
    });

    this.state.finalScore = Math.round(score);
  }

  getState(): SimulatorState {
    return { ...this.state };
  }

  getCurrentChoices(): DialogueChoice[] {
    return this.dialogueTree.get(this.state.currentStep) || [];
  }

  getProgress(): number {
    // Прогресс основан на количестве реплик в диалоге
    const dialogueCount = Math.floor(this.state.dialogue.length / 2); // Делим на 2, т.к. каждый обмен = 2 реплики
    const maxDialogues = 20; // Примерно максимальное количество обменов
    return Math.min(100, (dialogueCount / maxDialogues) * 100);
  }
}