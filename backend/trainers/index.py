'''
Business: Trainers management API - CRUD operations for practical simulators
Args: event with httpMethod, body, headers; context with request_id
Returns: HTTP response with trainers data or operation results
'''

import json
import os
from typing import Dict, Any, Optional, List
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
        # GET /trainers - Get all trainers or filtered by department/difficulty
        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            department_id = query_params.get('department_id')
            difficulty = query_params.get('difficulty')
            
            base_query = '''
                SELECT t.*, 
                       json_agg(json_build_object('id', d.id, 'name', d.name)) FILTER (WHERE d.id IS NOT NULL) as departments
                FROM t_p66738329_webapp_functionality.trainers t
                LEFT JOIN t_p66738329_webapp_functionality.trainer_departments td ON td.trainer_id = t.id
                LEFT JOIN t_p66738329_webapp_functionality.departments d ON d.id = td.department_id
                WHERE t.is_active = true
            '''
            
            conditions = []
            params = []
            
            if department_id:
                conditions.append('td.department_id = %s')
                params.append(department_id)
            
            if difficulty:
                conditions.append('t.difficulty_level = %s')
                params.append(difficulty)
            
            if conditions:
                base_query += ' AND ' + ' AND '.join(conditions)
            
            base_query += ' GROUP BY t.id ORDER BY t.created_at DESC'
            
            cur.execute(base_query, tuple(params))
            trainers = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(trainer) for trainer in trainers], default=str)
            }
        
        # POST /trainers - Create new trainer
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            title = body.get('title')
            description = body.get('description', '')
            content = body.get('content', '')
            difficulty_level = body.get('difficulty_level', 'Начальный')
            department_ids = body.get('department_ids', [])
            
            if not title:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Title is required'})
                }
            
            # Validate difficulty level
            valid_levels = ['Начальный', 'Средний', 'Продвинутый']
            if difficulty_level not in valid_levels:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Invalid difficulty level. Must be one of: {", ".join(valid_levels)}'})
                }
            
            # Create trainer
            cur.execute('''
                INSERT INTO t_p66738329_webapp_functionality.trainers 
                (title, description, content, difficulty_level, created_by)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, title, description, content, difficulty_level, is_active, created_at
            ''', (title, description, content, difficulty_level, user_id))
            
            trainer = cur.fetchone()
            trainer_id = trainer['id']
            
            # Link to departments
            if department_ids:
                for dept_id in department_ids:
                    cur.execute('''
                        INSERT INTO t_p66738329_webapp_functionality.trainer_departments 
                        (trainer_id, department_id)
                        VALUES (%s, %s)
                    ''', (trainer_id, dept_id))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(trainer), default=str)
            }
        
        # PUT /trainers - Update trainer
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            trainer_id = body.get('id')
            
            if not trainer_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Trainer ID is required'})
                }
            
            # Update trainer
            updates = []
            params = []
            
            if 'title' in body:
                updates.append('title = %s')
                params.append(body['title'])
            if 'description' in body:
                updates.append('description = %s')
                params.append(body['description'])
            if 'content' in body:
                updates.append('content = %s')
                params.append(body['content'])
            if 'difficulty_level' in body:
                valid_levels = ['Начальный', 'Средний', 'Продвинутый']
                if body['difficulty_level'] not in valid_levels:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': f'Invalid difficulty level. Must be one of: {", ".join(valid_levels)}'})
                    }
                updates.append('difficulty_level = %s')
                params.append(body['difficulty_level'])
            if 'is_active' in body:
                updates.append('is_active = %s')
                params.append(body['is_active'])
            
            updates.append('updated_at = NOW()')
            params.append(trainer_id)
            
            cur.execute(f'''
                UPDATE t_p66738329_webapp_functionality.trainers
                SET {', '.join(updates)}
                WHERE id = %s
                RETURNING id, title, description, content, difficulty_level, is_active, updated_at
            ''', tuple(params))
            
            trainer = cur.fetchone()
            
            # Update departments if provided
            if 'department_ids' in body:
                cur.execute('''
                    DELETE FROM t_p66738329_webapp_functionality.trainer_departments
                    WHERE trainer_id = %s
                ''', (trainer_id,))
                
                for dept_id in body['department_ids']:
                    cur.execute('''
                        INSERT INTO t_p66738329_webapp_functionality.trainer_departments 
                        (trainer_id, department_id)
                        VALUES (%s, %s)
                    ''', (trainer_id, dept_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(trainer), default=str)
            }
        
        # DELETE /trainers - Deactivate trainer
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters') or {}
            trainer_id = query_params.get('id')
            
            if not trainer_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Trainer ID is required'})
                }
            
            cur.execute('''
                UPDATE t_p66738329_webapp_functionality.trainers
                SET is_active = false, updated_at = NOW()
                WHERE id = %s
                RETURNING id
            ''', (trainer_id,))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Trainer deactivated'})
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
