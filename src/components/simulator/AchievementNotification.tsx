import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { SIMULATOR_ACHIEVEMENTS, UnlockedAchievement } from '@/lib/simulatorAchievements';

interface AchievementNotificationProps {
  achievement: UnlockedAchievement | null;
  onClose: () => void;
}

export default function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  const achievementData = SIMULATOR_ACHIEVEMENTS.find(a => a.id === achievement.achievementId);
  if (!achievementData) return null;

  const rarityColors = {
    common: 'from-gray-500 to-gray-600',
    rare: 'from-blue-500 to-blue-600',
    epic: 'from-purple-500 to-pink-600',
    legendary: 'from-yellow-500 to-orange-600'
  };

  const rarityText = {
    common: 'Обычное',
    rare: 'Редкое',
    epic: 'Эпическое',
    legendary: 'Легендарное'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <Card className="p-6 w-96 border-2 border-yellow-500/50 shadow-2xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${rarityColors[achievementData.rarity]} flex items-center justify-center shadow-lg flex-shrink-0`}>
            <Icon name={achievementData.icon as any} size={32} className="text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Sparkles" size={16} className="text-yellow-600" />
              <span className="text-xs font-semibold text-yellow-700 uppercase">
                {rarityText[achievementData.rarity]} достижение!
              </span>
            </div>
            
            <h4 className="font-bold text-lg mb-1">{achievementData.title}</h4>
            <p className="text-sm text-muted-foreground mb-2">
              {achievementData.description}
            </p>
            
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
              <Icon name="Gift" size={14} />
              <span>{achievementData.reward}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
