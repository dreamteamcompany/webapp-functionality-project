import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface User {
  id: number;
  name: string;
  role: string;
  department: string;
  avatar?: string;
}

interface SessionResult {
  id: number;
  scenarioId: number;
  scenarioTitle: string;
  timestamp: string;
  score: number;
  satisfaction: number;
  duration: number;
  emotions?: Array<{
    timestamp: number;
    emotion: string;
    confidence: number;
    frame?: string;
  }>;
  transcript?: Array<{
    speaker: 'user' | 'doctor' | 'system';
    text: string;
    timestamp: number;
    analysis?: {
      tone: string;
      empathy: number;
      professionalism: number;
      issues?: string[];
    };
  }>;
  recommendations?: string[];
  strengths?: string[];
  weaknesses?: string[];
}

interface ProfileContentProps {
  currentUser: User;
}

export default function ProfileContent({ currentUser }: ProfileContentProps) {
  const [sessions, setSessions] = useState<SessionResult[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockSessions: SessionResult[] = [
      {
        id: 1,
        scenarioId: 1,
        scenarioTitle: 'Сложная диагностика',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        score: 85,
        satisfaction: 4.5,
        duration: 720,
        emotions: [
          { timestamp: 0, emotion: 'нейтральное', confidence: 0.89, frame: '/placeholder.svg' },
          { timestamp: 180, emotion: 'озабоченное', confidence: 0.76, frame: '/placeholder.svg' },
          { timestamp: 360, emotion: 'уверенное', confidence: 0.92, frame: '/placeholder.svg' },
          { timestamp: 540, emotion: 'удовлетворенное', confidence: 0.85, frame: '/placeholder.svg' },
        ],
        transcript: [
          {
            speaker: 'system',
            text: 'Начало сессии. Сценарий: Сложная диагностика',
            timestamp: 0,
          },
          {
            speaker: 'doctor',
            text: 'Здравствуйте! Проходите, присаживайтесь. Что вас беспокоит?',
            timestamp: 5,
            analysis: {
              tone: 'дружелюбный',
              empathy: 0.85,
              professionalism: 0.9,
            },
          },
          {
            speaker: 'user',
            text: 'Добрый день, доктор. Последнюю неделю меня беспокоит головная боль.',
            timestamp: 12,
          },
          {
            speaker: 'doctor',
            text: 'Понимаю. Давайте разберемся подробнее. Где именно болит голова? Можете показать?',
            timestamp: 18,
            analysis: {
              tone: 'заботливый',
              empathy: 0.88,
              professionalism: 0.92,
              issues: [],
            },
          },
          {
            speaker: 'user',
            text: 'В основном в лобной части, иногда отдает в виски.',
            timestamp: 25,
          },
          {
            speaker: 'doctor',
            text: 'Есть ли какие-то факторы, которые усиливают или облегчают боль?',
            timestamp: 30,
            analysis: {
              tone: 'профессиональный',
              empathy: 0.82,
              professionalism: 0.95,
            },
          },
        ],
        recommendations: [
          'Отличная работа с установлением контакта с пациентом',
          'Рекомендуется больше уточняющих вопросов о характере боли',
          'Продолжайте активно слушать пациента',
        ],
        strengths: [
          'Эмпатичное общение',
          'Структурированный опрос',
          'Профессиональная терминология',
        ],
        weaknesses: [
          'Недостаточно вопросов о сопутствующих симптомах',
          'Можно было уточнить образ жизни пациента',
        ],
      },
      {
        id: 2,
        scenarioId: 3,
        scenarioTitle: 'Конфликтный пациент',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        score: 72,
        satisfaction: 3.8,
        duration: 540,
        emotions: [
          { timestamp: 0, emotion: 'нейтральное', confidence: 0.85 },
          { timestamp: 120, emotion: 'напряженное', confidence: 0.81 },
          { timestamp: 300, emotion: 'спокойное', confidence: 0.88 },
        ],
        transcript: [
          {
            speaker: 'system',
            text: 'Начало сессии. Сценарий: Конфликтный пациент',
            timestamp: 0,
          },
          {
            speaker: 'user',
            text: 'Я жду уже 40 минут! Это неприемлемо!',
            timestamp: 5,
          },
          {
            speaker: 'doctor',
            text: 'Приношу извинения за ожидание. Давайте я помогу вам прямо сейчас.',
            timestamp: 10,
            analysis: {
              tone: 'примирительный',
              empathy: 0.75,
              professionalism: 0.85,
              issues: ['Можно было более подробно объяснить причину задержки'],
            },
          },
        ],
        recommendations: [
          'Хорошая деэскалация конфликта',
          'Стоит детальнее объяснять причины задержек',
          'Практикуйте технику активного слушания в напряженных ситуациях',
        ],
        strengths: [
          'Сохранение спокойствия',
          'Быстрый переход к решению проблемы',
        ],
        weaknesses: [
          'Недостаточное признание чувств пациента',
          'Можно было предложить компенсацию за ожидание',
        ],
      },
    ];

    setTimeout(() => {
      setSessions(mockSessions);
      setLoading(false);
    }, 500);
  }, []);

  const totalSessions = sessions.length;
  const avgScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length || 0;
  const totalHours = Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / 3600);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{currentUser.name}</h2>
            <p className="text-muted-foreground">{currentUser.role}</p>
            <p className="text-sm text-muted-foreground">{currentUser.department}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Всего сессий</h3>
            <Icon name="PlayCircle" size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-bold">{totalSessions}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Средний балл</h3>
            <Icon name="TrendingUp" size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-bold">{avgScore.toFixed(1)}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Часов практики</h3>
            <Icon name="Clock" size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-bold">{totalHours}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Ваш прогресс</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Коммуникативные навыки</span>
              <span className="text-sm text-muted-foreground">82%</span>
            </div>
            <Progress value={82} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Эмпатия</span>
              <span className="text-sm text-muted-foreground">78%</span>
            </div>
            <Progress value={78} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Профессионализм</span>
              <span className="text-sm text-muted-foreground">90%</span>
            </div>
            <Progress value={90} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Разрешение конфликтов</span>
              <span className="text-sm text-muted-foreground">65%</span>
            </div>
            <Progress value={65} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Персональные рекомендации</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
            <Icon name="Lightbulb" size={20} className="text-primary mt-0.5" />
            <div>
              <p className="font-medium">Практикуйте работу с конфликтными пациентами</p>
              <p className="text-sm text-muted-foreground">
                Ваш средний балл в конфликтных сценариях ниже общего уровня на 13%
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
            <Icon name="TrendingUp" size={20} className="text-primary mt-0.5" />
            <div>
              <p className="font-medium">Отличная динамика роста</p>
              <p className="text-sm text-muted-foreground">
                За последний месяц ваш средний балл вырос на 8 пунктов
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
            <Icon name="Target" size={20} className="text-primary mt-0.5" />
            <div>
              <p className="font-medium">Рекомендуем пройти курс</p>
              <p className="text-sm text-muted-foreground">
                "Техники активного слушания" поможет улучшить ваши показатели эмпатии
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">История сессий</h3>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Loader" size={32} className="animate-spin mx-auto mb-2" />
            Загрузка...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="FileQuestion" size={48} className="mx-auto mb-2 opacity-50" />
            <p>У вас пока нет завершенных сессий</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex-1">
                  <h4 className="font-medium">{session.scenarioTitle}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.timestamp).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Балл</p>
                    <p className="text-lg font-bold">{session.score}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Длительность</p>
                    <p className="text-lg font-medium">{formatDuration(session.duration)}</p>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedSession?.scenarioTitle}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh] pr-4">
            {selectedSession && (
              <Tabs defaultValue="transcript" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="transcript">Диалог</TabsTrigger>
                  <TabsTrigger value="emotions">Эмоции</TabsTrigger>
                  <TabsTrigger value="analysis">Анализ</TabsTrigger>
                  <TabsTrigger value="recommendations">Рекомендации</TabsTrigger>
                </TabsList>

                <TabsContent value="transcript" className="space-y-3 mt-4">
                  {selectedSession.transcript?.map((message, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        message.speaker === 'system'
                          ? 'bg-muted/50 text-center text-sm'
                          : message.speaker === 'doctor'
                          ? 'bg-primary/10 ml-8'
                          : 'bg-accent/50 mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {message.speaker === 'doctor'
                            ? '🩺 Врач'
                            : message.speaker === 'user'
                            ? '👤 Пациент'
                            : '⚙️ Система'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <p>{message.text}</p>
                      {message.analysis && (
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="outline">{message.analysis.tone}</Badge>
                            <span className="text-muted-foreground">
                              Эмпатия: {(message.analysis.empathy * 100).toFixed(0)}%
                            </span>
                            <span className="text-muted-foreground">
                              Профессионализм: {(message.analysis.professionalism * 100).toFixed(0)}%
                            </span>
                          </div>
                          {message.analysis.issues && message.analysis.issues.length > 0 && (
                            <div className="flex items-start gap-2 text-sm text-orange-600">
                              <Icon name="AlertCircle" size={16} className="mt-0.5" />
                              <ul className="list-disc list-inside">
                                {message.analysis.issues.map((issue, i) => (
                                  <li key={i}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="emotions" className="space-y-4 mt-4">
                  {selectedSession.emotions && selectedSession.emotions.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedSession.emotions.map((emotion, index) => (
                        <Card key={index} className="p-4">
                          {emotion.frame && (
                            <img
                              src={emotion.frame}
                              alt="Кадр"
                              className="w-full h-48 object-cover rounded-lg mb-3"
                            />
                          )}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{emotion.emotion}</span>
                              <span className="text-sm text-muted-foreground">
                                {formatTimestamp(emotion.timestamp)}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-muted-foreground">Уверенность</span>
                                <span className="text-sm font-medium">
                                  {(emotion.confidence * 100).toFixed(0)}%
                                </span>
                              </div>
                              <Progress value={emotion.confidence * 100} />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Icon name="Camera" size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Анализ эмоций не проводился для этой сессии</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4 mt-4">
                  <Card className="p-6">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <Icon name="TrendingUp" size={20} className="text-green-600" />
                      Сильные стороны
                    </h4>
                    <ul className="space-y-2">
                      {selectedSession.strengths?.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={16} className="text-green-600 mt-1" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <Icon name="AlertCircle" size={20} className="text-orange-600" />
                      Области для улучшения
                    </h4>
                    <ul className="space-y-2">
                      {selectedSession.weaknesses?.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Icon name="AlertCircle" size={16} className="text-orange-600 mt-1" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2 text-muted-foreground">Общий балл</h4>
                        <p className="text-4xl font-bold">{selectedSession.score}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-muted-foreground">
                          Удовлетворённость
                        </h4>
                        <div className="flex items-center gap-2">
                          <p className="text-4xl font-bold">{selectedSession.satisfaction}</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Icon
                                key={star}
                                name="Star"
                                size={20}
                                className={
                                  star <= selectedSession.satisfaction
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-3 mt-4">
                  {selectedSession.recommendations?.map((recommendation, index) => (
                    <Card key={index} className="p-4 flex items-start gap-3">
                      <Icon name="Lightbulb" size={20} className="text-primary mt-0.5" />
                      <p>{recommendation}</p>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
