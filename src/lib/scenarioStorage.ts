import { CustomScenario } from '@/types/customScenario';

export class ScenarioStorage {
  private static readonly STORAGE_KEY = 'custom_doctor_scenarios';

  static getAll(): CustomScenario[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultScenarios();
    } catch (error) {
      console.error('Failed to load scenarios:', error);
      return this.getDefaultScenarios();
    }
  }

  static getById(id: string): CustomScenario | null {
    const scenarios = this.getAll();
    return scenarios.find(s => s.id === id) || null;
  }

  static save(scenario: CustomScenario): void {
    const scenarios = this.getAll();
    const index = scenarios.findIndex(s => s.id === scenario.id);
    
    if (index >= 0) {
      scenarios[index] = { ...scenario, updatedAt: Date.now() };
    } else {
      scenarios.push(scenario);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scenarios));
  }

  static delete(id: string): void {
    const scenarios = this.getAll();
    const filtered = scenarios.filter(s => s.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  static search(query: string, category?: string): CustomScenario[] {
    let scenarios = this.getAll();
    
    if (category) {
      scenarios = scenarios.filter(s => s.category === category);
    }
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      scenarios = scenarios.filter(s => 
        s.name.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery) ||
        s.context.role.toLowerCase().includes(lowerQuery) ||
        s.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
    
    return scenarios;
  }

  private static getDefaultScenarios(): CustomScenario[] {
    return [
      {
        id: 'default-consultation',
        name: 'Первичный приём: зубная боль',
        description: 'Пациент обращается впервые с острой зубной болью. Нужно собрать анамнез, успокоить и предложить план лечения.',
        context: {
          role: 'Врач-стоматолог',
          situation: 'Пациент впервые в клинике, жалуется на острую боль в зубе, которая беспокоит несколько дней',
          goal: 'Установить доверительный контакт, выявить причину боли, успокоить пациента и назначить лечение'
        },
        aiPersonality: {
          character: 'Я очень боюсь стоматологов с детства. У меня был негативный опыт.',
          emotionalState: 'scared',
          knowledge: 'low',
          communicationStyle: 'casual'
        },
        initialMessage: 'Здравствуйте, доктор... У меня сильно болит зуб справа уже третий день. Я очень боюсь, но терпеть уже невозможно.',
        objectives: [
          'Проявить эмпатию к страхам пациента',
          'Узнать характер и длительность боли',
          'Выяснить наличие аллергий',
          'Объяснить план лечения простым языком'
        ],
        challenges: [
          'Сильный страх перед стоматологом',
          'Низкий уровень медицинской грамотности',
          'Негативный опыт в прошлом'
        ],
        responsePatterns: {
          positive: [
            'Правда не будет больно?',
            'Спасибо, что объяснили.',
            'Хорошо, я вам доверяю.',
            'Вы меня успокоили.'
          ],
          negative: [
            'Мне очень страшно!',
            'А вдруг будет больно?',
            'Я передумал...',
            'Может, само пройдёт?'
          ],
          neutral: [
            'А что вы будете делать?',
            'Расскажите подробнее.',
            'Сколько это займёт времени?',
            'А какие варианты есть?'
          ]
        },
        category: 'consultation',
        tags: ['стоматология', 'первичный приём', 'страх', 'боль'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'default-treatment',
        name: 'Обсуждение плана лечения',
        description: 'Пациенту нужно удалить зуб мудрости. Он сомневается и боится осложнений.',
        context: {
          role: 'Врач-хирург',
          situation: 'После осмотра выявлено, что зуб мудрости растёт неправильно и требует удаления',
          goal: 'Убедить пациента в необходимости удаления, объяснить процедуру и развеять страхи'
        },
        aiPersonality: {
          character: 'Я читал в интернете много страшных историй про удаление зубов мудрости.',
          emotionalState: 'nervous',
          knowledge: 'medium',
          communicationStyle: 'professional'
        },
        initialMessage: 'Доктор, мне действительно нужно удалять зуб мудрости? Я слышал, что это очень больно и могут быть осложнения...',
        objectives: [
          'Объяснить необходимость удаления',
          'Рассказать о процедуре',
          'Развеять мифы из интернета',
          'Обсудить послеоперационный период'
        ],
        challenges: [
          'Страх осложнений',
          'Влияние негативной информации из интернета',
          'Сомнения в необходимости операции'
        ],
        responsePatterns: {
          positive: [
            'А сколько времени займёт восстановление?',
            'Хорошо, давайте назначим дату.',
            'Спасибо за разъяснения.',
            'Теперь мне стало спокойнее.'
          ],
          negative: [
            'Может, можно как-то по-другому?',
            'Я боюсь осложнений.',
            'Слишком рискованно...',
            'Давайте я ещё подумаю.'
          ],
          neutral: [
            'Как будет проходить операция?',
            'А анестезия точно подействует?',
            'Что мне нужно делать после?',
            'Сколько это стоит?'
          ]
        },
        category: 'treatment',
        tags: ['хирургия', 'зуб мудрости', 'страх', 'сомнения'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'default-emergency',
        name: 'Экстренный случай: кровотечение',
        description: 'Пациент в панике после удаления зуба - открылось кровотечение. Нужно успокоить и дать инструкции.',
        context: {
          role: 'Дежурный врач',
          situation: 'Пациент звонит/приходит через 2 часа после удаления зуба с жалобой на кровотечение',
          goal: 'Быстро оценить ситуацию, успокоить пациента, дать чёткие инструкции'
        },
        aiPersonality: {
          character: 'Я в панике, не знаю что делать. У меня изо рта кровь!',
          emotionalState: 'scared',
          knowledge: 'low',
          communicationStyle: 'casual'
        },
        initialMessage: 'Доктор! Помогите! У меня сильно кровоточит место, где удалили зуб! Что делать?!',
        objectives: [
          'Успокоить пациента',
          'Задать уточняющие вопросы',
          'Дать чёткие инструкции',
          'Определить необходимость срочного визита'
        ],
        challenges: [
          'Паника пациента',
          'Ограниченное время на принятие решения',
          'Дистанционная оценка ситуации'
        ],
        responsePatterns: {
          positive: [
            'Да, делаю как вы сказали.',
            'Кажется, помогает!',
            'Спасибо, я успокоился.',
            'Хорошо, я сейчас к вам приеду.'
          ],
          negative: [
            'Ничего не помогает!',
            'Мне страшно!',
            'Кровь не останавливается!',
            'Вызвать скорую?!'
          ],
          neutral: [
            'Что конкретно нужно сделать?',
            'Это опасно?',
            'Сколько ждать?',
            'Мне нужно приехать?'
          ]
        },
        category: 'emergency',
        tags: ['экстренная помощь', 'кровотечение', 'паника', 'инструкции'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];
  }
}
