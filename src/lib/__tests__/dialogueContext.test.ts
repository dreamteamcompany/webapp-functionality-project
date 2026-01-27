/**
 * Тесты для системы контекстной памяти диалога
 * Проверка основных функций DialogueContextManager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DialogueContextManager } from '../dialogueContext';

describe('DialogueContextManager', () => {
  let manager: DialogueContextManager;
  const sessionId = 'test-session-123';
  const patientProfile = {
    concerns: ['Боль в зубе', 'Стоимость лечения'],
    emotionalState: 'nervous'
  };

  beforeEach(() => {
    localStorage.clear();
    manager = new DialogueContextManager(sessionId, patientProfile);
  });

  it('должен создать новый контекст при инициализации', () => {
    const context = manager.getFullContext();
    
    expect(context.sessionId).toBe(sessionId);
    expect(context.patientProfile.mainConcern).toBe('Боль в зубе');
    expect(context.patientProfile.emotionalState).toBe('nervous');
    expect(context.conversationHistory).toHaveLength(0);
  });

  it('должен анализировать сообщения администратора', () => {
    manager.addAdminMessage('Здравствуйте! Я понимаю ваши переживания. Не волнуйтесь, мы вам поможем!');
    
    const context = manager.getFullContext();
    
    // Проверяем, что сообщение добавлено
    expect(context.conversationHistory).toHaveLength(1);
    expect(context.conversationHistory[0].role).toBe('admin');
    
    // Проверяем анализ
    const analysis = context.conversationHistory[0].analysisData;
    expect(analysis?.sentiment).toBe('positive');
    expect(analysis?.emotionalTone).toBe('empathetic');
  });

  it('должен обновлять профиль администратора на основе эмпатии', () => {
    manager.addAdminMessage('Я понимаю ваши переживания');
    
    const context = manager.getFullContext();
    const traits = context.extractedKnowledge.adminPersonalityTraits;
    
    expect(traits.empathyLevel).toBeGreaterThan(0);
  });

  it('должен отслеживать обсуждённые темы', () => {
    manager.addAdminMessage('Расскажу вам про лечение и стоимость процедуры');
    
    const responseContext = manager.getResponseContext();
    
    expect(responseContext.discussedTopics).toContain('treatment');
    expect(responseContext.discussedTopics).toContain('cost');
  });

  it('должен формировать стратегию следующего ответа', () => {
    manager.addAdminMessage('Здравствуйте');
    
    const context = manager.getFullContext();
    const strategy = context.nextResponseStrategy;
    
    expect(strategy.shouldAskQuestion).toBe(true);
    expect(strategy.topicToExplore).toBeTruthy();
  });

  it('должен определять фазу разговора', () => {
    const context1 = manager.getFullContext();
    expect(context1.conversationPhase).toBe('initial');
    
    // Добавляем несколько сообщений
    for (let i = 0; i < 4; i++) {
      manager.addAdminMessage('Тестовое сообщение ' + i);
      manager.addPatientMessage('Ответ пациента ' + i);
    }
    
    const context2 = manager.getFullContext();
    expect(context2.conversationPhase).toBe('exploration');
  });

  it('должен сохранять и загружать контекст из localStorage', () => {
    manager.addAdminMessage('Тестовое сообщение');
    manager.addPatientMessage('Ответ пациента');
    
    // Создаём новый менеджер с тем же sessionId
    const manager2 = new DialogueContextManager(sessionId, patientProfile);
    const context = manager2.getFullContext();
    
    // Проверяем, что данные загружены
    expect(context.conversationHistory).toHaveLength(2);
  });

  it('должен экспортировать контекст в JSON', () => {
    manager.addAdminMessage('Тест');
    
    const exported = manager.exportContext();
    const parsed = JSON.parse(exported);
    
    expect(parsed.sessionId).toBe(sessionId);
    expect(parsed.conversationHistory).toBeDefined();
  });

  it('должен обновлять состояние пациента', () => {
    manager.updatePatientState(10, 5, 'calm');
    
    const context = manager.getFullContext();
    
    expect(context.patientProfile.satisfactionLevel).toBe(60); // 50 + 10
    expect(context.patientProfile.trustLevel).toBe(35); // 30 + 5
    expect(context.patientProfile.emotionalState).toBe('calm');
  });

  it('должен очищать контекст', () => {
    manager.addAdminMessage('Тест');
    manager.clear();
    
    const key = `dialogue_context_${sessionId}`;
    const stored = localStorage.getItem(key);
    
    expect(stored).toBeNull();
  });
});
