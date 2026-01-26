import { useState } from 'react';
import { CustomScenario } from '@/types/customScenario';
import { ScenarioStorage } from '@/lib/scenarioStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ScenarioListProps {
  onEdit: (scenario: CustomScenario) => void;
  onPlay: (scenario: CustomScenario) => void;
  onCreateNew: () => void;
  onRefresh: () => void;
}

export default function ScenarioList({ onEdit, onPlay, onCreateNew, onRefresh }: ScenarioListProps) {
  const [scenarios, setScenarios] = useState<CustomScenario[]>(ScenarioStorage.getAll());
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const filteredScenarios = ScenarioStorage.search(searchQuery);

  const handleDelete = (id: string) => {
    ScenarioStorage.delete(id);
    setScenarios(ScenarioStorage.getAll());
    setDeleteDialog(null);
    onRefresh();
  };

  const emotionLabels: Record<string, string> = {
    calm: 'Спокойный',
    nervous: 'Нервный',
    angry: 'Раздражённый',
    scared: 'Напуганный',
    happy: 'Довольный',
    sad: 'Грустный',
    confused: 'Растерянный',
    excited: 'Взволнованный'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск сценариев..."
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={onCreateNew}>
          <Icon name="Plus" size={18} className="mr-2" />
          Создать сценарий
        </Button>
      </div>

      {filteredScenarios.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="FileQuestion" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Сценарии не найдены</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? 'Попробуйте изменить параметры поиска'
              : 'Создайте свой первый сценарий для практики'}
          </p>
          <Button onClick={onCreateNew}>
            <Icon name="Plus" size={18} className="mr-2" />
            Создать сценарий
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScenarios.map(scenario => (
            <Card key={scenario.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{scenario.name}</h3>
                  <Badge className={emotionColors[scenario.aiPersonality.emotionalState]}>
                    {emotionLabels[scenario.aiPersonality.emotionalState]}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(scenario)}
                  >
                    <Icon name="Edit" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialog(scenario.id)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {scenario.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <Icon name="Briefcase" size={14} className="mt-0.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Роль:</span>
                  <span className="font-medium">{scenario.context.role}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Icon name="Target" size={14} className="mt-0.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Цель:</span>
                  <span className="font-medium line-clamp-1">{scenario.context.goal}</span>
                </div>
              </div>

              {scenario.tags && scenario.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {scenario.tags.slice(0, 3).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {scenario.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{scenario.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => onPlay(scenario)}
              >
                <Icon name="Play" size={16} className="mr-2" />
                Начать практику
              </Button>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialog !== null} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить сценарий?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Сценарий будет удалён навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteDialog && handleDelete(deleteDialog)}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
