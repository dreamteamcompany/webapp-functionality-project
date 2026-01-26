import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomScenario } from '@/types/scenario';
import { ScenarioManager } from '@/lib/scenarioManager';
import { initializeDemoScenarios } from '@/lib/demoScenarios';
import { authService } from '@/lib/auth';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScenarioList from '@/components/scenario/ScenarioList';
import ScenarioEditor from '@/components/scenario/ScenarioEditor';
import ScenarioPlayer from '@/components/scenario/ScenarioPlayer';
import DashboardHeader from './Index/DashboardHeader';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

export default function Scenarios() {
  const navigate = useNavigate();
  const currentUser = authService.getUser();
  const { toast } = useToast();

  const [editDialog, setEditDialog] = useState(false);
  const [playDialog, setPlayDialog] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<CustomScenario | null>(null);

  useEffect(() => {
    initializeDemoScenarios();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const handleNavigateToAdmin = () => {
    navigate('/');
  };

  const handleCreateNew = () => {
    setSelectedScenario(null);
    setEditDialog(true);
  };

  const handleEdit = (scenario: CustomScenario) => {
    setSelectedScenario(scenario);
    setEditDialog(true);
  };

  const handlePlay = (scenario: CustomScenario) => {
    setSelectedScenario(scenario);
    setPlayDialog(true);
  };

  const handleSave = (scenario: CustomScenario) => {
    ScenarioManager.saveScenario(scenario);
    setEditDialog(false);
    setSelectedScenario(null);
    toast({
      title: 'Сценарий сохранён',
      description: `Сценарий "${scenario.name}" успешно сохранён`,
    });
  };

  const handleCancelEdit = () => {
    setEditDialog(false);
    setSelectedScenario(null);
  };

  const handleClosePlayer = () => {
    setPlayDialog(false);
    setSelectedScenario(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigateToAdmin={handleNavigateToAdmin}
      />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Layers" size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Конструктор сценариев</h1>
              <p className="text-muted-foreground">
                Создавайте уникальные сценарии для обучения вашей команды
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="scenarios" className="space-y-6">
          <TabsList>
            <TabsTrigger value="scenarios" className="gap-2">
              <Icon name="List" size={16} />
              Мои сценарии
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Icon name="BookTemplate" size={16} />
              Шаблоны
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios">
            <ScenarioList
              onEdit={handleEdit}
              onPlay={handlePlay}
              onCreateNew={handleCreateNew}
            />
          </TabsContent>

          <TabsContent value="templates">
            <div className="text-center py-12">
              <Icon name="BookTemplate" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Шаблоны скоро появятся</h3>
              <p className="text-muted-foreground">
                Мы работаем над библиотекой готовых шаблонов сценариев
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ScenarioEditor
            scenario={selectedScenario || undefined}
            onSave={handleSave}
            onCancel={handleCancelEdit}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={playDialog} onOpenChange={setPlayDialog}>
        <DialogContent className="max-w-5xl h-[90vh] p-0">
          {selectedScenario && (
            <ScenarioPlayer
              scenario={selectedScenario}
              onClose={handleClosePlayer}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}