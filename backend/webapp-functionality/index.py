import json
import os
import psycopg2
import random
from datetime import datetime

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not set')
    return psycopg2.connect(dsn)

def handler(event, context):
    '''
    Обработка запросов для функционала веб-приложения (компании, пользователи, менеджеры, турниры)
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            entity_type = params.get('entity_type', 'company')
            
            if entity_type == 'company':
                cur.execute("""
                    SELECT id, name, created_at 
                    FROM t_p66738329_webapp_functionality.companies 
                    ORDER BY name
                """)
                companies = []
                for row in cur.fetchall():
                    companies.append({
                        'id': row[0],
                        'name': row[1],
                        'created_at': row[2].isoformat() if row[2] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'companies': companies}),
                    'isBase64Encoded': False
                }
            
            elif entity_type == 'sales_manager':
                company_id = params.get('company_id')
                if company_id:
                    cur.execute(f"""
                        SELECT sm.id, u.username, sm.avatar, sm.level, sm.wins, sm.losses, sm.company_id
                        FROM t_p66738329_webapp_functionality.sales_managers sm
                        JOIN t_p66738329_webapp_functionality.users u ON sm.user_id = u.id
                        WHERE sm.company_id = {int(company_id)} AND sm.status = 'active'
                        ORDER BY sm.level DESC, sm.wins DESC
                    """)
                    
                    managers = []
                    for row in cur.fetchall():
                        managers.append({
                            'id': row[0],
                            'name': row[1],
                            'avatar': row[2],
                            'level': row[3],
                            'wins': row[4],
                            'losses': row[5],
                            'company_id': row[6]
                        })
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'managers': managers}),
                        'isBase64Encoded': False
                    }
            
            elif entity_type == 'tournament':
                tournament_id = params.get('tournament_id')
                if tournament_id:
                    cur.execute(f"""
                        SELECT t.id, t.name, t.company_a_id, t.company_b_id, 
                               ca.name, cb.name, t.prize_pool, t.status, t.winner_id
                        FROM t_p66738329_webapp_functionality.tournaments t
                        JOIN t_p66738329_webapp_functionality.companies ca ON t.company_a_id = ca.id
                        JOIN t_p66738329_webapp_functionality.companies cb ON t.company_b_id = cb.id
                        WHERE t.id = {int(tournament_id)}
                    """)
                    
                    row = cur.fetchone()
                    if not row:
                        return {
                            'statusCode': 404,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Tournament not found'}),
                            'isBase64Encoded': False
                        }
                    
                    cur.execute(f"""
                        SELECT m.id, m.round, m.match_order, m.player1_id, m.player2_id,
                               u1.username, u2.username, sm1.avatar, sm2.avatar,
                               m.winner_id, m.score1, m.score2, m.status
                        FROM t_p66738329_webapp_functionality.tournament_matches m
                        LEFT JOIN t_p66738329_webapp_functionality.sales_managers sm1 ON m.player1_id = sm1.id
                        LEFT JOIN t_p66738329_webapp_functionality.users u1 ON sm1.user_id = u1.id
                        LEFT JOIN t_p66738329_webapp_functionality.sales_managers sm2 ON m.player2_id = sm2.id
                        LEFT JOIN t_p66738329_webapp_functionality.users u2 ON sm2.user_id = u2.id
                        WHERE m.tournament_id = {int(tournament_id)}
                        ORDER BY m.round, m.match_order
                    """)
                    
                    matches = []
                    for match_row in cur.fetchall():
                        matches.append({
                            'id': match_row[0],
                            'round': match_row[1],
                            'match_order': match_row[2],
                            'player1_id': match_row[3],
                            'player2_id': match_row[4],
                            'player1_name': match_row[5],
                            'player2_name': match_row[6],
                            'player1_avatar': match_row[7],
                            'player2_avatar': match_row[8],
                            'winner_id': match_row[9],
                            'score1': match_row[10] or 0,
                            'score2': match_row[11] or 0,
                            'status': match_row[12]
                        })
                    
                    tournament = {
                        'id': row[0],
                        'name': row[1],
                        'company_a_id': row[2],
                        'company_b_id': row[3],
                        'company_a_name': row[4],
                        'company_b_name': row[5],
                        'prize_pool': row[6],
                        'status': row[7],
                        'winner_id': row[8],
                        'matches': matches
                    }
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'tournament': tournament}),
                        'isBase64Encoded': False
                    }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            entity_type = body.get('entity_type')
            
            if entity_type == 'tournament':
                name = body.get('name', '').replace("'", "''")
                company_a_id = body.get('company_a_id')
                company_b_id = body.get('company_b_id')
                prize_pool = body.get('prize_pool', 20000)
                
                cur.execute(f"""
                    INSERT INTO t_p66738329_webapp_functionality.tournaments 
                    (name, company_a_id, company_b_id, prize_pool, status)
                    VALUES ('{name}', {int(company_a_id)}, {int(company_b_id)}, {int(prize_pool)}, 'active')
                    RETURNING id
                """)
                
                tournament_id = cur.fetchone()[0]
                
                cur.execute(f"""
                    SELECT sm.id 
                    FROM t_p66738329_webapp_functionality.sales_managers sm
                    WHERE sm.company_id = {int(company_a_id)} AND sm.status = 'active'
                    ORDER BY sm.level DESC, sm.wins DESC
                """)
                managers_a = [row[0] for row in cur.fetchall()]
                
                cur.execute(f"""
                    SELECT sm.id 
                    FROM t_p66738329_webapp_functionality.sales_managers sm
                    WHERE sm.company_id = {int(company_b_id)} AND sm.status = 'active'
                    ORDER BY sm.level DESC, sm.wins DESC
                """)
                managers_b = [row[0] for row in cur.fetchall()]
                
                max_matches = max(len(managers_a), len(managers_b))
                for i in range(max_matches):
                    player1 = managers_a[i] if i < len(managers_a) else None
                    player2 = managers_b[i] if i < len(managers_b) else None
                    
                    player1_sql = str(int(player1)) if player1 is not None else 'NULL'
                    player2_sql = str(int(player2)) if player2 is not None else 'NULL'
                    
                    cur.execute(f"""
                        INSERT INTO t_p66738329_webapp_functionality.tournament_matches 
                        (tournament_id, round, match_order, player1_id, player2_id, status)
                        VALUES ({int(tournament_id)}, 1, {i + 1}, {player1_sql}, {player2_sql}, 'pending')
                    """)
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'tournament_id': tournament_id, 'success': True}),
                    'isBase64Encoded': False
                }
            
            elif entity_type == 'battle':
                action = body.get('action')
                
                if action == 'start_match':
                    match_id = body.get('match_id')
                    
                    cur.execute(f"""
                        UPDATE t_p66738329_webapp_functionality.tournament_matches
                        SET status = 'in-progress'
                        WHERE id = {int(match_id)}
                        RETURNING player1_id, player2_id
                    """)
                    
                    row = cur.fetchone()
                    if not row:
                        return {
                            'statusCode': 404,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Match not found'}),
                            'isBase64Encoded': False
                        }
                    
                    player1_id, player2_id = row
                    
                    cur.execute(f"""
                        INSERT INTO t_p66738329_webapp_functionality.battle_sessions
                        (match_id, player_id, opponent_id, chat_history, player_score, opponent_score, status)
                        VALUES ({int(match_id)}, {int(player1_id)}, {int(player2_id)}, '[]', 0, 0, 'active')
                        RETURNING id
                    """)
                    
                    session_id = cur.fetchone()[0]
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'session_id': session_id, 'success': True}),
                        'isBase64Encoded': False
                    }
                
                elif action == 'send_message':
                    session_id = body.get('session_id')
                    message = body.get('message', '')
                    
                    cur.execute(f"""
                        SELECT chat_history, player_score 
                        FROM t_p66738329_webapp_functionality.battle_sessions
                        WHERE id = {int(session_id)}
                    """)
                    
                    row = cur.fetchone()
                    if not row:
                        return {
                            'statusCode': 404,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Session not found'}),
                            'isBase64Encoded': False
                        }
                    
                    chat_history = json.loads(row[0]) if row[0] else []
                    current_score = row[1]
                    
                    points = 15
                    if len(message) > 50:
                        points += 5
                    if any(word in message.lower() for word in ['акция', 'скидка', 'предложение', 'выгода']):
                        points += 3
                    if '?' in message:
                        points += 2
                    
                    ai_responses = [
                        'Интересно. А какие у вас цены на чистку зубов?',
                        'Спасибо за информацию. Скажите, у вас есть рассрочка?',
                        'Звучит хорошо. А как быстро можно записаться на приём?',
                        'Понятно. Расскажите подробнее про ваших специалистов.',
                        'Хм, нужно подумать. Есть ли у вас какие-то специальные предложения?'
                    ]
                    
                    ai_response = random.choice(ai_responses)
                    
                    chat_history.append({'role': 'manager', 'content': message})
                    chat_history.append({'role': 'client', 'content': ai_response})
                    
                    new_score = current_score + points
                    chat_json = json.dumps(chat_history).replace("'", "''")
                    
                    cur.execute(f"""
                        UPDATE t_p66738329_webapp_functionality.battle_sessions
                        SET chat_history = '{chat_json}', player_score = {new_score}
                        WHERE id = {int(session_id)}
                    """)
                    
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'ai_response': ai_response,
                            'points_earned': points,
                            'total_score': new_score
                        }),
                        'isBase64Encoded': False
                    }
                
                elif action == 'finish_match':
                    session_id = body.get('session_id')
                    
                    cur.execute(f"""
                        SELECT match_id, player_score, opponent_score, player_id, opponent_id
                        FROM t_p66738329_webapp_functionality.battle_sessions
                        WHERE id = {int(session_id)}
                    """)
                    
                    row = cur.fetchone()
                    if not row:
                        return {
                            'statusCode': 404,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Session not found'}),
                            'isBase64Encoded': False
                        }
                    
                    match_id, player_score, opponent_score, player_id, opponent_id = row
                    opponent_score = random.randint(50, 120)
                    
                    winner_id = player_id if player_score > opponent_score else opponent_id
                    
                    cur.execute(f"""
                        UPDATE t_p66738329_webapp_functionality.tournament_matches
                        SET winner_id = {int(winner_id)}, score1 = {player_score}, score2 = {opponent_score}, status = 'completed'
                        WHERE id = {int(match_id)}
                    """)
                    
                    cur.execute(f"""
                        UPDATE t_p66738329_webapp_functionality.battle_sessions
                        SET opponent_score = {opponent_score}, status = 'completed'
                        WHERE id = {int(session_id)}
                    """)
                    
                    if winner_id == player_id:
                        cur.execute(f"UPDATE t_p66738329_webapp_functionality.sales_managers SET wins = wins + 1 WHERE id = {int(player_id)}")
                        cur.execute(f"UPDATE t_p66738329_webapp_functionality.sales_managers SET losses = losses + 1 WHERE id = {int(opponent_id)}")
                    else:
                        cur.execute(f"UPDATE t_p66738329_webapp_functionality.sales_managers SET losses = losses + 1 WHERE id = {int(player_id)}")
                        cur.execute(f"UPDATE t_p66738329_webapp_functionality.sales_managers SET wins = wins + 1 WHERE id = {int(opponent_id)}")
                    
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'winner': 'player' if winner_id == player_id else 'opponent',
                            'player_score': player_score,
                            'opponent_score': opponent_score
                        }),
                        'isBase64Encoded': False
                    }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        if conn:
            conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if conn:
            conn.close()
