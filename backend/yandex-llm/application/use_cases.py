"""
Application слой: Use Cases для управления тренировками.
Оркестрирует бизнес-логику через интерфейсы domain слоя.
"""
import uuid
from typing import List
from datetime import datetime

from domain.entities import Dialog, Scenario, MessageRole
from domain.interfaces import IDialogRepository, IScenarioRepository, ILLMService


class StartTrainingUseCase:
    """UC: Старт новой тренировки"""
    
    def __init__(
        self,
        dialog_repo: IDialogRepository,
        scenario_repo: IScenarioRepository
    ):
        self._dialog_repo = dialog_repo
        self._scenario_repo = scenario_repo
    
    def execute(self, scenario_id: str, user_id: str) -> Dialog:
        """
        Создать новый диалог для тренировки.
        
        Args:
            scenario_id: ID выбранного сценария
            user_id: ID пользователя
        
        Returns:
            Новый диалог
        
        Raises:
            ValueError: Сценарий не найден
        """
        scenario = self._scenario_repo.get_by_id(scenario_id)
        if not scenario:
            raise ValueError(f"Сценарий {scenario_id} не найден")
        
        dialog = Dialog(
            id=str(uuid.uuid4()),
            scenario=scenario
        )
        
        self._dialog_repo.save(dialog)
        return dialog


class SendMessageUseCase:
    """UC: Отправка сообщения и получение ответа"""
    
    def __init__(
        self,
        dialog_repo: IDialogRepository,
        llm_service: ILLMService
    ):
        self._dialog_repo = dialog_repo
        self._llm_service = llm_service
    
    def execute(self, dialog_id: str, message_text: str) -> dict:
        """
        Обработка сообщения пользователя.
        
        Args:
            dialog_id: ID диалога
            message_text: Текст сообщения от администратора
        
        Returns:
            {'user_message': Message, 'assistant_response': Message}
        
        Raises:
            ValueError: Диалог не найден
        """
        dialog = self._dialog_repo.get_by_id(dialog_id)
        if not dialog:
            raise ValueError(f"Диалог {dialog_id} не найден")
        
        user_msg = dialog.add_message(
            role=MessageRole.USER,
            content=message_text,
            token_count=len(message_text) // 4
        )
        
        if dialog.needs_summarization():
            self._apply_summarization(dialog)
        
        full_history = dialog.get_full_history()
        llm_response = self._llm_service.generate_response(full_history)
        
        total_tokens_used = llm_response.get('total_tokens', 0)
        if total_tokens_used > 0:
            dialog.total_tokens = total_tokens_used
        
        assistant_msg = dialog.add_message(
            role=MessageRole.ASSISTANT,
            content=llm_response['text'],
            token_count=llm_response.get('tokens', 0)
        )
        
        self._dialog_repo.save(dialog)
        
        return {
            'user_message': {
                'role': user_msg.role.value,
                'content': user_msg.content,
                'timestamp': user_msg.timestamp.isoformat()
            },
            'assistant_response': {
                'role': assistant_msg.role.value,
                'content': assistant_msg.content,
                'timestamp': assistant_msg.timestamp.isoformat()
            }
        }
    
    def _apply_summarization(self, dialog: Dialog) -> None:
        old_messages = dialog.get_messages_for_summary()
        if not old_messages:
            return
        
        print(f"[SUMMARIZE] Создание саммари для {len(old_messages)} сообщений")
        summary = self._llm_service.create_summary(old_messages)
        dialog.replace_history_with_summary(summary)
        print(f"[SUMMARIZE] Саммари создано, осталось {len(dialog.messages)} сообщений")


class GetDialogHistoryUseCase:
    """UC: Получение истории диалога"""
    
    def __init__(self, dialog_repo: IDialogRepository):
        self._dialog_repo = dialog_repo
    
    def execute(self, dialog_id: str) -> dict:
        """
        Получить полную историю диалога.
        
        Args:
            dialog_id: ID диалога
        
        Returns:
            Данные диалога с историей сообщений
        
        Raises:
            ValueError: Диалог не найден
        """
        dialog = self._dialog_repo.get_by_id(dialog_id)
        if not dialog:
            raise ValueError(f"Диалог {dialog_id} не найден")
        
        return {
            'id': dialog.id,
            'scenario': {
                'id': dialog.scenario.id,
                'title': dialog.scenario.title,
                'description': dialog.scenario.description
            },
            'messages': [
                {
                    'role': msg.role.value,
                    'content': msg.content,
                    'timestamp': msg.timestamp.isoformat()
                }
                for msg in dialog.messages
            ],
            'total_tokens': dialog.total_tokens,
            'created_at': dialog.created_at.isoformat(),
            'updated_at': dialog.updated_at.isoformat()
        }


class ListScenariosUseCase:
    """UC: Список доступных сценариев"""
    
    def __init__(self, scenario_repo: IScenarioRepository):
        self._scenario_repo = scenario_repo
    
    def execute(self) -> List[dict]:
        """
        Получить список всех сценариев.
        
        Returns:
            Список сценариев
        """
        scenarios = self._scenario_repo.list_all()
        return [
            {
                'id': s.id,
                'title': s.title,
                'description': s.description
            }
            for s in scenarios
        ]