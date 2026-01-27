import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { ConversationAnalysis } from '@/lib/advancedPatientAI';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DeepAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  analysis: ConversationAnalysis | null;
}

export default function DeepAnalysisModal({ open, onClose, analysis }: DeepAnalysisModalProps) {
  if (!analysis) return null;

  const { 
    patientBehaviorModel = {
      trustLevel: 0,
      cooperationLevel: 0,
      anxietyLevel: 0,
      informationAbsorption: 0,
      decisionReadiness: 0,
      primaryConcerns: [],
      unresolvedDouBts: [],
      emotionalTriggers: []
    }, 
    conversationScenarios = [], 
    deepInsights = [] 
  } = analysis;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: string) => {
    if (impact === 'positive') return 'bg-green-500/10 text-green-700 border-green-500/20';
    if (impact === 'negative') return 'bg-red-500/10 text-red-700 border-red-500/20';
    return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      communication: 'MessageCircle',
      empathy: 'Heart',
      professionalism: 'Award',
      clarity: 'Lightbulb',
      trust: 'Shield'
    };
    return icons[category] || 'Info';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Icon name="Brain" size={28} className="text-purple-600" />
            Глубокий анализ диалога
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="behavior" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="behavior">Модель пациента</TabsTrigger>
            <TabsTrigger value="scenarios">Сценарии</TabsTrigger>
            <TabsTrigger value="insights">Инсайты</TabsTrigger>
          </TabsList>

          <TabsContent value="behavior" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Icon name="User" size={20} />
                Психологический портрет пациента
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Уровень доверия</span>
                    <span className={`font-bold ${getScoreColor(patientBehaviorModel.trustLevel)}`}>
                      {patientBehaviorModel.trustLevel}%
                    </span>
                  </div>
                  <Progress value={patientBehaviorModel.trustLevel} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Готовность к сотрудничеству</span>
                    <span className={`font-bold ${getScoreColor(patientBehaviorModel.cooperationLevel)}`}>
                      {patientBehaviorModel.cooperationLevel}%
                    </span>
                  </div>
                  <Progress value={patientBehaviorModel.cooperationLevel} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Уровень тревожности</span>
                    <span className={`font-bold ${getScoreColor(100 - patientBehaviorModel.anxietyLevel)}`}>
                      {patientBehaviorModel.anxietyLevel}%
                    </span>
                  </div>
                  <Progress value={patientBehaviorModel.anxietyLevel} className="h-2 bg-red-100" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Усвоение информации</span>
                    <span className={`font-bold ${getScoreColor(patientBehaviorModel.informationAbsorption)}`}>
                      {patientBehaviorModel.informationAbsorption}%
                    </span>
                  </div>
                  <Progress value={patientBehaviorModel.informationAbsorption} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Готовность к решению</span>
                    <span className={`font-bold ${getScoreColor(patientBehaviorModel.decisionReadiness)}`}>
                      {patientBehaviorModel.decisionReadiness}%
                    </span>
                  </div>
                  <Progress value={patientBehaviorModel.decisionReadiness} className="h-2" />
                </div>
              </div>

              {patientBehaviorModel.primaryConcerns.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Icon name="AlertCircle" size={16} />
                    Основные опасения
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {patientBehaviorModel.primaryConcerns.map((concern, idx) => (
                      <Badge key={idx} variant="outline" className="bg-orange-500/10">
                        {concern}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {patientBehaviorModel.unresolvedDouBts.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Icon name="HelpCircle" size={16} />
                    Нерешённые сомнения
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {patientBehaviorModel.unresolvedDouBts.map((doubt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{doubt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {patientBehaviorModel.emotionalTriggers.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Icon name="Zap" size={16} />
                    Эмоциональные триггеры
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {patientBehaviorModel.emotionalTriggers.map((trigger, idx) => (
                      <Badge key={idx} variant="outline" className="bg-red-500/10">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-4">
            {conversationScenarios.map((scenario, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{scenario.description}</h3>
                  <Badge
                    variant="outline"
                    className={
                      scenario.scenarioType === 'ideal'
                        ? 'bg-green-500/10 text-green-700'
                        : scenario.scenarioType === 'actual'
                        ? 'bg-blue-500/10 text-blue-700'
                        : 'bg-purple-500/10 text-purple-700'
                    }
                  >
                    {scenario.scenarioType === 'ideal' && 'Идеальный'}
                    {scenario.scenarioType === 'actual' && 'Реальный'}
                    {scenario.scenarioType === 'alternative' && 'Альтернативный'}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  {scenario.keyMoments.map((moment, mIdx) => (
                    <div key={mIdx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Badge variant="outline" className={getImpactColor(moment.impact)}>
                        Ход {moment.turn}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm">{moment.what}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Изменение удовлетворённости: {moment.satisfactionChange > 0 ? '+' : ''}
                          {moment.satisfactionChange}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div>
                    <p className="text-sm font-semibold mb-1">Результат:</p>
                    <p className="text-sm text-muted-foreground">{scenario.outcome}</p>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                    <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                      <Icon name="MessageSquare" size={16} className="text-blue-600" />
                      Мысли пациента:
                    </p>
                    <p className="text-sm italic">"{scenario.patientResponse}"</p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {deepInsights.map((insight, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon name={getCategoryIcon(insight.category)} size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold">{insight.insight}</h3>
                      <Badge variant="outline">{insight.category}</Badge>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div>
                        <p className="text-sm font-semibold mb-2">Доказательства:</p>
                        <ul className="space-y-1">
                          {insight.evidence.map((evidence, eIdx) => (
                            <li key={eIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{evidence}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Icon name="Lightbulb" size={16} className="text-green-600" />
                          Рекомендация:
                        </p>
                        <p className="text-sm">{insight.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}