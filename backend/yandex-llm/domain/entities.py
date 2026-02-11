"""
Domain entities: диалоги, сценарии, сообщения.
Не знают о БД, API, фреймворках.
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Literal
from enum import Enum


class MessageRole(str, Enum):
    """Роли участников диалога"""
    USER = 'user'  # Администратор клиники
    ASSISTANT = 'assistant'  # Пациент (ответ от LLM)
    SYSTEM = 'system'  # Системное сообщение


@dataclass(frozen=True)
class Message:
    """Сообщение в диалоге - immutable value object"""
    role: MessageRole
    content: str
    timestamp: datetime = field(default_factory=datetime.now)
    token_count: int = 0
    
    def __post_init__(self):
        if not self.content.strip():
            raise ValueError("Сообщение не может быть пустым")


@dataclass
class Scenario:
    """Сценарий тренировки"""
    id: str
    title: str
    description: str
    system_prompt: str
    max_tokens: int = 8000
    
    def __post_init__(self):
        if not self.system_prompt.strip():
            raise ValueError("System prompt обязателен")
        if self.max_tokens < 1000:
            raise ValueError("Минимум 1000 токенов")


@dataclass
class Dialog:
    """Диалог тренировки - основная агрегатная сущность"""
    id: str
    scenario: Scenario
    messages: List[Message] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    total_tokens: int = 0
    
    def add_message(self, role: MessageRole, content: str, token_count: int = 0) -> Message:
        """Добавить сообщение в диалог"""
        message = Message(role=role, content=content, token_count=token_count)
        self.messages.append(message)
        self.total_tokens += token_count
        self.updated_at = datetime.now()
        return message
    
    def get_full_history(self) -> List[dict]:
        """Получить полную историю для отправки в LLM"""
        history = [{'role': 'system', 'text': self.scenario.system_prompt}]
        
        for msg in self.messages:
            history.append({
                'role': msg.role.value,
                'text': msg.content
            })
        
        return history
    
    def needs_summarization(self) -> bool:
        """Проверка необходимости саммари"""
        return self.total_tokens > self.scenario.max_tokens * 0.8
    
    def get_messages_for_summary(self) -> List[Message]:
        """Получить старые сообщения для саммари (кроме последних 5)"""
        if len(self.messages) <= 5:
            return []
        return self.messages[:-5]
    
    def get_recent_messages(self) -> List[Message]:
        """Получить последние 5 сообщений"""
        return self.messages[-5:] if len(self.messages) > 5 else self.messages
    
    def replace_history_with_summary(self, summary_text: str):
        """Заменить старые сообщения на саммари"""
        recent = self.get_recent_messages()
        summary_msg = Message(
            role=MessageRole.SYSTEM,
            content=f"[КРАТКОЕ СОДЕРЖАНИЕ ПРЕДЫДУЩЕГО ДИАЛОГА]\n{summary_text}",
            token_count=len(summary_text) // 4  # Примерная оценка
        )
        self.messages = [summary_msg] + recent
        self.total_tokens = sum(msg.token_count for msg in self.messages)
