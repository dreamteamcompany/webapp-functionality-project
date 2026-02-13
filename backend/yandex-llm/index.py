"""
Presentation слой: HTTP API для системы тренировок.
Точка входа для Cloud Function.
"""
import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))

from application.use_cases import (
    StartTrainingUseCase,
    SendMessageUseCase,
    GetDialogHistoryUseCase,
    ListScenariosUseCase
)
from infrastructure.db_repositories import (
    PostgresDialogRepository,
    PostgresScenarioRepository
)
from infrastructure.yandex_llm_client import YandexLLMClient
from infrastructure.rate_limiter import RateLimiter


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
}

rate_limiter = RateLimiter(max_requests=20, window_seconds=60)


def get_client_id(event: dict) -> str:
    """Получить идентификатор клиента для rate limiting"""
    headers = event.get('headers', {})
    headers_lower = {k.lower(): v for k, v in headers.items()}
    
    x_forwarded = headers_lower.get('x-forwarded-for', '')
    if x_forwarded:
        return x_forwarded.split(',')[0].strip()
    
    request_context = event.get('requestContext', {})
    identity = request_context.get('identity', {})
    return identity.get('sourceIp', 'unknown')


def handler(event: dict, context):
    """
    API для системы тренировок диалогов с Yandex LLM.
    
    Endpoints:
    - GET /scenarios - список сценариев
    - POST /training/start - начать тренировку
    - POST /training/message - отправить сообщение
    - GET /training/history?dialog_id=... - история диалога
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': '',
            'isBase64Encoded': False
        }
    
    print(f"[TRAINING_API] {method} запрос, timestamp: {datetime.now().isoformat()}")
    
    client_id = get_client_id(event)
    
    if not rate_limiter.is_allowed(client_id):
        remaining = rate_limiter.get_remaining(client_id)
        print(f"[TRAINING_API] Rate limit exceeded for {client_id}")
        return {
            'statusCode': 429,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'error': 'Превышен лимит запросов',
                'remaining': remaining
            }),
            'isBase64Encoded': False
        }
    
    try:
        query_params = event.get('queryStringParameters') or {}
        params = event.get('params') or {}
        action = params.get('action', query_params.get('action', ''))
        
        dialog_repo = PostgresDialogRepository()
        scenario_repo = PostgresScenarioRepository()
        
        if method == 'GET':
            if action == 'scenarios':
                use_case = ListScenariosUseCase(scenario_repo)
                scenarios = use_case.execute()
                
                return {
                    'statusCode': 200,
                    'headers': CORS_HEADERS,
                    'body': json.dumps({'scenarios': scenarios}),
                    'isBase64Encoded': False
                }
            
            elif action == 'history':
                dialog_id = query_params.get('dialog_id')
                if not dialog_id:
                    return {
                        'statusCode': 400,
                        'headers': CORS_HEADERS,
                        'body': json.dumps({'error': 'dialog_id обязателен'}),
                        'isBase64Encoded': False
                    }
                
                use_case = GetDialogHistoryUseCase(dialog_repo)
                history = use_case.execute(dialog_id)
                
                return {
                    'statusCode': 200,
                    'headers': CORS_HEADERS,
                    'body': json.dumps(history),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_str = event.get('body') or '{}'
            body = json.loads(body_str)
            
            if action == 'start':
                scenario_id = body.get('scenario_id')
                user_id = body.get('user_id', 'anonymous')
                
                if not scenario_id:
                    return {
                        'statusCode': 400,
                        'headers': CORS_HEADERS,
                        'body': json.dumps({'error': 'scenario_id обязателен'}),
                        'isBase64Encoded': False
                    }
                
                use_case = StartTrainingUseCase(dialog_repo, scenario_repo)
                dialog = use_case.execute(scenario_id, user_id)
                
                print(f"[TRAINING_API] Создан диалог {dialog.id}")
                
                return {
                    'statusCode': 200,
                    'headers': CORS_HEADERS,
                    'body': json.dumps({
                        'dialog_id': dialog.id,
                        'scenario': {
                            'id': dialog.scenario.id,
                            'title': dialog.scenario.title,
                            'description': dialog.scenario.description
                        }
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'message':
                dialog_id = body.get('dialog_id')
                message = body.get('message')
                
                if not dialog_id or not message:
                    return {
                        'statusCode': 400,
                        'headers': CORS_HEADERS,
                        'body': json.dumps({'error': 'dialog_id и message обязательны'}),
                        'isBase64Encoded': False
                    }
                
                print(f"[TRAINING_API] Обработка сообщения для диалога {dialog_id}")
                
                llm_client = YandexLLMClient()
                use_case = SendMessageUseCase(dialog_repo, llm_client)
                result = use_case.execute(dialog_id, message)
                
                print(f"[TRAINING_API] Ответ получен")
                
                return {
                    'statusCode': 200,
                    'headers': CORS_HEADERS,
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 404,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': 'Endpoint не найден'}),
            'isBase64Encoded': False
        }
    
    except ValueError as e:
        print(f"[TRAINING_API] Validation error: {e}")
        return {
            'statusCode': 400,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[TRAINING_API] Unexpected error: {type(e).__name__}: {e}")
        print(f"[TRAINING_API] Traceback:\n{error_trace}")
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': 'Внутренняя ошибка сервера'}),
            'isBase64Encoded': False
        }