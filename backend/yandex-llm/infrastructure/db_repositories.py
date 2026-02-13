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


def _get_connection():
    return psycopg2.connect(DATABASE_URL)


def _escape_str(value: str) -> str:
    return value.replace("'", "''")


class PostgresDialogRepository(IDialogRepository):
    """Репозиторий диалогов в PostgreSQL"""
    
    def __init__(self):
        self.table = f"{SCHEMA}.training_dialogs"
    
    def save(self, dialog: Dialog) -> None:
        conn = _get_connection()
        try:
            with conn.cursor() as cur:
                messages_json = json.dumps([
                    {
                        'role': msg.role.value,
                        'content': msg.content,
                        'timestamp': msg.timestamp.isoformat(),
                        'token_count': msg.token_count
                    }
                    for msg in dialog.messages
                ])
                
                scenario_json = json.dumps({
                    'id': dialog.scenario.id,
                    'title': dialog.scenario.title,
                    'description': dialog.scenario.description,
                    'system_prompt': dialog.scenario.system_prompt,
                    'max_tokens': dialog.scenario.max_tokens
                })
                
                esc_id = _escape_str(dialog.id)
                esc_scenario = _escape_str(scenario_json)
                esc_messages = _escape_str(messages_json)
                created = dialog.created_at.isoformat()
                updated = dialog.updated_at.isoformat()
                
                cur.execute(f"""
                    INSERT INTO {self.table}
                    (id, scenario, messages, total_tokens, created_at, updated_at)
                    VALUES (
                        '{esc_id}',
                        '{esc_scenario}'::jsonb,
                        '{esc_messages}'::jsonb,
                        {dialog.total_tokens},
                        '{created}'::timestamp,
                        '{updated}'::timestamp
                    )
                    ON CONFLICT (id) DO UPDATE SET
                        messages = EXCLUDED.messages,
                        total_tokens = EXCLUDED.total_tokens,
                        updated_at = EXCLUDED.updated_at
                """)
                conn.commit()
        finally:
            conn.close()
    
    def get_by_id(self, dialog_id: str) -> Optional[Dialog]:
        conn = _get_connection()
        try:
            with conn.cursor() as cur:
                esc_id = _escape_str(dialog_id)
                cur.execute(f"""
                    SELECT id, scenario, messages, total_tokens, created_at, updated_at
                    FROM {self.table}
                    WHERE id = '{esc_id}'
                """)
                
                row = cur.fetchone()
                if not row:
                    return None
                
                scenario_data = row[1] if isinstance(row[1], dict) else json.loads(row[1])
                scenario = Scenario(**scenario_data)
                
                messages_data = row[2] if isinstance(row[2], list) else json.loads(row[2])
                messages = [
                    Message(
                        role=MessageRole(msg['role']),
                        content=msg['content'],
                        timestamp=datetime.fromisoformat(msg['timestamp']),
                        token_count=msg.get('token_count', 0)
                    )
                    for msg in messages_data
                ]
                
                return Dialog(
                    id=row[0],
                    scenario=scenario,
                    messages=messages,
                    total_tokens=row[3] or 0,
                    created_at=row[4],
                    updated_at=row[5]
                )
        finally:
            conn.close()
    
    def list_by_user(self, user_id: str) -> List[Dialog]:
        return []


class PostgresScenarioRepository(IScenarioRepository):
    """Репозиторий сценариев в PostgreSQL"""
    
    def __init__(self):
        self.table = f"{SCHEMA}.training_scenarios"
    
    def get_by_id(self, scenario_id: str) -> Optional[Scenario]:
        conn = _get_connection()
        try:
            with conn.cursor() as cur:
                esc_id = _escape_str(scenario_id)
                cur.execute(f"""
                    SELECT id, title, description, system_prompt, max_tokens
                    FROM {self.table}
                    WHERE id = '{esc_id}'
                """)
                
                row = cur.fetchone()
                if not row:
                    return None
                
                return Scenario(
                    id=row[0],
                    title=row[1],
                    description=row[2],
                    system_prompt=row[3],
                    max_tokens=row[4] or 8000
                )
        finally:
            conn.close()
    
    def list_all(self) -> List[Scenario]:
        conn = _get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(f"""
                    SELECT id, title, description, system_prompt, max_tokens
                    FROM {self.table}
                    ORDER BY title
                """)
                
                rows = cur.fetchall()
                return [
                    Scenario(
                        id=row[0],
                        title=row[1],
                        description=row[2],
                        system_prompt=row[3],
                        max_tokens=row[4] or 8000
                    )
                    for row in rows
                ]
        finally:
            conn.close()