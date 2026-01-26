import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AnalyticsSummaryCardsProps {
  totalInProgress: number;
  totalCompleted: number;
}

export default function AnalyticsSummaryCards({ 
  totalInProgress, 
  totalCompleted 
}: AnalyticsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Icon name="BookOpen" size={24} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">В процессе</p>
            <p className="text-2xl font-bold">{totalInProgress}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
            <Icon name="CheckCircle" size={24} className="text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Завершено</p>
            <p className="text-2xl font-bold">{totalCompleted}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <Icon name="Users" size={24} className="text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Всего активностей</p>
            <p className="text-2xl font-bold">{totalInProgress + totalCompleted}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
