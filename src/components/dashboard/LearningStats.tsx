import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import PatientAI from '@/lib/patientAI';

interface LearningStatsProps {
  stats?: {
    totalObjections: number;
    totalSuccessful: number;
    totalUnsuccessful: number;
    mostLearnedObjection: string;
    maxLearningCount: number;
  };
}

export default function LearningStats({ stats }: LearningStatsProps) {
  // Default values if stats not provided
  const defaultStats = {
    totalObjections: 0,
    totalSuccessful: 0,
    totalUnsuccessful: 0,
    mostLearnedObjection: '',
    maxLearningCount: 0,
  };
  
  const actualStats = stats || defaultStats;
  const handleResetLearning = () => {
    if (confirm('Вы уверены, что хотите сбросить все данные обучения ИИ? Это действие необратимо.')) {
      PatientAI.resetLearning();
      window.location.reload();
    }
  };

  const successRate = actualStats.totalSuccessful + actualStats.totalUnsuccessful > 0
    ? Math.round((actualStats.totalSuccessful / (actualStats.totalSuccessful + actualStats.totalUnsuccessful)) * 100)
    : 0;

  const getLevelInfo = () => {
    const total = actualStats.totalSuccessful + actualStats.totalUnsuccessful;
    if (total === 0) return { level: 'Новичок', color: 'text-gray-600', icon: 'UserCircle' as const };
    if (total < 10) return { level: 'Ученик', color: 'text-blue-600', icon: 'GraduationCap' as const };
    if (total < 30) return { level: 'Практикант', color: 'text-green-600', icon: 'BookOpen' as const };
    if (total < 50) return { level: 'Специалист', color: 'text-purple-600', icon: 'Award' as const };
    return { level: 'Эксперт', color: 'text-yellow-600', icon: 'Crown' as const };
  };

  const levelInfo = getLevelInfo();
  const totalInteractions = actualStats.totalSuccessful + actualStats.totalUnsuccessful;

  return (
    <Card className="p-6 space-y-4 border-2 border-purple-500/20 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Icon name="Brain" size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Самообучающийся ИИ пациент</h3>
            <div className="flex items-center gap-2 mt-1">
              <Icon name={levelInfo.icon} size={14} className={levelInfo.color} />
              <span className={`text-sm font-medium ${levelInfo.color}`}>{levelInfo.level}</span>
              <span className="text-xs text-muted-foreground">• {totalInteractions} взаимодействий</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetLearning}>
          <Icon name="RotateCcw" size={16} className="mr-2" />
          Сбросить
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <div className="text-2xl font-bold text-primary">{actualStats.totalObjections}</div>
          <div className="text-xs text-muted-foreground">Изучено возражений</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-green-600">{actualStats.totalSuccessful}</div>
          <div className="text-xs text-muted-foreground">Успешных ответов</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-red-600">{actualStats.totalUnsuccessful}</div>
          <div className="text-xs text-muted-foreground">Неудачных ответов</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-purple-600">{successRate}%</div>
          <div className="text-xs text-muted-foreground">Процент успеха</div>
        </div>
      </div>

      {actualStats.mostLearnedObjection && (
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="TrendingUp" size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">Самое изученное возражение:</span>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-sm">
              {actualStats.mostLearnedObjection}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {actualStats.maxLearningCount} успешных ответов
            </span>
          </div>
        </div>
      )}

      <div className="pt-4 border-t space-y-3">
        <div className="flex items-start gap-2">
          <Icon name="Sparkles" size={16} className="text-purple-500 mt-0.5" />
          <div className="text-sm space-y-2">
            <p className="font-medium text-purple-700 dark:text-purple-300">Как работает самообучение:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>ИИ запоминает ваши успешные ответы на каждое возражение</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Анализирует ключевые слова и паттерны успешных диалогов</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Становится более требовательным при повторных попытках</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>Адаптирует реакции под ваш стиль коммуникации</span>
              </li>
            </ul>
            <p className="text-green-600 font-medium text-xs mt-2">
              ✨ Чем больше практики, тем реалистичнее становится пациент!
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}