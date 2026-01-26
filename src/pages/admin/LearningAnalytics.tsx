import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { authService } from '@/lib/auth';
import { LEARNING_API_URL } from '@/lib/learning';
import { useToast } from '@/hooks/use-toast';

import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import AnalyticsSummaryCards from '@/components/analytics/AnalyticsSummaryCards';
import CourseAnalyticsTab from '@/components/analytics/CourseAnalyticsTab';
import TrainerAnalyticsTab from '@/components/analytics/TrainerAnalyticsTab';
import UserProgressTab from '@/components/analytics/UserProgressTab';

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
  completed_at?: string;
}

interface CourseStats {
  course_id: number;
  title: string;
  total_users: number;
  in_progress: number;
  completed: number;
  avg_progress: number;
}

interface TrainerStats {
  trainer_id: number;
  title: string;
  total_users: number;
  in_progress: number;
  completed: number;
  avg_score: number;
}

interface Department {
  id: number;
  name: string;
}

export default function LearningAnalytics() {
  const { toast } = useToast();
  const [courseProgress, setCourseProgress] = useState<UserProgress[]>([]);
  const [trainerProgress, setTrainerProgress] = useState<UserProgress[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [trainerStats, setTrainerStats] = useState<TrainerStats[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
    fetchAnalytics();
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    const userId = authService.getUserId();
    if (!userId) return;

    try {
      const response = await fetch(`${LEARNING_API_URL}?entity_type=department`, {
        headers: { 'X-User-Id': userId.toString() },
      });
      const data = await response.json();
      if (data.departments) {
        setDepartments(data.departments.map((d: any) => ({ id: d.id, name: d.name })));
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchAnalytics = async () => {
    const userId = authService.getUserId();
    if (!userId) return;

    setLoading(true);
    try {
      const [courseProg, trainerProg] = await Promise.all([
        fetch(`${LEARNING_API_URL}?resource=progress&type=course`, {
          headers: { 'X-User-Id': userId.toString() },
        }),
        fetch(`${LEARNING_API_URL}?resource=progress&type=trainer`, {
          headers: { 'X-User-Id': userId.toString() },
        }),
      ]);

      if (courseProg.ok) {
        const data = await courseProg.json();
        setCourseProgress(data);
        calculateCourseStats(data);
      }

      if (trainerProg.ok) {
        const data = await trainerProg.json();
        setTrainerProgress(data);
        calculateTrainerStats(data);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить аналитику', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const calculateCourseStats = (progressData: UserProgress[]) => {
    const courseMap = new Map<number, CourseStats>();

    progressData.forEach((prog) => {
      if (!prog.course_id) return;

      if (!courseMap.has(prog.course_id)) {
        courseMap.set(prog.course_id, {
          course_id: prog.course_id,
          title: prog.title,
          total_users: 0,
          in_progress: 0,
          completed: 0,
          avg_progress: 0,
        });
      }

      const stats = courseMap.get(prog.course_id)!;
      stats.total_users++;
      
      if (prog.status === 'Завершен') {
        stats.completed++;
      } else {
        stats.in_progress++;
      }
      
      stats.avg_progress += prog.progress_percentage || 0;
    });

    const statsArray = Array.from(courseMap.values()).map(stat => ({
      ...stat,
      avg_progress: Math.round(stat.avg_progress / stat.total_users),
    }));

    setCourseStats(statsArray);
  };

  const calculateTrainerStats = (progressData: UserProgress[]) => {
    const trainerMap = new Map<number, TrainerStats>();

    progressData.forEach((prog) => {
      if (!prog.trainer_id) return;

      if (!trainerMap.has(prog.trainer_id)) {
        trainerMap.set(prog.trainer_id, {
          trainer_id: prog.trainer_id,
          title: prog.title,
          total_users: 0,
          in_progress: 0,
          completed: 0,
          avg_score: 0,
        });
      }

      const stats = trainerMap.get(prog.trainer_id)!;
      stats.total_users++;
      
      if (prog.status === 'Завершен') {
        stats.completed++;
      } else {
        stats.in_progress++;
      }
      
      stats.avg_score += prog.score || 0;
    });

    const statsArray = Array.from(trainerMap.values()).map(stat => ({
      ...stat,
      avg_score: Math.round(stat.avg_score / stat.total_users),
    }));

    setTrainerStats(statsArray);
  };

  const getFilteredProgress = (progress: UserProgress[]) => {
    if (selectedDepartment === 'all') return progress;
    return progress.filter(p => p.department_name === departments.find(d => d.id.toString() === selectedDepartment)?.name);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Завершен':
        return 'bg-green-500';
      case 'В процессе':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  const filteredCourseProgress = getFilteredProgress(courseProgress);
  const filteredTrainerProgress = getFilteredProgress(trainerProgress);

  const totalCompleted = filteredCourseProgress.filter(p => p.status === 'Завершен').length + 
                         filteredTrainerProgress.filter(p => p.status === 'Завершен').length;
  const totalInProgress = filteredCourseProgress.filter(p => p.status === 'В процессе').length + 
                          filteredTrainerProgress.filter(p => p.status === 'В процессе').length;

  return (
    <div className="min-h-screen bg-background">
      <AnalyticsHeader 
        departments={departments}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
      />

      <main className="container mx-auto px-6 py-8">
        <AnalyticsSummaryCards 
          totalInProgress={totalInProgress}
          totalCompleted={totalCompleted}
        />

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">Курсы</TabsTrigger>
            <TabsTrigger value="trainers">Тренажеры</TabsTrigger>
            <TabsTrigger value="users">По сотрудникам</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <CourseAnalyticsTab 
              courseStats={courseStats}
              filteredCourseProgress={filteredCourseProgress}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="trainers">
            <TrainerAnalyticsTab 
              trainerStats={trainerStats}
              filteredTrainerProgress={filteredTrainerProgress}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="users">
            <UserProgressTab 
              filteredCourseProgress={filteredCourseProgress}
              filteredTrainerProgress={filteredTrainerProgress}
              getStatusColor={getStatusColor}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
