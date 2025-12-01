'''
Business: Courses management API - CRUD operations for training courses
Args: event with httpMethod, body, headers; context with request_id
Returns: HTTP response with courses data or operation results
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
        # GET /courses - Get all courses or filtered by department
        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            department_id = query_params.get('department_id')
            
            if department_id:
                cur.execute('''
                    SELECT c.*, 
                           json_agg(json_build_object('id', d.id, 'name', d.name)) as departments
                    FROM t_p66738329_webapp_functionality.courses c
                    LEFT JOIN t_p66738329_webapp_functionality.course_departments cd ON cd.course_id = c.id
                    LEFT JOIN t_p66738329_webapp_functionality.departments d ON d.id = cd.department_id
                    WHERE c.is_active = true AND cd.department_id = %s
                    GROUP BY c.id
                    ORDER BY c.created_at DESC
                ''', (department_id,))
            else:
                cur.execute('''
                    SELECT c.*, 
                           json_agg(json_build_object('id', d.id, 'name', d.name)) FILTER (WHERE d.id IS NOT NULL) as departments
                    FROM t_p66738329_webapp_functionality.courses c
                    LEFT JOIN t_p66738329_webapp_functionality.course_departments cd ON cd.course_id = c.id
                    LEFT JOIN t_p66738329_webapp_functionality.departments d ON d.id = cd.department_id
                    WHERE c.is_active = true
                    GROUP BY c.id
                    ORDER BY c.created_at DESC
                ''')
            
            courses = cur.fetchall()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(course) for course in courses], default=str)
            }
        
        # POST /courses - Create new course
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            title = body.get('title')
            description = body.get('description', '')
            content = body.get('content', '')
            duration_hours = body.get('duration_hours', 0)
            department_ids = body.get('department_ids', [])
            
            if not title:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Title is required'})
                }
            
            # Create course
            cur.execute('''
                INSERT INTO t_p66738329_webapp_functionality.courses 
                (title, description, content, duration_hours, created_by)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, title, description, content, duration_hours, is_active, created_at
            ''', (title, description, content, duration_hours, user_id))
            
            course = cur.fetchone()
            course_id = course['id']
            
            # Link to departments
            if department_ids:
                for dept_id in department_ids:
                    cur.execute('''
                        INSERT INTO t_p66738329_webapp_functionality.course_departments 
                        (course_id, department_id)
                        VALUES (%s, %s)
                    ''', (course_id, dept_id))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(course), default=str)
            }
        
        # PUT /courses - Update course
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            course_id = body.get('id')
            
            if not course_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Course ID is required'})
                }
            
            # Update course
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
            if 'duration_hours' in body:
                updates.append('duration_hours = %s')
                params.append(body['duration_hours'])
            if 'is_active' in body:
                updates.append('is_active = %s')
                params.append(body['is_active'])
            
            updates.append('updated_at = NOW()')
            params.append(course_id)
            
            cur.execute(f'''
                UPDATE t_p66738329_webapp_functionality.courses
                SET {', '.join(updates)}
                WHERE id = %s
                RETURNING id, title, description, content, duration_hours, is_active, updated_at
            ''', tuple(params))
            
            course = cur.fetchone()
            
            # Update departments if provided
            if 'department_ids' in body:
                cur.execute('''
                    DELETE FROM t_p66738329_webapp_functionality.course_departments
                    WHERE course_id = %s
                ''', (course_id,))
                
                for dept_id in body['department_ids']:
                    cur.execute('''
                        INSERT INTO t_p66738329_webapp_functionality.course_departments 
                        (course_id, department_id)
                        VALUES (%s, %s)
                    ''', (course_id, dept_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(course), default=str)
            }
        
        # DELETE /courses - Deactivate course
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters') or {}
            course_id = query_params.get('id')
            
            if not course_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Course ID is required'})
                }
            
            cur.execute('''
                UPDATE t_p66738329_webapp_functionality.courses
                SET is_active = false, updated_at = NOW()
                WHERE id = %s
                RETURNING id
            ''', (course_id,))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Course deactivated'})
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
