import { useState } from 'react';
import { CustomScenario, ScenarioCategory } from '@/types/scenario';
import { ScenarioManager } from '@/lib/scenarioManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
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
}

export default function ScenarioList({ onEdit, onPlay, onCreateNew }: ScenarioListProps) {
  const [scenarios, setScenarios] = useState<CustomScenario[]>(ScenarioManager.getScenarios());
  const [categories] = useState<ScenarioCategory[]>(ScenarioManager.getCategories());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const filteredScenarios = ScenarioManager.searchScenarios(
    searchQuery,
    selectedCategory || undefined
  );

  const handleDelete = (id: string) => {
    ScenarioManager.deleteScenario(id);
    setScenarios(ScenarioManager.getScenarios());
    setDeleteDialog(null);
  };

  const getCategoryName = (categoryId?: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Без категории';
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

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          Все
        </Button>
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
          >
            <Icon name={cat.icon as any || 'Folder'} size={16} className="mr-1" />
            {cat.name}
          </Button>
        ))}
      </div>

      {filteredScenarios.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="FileQuestion" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Сценарии не найдены</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedCategory
              ? 'Попробуйте изменить параметры поиска'
              : 'Создайте свой первый сценарий для обучения'}
          </p>
          <Button onClick={onCreateNew}>
            <Icon name="Plus" size={18} className="mr-2" />
            Создать сценарий
          </Button>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-20rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
            {filteredScenarios.map(scenario => (
            <Card key={scenario.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{scenario.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {getCategoryName(scenario.category)}
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
                <div className="flex items-start gap-2 text-sm">
                  <Icon name="User" size={14} className="mt-0.5 text-muted-foreground" />
                  <span className="text-muted-foreground">ИИ:</span>
                  <span className="font-medium capitalize">{scenario.aiPersonality.emotionalState}</span>
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
                Начать тренировку
              </Button>
            </Card>
            ))}
          </div>
        </ScrollArea>
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