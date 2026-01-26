import os
import json
import psycopg2
import bcrypt
import secrets
from datetime import datetime, timedelta

DATABASE_URL = os.environ.get('DATABASE_URL', '')
SEARCH_PATH = 't_p66738329_webapp_functionality'

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
    'Content-Type': 'application/json'
}

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def handler(event, context):
    """API для авторизации с поддержкой БД"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        try:
            body_str = event.get('body') or '{}'
            body = json.loads(body_str) if body_str else {}
            action = body.get('action', 'login')
            
            headers = event.get('headers', {})
            headers_lower = {k.lower(): v for k, v in headers.items()}
            session_token = headers_lower.get('x-session-token', '')
            
            # Login action
            if action == 'login':
                username = body.get('username', '')
                password = body.get('password', '')
                
                if not username or not password:
                    return {
                        'statusCode': 400,
                        'headers': CORS_HEADERS,
                        'body': json.dumps({'error': 'Логин и пароль обязательны'}),
                        'isBase64Encoded': False
                    }
                
                conn = get_db_connection()
                try:
                    with conn.cursor() as cur:
                        cur.execute(f"""
                            SELECT id, password_hash, full_name, email, role_id, is_blocked
                            FROM {SEARCH_PATH}.users
                            WHERE username = '{username}'
                        """)
                        user = cur.fetchone()
                        
                        if not user:
                            return {
                                'statusCode': 401,
                                'headers': CORS_HEADERS,
                                'body': json.dumps({'error': 'Неверный логин или пароль'}),
                                'isBase64Encoded': False
                            }
                        
                        user_id, password_hash, full_name, email, role_id, is_blocked = user
                        
                        if is_blocked:
                            return {
                                'statusCode': 403,
                                'headers': CORS_HEADERS,
                                'body': json.dumps({'error': 'Пользователь заблокирован'}),
                                'isBase64Encoded': False
                            }
                        
                        if not bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8')):
                            return {
                                'statusCode': 401,
                                'headers': CORS_HEADERS,
                                'body': json.dumps({'error': 'Неверный логин или пароль'}),
                                'isBase64Encoded': False
                            }
                        
                        new_session_token = secrets.token_urlsafe(32)
                        expires_at = datetime.now() + timedelta(days=7)
                        
                        cur.execute(f"""
                            INSERT INTO {SEARCH_PATH}.user_sessions (user_id, session_token, expires_at, ip_address)
                            VALUES ({user_id}, '{new_session_token}', '{expires_at}', '0.0.0.0')
                        """)
                        
                        cur.execute(f"UPDATE {SEARCH_PATH}.users SET last_login = NOW() WHERE id = {user_id}")
                        conn.commit()
                        
                        return {
                            'statusCode': 200,
                            'headers': CORS_HEADERS,
                            'body': json.dumps({
                                'session_token': new_session_token,
                                'user': {
                                    'id': user_id,
                                    'username': username,
                                    'full_name': full_name,
                                    'email': email,
                                    'role_id': role_id,
                                    'role_name': 'Администратор' if role_id == 1 else 'Сотрудник'
                                },
                                'permissions': []
                            }),
                            'isBase64Encoded': False
                        }
                finally:
                    conn.close()
            
            # Validate action
            elif action == 'validate':
                if not session_token:
                    return {
                        'statusCode': 401,
                        'headers': CORS_HEADERS,
                        'body': json.dumps({'valid': False, 'error': 'Нет токена сессии'}),
                        'isBase64Encoded': False
                    }
                
                conn = get_db_connection()
                try:
                    with conn.cursor() as cur:
                        cur.execute(f"""
                            SELECT us.user_id, u.username, u.email, u.full_name, u.role_id, u.is_blocked
                            FROM {SEARCH_PATH}.user_sessions us
                            JOIN {SEARCH_PATH}.users u ON us.user_id = u.id
                            WHERE us.session_token = '{session_token}'
                            AND us.expires_at > NOW()
                        """)
                        result = cur.fetchone()
                        
                        if not result:
                            return {
                                'statusCode': 401,
                                'headers': CORS_HEADERS,
                                'body': json.dumps({'valid': False, 'error': 'Сессия истекла'}),
                                'isBase64Encoded': False
                            }
                        
                        user_id, username, email, full_name, role_id, is_blocked = result
                        
                        if is_blocked:
                            return {
                                'statusCode': 403,
                                'headers': CORS_HEADERS,
                                'body': json.dumps({'valid': False, 'error': 'Пользователь заблокирован'}),
                                'isBase64Encoded': False
                            }
                        
                        return {
                            'statusCode': 200,
                            'headers': CORS_HEADERS,
                            'body': json.dumps({
                                'valid': True,
                                'user': {
                                    'id': user_id,
                                    'username': username,
                                    'email': email,
                                    'full_name': full_name,
                                    'role_id': role_id,
                                    'role_name': 'Администратор' if role_id == 1 else 'Сотрудник'
                                },
                                'permissions': []
                            }),
                            'isBase64Encoded': False
                        }
                finally:
                    conn.close()
            
            # Logout action
            elif action == 'logout':
                if not session_token:
                    return {
                        'statusCode': 200,
                        'headers': CORS_HEADERS,
                        'body': json.dumps({'message': 'Выход выполнен'}),
                        'isBase64Encoded': False
                    }
                
                conn = get_db_connection()
                try:
                    with conn.cursor() as cur:
                        cur.execute(f"""
                            UPDATE {SEARCH_PATH}.user_sessions 
                            SET expires_at = NOW() 
                            WHERE session_token = '{session_token}'
                        """)
                        conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': CORS_HEADERS,
                        'body': json.dumps({'message': 'Выход выполнен'}),
                        'isBase64Encoded': False
                    }
                finally:
                    conn.close()
            
            else:
                return {
                    'statusCode': 400,
                    'headers': CORS_HEADERS,
                    'body': json.dumps({'error': 'Неизвестное действие'}),
                    'isBase64Encoded': False
                }
                
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': CORS_HEADERS,
        'body': json.dumps({'error': 'Метод не поддерживается'}),
        'isBase64Encoded': False
    }
