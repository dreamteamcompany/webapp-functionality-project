import json
import os
from openai import OpenAI

def handler(event: dict, context) -> dict:
    '''Генерация естественных ответов ИИ-пациента через OpenAI API'''
    
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        scenario = body.get('scenario')
        conversation_history = body.get('conversationHistory', [])
        user_message = body.get('userMessage')
        
        if not scenario or not user_message:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields: scenario, userMessage'})
            }
        
        client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
        
        system_prompt = build_system_prompt(scenario)
        
        messages = [{'role': 'system', 'content': system_prompt}]
        
        for msg in conversation_history[-10:]:
            messages.append({
                'role': 'assistant' if msg['role'] == 'ai' else 'user',
                'content': msg['content']
            })
        
        messages.append({'role': 'user', 'content': user_message})
        
        response = client.chat.completions.create(
            model='gpt-4o-mini',
            messages=messages,
            temperature=0.8,
            max_tokens=300
        )
        
        ai_response = response.choices[0].message.content
        
        emotional_state = analyze_emotion(ai_response, scenario.get('aiPersonality', {}).get('emotionalState', 'calm'))
        satisfaction = calculate_satisfaction(conversation_history, user_message, ai_response)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': ai_response,
                'emotionalState': emotional_state,
                'satisfaction': satisfaction
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }


def build_system_prompt(scenario: dict) -> str:
    context = scenario.get('context', {})
    personality = scenario.get('aiPersonality', {})
    
    emotion_descriptions = {
        'calm': 'спокойный и уравновешенный',
        'nervous': 'нервный и взволнованный',
        'angry': 'раздражённый и недовольный',
        'scared': 'напуганный и встревоженный',
        'happy': 'довольный и радостный',
        'sad': 'грустный и подавленный',
        'confused': 'растерянный и запутавшийся',
        'excited': 'взволнованный и возбуждённый'
    }
    
    knowledge_descriptions = {
        'low': 'Вы плохо разбираетесь в медицинских терминах. Просите объяснять всё простым языком.',
        'medium': 'У вас средний уровень медицинской грамотности. Вы понимаете базовые термины.',
        'high': 'Вы хорошо разбираетесь в медицине. Можете обсуждать медицинские детали.'
    }
    
    style_descriptions = {
        'formal': 'Общайтесь формально и официально.',
        'casual': 'Общайтесь неформально и просто.',
        'professional': 'Общайтесь профессионально и по существу.',
        'friendly': 'Общайтесь дружелюбно и открыто.',
        'aggressive': 'Общайтесь напористо и требовательно.'
    }
    
    prompt = f"""Ты играешь роль пациента на приёме у врача в учебном тренажёре.

КОНТЕКСТ СИТУАЦИИ:
{context.get('situation', 'Стандартная консультация')}

ТВОЙ ХАРАКТЕР И ЛИЧНОСТЬ:
{personality.get('character', 'Обычный пациент')}

ТВОЁ ЭМОЦИОНАЛЬНОЕ СОСТОЯНИЕ:
Ты {emotion_descriptions.get(personality.get('emotionalState', 'calm'), 'спокойный')}. Показывай это в своих ответах.

УРОВЕНЬ МЕДИЦИНСКОЙ ГРАМОТНОСТИ:
{knowledge_descriptions.get(personality.get('knowledge', 'low'), knowledge_descriptions['low'])}

СТИЛЬ ОБЩЕНИЯ:
{style_descriptions.get(personality.get('communicationStyle', 'casual'), style_descriptions['casual'])}

ПЕРВОЕ СООБЩЕНИЕ (для контекста):
{scenario.get('initialMessage', 'Здравствуйте, доктор')}
"""
    
    if scenario.get('objectives'):
        prompt += f"\n\nЧТО ВРАЧ ДОЛЖЕН СДЕЛАТЬ (скрытые цели, не говори о них напрямую):\n"
        for obj in scenario.get('objectives', [])[:3]:
            prompt += f"- {obj}\n"
    
    if scenario.get('challenges'):
        prompt += f"\n\nТВОИ СЛОЖНОСТИ И ОПАСЕНИЯ:\n"
        for ch in scenario.get('challenges', [])[:3]:
            prompt += f"- {ch}\n"
    
    prompt += """

ВАЖНЫЕ ПРАВИЛА:
1. Отвечай КРАТКО (1-3 предложения максимум)
2. Веди себя как настоящий пациент, а не как ИИ
3. Реагируй на эмпатию врача - становись спокойнее
4. Задавай уточняющие вопросы, если что-то непонятно
5. Показывай эмоции в ответах (волнение, страх, облегчение)
6. НЕ используй форматирование markdown - пиши обычным текстом
7. НЕ повторяй одни и те же фразы - каждый ответ должен быть уникальным
8. Реагируй естественно на то, что говорит врач
9. Если врач проявил эмпатию - покажи, что тебе стало легче
10. Если врач использует сложные термины - переспроси простым языком

Отвечай как живой человек на приёме у врача. Будь естественным!"""
    
    return prompt


def analyze_emotion(response_text: str, current_emotion: str) -> str:
    text_lower = response_text.lower()
    
    if any(word in text_lower for word in ['спасибо', 'понятно', 'хорошо', 'отлично', 'успокоили']):
        if current_emotion in ['scared', 'nervous']:
            return 'calm'
        if current_emotion == 'angry':
            return 'nervous'
        return 'happy'
    
    if any(word in text_lower for word in ['страшно', 'боюсь', 'боязно', 'ужас']):
        return 'scared'
    
    if any(word in text_lower for word in ['непонятно', 'не понимаю', 'что', 'как это']):
        return 'confused'
    
    if any(word in text_lower for word in ['хватит', 'достали', 'надоело']):
        return 'angry'
    
    return current_emotion


def calculate_satisfaction(history: list, user_msg: str, ai_response: str) -> int:
    base_satisfaction = 50
    
    msg_lower = user_msg.lower()
    
    empathy_keywords = ['понимаю', 'переживаете', 'волнуетесь', 'беспокоитесь', 'не волнуйтесь']
    if any(kw in msg_lower for kw in empathy_keywords):
        base_satisfaction += 20
    
    question_keywords = ['как', 'что', 'почему', 'расскажите', 'объясните']
    if any(kw in msg_lower for kw in question_keywords):
        base_satisfaction += 10
    
    simple_keywords = ['простыми словами', 'понятно объясните', 'не понимаю термины']
    if any(kw in msg_lower for kw in simple_keywords):
        base_satisfaction += 15
    
    technical_keywords = ['диагноз', 'патология', 'клиническая картина', 'этиология']
    if any(kw in msg_lower for kw in technical_keywords) and len(msg_lower.split()) > 20:
        base_satisfaction -= 15
    
    conversation_length = len(history)
    if conversation_length > 3:
        base_satisfaction += min(conversation_length * 2, 20)
    
    return max(0, min(100, base_satisfaction))
