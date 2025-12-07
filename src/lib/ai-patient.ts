export interface Message {
  role: 'manager' | 'client';
  content: string;
}

export interface AIResponse {
  response: string;
  score: number;
  phase: string;
}

export type Phase = 'greeting' | 'needs' | 'presentation' | 'objections' | 'closing';

const phaseResponses: Record<Phase, string[]> = {
  greeting: [
    "Здравствуйте. Слушаю вас.",
    "Да, я вас слушаю.",
    "Добрый день. Что вы хотели?",
    "Алло, кто это?",
  ],
  needs: [
    "У меня болит спина уже второй месяц, работать нормально не могу.",
    "Спина беспокоит, особенно после сидячей работы.",
    "Проблемы со спиной есть, хотел бы что-то с этим сделать.",
    "Боли в пояснице, врачи говорят нужно лечение.",
  ],
  presentation: [
    "А сколько это будет стоить?",
    "Как долго длится лечение?",
    "А есть ли у вас гарантии?",
    "Это точно поможет?",
  ],
  objections: [
    "Это дорого для меня.",
    "Мне нужно подумать.",
    "Может, я позже перезвоню?",
    "У вас есть что-то подешевле?",
  ],
  closing: [],
};

export function generateAIResponse(
  phase: Phase,
  message: string,
  history: Message[]
): AIResponse {
  const messageLower = message.toLowerCase();
  let response: string;

  // Для фазы closing зависит от качества работы
  if (phase === 'closing') {
    const hasGoodArguments = history.some(
      msg =>
        msg.role === 'manager' &&
        (msg.content.toLowerCase().includes('гарантия') ||
          msg.content.toLowerCase().includes('результат') ||
          msg.content.toLowerCase().includes('отзыв'))
    );

    if (hasGoodArguments) {
      response = "Хорошо, давайте запишусь. Когда можно прийти?";
    } else {
      response = "Спасибо, я подумаю и перезвоню.";
    }
  }
  // Для objections смотрим на качество аргументов
  else if (phase === 'objections') {
    if (
      messageLower.includes('рассрочка') ||
      messageLower.includes('скидка') ||
      messageLower.includes('акция')
    ) {
      response = "Хм, интересно. А какие условия?";
    } else if (
      messageLower.includes('результат') ||
      messageLower.includes('гарантия') ||
      messageLower.includes('отзыв')
    ) {
      response = "Да, это важно. Расскажите подробнее.";
    } else {
      response = phaseResponses.objections[0];
    }
  }
  // Для остальных фаз берём случайный ответ
  else {
    const responses = phaseResponses[phase];
    response = responses[Math.floor(Math.random() * responses.length)];
  }

  const score = evaluateResponse(phase, message);

  return {
    response,
    score,
    phase,
  };
}

function evaluateResponse(phase: Phase, message: string): number {
  const messageLower = message.toLowerCase();
  let score = 5; // Базовая оценка

  // Ключевые слова для каждой фазы
  const goodKeywords: Record<Phase, string[]> = {
    greeting: ['добрый день', 'здравствуйте', 'клиника', 'меня зовут'],
    needs: ['беспокоит', 'помочь', 'расскажите', 'что именно'],
    presentation: ['специалисты', 'опыт', 'оборудование', 'результат', 'метод'],
    objections: ['понимаю', 'рассрочка', 'гарантия', 'результат', 'пациенты', 'отзыв'],
    closing: ['запись', 'удобно', 'время', 'когда', 'встреча'],
  };

  const keywords = goodKeywords[phase] || [];

  // +1 балл за каждое ключевое слово
  keywords.forEach(keyword => {
    if (messageLower.includes(keyword)) {
      score += 1;
    }
  });

  // +2 балла за вопросы (вовлечение)
  if (message.includes('?')) {
    score += 2;
  }

  // +1 балл за длину (детальный ответ)
  if (message.length > 100) {
    score += 1;
  }

  // Ограничиваем диапазон 1-10
  return Math.max(1, Math.min(10, score));
}
