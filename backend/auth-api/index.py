import json

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
    'Content-Type': 'application/json'
}

def handler(event, context):
    """Временный API endpoint для авторизации"""
    method = event.get('httpMethod', 'GET')
    
    # Handle CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': '',
            'isBase64Encoded': False
        }
    
    # Simple login response
    if method == 'POST':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'session_token': 'test-session-token-123',
                'user': {
                    'id': 1,
                    'username': 'admin',
                    'email': 'admin@example.com',
                    'full_name': 'Administrator',
                    'role_id': 1
                }
            }),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': CORS_HEADERS,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
