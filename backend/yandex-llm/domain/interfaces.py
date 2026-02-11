"""
Интерфейсы для domain слоя.
Domain не знает о реализациях - только контракты.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from .entities import Dialog, Scenario, Message


class IDialogRepository(ABC):
    """Интерфейс репозитория диалогов"""
    
    @abstractmethod
    def save(self, dialog: Dialog) -> None:
        """Сохранить диалог"""
        pass
    
    @abstractmethod
    def get_by_id(self, dialog_id: str) -> Optional[Dialog]:
        """Получить диалог по ID"""
        pass
    
    @abstractmethod
    def list_by_user(self, user_id: str) -> List[Dialog]:
        """Список диалогов пользователя"""
        pass


class IScenarioRepository(ABC):
    """Интерфейс репозитория сценариев"""
    
    @abstractmethod
    def get_by_id(self, scenario_id: str) -> Optional[Scenario]:
        """Получить сценарий по ID"""
        pass
    
    @abstractmethod
    def list_all(self) -> List[Scenario]:
        """Все доступные сценарии"""
        pass


class ILLMService(ABC):
    """Интерфейс сервиса LLM"""
    
    @abstractmethod
    def generate_response(self, messages: List[dict]) -> dict:
        """
        Генерация ответа от LLM.
        
        Args:
            messages: История диалога в формате [{'role': 'user', 'text': '...'}]
        
        Returns:
            {'text': str, 'tokens': int}
        """
        pass
    
    @abstractmethod
    def create_summary(self, messages: List[Message]) -> str:
        """
        Создание краткого саммари из сообщений.
        
        Args:
            messages: Список сообщений для суммаризации
        
        Returns:
            Краткое содержание диалога
        """
        pass
