import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface UserProgress {
  user_id: number;
  username: string;
  full_name: string;
  department_name: string;
  course_id?: number;
  trainer_id?: number;
  title: string;
  status: string;
  progress_percentage?: number;
  score?: number;
  started_at: string;
}

interface UserProgressTabProps {
  filteredCourseProgress: UserProgress[];
  filteredTrainerProgress: UserProgress[];
  getStatusColor: (status: string) => string;
}

export default function UserProgressTab({ 
  filteredCourseProgress, 
  filteredTrainerProgress,
  getStatusColor
}: UserProgressTabProps) {
  const allProgress = [...filteredCourseProgress, ...filteredTrainerProgress];
  
  const userProgressMap = new Map<number, {
    user_id: number;
    username: string;
    full_name: string;
    department_name: string;
    total: number;
    completed: number;
    in_progress: number;
    items: UserProgress[];
  }>();

  allProgress.forEach((prog) => {
    if (!userProgressMap.has(prog.user_id)) {
      userProgressMap.set(prog.user_id, {
        user_id: prog.user_id,
        username: prog.username,
        full_name: prog.full_name,
        department_name: prog.department_name,
        total: 0,
        completed: 0,
        in_progress: 0,
        items: [],
      });
    }

    const userStats = userProgressMap.get(prog.user_id)!;
    userStats.total++;
    userStats.items.push(prog);
    
    if (prog.status === 'Завершен') {
      userStats.completed++;
    } else if (prog.status === 'В процессе') {
      userStats.in_progress++;
    }
  });

  const userStatsArray = Array.from(userProgressMap.values());

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Прогресс по сотрудникам</h2>
      <div className="space-y-4">
        {userStatsArray.map((userStat) => (
          <Card key={userStat.user_id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{userStat.full_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {userStat.username} • {userStat.department_name}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{userStat.in_progress} в процессе</Badge>
                <Badge className="bg-green-500">{userStat.completed} завершено</Badge>
              </div>
            </div>

            <div className="space-y-3">
              {userStat.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <Icon 
                      name={item.course_id ? "BookOpen" : "Target"} 
                      size={20} 
                      className="text-muted-foreground" 
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.course_id ? 'Курс' : 'Тренажер'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(item.status)} variant="outline">
                      {item.status}
                    </Badge>
                    
                    {item.course_id && item.progress_percentage !== undefined && (
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <Progress value={item.progress_percentage} className="w-16 h-2" />
                        <span className="text-xs font-medium">{item.progress_percentage}%</span>
                      </div>
                    )}
                    
                    {item.trainer_id && item.score !== undefined && (
                      <div className="flex items-center gap-1 min-w-[60px]">
                        <Icon name="Award" size={14} className="text-yellow-500" />
                        <span className="text-xs font-medium">{item.score}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
