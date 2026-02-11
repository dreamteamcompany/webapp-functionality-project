"""
Infrastructure: Rate Limiter для защиты от чрезмерного количества запросов.
"""
import time
from collections import defaultdict
from typing import Dict


class RateLimiter:
    """
    Простой rate limiter на основе sliding window.
    Не требует внешних зависимостей (Redis и т.п.).
    """
    
    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        """
        Args:
            max_requests: Максимум запросов в окне
            window_seconds: Размер окна в секундах
        """
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: Dict[str, list] = defaultdict(list)
    
    def is_allowed(self, client_id: str) -> bool:
        """
        Проверка, разрешён ли запрос для клиента.
        
        Args:
            client_id: Идентификатор клиента (IP, user_id и т.п.)
        
        Returns:
            True если разрешён, False если превышен лимит
        """
        now = time.time()
        
        # Очищаем старые записи
        self._requests[client_id] = [
            ts for ts in self._requests[client_id]
            if now - ts < self.window_seconds
        ]
        
        # Проверяем лимит
        if len(self._requests[client_id]) >= self.max_requests:
            return False
        
        # Добавляем новый запрос
        self._requests[client_id].append(now)
        return True
    
    def get_remaining(self, client_id: str) -> int:
        """Сколько запросов осталось"""
        now = time.time()
        self._requests[client_id] = [
            ts for ts in self._requests[client_id]
            if now - ts < self.window_seconds
        ]
        return max(0, self.max_requests - len(self._requests[client_id]))
    
    def cleanup_old_entries(self):
        """Периодическая очистка старых записей"""
        now = time.time()
        for client_id in list(self._requests.keys()):
            self._requests[client_id] = [
                ts for ts in self._requests[client_id]
                if now - ts < self.window_seconds
            ]
            if not self._requests[client_id]:
                del self._requests[client_id]
