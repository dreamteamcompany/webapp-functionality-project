# Система контекстной памяти AI-пациента

## Обзор

Система контекстной памяти обеспечивает осмысленное, контекстное и вариативное ведение диалога с AI-пациентом без использования скриптов или заранее зафиксированных ответов.

## Архитектура

### 1. DialogueContextManager (`src/lib/dialogueContext.ts`)

Центральный компонент системы, который:
- **Сохраняет полную историю диалога** в localStorage
- **Анализирует каждое сообщение администратора** по 5+ параметрам
- **Отслеживает паттерны поведения** администратора
- **Формирует стратегию** следующего ответа на основе контекста
- **Определяет фазу разговора** (initial, exploration, negotiation, decision, closing)

### 2. Структура контекста диалога

```typescript
interface DialogueContext {
  sessionId: string;                    // Уникальный ID сессии
  patientProfile: {                     // Профиль пациента
    mainConcern: string;                // Главная проблема
    emotionalState: string;             // Эмоциональное состояние
    satisfactionLevel: number;          // Уровень удовлетворённости (0-100)
    trustLevel: number;                 // Уровень доверия (0-100)
  };
  conversationHistory: DialogueTurn[]; // Полная история сообщений
  extractedKnowledge: {                // Извлечённые знания
    adminPromises: string[];           // Обещания администратора
    discussedTopics: Map<string, number>; // Темы и глубина обсуждения
    unresolvedQuestions: string[];     // Неотвеченные вопросы
    adminPersonalityTraits: {          // Черты личности администратора
      empathyLevel: number;            // Уровень эмпатии (0-100)
      professionalismLevel: number;    // Профессионализм (0-100)
      clarityLevel: number;            // Ясность изложения (0-100)
      responsivenessLevel: number;     // Отзывчивость (0-100)
    };
    patientReactions: {                // Реакции пациента
      positiveReactions: string[];     
      negativeReactions: string[];     
      confusionPoints: string[];       
    };
  };
  nextResponseStrategy: {              // Стратегия следующего ответа
    shouldAskQuestion: boolean;        // Нужно ли задать вопрос
    shouldExpressConcern: boolean;     // Нужно ли выразить опасение
    shouldShowGratitude: boolean;      // Нужно ли поблагодарить
    shouldChallenge: boolean;          // Нужно ли оспорить
    topicToExplore: string | null;     // Какую тему исследовать
    emotionalIntensity: number;        // Эмоциональная интенсивность
  };
  conversationPhase: string;           // Текущая фаза разговора
  lastUpdated: number;                 // Время последнего обновления
}
```

## Как это работает

### Шаг 1: Анализ сообщения администратора

Когда администратор отправляет сообщение, система анализирует:

1. **Темы** - какие темы затронуты (лечение, боль, стоимость, время, безопасность, результаты)
2. **Тональность** - позитивная, негативная или нейтральная
3. **Ключевые моменты** - обещания, объяснения, вопросы
4. **Эмоциональный тон** - эмпатичный, директивный или гибкий
5. **Обращение к опасениям** - затронуты ли главные проблемы пациента

```typescript
// Пример анализа
{
  topics: ['treatment', 'pain'],
  sentiment: 'positive',
  keyPoints: ['Дал разъяснение', 'Администратор пообещал помочь'],
  addressedConcerns: ['Страх перед болью'],
  emotionalTone: 'empathetic'
}
```

### Шаг 2: Обновление базы знаний

На основе анализа система обновляет:

- **Обсуждённые темы** - увеличивает счётчик глубины обсуждения каждой темы
- **Обещания администратора** - сохраняет обещания для отслеживания
- **Черты личности администратора** - корректирует профиль (эмпатия +15, профессионализм +10)
- **Реакции пациента** - фиксирует позитивные/негативные моменты

### Шаг 3: Формирование стратегии ответа

Система определяет, как пациент должен ответить:

```typescript
// Пример стратегии
{
  shouldAskQuestion: true,              // Да, задать вопрос
  shouldExpressConcern: false,          // Нет, не выражать опасение
  shouldShowGratitude: true,            // Да, поблагодарить (высокая эмпатия админа)
  shouldChallenge: false,               // Нет, не оспаривать
  topicToExplore: 'cost',              // Исследовать тему стоимости
  emotionalIntensity: 0.7              // Средне-высокая эмоциональность
}
```

### Шаг 4: Генерация контекстного ответа

`AdvancedPatientAI` использует контекст для генерации уникального ответа:

```typescript
private generateContextualResponse(userMessage, analysis, responseContext) {
  // 1. Реакция на качество общения администратора
  if (adminProfile.empathyLevel > 70) {
    parts.push('Спасибо, вы очень внимательны!');
  }

  // 2. Реакция на основе фазы разговора
  if (phase === 'exploration') {
    parts.push(generateTopicQuestion(strategy.topicToExplore));
  }

  // 3. Учёт нерешённых вопросов
  if (unresolvedQuestions.length > 0) {
    parts.push('Кстати, я всё ещё жду ответа на мой вопрос...');
  }

  // 4. Реакция на конкретные темы
  if (analysis.topics.includes('cost')) {
    parts.push('А можно подробнее про оплату?');
  }

  return parts.join(' ');
}
```

