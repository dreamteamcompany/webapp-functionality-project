# Примеры использования системы контекстной памяти

## Базовое использование

### 1. Создание AI-пациента с контекстной памятью

```typescript
import { AdvancedPatientAI } from '@/lib/advancedPatientAI';
import { CustomScenario } from '@/types/customScenario';

const scenario: CustomScenario = {
  name: 'Консультация по имплантации',
  context: {
    role: 'Администратор стоматологической клиники',
    situation: 'Пациент звонит узнать про имплантацию зубов',
    goal: 'Записать пациента на консультацию'
  },
  aiPersonality: {
    emotionalState: 'nervous',
    knowledge: 'low',
    concerns: [
      'Боль во время процедуры',
      'Высокая стоимость',
      'Длительность лечения'
    ]
  },
  objectives: [
    'Успокоить пациента',
    'Объяснить процедуру простым языком',
    'Назвать примерную стоимость'
  ]
};

// Создание AI-пациента (автоматически создаёт контекстную память)
const ai = new AdvancedPatientAI(scenario);

// Получение приветствия
const greeting = ai.getGreeting();
console.log(greeting);
// "Здравствуйте. У меня болит зуб уже неделю. Что вы можете мне посоветовать?"
```

### 2. Ведение диалога с автоматическим сохранением контекста

```typescript
// Администратор отправляет сообщение
const response1 = await ai.getResponse('Здравствуйте! Я понимаю ваши переживания.');

console.log(response1.message);
// "Спасибо, что понимаете меня. Мне правда легче стало. 
//  А сколько времени займёт лечение?"

console.log(response1.emotionalState); // "nervous" -> "calm"
console.log(response1.satisfaction);   // 65 (было 50)

// Следующее сообщение
const response2 = await ai.getResponse(
  'Лечение займёт около 2-3 месяцев. Процедура безболезненная, используем современную анестезию.'
);

console.log(response2.message);
// "Хорошо, с анестезией понятно. А сколько это будет стоить?"

console.log(response2.emotionalState); // "calm"
console.log(response2.satisfaction);   // 72
```

### 3. Просмотр контекста диалога

```typescript
// Получить полный контекст
const context = ai.getDialogueContext();

console.log(context.patientProfile);
// {
//   mainConcern: "Боль во время процедуры",
//   emotionalState: "calm",
//   satisfactionLevel: 72,
//   trustLevel: 65
// }

console.log(context.extractedKnowledge.adminPersonalityTraits);
// {
//   empathyLevel: 25,
//   professionalismLevel: 15,
//   clarityLevel: 20,
//   responsivenessLevel: 18
// }

console.log(context.nextResponseStrategy);
// {
//   shouldAskQuestion: true,
//   shouldExpressConcern: false,
//   shouldShowGratitude: true,
//   shouldChallenge: false,
//   topicToExplore: "cost",
//   emotionalIntensity: 0.72
// }

console.log(context.conversationPhase);
// "exploration"
```

### 4. Экспорт контекста для анализа

```typescript
// Экспорт в JSON
const exported = ai.exportDialogueContext();
console.log(exported);

// Сохранить в файл
const blob = new Blob([exported], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'dialogue-context.json';
a.click();
```

## Продвинутые примеры

### Пример 1: Отслеживание качества работы администратора

```typescript
const ai = new AdvancedPatientAI(scenario);

// Администратор использует медицинские термины
await ai.getResponse('У вас патология пародонта требует резекции');

const context1 = ai.getDialogueContext();
console.log(context1.extractedKnowledge.patientReactions.confusionPoints);
// ["Использованы сложные термины: патология, резекция"]

console.log(context1.patientProfile.satisfactionLevel);
// 35 (упала из-за непонятных терминов)

// Администратор исправился и объяснил простым языком
await ai.getResponse(
  'Извините за сложные слова. Проще говоря - у вас воспаление дёсен, ' +
  'нужно почистить зубные отложения. Это несложная процедура.'
);

const context2 = ai.getDialogueContext();
console.log(context2.extractedKnowledge.adminPersonalityTraits.clarityLevel);
// 45 (выросла после простого объяснения)

console.log(context2.patientProfile.satisfactionLevel);
// 58 (восстановилась)
```

### Пример 2: Реакция на игнорирование вопросов

```typescript
// Пациент задал вопрос
await ai.getResponse('dummy'); // Инициализация
const response1 = await ai.getResponse('dummy');
// Ответ пациента: "А это больно?"

// Администратор не ответил на вопрос
const response2 = await ai.getResponse('Наша клиника работает с 9 до 21');

console.log(response2.message);
// "Понятно про время работы... Но вы не ответили на мой главный вопрос: 
//  а это больно?"

const context = ai.getDialogueContext();
console.log(context.extractedKnowledge.unresolvedQuestions);
// ["А это больно?"]

console.log(context.extractedKnowledge.adminPersonalityTraits.responsivenessLevel);
// 5 (низкая отзывчивость)
```

### Пример 3: Высокая эмпатия администратора

