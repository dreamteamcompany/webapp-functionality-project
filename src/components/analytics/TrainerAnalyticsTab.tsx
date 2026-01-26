import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface UserProgress {
  user_id: number;
  username: string;
  full_name: string;
  department_name: string;
  trainer_id?: number;
  title: string;
  status: string;
  score?: number;
  started_at: string;
}

interface TrainerStats {
  trainer_id: number;
  title: string;
  total_users: number;
  in_progress: number;
  completed: number;
  avg_score: number;
}

interface TrainerAnalyticsTabProps {
  trainerStats: TrainerStats[];
  filteredTrainerProgress: UserProgress[];
  getStatusColor: (status: string) => string;
}

export default function TrainerAnalyticsTab({ 
  trainerStats, 
  filteredTrainerProgress,
  getStatusColor
}: TrainerAnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Статистика по тренажерам</h2>
        <div className="space-y-4">
          {trainerStats.map((stat) => (
            <Card key={stat.trainer_id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{stat.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {stat.total_users} сотрудников
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{stat.in_progress} в процессе</Badge>
                  <Badge className="bg-green-500">{stat.completed} завершено</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Award" size={20} className="text-yellow-500" />
                <span className="text-sm">Средний результат: <strong>{stat.avg_score}%</strong></span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Детальный прогресс по тренажерам</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Сотрудник</th>
                  <th className="text-left p-4 font-medium">Отдел</th>
                  <th className="text-left p-4 font-medium">Тренажер</th>
                  <th className="text-left p-4 font-medium">Статус</th>
                  <th className="text-left p-4 font-medium">Результат</th>
                  <th className="text-left p-4 font-medium">Начат</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrainerProgress.map((prog, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{prog.full_name}</p>
                        <p className="text-sm text-muted-foreground">{prog.username}</p>
                      </div>
                    </td>
                    <td className="p-4">{prog.department_name}</td>
                    <td className="p-4">{prog.title}</td>
                    <td className="p-4">
                      <Badge className={getStatusColor(prog.status)}>{prog.status}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Icon name="Award" size={16} className="text-yellow-500" />
                        <span className="text-sm font-semibold">{prog.score || 0}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(prog.started_at).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
