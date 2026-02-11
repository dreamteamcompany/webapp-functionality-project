"""
Infrastructure: клиент для Yandex Cloud LLM API.
Реализация интерфейса ILLMService.
"""
import os
import requests
from typing import List, Dict
from datetime import datetime

from domain.interfaces import ILLMService
from domain.entities import Message


class YandexLLMClient(ILLMService):
    """Клиент для работы с Yandex Cloud Foundation Models API"""
    
    API_URL = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
    MODEL_URI_TEMPLATE = 'gpt://{folder_id}/yandexgpt-lite/latest'
    
    def __init__(self):
        self.api_key = os.environ.get('YANDEX_LLM_API_KEY')
        self.folder_id = os.environ.get('YANDEX_LLM_FOLDER_ID')
        
        if not self.api_key or not self.folder_id:
            raise ValueError("YANDEX_LLM_API_KEY и YANDEX_LLM_FOLDER_ID обязательны")
        
        self.model_uri = self.MODEL_URI_TEMPLATE.format(folder_id=self.folder_id)
    
    def generate_response(self, messages: List[dict]) -> dict:
        """
        Генерация ответа от YandexGPT.
        
        Args:
            messages: История в формате [{'role': 'system|user|assistant', 'text': '...'}]
        
        Returns:
            {'text': str, 'tokens': int}
        
        Raises:
            RuntimeError: Ошибка API
        """
        headers = {
            'Authorization': f'Api-Key {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'modelUri': self.model_uri,
            'completionOptions': {
                'stream': False,
                'temperature': 0.7,
                'maxTokens': 2000
            },
            'messages': messages
        }
        
        print(f"[LLM] Запрос к Yandex API: {len(messages)} сообщений")
        
        try:
            response = requests.post(
                self.API_URL,
                json=payload,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            result = data.get('result', {})
            alternatives = result.get('alternatives', [])
            
            if not alternatives:
                raise RuntimeError("Пустой ответ от API")
            
            text = alternatives[0].get('message', {}).get('text', '')
            tokens = result.get('usage', {}).get('completionTokens', 0)
            
            print(f"[LLM] Ответ получен: {len(text)} символов, {tokens} токенов")
            
            return {'text': text, 'tokens': tokens}
            
        except requests.exceptions.Timeout:
            print("[LLM] Timeout при запросе к API")
            raise RuntimeError("Превышено время ожидания ответа от LLM")
        except requests.exceptions.RequestException as e:
            print(f"[LLM] Ошибка запроса: {e}")
            raise RuntimeError(f"Ошибка связи с LLM API: {str(e)}")
        except Exception as e:
            print(f"[LLM] Неожиданная ошибка: {e}")
            raise RuntimeError(f"Ошибка обработки ответа LLM: {str(e)}")
    
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
        
        # Формируем запрос на саммари
        dialog_text = "\n".join([
            f"{msg.role.value}: {msg.content}"
            for msg in messages
        ])
        
        summary_request = [
            {
                'role': 'system',
                'text': 'Ты помощник, который создаёт краткие саммари диалогов. '
                        'Сохраняй ключевые факты, договорённости и важную информацию. '
                        'Отвечай кратко, не более 500 символов.'
            },
            {
                'role': 'user',
                'text': f'Создай краткое саммари следующего диалога:\n\n{dialog_text}'
            }
        ]
        
        try:
            result = self.generate_response(summary_request)
            return result['text']
        except Exception as e:
            print(f"[LLM] Ошибка создания саммари: {e}")
            # Fallback: простое усечение
            return f"[Краткое содержание {len(messages)} сообщений]"