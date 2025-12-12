import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { Course } from '@/components/dashboard/types';

interface DashboardContentProps {
  courses: Course[];
  achievements: any[];
  leaderboard: any[];
  selectedCourseCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  onCourseClick: (course: Course) => void;
  onStartTraining: (type: 'quiz' | 'voice' | 'doctor') => void;
  onOpenSimulator: () => void;
  onOpenSalesBattle: () => void;
  getStatusBadge: (status: Course['status']) => { variant: 'secondary' | 'default' | 'outline'; text: string };
}

export default function DashboardContent({
  courses,
  achievements,
  leaderboard,
  selectedCourseCategory,
  onCategorySelect,
  onCourseClick,
  onStartTraining,
  onOpenSimulator,
  onOpenSalesBattle,
  getStatusBadge,
}: DashboardContentProps) {
  const categories = Array.from(new Set(courses.map(c => c.category)));
  const filteredCourses = selectedCourseCategory
    ? courses.filter(c => c.category === selectedCourseCategory)
    : courses;

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Доступные курсы</h2>
            <p className="text-muted-foreground">Выберите курс для изучения</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedCourseCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategorySelect(null)}
            >
              Все
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCourseCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategorySelect(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map(course => {
            const statusInfo = getStatusBadge(course.status);
            return (
              <Card
                key={course.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onCourseClick(course)}
              >
                <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Icon name="BookOpen" size={48} className="text-primary" />
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Прогресс</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} />
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Icon name="Clock" size={14} />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Icon name="BookOpen" size={14} />
                        {course.lessons.length} уроков
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Тренажёры</h2>
            <Icon name="Dumbbell" size={24} className="text-primary" />
          </div>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onStartTraining('quiz')}
            >
              <Icon name="Brain" size={20} className="mr-3" />
              <div className="flex-1 text-left">
                <div className="font-medium">Тест знаний</div>
                <div className="text-xs text-muted-foreground">Проверьте свои знания</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onStartTraining('voice')}
            >
              <Icon name="Mic" size={20} className="mr-3" />
              <div className="flex-1 text-left">
                <div className="font-medium">Голосовой тренинг</div>
                <div className="text-xs text-muted-foreground">Практика презентации</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onStartTraining('doctor')}
            >
              <Icon name="Stethoscope" size={20} className="mr-3" />
              <div className="flex-1 text-left">
                <div className="font-medium">Виртуальный врач</div>
                <div className="text-xs text-muted-foreground">Практика общения с AI</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onOpenSimulator}
            >
              <Icon name="MessageSquare" size={20} className="mr-3" />
              <div className="flex-1 text-left">
                <div className="font-medium">Симулятор продаж</div>
                <div className="text-xs text-muted-foreground">Тренировка переговоров</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onOpenSalesBattle}
            >
              <Icon name="Swords" size={20} className="mr-3" />
              <div className="flex-1 text-left">
                <div className="font-medium">Sales Battle Arena</div>
                <div className="text-xs text-muted-foreground">Турниры продаж</div>
              </div>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Достижения</h2>
            <Icon name="Award" size={24} className="text-primary" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className={`text-center p-4 rounded-lg border-2 ${
                  achievement.unlocked
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-muted/50 border-muted opacity-60'
                }`}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <div className="text-xs font-medium">{achievement.title}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Рейтинг обучающихся</h2>
          <Icon name="TrendingUp" size={24} className="text-primary" />
        </div>
        <div className="space-y-4">
          {leaderboard.map((user, index) => (
            <div key={user.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0
                    ? 'bg-yellow-500 text-white'
                    : index === 1
                    ? 'bg-gray-400 text-white'
                    : index === 2
                    ? 'bg-orange-600 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </div>
              <Avatar>
                <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.department}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{user.points} XP</div>
                <div className="text-xs text-muted-foreground">{user.coursesCompleted} курсов</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
