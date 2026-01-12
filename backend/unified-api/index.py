import os
import json
import psycopg2
import bcrypt
import secrets
from datetime import datetime, timedelta
from urllib.parse import parse_qs

# Unified API v2 - handles all business logic (auth, learning, companies, battles)
DATABASE_URL = os.environ.get('DATABASE_URL', '')
SEARCH_PATH = 't_p66738329_webapp_functionality'

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
    'Content-Type': 'application/json'
}

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    with conn.cursor() as cur:
        cur.execute(f"SET search_path TO {SEARCH_PATH}")
    conn.commit()
    return conn

def validate_session(session_token):
    if not session_token:
        return None
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT us.user_id, u.username, u.email, u.full_name, u.role_id, u.is_blocked
                FROM user_sessions us
                JOIN users u ON us.user_id = u.id
                WHERE us.session_token = '{session_token}'
                AND us.expires_at > NOW()
            """)
            result = cur.fetchone()
            if result:
                return {
                    'user_id': result[0],
                    'username': result[1],
                    'email': result[2],
                    'full_name': result[3],
                    'role_id': result[4],
                    'is_blocked': result[5]
                }
    finally:
        conn.close()
    return None

def handle_auth(method, query_params, body, headers):
    action = query_params.get('action', [''])[0]
    
    if action == 'login':
        if method != 'POST':
            return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'})}
        
        username = body.get('username')
        password = body.get('password')
        
        if not username or not password:
            return {'statusCode': 400, 'body': json.dumps({'error': 'Username and password required'})}
        
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(f"""
                    SELECT id, password_hash, full_name, email, role_id, is_blocked
                    FROM users
                    WHERE username = '{username}'
                """)
                user = cur.fetchone()
                
                if not user:
                    return {'statusCode': 401, 'body': json.dumps({'error': 'Invalid credentials'})}
                
                user_id, password_hash, full_name, email, role_id, is_blocked = user
                
                if is_blocked:
                    return {'statusCode': 403, 'body': json.dumps({'error': 'User is blocked'})}
                
                if not bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8')):
                    return {'statusCode': 401, 'body': json.dumps({'error': 'Invalid credentials'})}
                
                session_token = secrets.token_urlsafe(32)
                expires_at = datetime.now() + timedelta(days=7)
                
                cur.execute(f"""
                    INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address)
                    VALUES ({user_id}, '{session_token}', '{expires_at}', '0.0.0.0')
                """)
                
                cur.execute(f"UPDATE users SET last_login = NOW() WHERE id = {user_id}")
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'body': json.dumps({
                        'session_token': session_token,
                        'user': {
                            'id': user_id,
                            'username': username,
                            'full_name': full_name,
                            'email': email,
                            'role_id': role_id
                        }
                    })
                }
        finally:
            conn.close()
    
    elif action == 'logout':
        if method != 'POST':
            return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'})}
        
        session_token = headers.get('x-session-token', '')
        if not session_token:
            return {'statusCode': 401, 'body': json.dumps({'error': 'No session token'})}
        
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM user_sessions WHERE session_token = '{session_token}'")
                conn.commit()
            return {'statusCode': 200, 'body': json.dumps({'message': 'Logged out successfully'})}
        finally:
            conn.close()
    
    elif action == 'validate':
        if method != 'GET':
            return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'})}
        
        session_token = headers.get('x-session-token', '')
        user = validate_session(session_token)
        
        if not user:
            return {'statusCode': 401, 'body': json.dumps({'error': 'Invalid or expired session'})}
        
        return {'statusCode': 200, 'body': json.dumps({'user': user})}
    
    return {'statusCode': 400, 'body': json.dumps({'error': 'Invalid action'})}

def handle_users(method, query_params, body, headers):
    session_token = headers.get('x-session-token', '')
    user = validate_session(session_token)
    
    if not user:
        return {'statusCode': 401, 'body': json.dumps({'error': 'Unauthorized'})}
    
    conn = get_db_connection()
    try:
        if method == 'GET':
            user_id = query_params.get('id', [''])[0]
            
            if user_id:
                with conn.cursor() as cur:
                    cur.execute(f"""
                        SELECT id, username, email, full_name, role_id, is_blocked, company_id, department_id,
                               created_at, updated_at, last_login
                        FROM users WHERE id = {user_id}
                    """)
                    result = cur.fetchone()
                    if not result:
                        return {'statusCode': 404, 'body': json.dumps({'error': 'User not found'})}
                    
                    return {
                        'statusCode': 200,
                        'body': json.dumps({
                            'id': result[0], 'username': result[1], 'email': result[2],
                            'full_name': result[3], 'role_id': result[4], 'is_blocked': result[5],
                            'company_id': result[6], 'department_id': result[7],
                            'created_at': str(result[8]), 'updated_at': str(result[9]),
                            'last_login': str(result[10]) if result[10] else None
                        })
                    }
            else:
                with conn.cursor() as cur:
                    cur.execute("""
                        SELECT id, username, email, full_name, role_id, is_blocked, company_id, department_id,
                               created_at, last_login
                        FROM users ORDER BY created_at DESC
                    """)
                    users = []
                    for row in cur.fetchall():
                        users.append({
                            'id': row[0], 'username': row[1], 'email': row[2],
                            'full_name': row[3], 'role_id': row[4], 'is_blocked': row[5],
                            'company_id': row[6], 'department_id': row[7],
                            'created_at': str(row[8]), 'last_login': str(row[9]) if row[9] else None
                        })
                    return {'statusCode': 200, 'body': json.dumps(users)}
        
        elif method == 'POST':
            username = body.get('username')
            email = body.get('email')
            password = body.get('password')
            full_name = body.get('full_name')
            role_id = body.get('role_id', 4)
            
            if not all([username, email, password, full_name]):
                return {'statusCode': 400, 'body': json.dumps({'error': 'Missing required fields'})}
            
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            with conn.cursor() as cur:
                cur.execute(f"""
                    INSERT INTO users (username, email, password_hash, full_name, role_id, created_by)
                    VALUES ('{username}', '{email}', '{password_hash}', '{full_name}', {role_id}, {user['user_id']})
                    RETURNING id
                """)
                new_id = cur.fetchone()[0]
                conn.commit()
            
            return {'statusCode': 201, 'body': json.dumps({'id': new_id, 'message': 'User created successfully'})}
        
        elif method == 'PUT':
            user_id = body.get('id')
            if not user_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'User ID required'})}
            
            updates = []
            if 'email' in body:
                updates.append(f"email = '{body['email']}'")
            if 'full_name' in body:
                updates.append(f"full_name = '{body['full_name']}'")
            if 'role_id' in body:
                updates.append(f"role_id = {body['role_id']}")
            if 'is_blocked' in body:
                updates.append(f"is_blocked = {body['is_blocked']}")
            if 'company_id' in body:
                updates.append(f"company_id = {body['company_id']}")
            if 'department_id' in body:
                updates.append(f"department_id = {body['department_id']}")
            if 'password' in body:
                password_hash = bcrypt.hashpw(body['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                updates.append(f"password_hash = '{password_hash}'")
            
            updates.append("updated_at = NOW()")
            
            with conn.cursor() as cur:
                cur.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = {user_id}")
                conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'User updated successfully'})}
        
        elif method == 'DELETE':
            user_id = query_params.get('id', [''])[0]
            if not user_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'User ID required'})}
            
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM users WHERE id = {user_id}")
                conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'User deleted successfully'})}
    
    finally:
        conn.close()
    
    return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'})}

def handle_access_groups(method, query_params, body, headers):
    session_token = headers.get('x-session-token', '')
    user = validate_session(session_token)
    
    if not user:
        return {'statusCode': 401, 'body': json.dumps({'error': 'Unauthorized'})}
    
    conn = get_db_connection()
    try:
        if method == 'GET':
            group_type = query_params.get('type', ['roles'])[0]
            
            if group_type == 'roles':
                with conn.cursor() as cur:
                    cur.execute("SELECT id, name, description, created_at, updated_at FROM roles ORDER BY id")
                    roles = []
                    for row in cur.fetchall():
                        roles.append({
                            'id': row[0], 'name': row[1], 'description': row[2],
                            'created_at': str(row[3]), 'updated_at': str(row[4])
                        })
                    return {'statusCode': 200, 'body': json.dumps(roles)}
            
            elif group_type == 'permissions':
                role_id = query_params.get('role_id', [''])[0]
                with conn.cursor() as cur:
                    if role_id:
                        cur.execute(f"""
                            SELECT p.id, p.code, p.name, p.description, p.category
                            FROM permissions p
                            JOIN role_permissions rp ON p.id = rp.permission_id
                            WHERE rp.role_id = {role_id}
                            ORDER BY p.category, p.code
                        """)
                    else:
                        cur.execute("SELECT id, code, name, description, category FROM permissions ORDER BY category, code")
                    
                    permissions = []
                    for row in cur.fetchall():
                        permissions.append({
                            'id': row[0], 'code': row[1], 'name': row[2],
                            'description': row[3], 'category': row[4]
                        })
                    return {'statusCode': 200, 'body': json.dumps(permissions)}
        
        elif method == 'POST':
            action = query_params.get('action', [''])[0]
            
            if action == 'assign_permissions':
                role_id = body.get('role_id')
                permission_ids = body.get('permission_ids', [])
                
                if not role_id:
                    return {'statusCode': 400, 'body': json.dumps({'error': 'Role ID required'})}
                
                with conn.cursor() as cur:
                    cur.execute(f"DELETE FROM role_permissions WHERE role_id = {role_id}")
                    for perm_id in permission_ids:
                        cur.execute(f"INSERT INTO role_permissions (role_id, permission_id) VALUES ({role_id}, {perm_id})")
                    conn.commit()
                
                return {'statusCode': 200, 'body': json.dumps({'message': 'Permissions assigned successfully'})}
            
            else:
                name = body.get('name')
                description = body.get('description', '')
                
                if not name:
                    return {'statusCode': 400, 'body': json.dumps({'error': 'Name required'})}
                
                with conn.cursor() as cur:
                    cur.execute(f"""
                        INSERT INTO roles (name, description)
                        VALUES ('{name}', '{description}')
                        RETURNING id
                    """)
                    new_id = cur.fetchone()[0]
                    conn.commit()
                
                return {'statusCode': 201, 'body': json.dumps({'id': new_id, 'message': 'Role created successfully'})}
        
        elif method == 'PUT':
            role_id = body.get('id')
            if not role_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Role ID required'})}
            
            updates = []
            if 'name' in body:
                updates.append(f"name = '{body['name']}'")
            if 'description' in body:
                updates.append(f"description = '{body['description']}'")
            updates.append("updated_at = NOW()")
            
            with conn.cursor() as cur:
                cur.execute(f"UPDATE roles SET {', '.join(updates)} WHERE id = {role_id}")
                conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'Role updated successfully'})}
        
        elif method == 'DELETE':
            role_id = query_params.get('id', [''])[0]
            if not role_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Role ID required'})}
            
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM role_permissions WHERE role_id = {role_id}")
                cur.execute(f"DELETE FROM roles WHERE id = {role_id}")
                conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'Role deleted successfully'})}
    
    finally:
        conn.close()
    
    return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'})}

def handle_company(method, query_params, body, headers):
    session_token = headers.get('x-session-token', '')
    user = validate_session(session_token)
    
    if not user:
        return {'statusCode': 401, 'body': json.dumps({'error': 'Unauthorized'})}
    
    conn = get_db_connection()
    try:
        if method == 'GET':
            company_id = query_params.get('id', [''])[0]
            
            if company_id:
                with conn.cursor() as cur:
                    cur.execute(f"""
                        SELECT id, name, description, is_active, created_at, updated_at
                        FROM companies WHERE id = {company_id}
                    """)
                    result = cur.fetchone()
                    if not result:
                        return {'statusCode': 404, 'body': json.dumps({'error': 'Company not found'})}
                    
                    return {
                        'statusCode': 200,
                        'body': json.dumps({
                            'id': result[0], 'name': result[1], 'description': result[2],
                            'is_active': result[3], 'created_at': str(result[4]),
                            'updated_at': str(result[5])
                        })
                    }
            else:
                with conn.cursor() as cur:
                    cur.execute("""
                        SELECT id, name, description, is_active, created_at
                        FROM companies ORDER BY created_at DESC
                    """)
                    companies = []
                    for row in cur.fetchall():
                        companies.append({
                            'id': row[0], 'name': row[1], 'description': row[2],
                            'is_active': row[3], 'created_at': str(row[4])
                        })
                    return {'statusCode': 200, 'body': json.dumps(companies)}
        
        elif method == 'POST':
            name = body.get('name')
            description = body.get('description', '')
            
            if not name:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Name required'})}
            
            with conn.cursor() as cur:
                cur.execute(f"""
                    INSERT INTO companies (name, description)
                    VALUES ('{name}', '{description}')
                    RETURNING id
                """)
                new_id = cur.fetchone()[0]
                conn.commit()
            
            return {'statusCode': 201, 'body': json.dumps({'id': new_id, 'message': 'Company created'})}
        
        elif method == 'PUT':
            company_id = body.get('id')
            if not company_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Company ID required'})}
            
            updates = []
            if 'name' in body:
                updates.append(f"name = '{body['name']}'")
            if 'description' in body:
                updates.append(f"description = '{body['description']}'")
            if 'is_active' in body:
                updates.append(f"is_active = {body['is_active']}")
            updates.append("updated_at = NOW()")
            
            with conn.cursor() as cur:
                cur.execute(f"UPDATE companies SET {', '.join(updates)} WHERE id = {company_id}")
                conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'Company updated'})}
        
        elif method == 'DELETE':
            company_id = query_params.get('id', [''])[0]
            if not company_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Company ID required'})}
            
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM companies WHERE id = {company_id}")
                conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'Company deleted'})}
    
    finally:
        conn.close()
    
    return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'})}

def handle_department(method, query_params, body, headers):
    session_token = headers.get('x-session-token', '')
    user = validate_session(session_token)
    
    if not user:
        return {'statusCode': 401, 'body': json.dumps({'error': 'Unauthorized'})}
    
    conn = get_db_connection()
    try:
        if method == 'GET':
            dept_id = query_params.get('id', [''])[0]
            company_id = query_params.get('company_id', [''])[0]
            
            if dept_id:
                with conn.cursor() as cur:
                    cur.execute(f"""
                        SELECT id, company_id, name, description, is_active, created_at, updated_at
                        FROM departments WHERE id = {dept_id}
                    """)
                    result = cur.fetchone()
                    if not result:
                        return {'statusCode': 404, 'body': json.dumps({'error': 'Department not found'})}
                    
                    return {
                        'statusCode': 200,
                        'body': json.dumps({
                            'id': result[0], 'company_id': result[1], 'name': result[2],
                            'description': result[3], 'is_active': result[4],
                            'created_at': str(result[5]), 'updated_at': str(result[6])
                        })
                    }
            else:
                with conn.cursor() as cur:
                    if company_id:
                        cur.execute(f"""
                            SELECT id, company_id, name, description, is_active, created_at
                            FROM departments WHERE company_id = {company_id} ORDER BY created_at DESC
                        """)
                    else:
                        cur.execute("""
                            SELECT id, company_id, name, description, is_active, created_at
                            FROM departments ORDER BY created_at DESC
                        """)
                    
                    departments = []
                    for row in cur.fetchall():
                        departments.append({
                            'id': row[0], 'company_id': row[1], 'name': row[2],
                            'description': row[3], 'is_active': row[4], 'created_at': str(row[5])
                        })
                    return {'statusCode': 200, 'body': json.dumps(departments)}
        
        elif method == 'POST':
            company_id = body.get('company_id')
            name = body.get('name')
            description = body.get('description', '')
            
            if not company_id or not name:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Company ID and name required'})}
            
            with conn.cursor() as cur:
                cur.execute(f"""
                    INSERT INTO departments (company_id, name, description)
                    VALUES ({company_id}, '{name}', '{description}')
                    RETURNING id
                """)
                new_id = cur.fetchone()[0]
                conn.commit()
            
            return {'statusCode': 201, 'body': json.dumps({'id': new_id, 'message': 'Department created'})}
        
        elif method == 'PUT':
            dept_id = body.get('id')
            if not dept_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Department ID required'})}
            
            updates = []
            if 'name' in body:
                updates.append(f"name = '{body['name']}'")
            if 'description' in body:
                updates.append(f"description = '{body['description']}'")
            if 'is_active' in body:
                updates.append(f"is_active = {body['is_active']}")
            updates.append("updated_at = NOW()")
            
            with conn.cursor() as cur:
                cur.execute(f"UPDATE departments SET {', '.join(updates)} WHERE id = {dept_id}")
                conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'Department updated'})}
        
        elif method == 'DELETE':
            dept_id = query_params.get('id', [''])[0]
            if not dept_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Department ID required'})}
            
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM departments WHERE id = {dept_id}")
                conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'Department deleted'})}
    
    finally:
        conn.close()
    
    return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'})}

def handle_course(method, query_params, body, headers):
    session_token = headers.get('x-session-token', '')
    user = validate_session(session_token)
    
    if not user:
        return {'statusCode': 401, 'body': json.dumps({'error': 'Unauthorized'})}
    
    conn = get_db_connection()
    try:
        if method == 'GET':
            course_id = query_params.get('id', [''])[0]
            
            if course_id:
                with conn.cursor() as cur:
                    cur.execute(f"""
                        SELECT id, title, description, content, duration_hours, is_active,
                               created_by, created_at, updated_at
                        FROM courses WHERE id = {course_id}
                    """)
                    result = cur.fetchone()
                    if not result:
                        return {'statusCode': 404, 'body': json.dumps({'error': 'Course not found'})}
                    
                    return {
                        'statusCode': 200,
                        'body': json.dumps({
                            'id': result[0], 'title': result[1], 'description': result[2],
                            'content': result[3], 'duration_hours': result[4], 'is_active': result[5],
                            'created_by': result[6], 'created_at': str(result[7]),
                            'updated_at': str(result[8])
                        })
                    }
            else:
                with conn.cursor() as cur:
                    cur.execute("""
                        SELECT id, title, description, duration_hours, is_active, created_at
                        FROM courses ORDER BY created_at DESC
                    """)
                    courses = []
                    for row in cur.fetchall():
                        courses.append({
                            'id': row[0], 'title': row[1], 'description': row[2],
                            'duration_hours': row[3], 'is_active': row[4], 'created_at': str(row[5])
                        })
                    return {'statusCode': 200, 'body': json.dumps(courses)}
        
        elif method == 'POST':
            title = body.get('title')
            description = body.get('description', '')
            content = body.get('content', '')
            duration_hours = body.get('duration_hours', 0)
            
            if not title:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Title required'})}
            
            with conn.cursor() as cur:
                cur.execute(f"""
                    INSERT INTO courses (title, description, content, duration_hours, created_by)
                    VALUES ('{title}', '{description}', '{content}', {duration_hours}, {user['user_id']})
                    RETURNING id
                """)
                new_id = cur.fetchone()[0]
                conn.commit()
            
            return {'statusCode': 201, 'body': json.dumps({'id': new_id, 'message': 'Course created'})}
        
        elif method == 'PUT':
            course_id = body.get('id')
            if not course_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Course ID required'})}
            
            updates = []
            if 'title' in body:
                updates.append(f"title = '{body['title']}'")
            if 'description' in body:
                updates.append(f"description = '{body['description']}'")
            if 'content' in body:
                updates.append(f"content = '{body['content']}'")
            if 'duration_hours' in body:
                updates.append(f"duration_hours = {body['duration_hours']}")
            if 'is_active' in body:
                updates.append(f"is_active = {body['is_active']}")
            updates.append("updated_at = NOW()")
            
            with conn.cursor() as cur:
                cur.execute(f"UPDATE courses SET {', '.join(updates)} WHERE id = {course_id}")
                conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'Course updated'})}
        
        elif method == 'DELETE':
            course_id = query_params.get('id', [''])[0]
            if not course_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Course ID required'})}
            
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM courses WHERE id = {course_id}")
                conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'Course deleted'})}
    
    finally:
        conn.close()
    
    return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'})}

def handle_trainer(method, query_params, body, headers):
    session_token = headers.get('x-session-token', '')
    user = validate_session(session_token)
    
    if not user:
        return {'statusCode': 401, 'body': json.dumps({'error': 'Unauthorized'})}
    
    conn = get_db_connection()
    try:
        if method == 'GET':
            trainer_id = query_params.get('id', [''])[0]
            
            if trainer_id:
                with conn.cursor() as cur:
                    cur.execute(f"""
                        SELECT id, title, description, content, difficulty_level, is_active,
                               created_by, created_at, updated_at
                        FROM trainers WHERE id = {trainer_id}
                    """)
                    result = cur.fetchone()
                    if not result:
                        return {'statusCode': 404, 'body': json.dumps({'error': 'Trainer not found'})}
                    
                    return {
                        'statusCode': 200,
                        'body': json.dumps({
                            'id': result[0], 'title': result[1], 'description': result[2],
                            'content': result[3], 'difficulty_level': result[4], 'is_active': result[5],
                            'created_by': result[6], 'created_at': str(result[7]),
                            'updated_at': str(result[8])
                        })
                    }
            else:
                with conn.cursor() as cur:
                    cur.execute("""
                        SELECT id, title, description, difficulty_level, is_active, created_at
                        FROM trainers ORDER BY created_at DESC
                    """)
                    trainers = []
                    for row in cur.fetchall():
                        trainers.append({
                            'id': row[0], 'title': row[1], 'description': row[2],
                            'difficulty_level': row[3], 'is_active': row[4], 'created_at': str(row[5])
                        })
                    return {'statusCode': 200, 'body': json.dumps(trainers)}
        
        elif method == 'POST':
            title = body.get('title')
            description = body.get('description', '')
            content = body.get('content', '')
            difficulty_level = body.get('difficulty_level', 'Начальный')
            
            if not title:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Title required'})}
            
            with conn.cursor() as cur:
                cur.execute(f"""
                    INSERT INTO trainers (title, description, content, difficulty_level, created_by)
                    VALUES ('{title}', '{description}', '{content}', '{difficulty_level}', {user['user_id']})
                    RETURNING id
                """)
                new_id = cur.fetchone()[0]
                conn.commit()
            
            return {'statusCode': 201, 'body': json.dumps({'id': new_id, 'message': 'Trainer created'})}
        
        elif method == 'PUT':
            trainer_id = body.get('id')
            if not trainer_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Trainer ID required'})}
            
            updates = []
            if 'title' in body:
                updates.append(f"title = '{body['title']}'")
            if 'description' in body:
                updates.append(f"description = '{body['description']}'")
            if 'content' in body:
                updates.append(f"content = '{body['content']}'")
            if 'difficulty_level' in body:
                updates.append(f"difficulty_level = '{body['difficulty_level']}'")
            if 'is_active' in body:
                updates.append(f"is_active = {body['is_active']}")
            updates.append("updated_at = NOW()")
            
            with conn.cursor() as cur:
                cur.execute(f"UPDATE trainers SET {', '.join(updates)} WHERE id = {trainer_id}")
                conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'Trainer updated'})}
        
        elif method == 'DELETE':
            trainer_id = query_params.get('id', [''])[0]
            if not trainer_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Trainer ID required'})}
            
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM trainers WHERE id = {trainer_id}")
                conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'Trainer deleted'})}
    
    finally:
        conn.close()
    
    return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'})}

def handle_course_progress(method, query_params, body, headers):
    user_id = headers.get('x-user-id', '')
    if not user_id:
        return {'statusCode': 401, 'body': json.dumps({'error': 'User ID required'})}
    
    conn = get_db_connection()
    try:
        if method == 'GET':
            with conn.cursor() as cur:
                cur.execute(f"""
                    SELECT cp.id, cp.course_id, c.title, cp.status, cp.progress_percentage, cp.started_at
                    FROM course_progress cp
                    JOIN courses c ON cp.course_id = c.id
                    WHERE cp.user_id = {user_id}
                    ORDER BY cp.started_at DESC
                """)
                progress_list = []
                for row in cur.fetchall():
                    progress_list.append({
                        'id': row[0], 'course_id': row[1], 'title': row[2],
                        'status': row[3], 'progress_percentage': row[4],
                        'started_at': str(row[5])
                    })
                return {'statusCode': 200, 'body': json.dumps(progress_list)}
        
        elif method == 'POST':
            item_id = body.get('item_id')
            if not item_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Course ID required'})}
            
            with conn.cursor() as cur:
                cur.execute(f"""
                    INSERT INTO course_progress (user_id, course_id, status, progress_percentage)
                    VALUES ({user_id}, {item_id}, 'in_progress', 0)
                    RETURNING id
                """)
                new_id = cur.fetchone()[0]
                conn.commit()
            
            return {'statusCode': 201, 'body': json.dumps({'id': new_id, 'message': 'Course progress started'})}
        
        elif method == 'PUT':
            progress_id = body.get('id')
            if not progress_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Progress ID required'})}
            
            updates = []
            if 'status' in body:
                updates.append(f"status = '{body['status']}'")
            if 'progress_percentage' in body:
                updates.append(f"progress_percentage = {body['progress_percentage']}")
            if body.get('status') == 'completed':
                updates.append("completed_at = NOW()")
            
            if updates:
                with conn.cursor() as cur:
                    cur.execute(f"UPDATE course_progress SET {', '.join(updates)} WHERE id = {progress_id} AND user_id = {user_id}")
                    conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'Progress updated'})}
    
    finally:
        conn.close()
    
    return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'})}

def handle_trainer_progress(method, query_params, body, headers):
    user_id = headers.get('x-user-id', '')
    if not user_id:
        return {'statusCode': 401, 'body': json.dumps({'error': 'User ID required'})}
    
    conn = get_db_connection()
    try:
        if method == 'GET':
            with conn.cursor() as cur:
                cur.execute(f"""
                    SELECT tp.id, tp.trainer_id, t.title, tp.status, tp.score, tp.started_at
                    FROM trainer_progress tp
                    JOIN trainers t ON tp.trainer_id = t.id
                    WHERE tp.user_id = {user_id}
                    ORDER BY tp.started_at DESC
                """)
                progress_list = []
                for row in cur.fetchall():
                    progress_list.append({
                        'id': row[0], 'trainer_id': row[1], 'title': row[2],
                        'status': row[3], 'score': row[4],
                        'started_at': str(row[5])
                    })
                return {'statusCode': 200, 'body': json.dumps(progress_list)}
        
        elif method == 'POST':
            item_id = body.get('item_id')
            if not item_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Trainer ID required'})}
            
            with conn.cursor() as cur:
                cur.execute(f"""
                    INSERT INTO trainer_progress (user_id, trainer_id, status, score)
                    VALUES ({user_id}, {item_id}, 'in_progress', 0)
                    RETURNING id
                """)
                new_id = cur.fetchone()[0]
                conn.commit()
            
            return {'statusCode': 201, 'body': json.dumps({'id': new_id, 'message': 'Trainer progress started'})}
        
        elif method == 'PUT':
            progress_id = body.get('id')
            if not progress_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Progress ID required'})}
            
            updates = []
            if 'status' in body:
                updates.append(f"status = '{body['status']}'")
            if 'score' in body:
                updates.append(f"score = {body['score']}")
            if body.get('status') == 'completed':
                updates.append("completed_at = NOW()")
            
            if updates:
                with conn.cursor() as cur:
                    cur.execute(f"UPDATE trainer_progress SET {', '.join(updates)} WHERE id = {progress_id} AND user_id = {user_id}")
                    conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'Progress updated'})}
    
    finally:
        conn.close()
    
    return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'})}

def handle_sales_manager(method, query_params, body, headers):
    session_token = headers.get('x-session-token', '')
    user = validate_session(session_token)
    
    if not user:
        return {'statusCode': 401, 'body': json.dumps({'error': 'Unauthorized'})}
    
    conn = get_db_connection()
    try:
        if method == 'GET':
            manager_id = query_params.get('id', [''])[0]
            company_id = query_params.get('company_id', [''])[0]
            
            if manager_id:
                with conn.cursor() as cur:
                    cur.execute(f"""
                        SELECT sm.id, sm.user_id, sm.company_id, sm.avatar, sm.level,
                               sm.wins, sm.losses, sm.total_score, sm.status, sm.created_at,
                               u.full_name
                        FROM sales_managers sm
                        JOIN users u ON sm.user_id = u.id
                        WHERE sm.id = {manager_id}
                    """)
                    result = cur.fetchone()
                    if not result:
                        return {'statusCode': 404, 'body': json.dumps({'error': 'Manager not found'})}
                    
                    return {
                        'statusCode': 200,
                        'body': json.dumps({
                            'id': result[0], 'user_id': result[1], 'company_id': result[2],
                            'avatar': result[3], 'level': result[4], 'wins': result[5],
                            'losses': result[6], 'total_score': result[7], 'status': result[8],
                            'created_at': str(result[9]), 'full_name': result[10]
                        })
                    }
            else:
                with conn.cursor() as cur:
                    if company_id:
                        cur.execute(f"""
                            SELECT sm.id, sm.user_id, sm.company_id, sm.avatar, sm.level,
                                   sm.wins, sm.losses, sm.total_score, sm.status, u.full_name
                            FROM sales_managers sm
                            JOIN users u ON sm.user_id = u.id
                            WHERE sm.company_id = {company_id}
                            ORDER BY sm.total_score DESC
                        """)
                    else:
                        cur.execute("""
                            SELECT sm.id, sm.user_id, sm.company_id, sm.avatar, sm.level,
                                   sm.wins, sm.losses, sm.total_score, sm.status, u.full_name
                            FROM sales_managers sm
                            JOIN users u ON sm.user_id = u.id
                            ORDER BY sm.total_score DESC
                        """)
                    
                    managers = []
                    for row in cur.fetchall():
                        managers.append({
                            'id': row[0], 'user_id': row[1], 'company_id': row[2],
                            'avatar': row[3], 'level': row[4], 'wins': row[5],
                            'losses': row[6], 'total_score': row[7], 'status': row[8],
                            'full_name': row[9]
                        })
                    return {'statusCode': 200, 'body': json.dumps(managers)}
        
        elif method == 'POST':
            user_id = body.get('user_id')
            company_id = body.get('company_id')
            avatar = body.get('avatar', '👤')
            
            if not user_id or not company_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'User ID and company ID required'})}
            
            with conn.cursor() as cur:
                cur.execute(f"""
                    INSERT INTO sales_managers (user_id, company_id, avatar)
                    VALUES ({user_id}, {company_id}, '{avatar}')
                    RETURNING id
                """)
                new_id = cur.fetchone()[0]
                conn.commit()
            
            return {'statusCode': 201, 'body': json.dumps({'id': new_id, 'message': 'Sales manager created'})}
        
        elif method == 'PUT':
            manager_id = body.get('id')
            if not manager_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Manager ID required'})}
            
            updates = []
            if 'avatar' in body:
                updates.append(f"avatar = '{body['avatar']}'")
            if 'level' in body:
                updates.append(f"level = {body['level']}")
            if 'wins' in body:
                updates.append(f"wins = {body['wins']}")
            if 'losses' in body:
                updates.append(f"losses = {body['losses']}")
            if 'total_score' in body:
                updates.append(f"total_score = {body['total_score']}")
            if 'status' in body:
                updates.append(f"status = '{body['status']}'")
            updates.append("updated_at = NOW()")
            
            with conn.cursor() as cur:
                cur.execute(f"UPDATE sales_managers SET {', '.join(updates)} WHERE id = {manager_id}")
                conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'Sales manager updated'})}
        
        elif method == 'DELETE':
            manager_id = query_params.get('id', [''])[0]
            if not manager_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Manager ID required'})}
            
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM sales_managers WHERE id = {manager_id}")
                conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'Sales manager deleted'})}
    
    finally:
        conn.close()
    
    return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'})}

def handle_tournament(method, query_params, body, headers):
    session_token = headers.get('x-session-token', '')
    user = validate_session(session_token)
    
    if not user:
        return {'statusCode': 401, 'body': json.dumps({'error': 'Unauthorized'})}
    
    conn = get_db_connection()
    try:
        if method == 'GET':
            tournament_id = query_params.get('id', [''])[0]
            
            if tournament_id:
                with conn.cursor() as cur:
                    cur.execute(f"""
                        SELECT id, name, company_a_id, company_b_id, prize_pool, status,
                               winner_id, created_at, started_at, completed_at
                        FROM tournaments WHERE id = {tournament_id}
                    """)
                    result = cur.fetchone()
                    if not result:
                        return {'statusCode': 404, 'body': json.dumps({'error': 'Tournament not found'})}
                    
                    cur.execute(f"""
                        SELECT id, round, match_order, player1_id, player2_id, winner_id,
                               score1, score2, status, started_at, completed_at
                        FROM tournament_matches
                        WHERE tournament_id = {tournament_id}
                        ORDER BY round, match_order
                    """)
                    matches = []
                    for match in cur.fetchall():
                        matches.append({
                            'id': match[0], 'round': match[1], 'match_order': match[2],
                            'player1_id': match[3], 'player2_id': match[4], 'winner_id': match[5],
                            'score1': match[6], 'score2': match[7], 'status': match[8],
                            'started_at': str(match[9]) if match[9] else None,
                            'completed_at': str(match[10]) if match[10] else None
                        })
                    
                    return {
                        'statusCode': 200,
                        'body': json.dumps({
                            'id': result[0], 'name': result[1], 'company_a_id': result[2],
                            'company_b_id': result[3], 'prize_pool': result[4], 'status': result[5],
                            'winner_id': result[6], 'created_at': str(result[7]),
                            'started_at': str(result[8]) if result[8] else None,
                            'completed_at': str(result[9]) if result[9] else None,
                            'matches': matches
                        })
                    }
            else:
                with conn.cursor() as cur:
                    cur.execute("""
                        SELECT id, name, company_a_id, company_b_id, prize_pool, status,
                               created_at, started_at
                        FROM tournaments ORDER BY created_at DESC
                    """)
                    tournaments = []
                    for row in cur.fetchall():
                        tournaments.append({
                            'id': row[0], 'name': row[1], 'company_a_id': row[2],
                            'company_b_id': row[3], 'prize_pool': row[4], 'status': row[5],
                            'created_at': str(row[6]),
                            'started_at': str(row[7]) if row[7] else None
                        })
                    return {'statusCode': 200, 'body': json.dumps(tournaments)}
        
        elif method == 'POST':
            action = query_params.get('action', [''])[0]
            
            if action == 'start':
                tournament_id = body.get('tournament_id')
                if not tournament_id:
                    return {'statusCode': 400, 'body': json.dumps({'error': 'Tournament ID required'})}
                
                with conn.cursor() as cur:
                    cur.execute(f"""
                        UPDATE tournaments SET status = 'in_progress', started_at = NOW()
                        WHERE id = {tournament_id}
                    """)
                    conn.commit()
                
                return {'statusCode': 200, 'body': json.dumps({'message': 'Tournament started'})}
            
            else:
                name = body.get('name')
                company_a_id = body.get('company_a_id')
                company_b_id = body.get('company_b_id')
                prize_pool = body.get('prize_pool', 20000)
                
                if not name or not company_a_id or not company_b_id:
                    return {'statusCode': 400, 'body': json.dumps({'error': 'Name and company IDs required'})}
                
                with conn.cursor() as cur:
                    cur.execute(f"""
                        INSERT INTO tournaments (name, company_a_id, company_b_id, prize_pool)
                        VALUES ('{name}', {company_a_id}, {company_b_id}, {prize_pool})
                        RETURNING id
                    """)
                    new_id = cur.fetchone()[0]
                    conn.commit()
                
                return {'statusCode': 201, 'body': json.dumps({'id': new_id, 'message': 'Tournament created'})}
        
        elif method == 'PUT':
            tournament_id = body.get('id')
            if not tournament_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Tournament ID required'})}
            
            updates = []
            if 'status' in body:
                updates.append(f"status = '{body['status']}'")
            if 'winner_id' in body:
                updates.append(f"winner_id = {body['winner_id']}")
            if body.get('status') == 'completed':
                updates.append("completed_at = NOW()")
            
            with conn.cursor() as cur:
                cur.execute(f"UPDATE tournaments SET {', '.join(updates)} WHERE id = {tournament_id}")
                conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'Tournament updated'})}
        
        elif method == 'DELETE':
            tournament_id = query_params.get('id', [''])[0]
            if not tournament_id:
                return {'statusCode': 400, 'body': json.dumps({'error': 'Tournament ID required'})}
            
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM tournament_matches WHERE tournament_id = {tournament_id}")
                cur.execute(f"DELETE FROM tournaments WHERE id = {tournament_id}")
                conn.commit()
            
            return {'statusCode': 200, 'body': json.dumps({'message': 'Tournament deleted'})}
    
    finally:
        conn.close()
    
    return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'})}

def handle_battle(method, query_params, body, headers):
    session_token = headers.get('x-session-token', '')
    user = validate_session(session_token)
    
    if not user:
        return {'statusCode': 401, 'body': json.dumps({'error': 'Unauthorized'})}
    
    conn = get_db_connection()
    try:
        if method == 'GET':
            match_id = query_params.get('match_id', [''])[0]
            manager_id = query_params.get('manager_id', [''])[0]
            
            if match_id and manager_id:
                with conn.cursor() as cur:
                    cur.execute(f"""
                        SELECT id, match_id, manager_id, current_phase, chat_history,
                               phase_scores, total_score, timer_remaining, status, updated_at
                        FROM battle_sessions
                        WHERE match_id = {match_id} AND manager_id = {manager_id}
                    """)
                    result = cur.fetchone()
                    if not result:
                        return {'statusCode': 404, 'body': json.dumps({'error': 'Battle session not found'})}
                    
                    return {
                        'statusCode': 200,
                        'body': json.dumps({
                            'id': result[0], 'match_id': result[1], 'manager_id': result[2],
                            'current_phase': result[3], 'chat_history': result[4],
                            'phase_scores': result[5], 'total_score': result[6],
                            'timer_remaining': result[7], 'status': result[8],
                            'updated_at': str(result[9])
                        })
                    }
            elif match_id:
                with conn.cursor() as cur:
                    cur.execute(f"""
                        SELECT id, player1_id, player2_id, winner_id, score1, score2,
                               status, battle_log, started_at, completed_at
                        FROM tournament_matches WHERE id = {match_id}
                    """)
                    result = cur.fetchone()
                    if not result:
                        return {'statusCode': 404, 'body': json.dumps({'error': 'Match not found'})}
                    
                    return {
                        'statusCode': 200,
                        'body': json.dumps({
                            'id': result[0], 'player1_id': result[1], 'player2_id': result[2],
                            'winner_id': result[3], 'score1': result[4], 'score2': result[5],
                            'status': result[6], 'battle_log': result[7],
                            'started_at': str(result[8]) if result[8] else None,
                            'completed_at': str(result[9]) if result[9] else None
                        })
                    }
        
        elif method == 'POST':
            action = query_params.get('action', [''])[0]
            
            if action == 'message':
                match_id = body.get('match_id')
                manager_id = body.get('manager_id')
                message = body.get('message', '')
                
                if not match_id or not manager_id:
                    return {'statusCode': 400, 'body': json.dumps({'error': 'Match ID and manager ID required'})}
                
                with conn.cursor() as cur:
                    cur.execute(f"""
                        SELECT chat_history FROM battle_sessions
                        WHERE match_id = {match_id} AND manager_id = {manager_id}
                    """)
                    result = cur.fetchone()
                    
                    if result:
                        chat_history = result[0] if result[0] else []
                        chat_history.append({'role': 'user', 'content': message, 'timestamp': str(datetime.now())})
                        
                        cur.execute(f"""
                            UPDATE battle_sessions
                            SET chat_history = '{json.dumps(chat_history)}'::jsonb, updated_at = NOW()
                            WHERE match_id = {match_id} AND manager_id = {manager_id}
                        """)
                        conn.commit()
                        
                        return {'statusCode': 200, 'body': json.dumps({'message': 'Message added', 'chat_history': chat_history})}
            
            elif action == 'update_score':
                match_id = body.get('match_id')
                manager_id = body.get('manager_id')
                phase = body.get('phase')
                score = body.get('score', 0)
                
                if not match_id or not manager_id or not phase:
                    return {'statusCode': 400, 'body': json.dumps({'error': 'Match ID, manager ID and phase required'})}
                
                with conn.cursor() as cur:
                    cur.execute(f"""
                        SELECT phase_scores, total_score FROM battle_sessions
                        WHERE match_id = {match_id} AND manager_id = {manager_id}
                    """)
                    result = cur.fetchone()
                    
                    if result:
                        phase_scores = result[0] if result[0] else {}
                        phase_scores[phase] = score
                        total_score = sum(phase_scores.values())
                        
                        cur.execute(f"""
                            UPDATE battle_sessions
                            SET phase_scores = '{json.dumps(phase_scores)}'::jsonb,
                                total_score = {total_score}, updated_at = NOW()
                            WHERE match_id = {match_id} AND manager_id = {manager_id}
                        """)
                        conn.commit()
                        
                        return {'statusCode': 200, 'body': json.dumps({'message': 'Score updated', 'total_score': total_score})}
            
            elif action == 'complete_match':
                match_id = body.get('match_id')
                winner_id = body.get('winner_id')
                score1 = body.get('score1', 0)
                score2 = body.get('score2', 0)
                
                if not match_id or not winner_id:
                    return {'statusCode': 400, 'body': json.dumps({'error': 'Match ID and winner ID required'})}
                
                with conn.cursor() as cur:
                    cur.execute(f"""
                        UPDATE tournament_matches
                        SET winner_id = {winner_id}, score1 = {score1}, score2 = {score2},
                            status = 'completed', completed_at = NOW()
                        WHERE id = {match_id}
                    """)
                    
                    cur.execute(f"""
                        UPDATE battle_sessions SET status = 'completed'
                        WHERE match_id = {match_id}
                    """)
                    
                    conn.commit()
                
                return {'statusCode': 200, 'body': json.dumps({'message': 'Match completed'})}
            
            else:
                match_id = body.get('match_id')
                player1_id = body.get('player1_id')
                player2_id = body.get('player2_id')
                
                if not match_id or not player1_id or not player2_id:
                    return {'statusCode': 400, 'body': json.dumps({'error': 'Match ID and player IDs required'})}
                
                with conn.cursor() as cur:
                    for player_id in [player1_id, player2_id]:
                        cur.execute(f"""
                            INSERT INTO battle_sessions (match_id, manager_id)
                            VALUES ({match_id}, {player_id})
                        """)
                    
                    cur.execute(f"""
                        UPDATE tournament_matches SET status = 'in_progress', started_at = NOW()
                        WHERE id = {match_id}
                    """)
                    conn.commit()
                
                return {'statusCode': 201, 'body': json.dumps({'message': 'Battle sessions created'})}
    
    finally:
        conn.close()
    
    return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'})}

def handler(event, context):
    try:
        method = event.get('httpMethod', 'GET')
        
        if method == 'OPTIONS':
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}
        
        query_params = parse_qs(event.get('queryStringParameters', '') or '')
        headers = {k.lower(): v for k, v in (event.get('headers', {}) or {}).items()}
        
        body = {}
        if event.get('body'):
            body = json.loads(event['body'])
        
        # Route based on entity, entity_type, or resource parameter
        entity = query_params.get('entity', [''])[0]
        entity_type = query_params.get('entity_type', [''])[0]
        resource = query_params.get('resource', [''])[0]
        
        # Auth API routing (entity parameter)
        if entity == 'auth':
            response = handle_auth(method, query_params, body, headers)
        elif entity == 'users':
            response = handle_users(method, query_params, body, headers)
        elif entity == 'access_groups':
            response = handle_access_groups(method, query_params, body, headers)
        # Learning API routing (resource parameter)
        elif resource == 'courses':
            response = handle_course(method, query_params, body, headers)
        elif resource == 'trainers':
            response = handle_trainer(method, query_params, body, headers)
        elif resource == 'progress':
            progress_type = query_params.get('type', [''])[0]
            if progress_type == 'course':
                response = handle_course_progress(method, query_params, body, headers)
            elif progress_type == 'trainer':
                response = handle_trainer_progress(method, query_params, body, headers)
            else:
                response = {'statusCode': 400, 'body': json.dumps({'error': 'Invalid progress type'})}
        # Business API routing (entity_type parameter)
        elif entity_type == 'company':
            response = handle_company(method, query_params, body, headers)
        elif entity_type == 'department':
            response = handle_department(method, query_params, body, headers)
        elif entity_type == 'course':
            response = handle_course(method, query_params, body, headers)
        elif entity_type == 'trainer':
            response = handle_trainer(method, query_params, body, headers)
        elif entity_type == 'sales_manager':
            response = handle_sales_manager(method, query_params, body, headers)
        elif entity_type == 'tournament':
            response = handle_tournament(method, query_params, body, headers)
        elif entity_type == 'battle':
            response = handle_battle(method, query_params, body, headers)
        else:
            response = {'statusCode': 400, 'body': json.dumps({'error': 'Invalid entity, entity_type, or resource parameter'})}
        
        response['headers'] = CORS_HEADERS
        return response
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': str(e)})
        }