```typescript
// Администратор проявляет эмпатию несколько раз
await ai.getResponse('Я понимаю ваши переживания, это действительно волнительно');
await ai.getResponse('Не волнуйтесь, я вам помогу разобраться');
await ai.getResponse('Многие пациенты чувствуют то же самое');

const context = ai.getDialogueContext();
console.log(context.extractedKnowledge.adminPersonalityTraits.empathyLevel);
// 75 (высокая эмпатия)

const response = await ai.getResponse('Давайте обсудим детали');
console.log(response.message);
// "Вы очень внимательны, спасибо за такое отношение! 
//  Мне правда стало легче. Я готов записаться!"
```

### Пример 4: Фазы разговора

```typescript
const ai = new AdvancedPatientAI(scenario);

// Начальная фаза (1-2 сообщения)
await ai.getResponse('Здравствуйте');
console.log(ai.getDialogueContext().conversationPhase);
// "initial"

// Фаза исследования (3-6 сообщений)
await ai.getResponse('Расскажу про лечение');
await ai.getResponse('Стоимость составит 50000 рублей');
console.log(ai.getDialogueContext().conversationPhase);
// "exploration"

// Фаза переговоров (7-10 сообщений)
await ai.getResponse('Можем предложить рассрочку');
await ai.getResponse('Гарантия 5 лет');
console.log(ai.getDialogueContext().conversationPhase);
// "negotiation"

// Фаза решения (satisfaction > 70, trust > 60)
await ai.getResponse('Запишу вас на консультацию');
console.log(ai.getDialogueContext().conversationPhase);
// "decision"
```

## Интеграция с UI

### Пример: Компонент диалога с отображением контекста

```typescript
import { useState, useEffect } from 'react';
import { AdvancedPatientAI } from '@/lib/advancedPatientAI';
import DialogueContextViewer from '@/components/debug/DialogueContextViewer';

function ChatComponent({ scenario }) {
  const [ai, setAi] = useState<AdvancedPatientAI | null>(null);
  const [messages, setMessages] = useState([]);
  const [context, setContext] = useState(null);
  
  useEffect(() => {
    const aiInstance = new AdvancedPatientAI(scenario);
    setAi(aiInstance);
    
    // Добавить приветствие
    setMessages([{
      role: 'patient',
      content: aiInstance.getGreeting()
    }]);
  }, [scenario]);
  
  const handleSend = async (message: string) => {
    if (!ai) return;
    
    // Добавить сообщение администратора
    setMessages(prev => [...prev, { role: 'admin', content: message }]);
    
    // Получить ответ AI-пациента
    const response = await ai.getResponse(message);
    
    // Добавить ответ пациента
    setMessages(prev => [...prev, {
      role: 'patient',
      content: response.message
    }]);
    
    // Обновить контекст для отображения
    setContext(ai.getDialogueContext());
  };
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>
      
      <div className="context-viewer">
        {context && <DialogueContextViewer context={context} />}
      </div>
    </div>
  );
}
```

## Отладка и анализ

### Просмотр контекста в консоли

```typescript
const ai = new AdvancedPatientAI(scenario);

// После нескольких сообщений
await ai.getResponse('Тест 1');
await ai.getResponse('Тест 2');

// Вывести весь контекст
console.table(ai.getDialogueContext().patientProfile);
console.table(ai.getDialogueContext().extractedKnowledge.adminPersonalityTraits);
console.log(ai.getDialogueContext().conversationHistory);
```

### Сохранение истории диалогов для обучения

```typescript
const sessions = [];

// После каждого диалога
const sessionData = {
  sessionId: ai.getDialogueContext().sessionId,
  timestamp: Date.now(),
  context: ai.exportDialogueContext(),
  finalSatisfaction: ai.getCurrentSatisfaction(),
  adminScore: calculateAdminScore(ai.getDialogueContext())
};

sessions.push(sessionData);

// Сохранить в базу данных
await fetch('/api/training-sessions', {
  method: 'POST',
  body: JSON.stringify(sessionData)
});
```

### Анализ эффективности администраторов

```typescript
function analyzeAdminPerformance(context: DialogueContext) {
  const traits = context.extractedKnowledge.adminPersonalityTraits;
  
  return {
    empathy: traits.empathyLevel > 60 ? 'Отлично' : 'Требует улучшения',
    professionalism: traits.professionalismLevel > 50 ? 'Хорошо' : 'Недостаточно',
    clarity: traits.clarityLevel > 50 ? 'Понятно' : 'Слишком сложно',
    responsiveness: traits.responsivenessLevel > 50 ? 'Активен' : 'Игнорирует вопросы',
    
    overallScore: Math.round(
      (traits.empathyLevel + 
       traits.professionalismLevel + 
       traits.clarityLevel + 
       traits.responsivenessLevel) / 4
    ),
    
    recommendations: generateRecommendations(traits)
  };
}
```

## Очистка и сброс

```typescript
// Очистить контекст текущей сессии
ai.clearDialogueContext();

// Удалить все сохранённые контексты
Object.keys(localStorage)
  .filter(key => key.startsWith('dialogue_context_'))
  .forEach(key => localStorage.removeItem(key));
```

## Заключение

Система контекстной памяти обеспечивает:
- ✅ Автоматическое сохранение истории диалога
- ✅ Анализ поведения администратора в реальном времени
- ✅ Адаптивную генерацию ответов без скриптов
- ✅ Отслеживание качества общения
- ✅ Персистентное хранение для продолжения диалога
- ✅ Экспорт данных для анализа и обучения
