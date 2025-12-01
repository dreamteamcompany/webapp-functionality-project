'''
Business: Progress tracking API - manage user progress in courses and trainers
Args: event with httpMethod, body, headers; context with request_id
Returns: HTTP response with progress data or operation results
'''

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def get_user_id_from_headers(headers: Dict[str, str]) -> Optional[int]:
    user_id = headers.get('x-user-id') or headers.get('X-User-Id')
    return int(user_id) if user_id else None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    headers: Dict[str, str] = event.get('headers', {})
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    # Check authentication
    user_id = get_user_id_from_headers(headers)
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        query_params = event.get('queryStringParameters') or {}
        progress_type = query_params.get('type', 'course')  # 'course' or 'trainer'
        
        # GET /progress - Get user progress
        if method == 'GET':
            target_user_id = query_params.get('user_id', user_id)
            
            if progress_type == 'course':
                cur.execute('''
                    SELECT cp.*, c.title, c.description, c.duration_hours
                    FROM t_p66738329_webapp_functionality.course_progress cp
                    INNER JOIN t_p66738329_webapp_functionality.courses c ON c.id = cp.course_id
                    WHERE cp.user_id = %s
                    ORDER BY cp.updated_at DESC
                ''', (target_user_id,))
            else:
                cur.execute('''
                    SELECT tp.*, t.title, t.description, t.difficulty_level
                    FROM t_p66738329_webapp_functionality.trainer_progress tp
                    INNER JOIN t_p66738329_webapp_functionality.trainers t ON t.id = tp.trainer_id
                    WHERE tp.user_id = %s
                    ORDER BY tp.updated_at DESC
                ''', (target_user_id,))
            
            progress = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(p) for p in progress], default=str)
            }
        
        # POST /progress - Start course/trainer
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            item_id = body.get('item_id')
            
            if not item_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'item_id is required'})
                }
            
            if progress_type == 'course':
                # Check if already started
                cur.execute('''
                    SELECT id FROM t_p66738329_webapp_functionality.course_progress
                    WHERE user_id = %s AND course_id = %s
                ''', (user_id, item_id))
                
                existing = cur.fetchone()
                if existing:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Course already started'})
                    }
                
                cur.execute('''
                    INSERT INTO t_p66738329_webapp_functionality.course_progress
                    (user_id, course_id, status, progress_percentage)
                    VALUES (%s, %s, 'В процессе', 0)
                    RETURNING *
                ''', (user_id, item_id))
            else:
                # Check if already started
                cur.execute('''
                    SELECT id FROM t_p66738329_webapp_functionality.trainer_progress
                    WHERE user_id = %s AND trainer_id = %s
                ''', (user_id, item_id))
                
                existing = cur.fetchone()
                if existing:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Trainer already started'})
                    }
                
                cur.execute('''
                    INSERT INTO t_p66738329_webapp_functionality.trainer_progress
                    (user_id, trainer_id, status, score)
                    VALUES (%s, %s, 'В процессе', 0)
                    RETURNING *
                ''', (user_id, item_id))
            
            progress = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(progress), default=str)
            }
        
        # PUT /progress - Update progress
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            progress_id = body.get('id')
            
            if not progress_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Progress ID is required'})
                }
            
            if progress_type == 'course':
                updates = []
                params = []
                
                if 'progress_percentage' in body:
                    updates.append('progress_percentage = %s')
                    params.append(body['progress_percentage'])
                
                if 'status' in body:
                    updates.append('status = %s')
                    params.append(body['status'])
                
                if 'completed_at' in body:
                    updates.append('completed_at = NOW()')
                
                updates.append('updated_at = NOW()')
                params.append(progress_id)
                params.append(user_id)
                
                cur.execute(f'''
                    UPDATE t_p66738329_webapp_functionality.course_progress
                    SET {', '.join(updates)}
                    WHERE id = %s AND user_id = %s
                    RETURNING *
                ''', tuple(params))
            else:
                updates = []
                params = []
                
                if 'score' in body:
                    updates.append('score = %s')
                    params.append(body['score'])
                
                if 'status' in body:
                    updates.append('status = %s')
                    params.append(body['status'])
                
                if 'completed_at' in body:
                    updates.append('completed_at = NOW()')
                
                updates.append('updated_at = NOW()')
                params.append(progress_id)
                params.append(user_id)
                
                cur.execute(f'''
                    UPDATE t_p66738329_webapp_functionality.trainer_progress
                    SET {', '.join(updates)}
                    WHERE id = %s AND user_id = %s
                    RETURNING *
                ''', tuple(params))
            
            progress = cur.fetchone()
            
            if not progress:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Progress not found or access denied'})
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(progress), default=str)
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
        
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        cur.close()
        conn.close()
