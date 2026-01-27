import { useState, useEffect, useRef } from 'react';
import { CustomScenario } from '@/types/scenario';
import { CustomAI, ConversationAnalysis } from '@/lib/customAI';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScenarioPlayerProps {
  scenario: CustomScenario;
  onClose: () => void;
}

export default function ScenarioPlayer({ scenario, onClose }: ScenarioPlayerProps) {
  const storageKey = `scenario_${scenario.id}_history`;
  
  const [ai] = useState(() => {
    const aiInstance = new CustomAI(scenario);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        aiInstance.loadHistory(parsed);
      } catch (e) {
        console.error('Failed to restore history:', e);
      }
    }
    return aiInstance;
  });
  
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.messages || [];
      } catch (e) {
        return [{ role: 'ai', content: ai.getGreeting() }];
      }
    }
    return [{ role: 'ai', content: ai.getGreeting() }];
  });
  
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<ConversationAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    const historyData = {
      messages,
      satisfaction: ai.getCurrentSatisfaction(),
      emotionalState: ai.getCurrentEmotionalState(),
      timestamp: Date.now()
    };
    localStorage.setItem(storageKey, JSON.stringify(historyData));
  }, [messages, storageKey, ai]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsProcessing(true);

    try {
      const response = await ai.generateResponse(userMessage);
      setMessages(prev => [...prev, { role: 'ai', content: response.message }]);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem(storageKey);
    window.location.reload();
  };

  const handleAnalyze = () => {
    const result = ai.analyzeConversation();
    setAnalysis(result);
    setShowAnalysis(true);
  };

  const satisfaction = ai.getCurrentSatisfaction();
  const emotionalState = ai.getCurrentEmotionalState();
  const messageCount = Math.floor(messages.filter(m => m.role === 'user').length);
  const maxMessages = 15;
  const remainingMessages = maxMessages - messageCount;

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      calm: 'bg-blue-100 text-blue-800',
      nervous: 'bg-yellow-100 text-yellow-800',
      angry: 'bg-red-100 text-red-800',
      scared: 'bg-purple-100 text-purple-800',
      happy: 'bg-green-100 text-green-800',
      sad: 'bg-gray-100 text-gray-800',
      confused: 'bg-orange-100 text-orange-800',
      excited: 'bg-pink-100 text-pink-800'
    };
    return colors[emotion] || 'bg-gray-100 text-gray-800';
  };

  const emotionLabels: Record<string, string> = {
    calm: 'Спокойный',
    nervous: 'Нервный',
    angry: 'Раздражён',
    scared: 'Напуган',
    happy: 'Доволен',
    sad: 'Грустный',
    confused: 'Растерян',
    excited: 'Взволнован'
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4 bg-muted/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-semibold">{scenario.name}</h2>
            <p className="text-sm text-muted-foreground">{scenario.context.role}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleClearHistory} title="Начать заново">
              <Icon name="RotateCcw" size={20} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Удовлетворённость</span>
              <span className={`text-lg font-bold ${getScoreColor(satisfaction)}`}>
                {satisfaction}%
              </span>
            </div>
            <Progress value={satisfaction} className="h-2" />
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Состояние ИИ</span>
              <Badge className={getEmotionColor(emotionalState)}>
                {emotionLabels[emotionalState] || emotionalState}
              </Badge>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Сообщений</span>
              <Badge variant={remainingMessages <= 3 ? "destructive" : "secondary"}>
                {messageCount} / {maxMessages}
              </Badge>
            </div>
          </Card>
        </div>
      </div>

      {showAnalysis ? (
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Анализ разговора</h3>
              <Button variant="outline" onClick={() => setShowAnalysis(false)}>
                <Icon name="MessageSquare" size={16} className="mr-2" />
                Вернуться к диалогу
              </Button>
            </div>

            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4">Общий результат</h4>
              <div className="text-center mb-6">
                <div className={`text-6xl font-bold ${getScoreColor(analysis!.overallScore)}`}>
                  {analysis!.overallScore}%
                </div>
                <p className="text-muted-foreground mt-2">Итоговый балл</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Соответствие контексту</div>
                  <div className={`text-2xl font-bold ${getScoreColor(analysis!.alignmentScore)}`}>
                    {analysis!.alignmentScore}%
                  </div>
                  <Progress value={analysis!.alignmentScore} className="h-2 mt-2" />
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Качество общения</div>
                  <div className={`text-2xl font-bold ${getScoreColor(analysis!.communicationScore)}`}>
                    {analysis!.communicationScore}%
                  </div>
                  <Progress value={analysis!.communicationScore} className="h-2 mt-2" />
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Прогресс к цели</div>
                  <div className={`text-2xl font-bold ${getScoreColor(analysis!.goalProgressScore)}`}>
                    {analysis!.goalProgressScore}%
                  </div>
                  <Progress value={analysis!.goalProgressScore} className="h-2 mt-2" />
                </div>
              </div>
            </Card>

            {analysis!.goodPoints.length > 0 && (
              <Card className="p-6 border-green-200 bg-green-50">
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-800">
                  <Icon name="ThumbsUp" size={20} />
                  Что получилось хорошо
                </h4>
                <ul className="space-y-2">
                  {analysis!.goodPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-green-700">
                      <Icon name="Check" size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {analysis!.recommendations.length > 0 && (
              <Card className="p-6 border-yellow-200 bg-yellow-50">
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-yellow-800">
                  <Icon name="Lightbulb" size={20} />
                  Рекомендации
                </h4>
                <ul className="space-y-2">
                  {analysis!.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-yellow-700">
                      <Icon name="ArrowRight" size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {analysis!.missedOpportunities.length > 0 && (
              <Card className="p-6 border-red-200 bg-red-50">
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-800">
                  <Icon name="AlertCircle" size={20} />
                  Упущенные возможности
                </h4>
                <ul className="space-y-2">
                  {analysis!.missedOpportunities.map((miss, i) => (
                    <li key={i} className="flex items-start gap-2 text-red-700">
                      <Icon name="Minus" size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{miss}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <Card
                    className={`p-4 max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </Card>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <Card className="p-4 bg-muted">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </Card>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4 bg-background">
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Введите ваш ответ..."
                  className="min-h-[80px] resize-none"
                  disabled={isProcessing || messageCount >= maxMessages}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isProcessing || messageCount >= maxMessages}
                    size="icon"
                    className="h-10 w-10"
                  >
                    <Icon name="Send" size={18} />
                  </Button>
                  <Button
                    onClick={handleAnalyze}
                    variant="outline"
                    size="icon"
                    disabled={messageCount < 1}
                    className="h-10 w-10"
                  >
                    <Icon name="BarChart3" size={18} />
                  </Button>
                </div>
              </div>

              {remainingMessages <= 5 && remainingMessages > 0 && (
                <div className="text-sm text-muted-foreground text-center">
                  Осталось сообщений: {remainingMessages}
                </div>
              )}

              {messageCount >= maxMessages && (
                <div className="text-sm text-destructive text-center font-medium">
                  Лимит сообщений достигнут. Нажмите кнопку анализа для получения результатов.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