## Преимущества системы

### 1. Отсутствие скриптов
- Каждый ответ генерируется динамически на основе контекста
- Нет заранее заданных путей диалога
- Пациент реагирует на реальную историю общения

### 2. Память о предыдущих ответах
- Пациент помнит все обещания администратора
- Отслеживает, на какие вопросы не получил ответа
- Учитывает стиль общения администратора

### 3. Адаптивное поведение
- Пациент меняет стратегию в зависимости от фазы разговора
- Реагирует на личностные качества администратора
- Корректирует эмоциональную интенсивность

### 4. Персистентное хранение
- Контекст сохраняется в localStorage
- При перезагрузке страницы диалог можно продолжить
- Можно экспортировать контекст для анализа

## Примеры работы

### Пример 1: Начальная фаза

**Администратор:** "Здравствуйте! Чем могу вам помочь?"

**Анализ:**
- Topics: []
- Sentiment: positive
- Emotional tone: neutral
- Admin empathy: +5

**Стратегия:**
- shouldAskQuestion: true (начало диалога)
- topicToExplore: 'treatment'
- phase: 'initial'

**Ответ пациента:** "Здравствуйте. У меня болит зуб уже неделю. Что вы можете мне посоветовать?"

---

### Пример 2: Реакция на высокую эмпатию

**Администратор:** "Я понимаю ваши переживания. Это действительно волнительно. Не волнуйтесь, мы обязательно вам поможем!"

**Анализ:**
- Topics: []
- Sentiment: positive
- Emotional tone: empathetic
- Admin empathy: +15 (теперь 65)
- keyPoints: ['Администратор пообещал помочь']

**Стратегия:**
- shouldShowGratitude: true (высокая эмпатия)
- shouldAskQuestion: true

**Ответ пациента:** "Спасибо, вы очень внимательны! Это правда важно для меня. А сколько времени займёт лечение?"

---

### Пример 3: Реакция на игнорирование вопроса

**Предыстория:** Пациент спросил: "А это больно?"

**Администратор:** "Наша клиника работает с 9 до 21."

**Анализ:**
- Topics: ['time']
- Admin responsiveness: -5
- Unresolved questions: ["А это больно?"]

**Стратегия:**
- shouldExpressConcern: true
- Mention unresolved question

**Ответ пациента:** "Понятно про время работы... Но вы не ответили на мой главный вопрос: а это больно?"

---

### Пример 4: Фаза принятия решения

**Контекст:**
- messageCount: 12
- satisfaction: 75
- trust: 70
- discussedTopics: ['treatment', 'pain', 'cost', 'time']

**Фаза:** decision

**Администратор:** "Отлично! Могу предложить вам запись на завтра в 15:00."

**Ответ пациента:** "Знаете, я готов записаться! Давайте на завтра в 15:00. Спасибо за вашу помощь!"

## Отладка и мониторинг

### Экспорт контекста

```typescript
const ai = new AdvancedPatientAI(scenario);

// После нескольких сообщений
const context = ai.exportDialogueContext();
console.log(context); // Полный JSON контекста

// Или получить структурированный объект
const fullContext = ai.getDialogueContext();
console.log(fullContext.extractedKnowledge.adminPersonalityTraits);
```

### Просмотр в localStorage

Контекст хранится в ключе: `dialogue_context_{sessionId}`

Можно посмотреть в DevTools → Application → Local Storage

## API

### DialogueContextManager

```typescript
// Создание менеджера контекста
const manager = new DialogueContextManager(sessionId, patientProfile);

// Добавление сообщения администратора (автоматический анализ)
manager.addAdminMessage("Здравствуйте! Чем помочь?");

// Получение контекста для генерации ответа
const context = manager.getResponseContext();

// Добавление ответа пациента
manager.addPatientMessage("Болит зуб...");

// Обновление состояния пациента
manager.updatePatientState(
  satisfactionDelta: 10,
  trustDelta: 5,
  newEmotionalState: 'calm'
);

// Экспорт и очистка
const exported = manager.exportContext();
manager.clear();
```

### AdvancedPatientAI

```typescript
const ai = new AdvancedPatientAI(scenario);

// Получение ответа (автоматически использует контекст)
const response = await ai.getResponse("Ваше сообщение");

// Доступ к контексту диалога
const dialogueContext = ai.getDialogueContext();
const exported = ai.exportDialogueContext();
ai.clearDialogueContext();
```

## Заключение

Система контекстной памяти превращает AI-пациента из скриптового бота в интеллектуального собеседника, который:
- Запоминает всё сказанное
- Анализирует поведение администратора
- Формирует стратегию на основе контекста
- Генерирует уникальные ответы
- Адаптируется к стилю общения

Это создаёт реалистичный и непредсказуемый опыт практики для администраторов клиник.
