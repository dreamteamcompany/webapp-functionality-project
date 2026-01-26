import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface Department {
  id: number;
  name: string;
}

interface AnalyticsHeaderProps {
  departments: Department[];
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
}

export default function AnalyticsHeader({ 
  departments, 
  selectedDepartment, 
  onDepartmentChange 
}: AnalyticsHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Аналитика обучения</h1>
              <p className="text-sm text-muted-foreground">Прогресс сотрудников и статистика</p>
            </div>
          </div>
          <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Выберите отдел" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все отделы</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
