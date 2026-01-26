import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { SIMULATOR_ACHIEVEMENTS, achievementSystem } from '@/lib/simulatorAchievements';

interface AchievementsDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AchievementsDialog({ open, onClose }: AchievementsDialogProps) {
  const progress = achievementSystem.getProgress();
  const totalPoints = achievementSystem.getTotalPoints();
  const unlockedIds = new Set(achievementSystem.getUnlockedAchievements().map(a => a.achievementId));

  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
  const sortedAchievements = [...SIMULATOR_ACHIEVEMENTS].sort((a, b) => {
    const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
    if (rarityDiff !== 0) return rarityDiff;
    
    const aUnlocked = unlockedIds.has(a.id);
    const bUnlocked = unlockedIds.has(b.id);
    if (aUnlocked !== bUnlocked) return bUnlocked ? -1 : 1;
    
    return 0;
  });

  const rarityColors = {
    common: {
      bg: 'bg-gray-500/10',
      text: 'text-gray-600',
      border: 'border-gray-500/20',
      gradient: 'from-gray-500 to-gray-600'
    },
    rare: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-600',
      border: 'border-blue-500/20',
      gradient: 'from-blue-500 to-blue-600'
    },
    epic: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-600',
      border: 'border-purple-500/20',
      gradient: 'from-purple-500 to-pink-600'
    },
    legendary: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-600',
      border: 'border-yellow-500/20',
      gradient: 'from-yellow-500 to-orange-600'
    }
  };

  const rarityText = {
    common: 'Обычное',
    rare: 'Редкое',
    epic: 'Эпическое',
    legendary: 'Легендарное'
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Icon name="Trophy" size={28} className="text-yellow-600" />
            Достижения симулятора
          </DialogTitle>
        </DialogHeader>

        {/* Общая статистика */}
        <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="Award" size={32} className="text-white" />
              </div>
              <p className="text-3xl font-bold mb-1">{progress.unlocked}</p>
              <p className="text-sm text-muted-foreground">Разблокировано</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="Star" size={32} className="text-white" />
              </div>
              <p className="text-3xl font-bold mb-1">{totalPoints}</p>
              <p className="text-sm text-muted-foreground">Очков заработано</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="Target" size={32} className="text-white" />
              </div>
              <p className="text-3xl font-bold mb-1">{progress.percentage}%</p>
              <p className="text-sm text-muted-foreground">Прогресс</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Общий прогресс</span>
              <span className="font-medium">{progress.unlocked} / {progress.total}</span>
            </div>
            <Progress value={progress.percentage} className="h-3" />
          </div>
        </Card>

        {/* Список достижений по редкости */}
        {(['legendary', 'epic', 'rare', 'common'] as const).map((rarity) => {
          const achievements = sortedAchievements.filter(a => a.rarity === rarity);
          if (achievements.length === 0) return null;

          return (
            <div key={rarity}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${rarityColors[rarity].gradient}`} />
                {rarityText[rarity]} ({achievements.filter(a => unlockedIds.has(a.id)).length} / {achievements.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {achievements.map((achievement) => {
                  const isUnlocked = unlockedIds.has(achievement.id);
                  const colors = rarityColors[rarity];

                  return (
                    <Card
                      key={achievement.id}
                      className={`p-4 transition-all ${
                        isUnlocked 
                          ? `border-2 ${colors.border} ${colors.bg}`
                          : 'opacity-50 grayscale'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isUnlocked 
                            ? `bg-gradient-to-br ${colors.gradient} shadow-lg`
                            : 'bg-gray-500/20'
                        }`}>
                          <Icon 
                            name={achievement.icon as any} 
                            size={28} 
                            className={isUnlocked ? 'text-white' : 'text-gray-400'}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className={`font-semibold ${isUnlocked ? colors.text : 'text-gray-500'}`}>
                              {achievement.title}
                            </h4>
                            {isUnlocked && (
                              <Icon name="CheckCircle2" size={18} className="text-green-600 flex-shrink-0" />
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">
                            {achievement.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${isUnlocked ? colors.text : 'text-gray-500'}`}
                            >
                              {rarityText[rarity]}
                            </Badge>
                            
                            <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                              <Icon name="Gift" size={14} />
                              <span>{achievement.reward}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </DialogContent>
    </Dialog>
  );
}
