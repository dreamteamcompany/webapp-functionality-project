import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { DialogueContext } from '@/lib/dialogueContext';

interface DialogueContextViewerProps {
  context: DialogueContext | null;
  onClose?: () => void;
}

export default function DialogueContextViewer({ context, onClose }: DialogueContextViewerProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!context) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <Icon name="AlertCircle" size={48} className="mx-auto mb-4" />
        <p>Контекст диалога недоступен</p>
      </Card>
    );
  }

  const { patientProfile, extractedKnowledge, nextResponseStrategy, conversationPhase } = context;
  const adminTraits = extractedKnowledge.adminPersonalityTraits;
  const discussedTopicsArray = Array.from(extractedKnowledge.discussedTopics.entries());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Контекст диалога (Debug)</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="admin">Админ</TabsTrigger>
          <TabsTrigger value="topics">Темы</TabsTrigger>
          <TabsTrigger value="strategy">Стратегия</TabsTrigger>
        </TabsList>

        {/* Обзор */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="User" size={18} />
              Профиль пациента
            </h4>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Главная проблема</div>
                <p className="text-sm font-medium">{patientProfile.mainConcern}</p>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Эмоциональное состояние</div>
                <Badge>{patientProfile.emotionalState}</Badge>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Удовлетворённость: {patientProfile.satisfactionLevel}%
                </div>
                <Progress value={patientProfile.satisfactionLevel} className="h-2" />
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Доверие: {patientProfile.trustLevel}%
                </div>
                <Progress value={patientProfile.trustLevel} className="h-2" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="Layers" size={18} />
              Фаза разговора
            </h4>
            <div className="flex items-center gap-2">
              <Badge variant={conversationPhase === 'decision' ? 'default' : 'outline'}>
                {conversationPhase}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {conversationPhase === 'initial' && 'Знакомство'}
                {conversationPhase === 'exploration' && 'Исследование'}
                {conversationPhase === 'negotiation' && 'Переговоры'}
                {conversationPhase === 'decision' && 'Принятие решения'}
                {conversationPhase === 'closing' && 'Завершение'}
              </span>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="MessageCircle" size={18} />
              История диалога
            </h4>
            <p className="text-sm text-muted-foreground">
              Всего сообщений: {context.conversationHistory.length}
            </p>
            <p className="text-sm text-muted-foreground">
              Последнее обновление: {new Date(context.lastUpdated).toLocaleTimeString()}
            </p>
          </Card>
        </TabsContent>

        {/* Профиль администратора */}
        <TabsContent value="admin" className="space-y-4">
          <Card className="p-4">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Icon name="UserCircle" size={18} />
              Черты личности администратора
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Эмпатия</span>
                  <span className="text-sm font-medium">{adminTraits.empathyLevel}%</span>
                </div>
                <Progress value={adminTraits.empathyLevel} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Профессионализм</span>
                  <span className="text-sm font-medium">{adminTraits.professionalismLevel}%</span>
                </div>
                <Progress value={adminTraits.professionalismLevel} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Ясность</span>
                  <span className="text-sm font-medium">{adminTraits.clarityLevel}%</span>
                </div>
                <Progress value={adminTraits.clarityLevel} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Отзывчивость</span>
                  <span className="text-sm font-medium">{adminTraits.responsivenessLevel}%</span>
                </div>
                <Progress value={adminTraits.responsivenessLevel} className="h-2" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="CheckCircle" size={18} />
              Обещания администратора
            </h4>
            {extractedKnowledge.adminPromises.length > 0 ? (
              <ul className="space-y-2">
                {extractedKnowledge.adminPromises.map((promise, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <Icon name="Check" size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{promise}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Обещаний пока нет</p>
            )}
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="AlertCircle" size={18} />
              Нерешённые вопросы
            </h4>
            {extractedKnowledge.unresolvedQuestions.length > 0 ? (
              <ul className="space-y-2">
                {extractedKnowledge.unresolvedQuestions.map((q, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <Icon name="HelpCircle" size={14} className="text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{q}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Все вопросы решены</p>
            )}
          </Card>
        </TabsContent>

        {/* Обсуждённые темы */}
        <TabsContent value="topics" className="space-y-4">
          <Card className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="List" size={18} />
              Обсуждённые темы
            </h4>
            {discussedTopicsArray.length > 0 ? (
              <div className="space-y-2">
                {discussedTopicsArray.map(([topic, depth]) => (
                  <div key={topic} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{topic}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Глубина: {depth}</Badge>
                      <Progress value={Math.min(depth * 20, 100)} className="w-20 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Темы ещё не обсуждались</p>
            )}
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
              <Icon name="ThumbsUp" size={18} />
              Позитивные реакции
            </h4>
            {extractedKnowledge.patientReactions.positiveReactions.length > 0 ? (
              <ul className="space-y-1">
                {extractedKnowledge.patientReactions.positiveReactions.map((r, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground">• {r}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Нет позитивных реакций</p>
            )}
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
              <Icon name="ThumbsDown" size={18} />
              Негативные реакции
            </h4>
            {extractedKnowledge.patientReactions.negativeReactions.length > 0 ? (
              <ul className="space-y-1">
                {extractedKnowledge.patientReactions.negativeReactions.map((r, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground">• {r}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Нет негативных реакций</p>
            )}
          </Card>
        </TabsContent>

        {/* Стратегия ответа */}
        <TabsContent value="strategy" className="space-y-4">
          <Card className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="Target" size={18} />
              Стратегия следующего ответа
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Задать вопрос</span>
                {nextResponseStrategy.shouldAskQuestion ? (
                  <Badge variant="default">Да</Badge>
                ) : (
                  <Badge variant="outline">Нет</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Выразить опасение</span>
                {nextResponseStrategy.shouldExpressConcern ? (
                  <Badge variant="default">Да</Badge>
                ) : (
                  <Badge variant="outline">Нет</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Показать благодарность</span>
                {nextResponseStrategy.shouldShowGratitude ? (
                  <Badge variant="default">Да</Badge>
                ) : (
                  <Badge variant="outline">Нет</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Оспорить</span>
                {nextResponseStrategy.shouldChallenge ? (
                  <Badge variant="default">Да</Badge>
                ) : (
                  <Badge variant="outline">Нет</Badge>
                )}
              </div>

              {nextResponseStrategy.topicToExplore && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Тема для исследования:</p>
                  <Badge>{nextResponseStrategy.topicToExplore}</Badge>
                </div>
              )}

              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Эмоциональная интенсивность</span>
                  <span className="text-sm font-medium">
                    {Math.round(nextResponseStrategy.emotionalIntensity * 100)}%
                  </span>
                </div>
                <Progress 
                  value={nextResponseStrategy.emotionalIntensity * 100} 
                  className="h-2" 
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Как используется стратегия?</p>
                <p>
                  AI-пациент анализирует эти параметры и генерирует уникальный ответ 
                  на основе контекста диалога, без использования скриптов.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
