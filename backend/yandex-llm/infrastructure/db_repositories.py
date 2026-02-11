"""
Infrastructure: репозитории для работы с PostgreSQL.
Реализация интерфейсов IDialogRepository и IScenarioRepository.
"""
import os
import json
import psycopg2
from typing import List, Optional
from datetime import datetime

from domain.entities import Dialog, Scenario, Message, MessageRole
from domain.interfaces import IDialogRepository, IScenarioRepository


DATABASE_URL = os.environ.get('DATABASE_URL', '')
SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')


class PostgresDialogRepository(IDialogRepository):
    """Репозиторий диалогов в PostgreSQL"""
    
    def __init__(self):
        self.db_url = DATABASE_URL
        self.schema = SCHEMA
    
    def _get_connection(self):
        conn = psycopg2.connect(self.db_url)
        with conn.cursor() as cur:
            cur.execute(f"SET search_path TO {self.schema}")
        return conn
    
    def save(self, dialog: Dialog) -> None:
        """Сохранить диалог (insert or update)"""
        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                # Сериализуем сообщения
                messages_json = json.dumps([
                    {
                        'role': msg.role.value,
                        'content': msg.content,
                        'timestamp': msg.timestamp.isoformat(),
                        'token_count': msg.token_count
                    }
                    for msg in dialog.messages
                ])
                
                # Сериализуем сценарий
                scenario_json = json.dumps({
                    'id': dialog.scenario.id,
                    'title': dialog.scenario.title,
                    'description': dialog.scenario.description,
                    'system_prompt': dialog.scenario.system_prompt,
                    'max_tokens': dialog.scenario.max_tokens
                })
                
                # Upsert
                cur.execute(f"""
                    INSERT INTO {self.schema}.training_dialogs 
                    (id, scenario, messages, total_tokens, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        messages = EXCLUDED.messages,
                        total_tokens = EXCLUDED.total_tokens,
                        updated_at = EXCLUDED.updated_at
                """, (
                    dialog.id,
                    scenario_json,
                    messages_json,
                    dialog.total_tokens,
                    dialog.created_at,
                    dialog.updated_at
                ))
                conn.commit()
        finally:
            conn.close()
    
    def get_by_id(self, dialog_id: str) -> Optional[Dialog]:
        """Получить диалог по ID"""
        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(f"""
                    SELECT id, scenario, messages, total_tokens, created_at, updated_at
                    FROM {self.schema}.training_dialogs
                    WHERE id = %s
                """, (dialog_id,))
                
                row = cur.fetchone()
                if not row:
                    return None
                
                # Десериализация
                scenario_data = json.loads(row[1])
                scenario = Scenario(**scenario_data)
                
                messages_data = json.loads(row[2])
                messages = [
                    Message(
                        role=MessageRole(msg['role']),
                        content=msg['content'],
                        timestamp=datetime.fromisoformat(msg['timestamp']),
                        token_count=msg['token_count']
                    )
                    for msg in messages_data
                ]
                
                dialog = Dialog(
                    id=row[0],
                    scenario=scenario,
                    messages=messages,
                    total_tokens=row[3],
                    created_at=row[4],
                    updated_at=row[5]
                )
                
                return dialog
        finally:
            conn.close()
    
    def list_by_user(self, user_id: str) -> List[Dialog]:
        """Список диалогов пользователя (пока не используется)"""
        return []


class PostgresScenarioRepository(IScenarioRepository):
    """Репозиторий сценариев в PostgreSQL"""
    
    def __init__(self):
        self.db_url = DATABASE_URL
        self.schema = SCHEMA
    
    def _get_connection(self):
        conn = psycopg2.connect(self.db_url)
        with conn.cursor() as cur:
            cur.execute(f"SET search_path TO {self.schema}")
        return conn
    
    def get_by_id(self, scenario_id: str) -> Optional[Scenario]:
        """Получить сценарий по ID"""
        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(f"""
                    SELECT id, title, description, system_prompt, max_tokens
                    FROM {self.schema}.training_scenarios
                    WHERE id = %s
                """, (scenario_id,))
                
                row = cur.fetchone()
                if not row:
                    return None
                
                return Scenario(
                    id=row[0],
                    title=row[1],
                    description=row[2],
                    system_prompt=row[3],
                    max_tokens=row[4]
                )
        finally:
            conn.close()
    
    def list_all(self) -> List[Scenario]:
        """Все доступные сценарии"""
        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(f"""
                    SELECT id, title, description, system_prompt, max_tokens
                    FROM {self.schema}.training_scenarios
                    ORDER BY title
                """)
                
                rows = cur.fetchall()
                return [
                    Scenario(
                        id=row[0],
                        title=row[1],
                        description=row[2],
                        system_prompt=row[3],
                        max_tokens=row[4]
                    )
                    for row in rows
                ]
        finally:
            conn.close()