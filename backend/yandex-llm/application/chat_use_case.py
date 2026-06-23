"""
Application слой: stateless-чат с ИИ-пациентом для пользовательских сценариев.
История диалога хранится на клиенте (localStorage), сервер не сохраняет состояние.
"""
from typing import List, Dict

from domain.interfaces import ILLMService
from domain.patient_persona import PatientPersona, PatientPromptBuilder


class ChatWithPatientUseCase:
    """UC: один ход ролевого диалога без хранения состояния на сервере"""

    MAX_HISTORY_MESSAGES = 20

    def __init__(self, llm_service: ILLMService):
        self._llm_service = llm_service
        self._prompt_builder = PatientPromptBuilder()

    def execute(
        self,
        persona: PatientPersona,
        history: List[Dict[str, str]],
        user_message: str
    ) -> dict:
        """
        Сгенерировать ответ пациента.

        Args:
            persona: Описание роли пациента
            history: Предыдущие реплики [{'role': 'user|assistant', 'content': '...'}]
            user_message: Новая реплика обучаемого

        Returns:
            {'message': str}
        """
        messages = self._build_messages(persona, history, user_message)
        llm_response = self._llm_service.generate_response(messages)

        return {'message': llm_response['text'].strip()}

    def _build_messages(
        self,
        persona: PatientPersona,
        history: List[Dict[str, str]],
        user_message: str
    ) -> List[Dict[str, str]]:
        system_prompt = self._prompt_builder.build(persona)
        messages = [{'role': 'system', 'text': system_prompt}]

        for item in self._trim_history(history):
            role = 'assistant' if item.get('role') == 'assistant' else 'user'
            content = item.get('content', '').strip()
            if content:
                messages.append({'role': role, 'text': content})

        messages.append({'role': 'user', 'text': user_message})
        return messages

    def _trim_history(self, history: List[Dict[str, str]]) -> List[Dict[str, str]]:
        if len(history) <= self.MAX_HISTORY_MESSAGES:
            return history
        return history[-self.MAX_HISTORY_MESSAGES:]
