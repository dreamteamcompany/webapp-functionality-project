"""
Domain: value object персонажа-пациента и построение системного промпта.
Чистая логика без знания о фреймворках, БД и HTTP.
"""
from dataclasses import dataclass, field
from typing import List


EMOTION_LABELS = {
    'calm': 'спокоен',
    'nervous': 'нервничает',
    'angry': 'раздражён и недоволен',
    'scared': 'напуган и тревожен',
    'happy': 'в хорошем настроении',
    'sad': 'подавлен и грустит',
    'confused': 'растерян',
    'excited': 'взволнован',
    'relieved': 'испытывает облегчение',
}

KNOWLEDGE_LABELS = {
    'low': 'плохо разбирается в теме, использует простые слова, не понимает терминов',
    'medium': 'средне разбирается в теме',
    'high': 'хорошо разбирается в теме, задаёт уточняющие вопросы',
}

STYLE_LABELS = {
    'formal': 'общается формально и сдержанно',
    'casual': 'общается просто, по-бытовому',
    'professional': 'общается по-деловому',
    'friendly': 'общается дружелюбно и открыто',
    'aggressive': 'общается резко, может перебивать и давить',
}


@dataclass(frozen=True)
class PatientPersona:
    """Описание роли пациента для ролевой игры"""

    role: str
    situation: str
    goal: str
    character: str
    emotional_state: str
    knowledge: str
    communication_style: str
    objectives: List[str] = field(default_factory=list)
    challenges: List[str] = field(default_factory=list)

    def emotion_text(self) -> str:
        return EMOTION_LABELS.get(self.emotional_state, 'нейтрален')

    def knowledge_text(self) -> str:
        return KNOWLEDGE_LABELS.get(self.knowledge, '')

    def style_text(self) -> str:
        return STYLE_LABELS.get(self.communication_style, '')


class PatientPromptBuilder:
    """Строит системный промпт для модели на основе персонажа"""

    MAX_REPLY_SENTENCES = 3

    def build(self, persona: PatientPersona) -> str:
        sections = [
            self._role_section(persona),
            self._behavior_section(persona),
            self._tasks_section(persona),
            self._rules_section(),
        ]
        return "\n\n".join(part for part in sections if part)

    def _role_section(self, persona: PatientPersona) -> str:
        lines = [
            "Ты играешь роль человека в ролевом тренажёре для обучения сотрудников.",
            f"Твоя роль: {persona.role}.",
        ]
        if persona.character:
            lines.append(f"Характер: {persona.character}.")
        if persona.situation:
            lines.append(f"Ситуация: {persona.situation}.")
        return " ".join(lines)

    def _behavior_section(self, persona: PatientPersona) -> str:
        lines = [
            f"Сейчас ты {persona.emotion_text()}.",
            f"Ты {persona.knowledge_text()}.",
            f"Ты {persona.style_text()}.",
        ]
        return " ".join(line for line in lines if line.strip(' .'))

    def _tasks_section(self, persona: PatientPersona) -> str:
        parts = []
        if persona.goal:
            parts.append(f"Твоя внутренняя цель: {persona.goal}.")
        if persona.challenges:
            joined = "; ".join(persona.challenges)
            parts.append(f"Ты можешь поднимать такие сложности: {joined}.")
        return " ".join(parts)

    def _rules_section(self) -> str:
        return (
            "Правила: отвечай ТОЛЬКО от лица своего персонажа, живым разговорным языком. "
            f"Держи ответ коротким — не больше {self.MAX_REPLY_SENTENCES} предложений. "
            "Реагируй на смысл слов собеседника, проявляй эмоции, задавай встречные вопросы. "
            "Никогда не выходи из роли, не упоминай, что ты ИИ, и не давай инструкций обучаемому."
        )
