import { useState, useEffect, useRef } from 'react';
import { CustomScenario } from '@/types/customScenario';
import { CustomPatientAI, ConversationAnalysis } from '@/lib/customPatientAI';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CustomDoctorDialogProps {
  scenario: CustomScenario | null;
  open: boolean;
  onClose: () => void;
}

export default function CustomDoctorDialog({ scenario, open, onClose }: CustomDoctorDialogProps) {
  const [ai, setAi] = useState<CustomPatientAI | null>(null);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<ConversationAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scenario && open) {
      const newAi = new CustomPatientAI(scenario);
      setAi(newAi);
      const greeting = newAi.getGreeting();
      setMessages([{ role: 'ai', content: greeting }]);
      setAnalysis(null);
      setShowAnalysis(false);
    }
  }, [scenario, open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing || !ai) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsProcessing(true);

    try {
      const response = await ai.getResponse(userMessage);
      setMessages(prev => [...prev, { role: 'ai', content: response.message }]);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyze = () => {
    if (!ai) return;
    const result = ai.analyzeConversation();
    setAnalysis(result);
    setShowAnalysis(true);
  };

  const handleClose = () => {
    setMessages([]);
    setInput('');
    setAnalysis(null);
    setShowAnalysis(false);
    setAi(null);
    onClose();
  };

  if (!scenario) return null;

  const satisfaction = ai?.getCurrentSatisfaction() || 50;
  const emotionalState = ai?.getCurrentEmotionalState() || scenario.aiPersonality.emotionalState;

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
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

  const emotionColors: Record<string, string> = {
    calm: 'bg-blue-100 text-blue-800',
    nervous: 'bg-yellow-100 text-yellow-800',
    angry: 'bg-red-100 text-red-800',
    scared: 'bg-purple-100 text-purple-800',
    happy: 'bg-green-100 text-green-800',
    sad: 'bg-gray-100 text-gray-800',
    confused: 'bg-orange-100 text-orange-800',
    excited: 'bg-pink-100 text-pink-800'
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        {showAnalysis && analysis ? (
          <div className="h-full flex flex-col">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="text-2xl">Анализ разговора</DialogTitle>
              <DialogDescription>Результаты вашей практики</DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4">Общий результат</h4>
                  <div className="text-center mb-6">
                    <div className={`text-6xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                      {analysis.overallScore}%
                    </div>
                    <p className="text-muted-foreground mt-2">Итоговый балл</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Соответствие контексту</div>
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.alignmentScore)}`}>
                        {analysis.alignmentScore}%
                      </div>
                      <Progress value={analysis.alignmentScore} className="h-2 mt-2" />
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Качество общения</div>
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.communicationScore)}`}>
                        {analysis.communicationScore}%
                      </div>
                      <Progress value={analysis.communicationScore} className="h-2 mt-2" />
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Прогресс к цели</div>
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.goalProgressScore)}`}>
                        {analysis.goalProgressScore}%
                      </div>
                      <Progress value={analysis.goalProgressScore} className="h-2 mt-2" />
                    </div>
                  </div>
                </Card>

                {analysis.goodPoints.length > 0 && (
                  <Card className="p-6 border-green-200 bg-green-50">
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-800">
                      <Icon name="ThumbsUp" size={20} />
                      Что получилось хорошо
                    </h4>
                    <ul className="space-y-2">
                      {analysis.goodPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-green-700">
                          <Icon name="Check" size={16} className="mt-0.5 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {analysis.recommendations.length > 0 && (
                  <Card className="p-6 border-yellow-200 bg-yellow-50">
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-yellow-800">
                      <Icon name="Lightbulb" size={20} />
                      Рекомендации
                    </h4>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-yellow-700">
                          <Icon name="AlertCircle" size={16} className="mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {analysis.missedOpportunities.length > 0 && (
                  <Card className="p-6 border-red-200 bg-red-50">
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-800">
                      <Icon name="AlertTriangle" size={20} />
                      Упущенные возможности
                    </h4>
                    <ul className="space-y-2">
                      {analysis.missedOpportunities.map((opp, i) => (
                        <li key={i} className="flex items-start gap-2 text-red-700">
                          <Icon name="X" size={16} className="mt-0.5 flex-shrink-0" />
                          <span>{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                <div className="flex gap-2 justify-center pt-4">
                  <Button onClick={() => setShowAnalysis(false)} variant="outline">
                    <Icon name="ArrowLeft" size={16} className="mr-2" />
                    Вернуться к диалогу
                  </Button>
                  <Button onClick={handleClose}>
                    Закрыть
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <DialogHeader className="p-6 border-b bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <DialogTitle className="text-xl">{scenario.name}</DialogTitle>
                  <DialogDescription>{scenario.context.role}</DialogDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <Icon name="X" size={20} />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Настрой пациента</span>
                    <span className={`text-lg font-bold ${getScoreColor(satisfaction)}`}>
                      {satisfaction}%
                    </span>
                  </div>
                  <Progress value={satisfaction} className="h-2" />
                </Card>

                <Card className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Состояние</span>
                    <Badge className={emotionColors[emotionalState]}>
                      {emotionLabels[emotionalState] || emotionalState}
                    </Badge>
                  </div>
                </Card>

                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Icon name="Target" size={14} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">
                      {scenario.context.goal}
                    </span>
                  </div>
                </Card>
              </div>
            </DialogHeader>

            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 bg-blue-50 border-b">
                <div className="flex items-start gap-3 text-sm">
                  <Icon name="Info" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p><strong>Ситуация:</strong> {scenario.context.situation}</p>
                    {scenario.objectives && scenario.objectives.length > 0 && (
                      <p className="mt-1"><strong>Ваши задачи:</strong> {scenario.objectives.slice(0, 3).join(', ')}</p>
                    )}
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="max-w-3xl mx-auto space-y-4">
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
                        <div className="flex items-center gap-2">
                          <Icon name="Loader2" size={16} className="animate-spin" />
                          <span className="text-sm text-muted-foreground">Пациент думает...</span>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="border-t p-4 bg-background">
                <div className="max-w-3xl mx-auto space-y-3">
                  <div className="flex gap-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Введите ваш ответ пациенту..."
                      className="resize-none"
                      rows={2}
                    />
                    <div className="flex flex-col gap-2">
                      <Button onClick={handleSend} disabled={!input.trim() || isProcessing}>
                        <Icon name="Send" size={18} />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleAnalyze}
                        disabled={messages.length < 3}
                      >
                        <Icon name="BarChart" size={18} />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Enter - отправить • Shift+Enter - новая строка
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
