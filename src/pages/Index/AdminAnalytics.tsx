import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SessionData {
  id: number;
  userId: number;
  userName: string;
  department: string;
  region: string;
  position: string;
  scenarioId: number;
  scenarioTitle: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timestamp: string;
  score: number;
  satisfaction: number;
  duration: number;
  errors: string[];
  missedOpportunities: string[];
  criteria: {
    communication: number;
    empathy: number;
    professionalism: number;
    problemSolving: number;
    knowledgeBase: number;
  };
}

interface ErrorStat {
  error: string;
  count: number;
  avgImpact: number;
}

interface ScenarioStat {
  id: number;
  title: string;
  avgScore: number;
  totalAttempts: number;
  avgDuration: number;
  successRate: number;
}

export default function AdminAnalytics() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('30');

  useEffect(() => {
    const mockSessions: SessionData[] = [
      {
        id: 1,
        userId: 1,
        userName: 'Иванов Иван',
        department: 'Терапия',
        region: 'Москва',
        position: 'Врач-терапевт',
        scenarioId: 1,
        scenarioTitle: 'Сложная диагностика',
        difficulty: 'hard',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        score: 85,
        satisfaction: 4.5,
        duration: 720,
        errors: ['Недостаточно уточняющих вопросов', 'Пропущен важный симптом'],
        missedOpportunities: ['Можно было углубиться в анамнез'],
        criteria: {
          communication: 88,
          empathy: 85,
          professionalism: 90,
          problemSolving: 82,
          knowledgeBase: 80,
        },
      },
      {
        id: 2,
        userId: 2,
        userName: 'Петрова Мария',
        department: 'Кардиология',
        region: 'Санкт-Петербург',
        position: 'Врач-кардиолог',
        scenarioId: 2,
        scenarioTitle: 'Экстренная помощь',
        difficulty: 'hard',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        score: 72,
        satisfaction: 4.0,
        duration: 540,
        errors: ['Медленное принятие решений', 'Нарушена последовательность действий'],
        missedOpportunities: ['Можно было быстрее вызвать помощь', 'Недостаточная коммуникация с пациентом'],
        criteria: {
          communication: 70,
          empathy: 75,
          professionalism: 85,
          problemSolving: 65,
          knowledgeBase: 78,
        },
      },
      {
        id: 3,
        userId: 3,
        userName: 'Сидоров Алексей',
        department: 'Терапия',
        region: 'Москва',
        position: 'Врач-терапевт',
        scenarioId: 3,
        scenarioTitle: 'Конфликтный пациент',
        difficulty: 'medium',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        score: 68,
        satisfaction: 3.5,
        duration: 480,
        errors: ['Недостаточная эмпатия', 'Не удалось деэскалировать конфликт сразу'],
        missedOpportunities: ['Можно было предложить компромисс раньше'],
        criteria: {
          communication: 65,
          empathy: 60,
          professionalism: 75,
          problemSolving: 70,
          knowledgeBase: 72,
        },
      },
      {
        id: 4,
        userId: 4,
        userName: 'Кузнецова Анна',
        department: 'Педиатрия',
        region: 'Казань',
        position: 'Врач-педиатр',
        scenarioId: 1,
        scenarioTitle: 'Сложная диагностика',
        difficulty: 'hard',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        score: 78,
        satisfaction: 4.2,
        duration: 660,
        errors: ['Недостаточно вопросов о семейном анамнезе'],
        missedOpportunities: ['Можно было провести дополнительный осмотр'],
        criteria: {
          communication: 80,
          empathy: 82,
          professionalism: 88,
          problemSolving: 75,
          knowledgeBase: 70,
        },
      },
      {
        id: 5,
        userId: 5,
        userName: 'Смирнов Дмитрий',
        department: 'Хирургия',
        region: 'Санкт-Петербург',
        position: 'Хирург',
        scenarioId: 4,
        scenarioTitle: 'Предоперационная консультация',
        difficulty: 'medium',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        score: 90,
        satisfaction: 4.8,
        duration: 600,
        errors: [],
        missedOpportunities: [],
        criteria: {
          communication: 92,
          empathy: 88,
          professionalism: 95,
          problemSolving: 90,
          knowledgeBase: 85,
        },
      },
      {
        id: 6,
        userId: 1,
        userName: 'Иванов Иван',
        department: 'Терапия',
        region: 'Москва',
        position: 'Врач-терапевт',
        scenarioId: 3,
        scenarioTitle: 'Конфликтный пациент',
        difficulty: 'medium',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        score: 75,
        satisfaction: 4.0,
        duration: 500,
        errors: ['Недостаточная деэскалация конфликта'],
        missedOpportunities: ['Можно было проявить больше эмпатии'],
        criteria: {
          communication: 78,
          empathy: 70,
          professionalism: 80,
          problemSolving: 75,
          knowledgeBase: 72,
        },
      },
    ];

    setTimeout(() => {
      setSessions(mockSessions);
      setLoading(false);
    }, 500);
  }, []);

  const filteredSessions = sessions.filter((session) => {
    const matchesDepartment = departmentFilter === 'all' || session.department === departmentFilter;
    const matchesRegion = regionFilter === 'all' || session.region === regionFilter;
    const matchesPosition = positionFilter === 'all' || session.position === positionFilter;
    const matchesDifficulty = difficultyFilter === 'all' || session.difficulty === difficultyFilter;

    const daysAgo = (Date.now() - new Date(session.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    const matchesTime = timeFilter === 'all' || daysAgo <= parseInt(timeFilter);

    return matchesDepartment && matchesRegion && matchesPosition && matchesDifficulty && matchesTime;
  });

  const departments = Array.from(new Set(sessions.map((s) => s.department)));
  const regions = Array.from(new Set(sessions.map((s) => s.region)));
  const positions = Array.from(new Set(sessions.map((s) => s.position)));

  const totalSessions = filteredSessions.length;
  const avgScore = filteredSessions.reduce((sum, s) => sum + s.score, 0) / filteredSessions.length || 0;
  const avgSatisfaction =
    filteredSessions.reduce((sum, s) => sum + s.satisfaction, 0) / filteredSessions.length || 0;

  const avgCriteria = {
    communication:
      filteredSessions.reduce((sum, s) => sum + s.criteria.communication, 0) / filteredSessions.length || 0,
    empathy:
      filteredSessions.reduce((sum, s) => sum + s.criteria.empathy, 0) / filteredSessions.length || 0,
    professionalism:
      filteredSessions.reduce((sum, s) => sum + s.criteria.professionalism, 0) / filteredSessions.length || 0,
    problemSolving:
      filteredSessions.reduce((sum, s) => sum + s.criteria.problemSolving, 0) / filteredSessions.length || 0,
    knowledgeBase:
      filteredSessions.reduce((sum, s) => sum + s.criteria.knowledgeBase, 0) / filteredSessions.length || 0,
  };

  const errorStats: ErrorStat[] = [];
  filteredSessions.forEach((session) => {
    session.errors.forEach((error) => {
      const existing = errorStats.find((e) => e.error === error);
      if (existing) {
        existing.count++;
        existing.avgImpact += (100 - session.score) / session.errors.length;
      } else {
        errorStats.push({
          error,
          count: 1,
          avgImpact: (100 - session.score) / session.errors.length,
        });
      }
    });
  });
  errorStats.forEach((stat) => (stat.avgImpact /= stat.count));
  errorStats.sort((a, b) => b.count - a.count);

  const scenarioStats: { [key: number]: ScenarioStat } = {};
  filteredSessions.forEach((session) => {
    if (!scenarioStats[session.scenarioId]) {
      scenarioStats[session.scenarioId] = {
        id: session.scenarioId,
        title: session.scenarioTitle,
        avgScore: 0,
        totalAttempts: 0,
        avgDuration: 0,
        successRate: 0,
      };
    }
    const stat = scenarioStats[session.scenarioId];
    stat.avgScore += session.score;
    stat.totalAttempts++;
    stat.avgDuration += session.duration;
    if (session.score >= 70) stat.successRate++;
  });

  const scenarioStatsArray = Object.values(scenarioStats).map((stat) => ({
    ...stat,
    avgScore: stat.avgScore / stat.totalAttempts,
    avgDuration: stat.avgDuration / stat.totalAttempts,
    successRate: (stat.successRate / stat.totalAttempts) * 100,
  }));
  scenarioStatsArray.sort((a, b) => a.avgScore - b.avgScore);

  const departmentStats = departments.map((dept) => {
    const deptSessions = filteredSessions.filter((s) => s.department === dept);
    const deptAvgScore = deptSessions.reduce((sum, s) => sum + s.score, 0) / deptSessions.length || 0;
    return { department: dept, avgScore: deptAvgScore, count: deptSessions.length };
  });
  departmentStats.sort((a, b) => b.avgScore - a.avgScore);

  const regionStats = regions.map((region) => {
    const regionSessions = filteredSessions.filter((s) => s.region === region);
    const regionAvgScore = regionSessions.reduce((sum, s) => sum + s.score, 0) / regionSessions.length || 0;
    return { region, avgScore: regionAvgScore, count: regionSessions.length };
  });
  regionStats.sort((a, b) => b.avgScore - a.avgScore);

  const positionStats = positions.map((position) => {
    const posSessions = filteredSessions.filter((s) => s.position === position);
    const posAvgScore = posSessions.reduce((sum, s) => sum + s.score, 0) / posSessions.length || 0;
    return { position, avgScore: posAvgScore, count: posSessions.length };
  });
  positionStats.sort((a, b) => b.avgScore - a.avgScore);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Аналитика для администратора</h2>
          <p className="text-muted-foreground">Детальная статистика по всем сессиям и пользователям</p>
        </div>
        <Button>
          <Icon name="Download" size={20} className="mr-2" />
          Экспорт данных
        </Button>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Фильтры</h3>
        <div className="grid grid-cols-5 gap-4">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Отдел" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все отделы</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Регион" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все регионы</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Должность" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все должности</SelectItem>
              {positions.map((position) => (
                <SelectItem key={position} value={position}>
                  {position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Сложность" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Любая сложность</SelectItem>
              <SelectItem value="easy">Легкая</SelectItem>
              <SelectItem value="medium">Средняя</SelectItem>
              <SelectItem value="hard">Сложная</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">За 7 дней</SelectItem>
              <SelectItem value="30">За 30 дней</SelectItem>
              <SelectItem value="90">За 90 дней</SelectItem>
              <SelectItem value="all">Все время</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <Icon name="Loader" size={48} className="animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Всего сессий</h3>
                <Icon name="Activity" size={20} className="text-primary" />
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
                <h3 className="text-sm font-medium text-muted-foreground">Удовлетворённость</h3>
                <Icon name="Star" size={20} className="text-primary" />
              </div>
              <p className="text-3xl font-bold">{avgSatisfaction.toFixed(1)}/5</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Общие оценки по критериям</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Коммуникативные навыки</span>
                  <span className="text-sm text-muted-foreground">{avgCriteria.communication.toFixed(1)}%</span>
                </div>
                <Progress value={avgCriteria.communication} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Эмпатия</span>
                  <span className="text-sm text-muted-foreground">{avgCriteria.empathy.toFixed(1)}%</span>
                </div>
                <Progress value={avgCriteria.empathy} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Профессионализм</span>
                  <span className="text-sm text-muted-foreground">{avgCriteria.professionalism.toFixed(1)}%</span>
                </div>
                <Progress value={avgCriteria.professionalism} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Решение проблем</span>
                  <span className="text-sm text-muted-foreground">{avgCriteria.problemSolving.toFixed(1)}%</span>
                </div>
                <Progress value={avgCriteria.problemSolving} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">База знаний</span>
                  <span className="text-sm text-muted-foreground">{avgCriteria.knowledgeBase.toFixed(1)}%</span>
                </div>
                <Progress value={avgCriteria.knowledgeBase} />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="AlertCircle" size={24} className="text-orange-600" />
                Топ ошибок
              </h3>
              {errorStats.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Ошибок не обнаружено</p>
              ) : (
                <div className="space-y-3">
                  {errorStats.slice(0, 5).map((stat, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-accent/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{stat.error}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Встречается {stat.count} раз • Влияние: -{stat.avgImpact.toFixed(1)} баллов
                        </p>
                      </div>
                      <Badge variant="destructive">{stat.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Target" size={24} className="text-red-600" />
                Самые сложные сценарии
              </h3>
              {scenarioStatsArray.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Нет данных</p>
              ) : (
                <div className="space-y-3">
                  {scenarioStatsArray.slice(0, 5).map((stat) => (
                    <div key={stat.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{stat.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stat.totalAttempts} попыток • {stat.successRate.toFixed(0)}% успешных
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{stat.avgScore.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">средний балл</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Статистика по отделам</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Отдел</TableHead>
                  <TableHead>Количество сессий</TableHead>
                  <TableHead>Средний балл</TableHead>
                  <TableHead>Уровень</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentStats.map((stat) => (
                  <TableRow key={stat.department}>
                    <TableCell className="font-medium">{stat.department}</TableCell>
                    <TableCell>{stat.count}</TableCell>
                    <TableCell>{stat.avgScore.toFixed(1)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          stat.avgScore >= 80 ? 'default' : stat.avgScore >= 70 ? 'secondary' : 'destructive'
                        }
                      >
                        {stat.avgScore >= 80 ? 'Высокий' : stat.avgScore >= 70 ? 'Средний' : 'Низкий'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Статистика по регионам</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Регион</TableHead>
                  <TableHead>Количество сессий</TableHead>
                  <TableHead>Средний балл</TableHead>
                  <TableHead>Уровень</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regionStats.map((stat) => (
                  <TableRow key={stat.region}>
                    <TableCell className="font-medium">{stat.region}</TableCell>
                    <TableCell>{stat.count}</TableCell>
                    <TableCell>{stat.avgScore.toFixed(1)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          stat.avgScore >= 80 ? 'default' : stat.avgScore >= 70 ? 'secondary' : 'destructive'
                        }
                      >
                        {stat.avgScore >= 80 ? 'Высокий' : stat.avgScore >= 70 ? 'Средний' : 'Низкий'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Статистика по должностям</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Должность</TableHead>
                  <TableHead>Количество сессий</TableHead>
                  <TableHead>Средний балл</TableHead>
                  <TableHead>Уровень</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positionStats.map((stat) => (
                  <TableRow key={stat.position}>
                    <TableCell className="font-medium">{stat.position}</TableCell>
                    <TableCell>{stat.count}</TableCell>
                    <TableCell>{stat.avgScore.toFixed(1)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          stat.avgScore >= 80 ? 'default' : stat.avgScore >= 70 ? 'secondary' : 'destructive'
                        }
                      >
                        {stat.avgScore >= 80 ? 'Высокий' : stat.avgScore >= 70 ? 'Средний' : 'Низкий'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
