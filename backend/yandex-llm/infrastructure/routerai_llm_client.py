"""
Infrastructure: клиент для RouterAI (OpenAI-совместимый шлюз к Claude/GPT).
Реализация интерфейса ILLMService.
"""
import os
import requests
from typing import List, Dict

from domain.interfaces import ILLMService
from domain.entities import Message


class RouterAILLMClient(ILLMService):
    """Клиент для работы с RouterAI через OpenAI-совместимый API"""

    API_URL = 'https://routerai.ru/v1/chat/completions'
    DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet'
    RESPONSE_TEMPERATURE = 0.7
    RESPONSE_MAX_TOKENS = 2000
    SUMMARY_MAX_TOKENS = 600
    REQUEST_TIMEOUT = 60

    def __init__(self):
        self.api_key = os.environ.get('ROUTERAI_API_KEY', '')
        self.model = os.environ.get('ROUTERAI_MODEL', self.DEFAULT_MODEL)

        if not self.api_key:
            raise ValueError("ROUTERAI_API_KEY обязателен")

    def generate_response(self, messages: List[dict]) -> dict:
        """
        Генерация ответа от модели.

        Args:
            messages: История в формате [{'role': 'system|user|assistant', 'text': '...'}]

        Returns:
            {'text': str, 'tokens': int, 'total_tokens': int}
        """
        openai_messages = self._to_openai_messages(messages)
        data = self._call_api(openai_messages, self.RESPONSE_MAX_TOKENS)

        choices = data.get('choices', [])
        if not choices:
            raise RuntimeError("Пустой ответ от API")

        text = choices[0].get('message', {}).get('content', '')
        usage = data.get('usage', {})
        completion_tokens = usage.get('completion_tokens', 0)
        total_tokens = usage.get('total_tokens', 0)

        print(f"[LLM] Ответ получен: {len(text)} символов, "
              f"completion={completion_tokens}, total={total_tokens}")

        return {
            'text': text,
            'tokens': completion_tokens,
            'total_tokens': total_tokens
        }

    def create_summary(self, messages: List[Message]) -> str:
        """
        Создание краткого саммари диалога.

        Args:
            messages: Список сообщений для суммаризации

        Returns:
            Краткое содержание
        """
        if not messages:
            return ""

        dialog_text = self._format_messages_for_summary(messages)
        summary_request = self._build_summary_request(dialog_text)

        try:
            data = self._call_api(summary_request, self.SUMMARY_MAX_TOKENS)
            choices = data.get('choices', [])
            if not choices:
                raise RuntimeError("Пустой ответ при суммаризации")
            return choices[0].get('message', {}).get('content', '')
        except Exception as e:
            print(f"[LLM] Ошибка создания саммари: {e}")
            return f"[Краткое содержание {len(messages)} сообщений]"

    def _call_api(self, messages: List[dict], max_tokens: int) -> dict:
        """Низкоуровневый вызов RouterAI API"""
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

        payload = {
            'model': self.model,
            'messages': messages,
            'temperature': self.RESPONSE_TEMPERATURE,
            'max_tokens': max_tokens
        }

        print(f"[LLM] Запрос к RouterAI ({self.model}): {len(messages)} сообщений")

        try:
            response = requests.post(
                self.API_URL,
                json=payload,
                headers=headers,
                timeout=self.REQUEST_TIMEOUT
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            print("[LLM] Timeout при запросе к API")
            raise RuntimeError("Превышено время ожидания ответа от модели")
        except requests.exceptions.RequestException as e:
            print(f"[LLM] Ошибка запроса: {e}")
            raise RuntimeError(f"Ошибка связи с RouterAI: {str(e)}")

    @staticmethod
    def _to_openai_messages(messages: List[dict]) -> List[Dict[str, str]]:
        """Преобразовать формат {'role','text'} в OpenAI {'role','content'}"""
        return [
            {'role': msg['role'], 'content': msg.get('text', msg.get('content', ''))}
            for msg in messages
        ]

    @staticmethod
    def _format_messages_for_summary(messages: List[Message]) -> str:
        """Сформировать текст диалога для запроса саммари"""
        return "\n".join(
            f"{msg.role.value}: {msg.content}" for msg in messages
        )

    @staticmethod
    def _build_summary_request(dialog_text: str) -> List[Dict[str, str]]:
        """Сформировать запрос на создание саммари"""
        return [
            {
                'role': 'system',
                'content': (
                    'Ты помощник, который создаёт краткие саммари диалогов. '
                    'Сохраняй ключевые факты, договорённости и важную информацию. '
                    'Отвечай кратко, не более 500 символов.'
                )
            },
            {
                'role': 'user',
                'content': f'Создай краткое саммари следующего диалога:\n\n{dialog_text}'
            }
        ]
