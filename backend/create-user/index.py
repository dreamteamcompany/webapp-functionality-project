import bcrypt
import json

def handler(event, context):
    """Генерация хеша пароля для нового пользователя"""
    body = json.loads(event.get('body', '{}'))
    password = body.get('password', 'newuser123')
    
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'password': password,
            'hash': password_hash
        }),
        'isBase64Encoded': False
    }
