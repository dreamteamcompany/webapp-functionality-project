export interface SimulatorAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: AchievementStats) => boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: string;
}

export interface AchievementStats {
  scenariosCompleted: string[];
  perfectScenarios: string[];
  totalScore: number;
  averageScore: number;
  totalDialogues: number;
  goodChoices: number;
  neutralChoices: number;
  badChoices: number;
  maxEmpathy: number;
  maxProfessionalism: number;
  maxEfficiency: number;
  maxSalesSkill: number;
  maxConflictResolution: number;
  scenarioScores: Record<string, number>;
  firstTryPerfect: string[];
  noMistakes: boolean;
  speedrunCompleted: string[];
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: number;
  scenarioId?: string;
}

export const SIMULATOR_ACHIEVEMENTS: SimulatorAchievement[] = [
  // Базовые достижения (Common)
  {
    id: 'first_steps',
    title: 'Первые шаги',
    description: 'Завершите любой сценарий',
    icon: 'Footprints',
    rarity: 'common',
    reward: '+50 баллов',
    condition: (stats) => stats.scenariosCompleted.length >= 1
  },
  {
    id: 'perfect_first_call',
    title: 'Идеальный первый контакт',
    description: 'Наберите 90+ баллов в сценарии "Первый звонок"',
    icon: 'Phone',
    rarity: 'common',
    reward: '+100 баллов',
    condition: (stats) => (stats.scenarioScores['first_call'] || 0) >= 90
  },
  {
    id: 'empathy_master',
    title: 'Мастер эмпатии',
    description: 'Достигните уровня эмпатии 90+',
    icon: 'Heart',
    rarity: 'common',
    reward: '+75 баллов',
    condition: (stats) => stats.maxEmpathy >= 90
  },
  {
    id: 'professional',
    title: 'Настоящий профессионал',
    description: 'Достигните профессионализма 95+',
    icon: 'Briefcase',
    rarity: 'common',
    reward: '+75 баллов',
    condition: (stats) => stats.maxProfessionalism >= 95
  },

  // Редкие достижения (Rare)
  {
    id: 'sales_genius',
    title: 'Гений продаж',
    description: 'Наберите 95+ баллов в сценарии "Допродажа услуг"',
    icon: 'TrendingUp',
    rarity: 'rare',
    reward: '+150 баллов',
    condition: (stats) => (stats.scenarioScores['upsell_cleaning'] || 0) >= 95
  },
  {
    id: 'conflict_resolver',
    title: 'Укротитель конфликтов',
    description: 'Наберите 90+ баллов в сценарии "Конфликтный пациент"',
    icon: 'Shield',
    rarity: 'rare',
    reward: '+150 баллов',
    condition: (stats) => (stats.scenarioScores['angry_patient'] || 0) >= 90
  },
  {
    id: 'price_master',
    title: 'Мастер работы с ценой',
    description: 'Наберите 85+ баллов в сценарии "Возражение по цене"',
    icon: 'DollarSign',
    rarity: 'rare',
    reward: '+150 баллов',
    condition: (stats) => (stats.scenarioScores['price_objection'] || 0) >= 85
  },
  {
    id: 'child_whisperer',
    title: 'Заклинатель детей',
    description: 'Идеально пройдите сценарий "Испуганный ребёнок"',
    icon: 'Baby',
    rarity: 'rare',
    reward: '+150 баллов',
    condition: (stats) => (stats.scenarioScores['scared_child'] || 0) >= 95
  },
  {
    id: 'five_scenarios',
    title: 'Опытный администратор',
    description: 'Завершите 5 разных сценариев',
    icon: 'Award',
    rarity: 'rare',
    reward: '+200 баллов',
    condition: (stats) => stats.scenariosCompleted.length >= 5
  },

  // Эпические достижения (Epic)
  {
    id: 'perfectionist',
    title: 'Перфекционист',
    description: 'Наберите 95+ баллов в 3 разных сценариях',
    icon: 'Target',
    rarity: 'epic',
    reward: '+300 баллов',
    condition: (stats) => {
      const highScores = Object.values(stats.scenarioScores).filter(score => score >= 95);
      return highScores.length >= 3;
    }
  },
  {
    id: 'all_scenarios',
    title: 'Универсал',
    description: 'Завершите все 7 сценариев',
    icon: 'CheckCircle2',
    rarity: 'epic',
    reward: '+400 баллов',
    condition: (stats) => stats.scenariosCompleted.length >= 7
  },
  {
    id: 'vip_service',
    title: 'VIP-сервис',
    description: 'Идеально обслужите VIP-пациента (95+ баллов)',
    icon: 'Crown',
    rarity: 'epic',
    reward: '+250 баллов',
    condition: (stats) => (stats.scenarioScores['vip_patient'] || 0) >= 95
  },
  {
    id: 'no_bad_choices',
    title: 'Безупречный путь',
    description: 'Пройдите любой сценарий без единого плохого выбора',
    icon: 'Sparkles',
    rarity: 'epic',
    reward: '+350 баллов',
    condition: (stats) => stats.noMistakes && stats.scenariosCompleted.length >= 1
  },
  {
    id: 'speed_demon',
    title: 'Скоростной дьявол',
    description: 'Завершите 3 сценария за идеальное время',
    icon: 'Zap',
    rarity: 'epic',
    reward: '+300 баллов',
    condition: (stats) => stats.speedrunCompleted.length >= 3
  },

  // Легендарные достижения (Legendary)
  {
    id: 'grand_master',
    title: 'Гранд-мастер',
    description: 'Средний балл 85+ по всем сценариям',
    icon: 'Trophy',
    rarity: 'legendary',
    reward: '+500 баллов',
    condition: (stats) => stats.averageScore >= 85 && stats.scenariosCompleted.length >= 7
  },
  {
    id: 'perfect_seven',
    title: 'Идеальная семёрка',
    description: 'Наберите 90+ баллов во всех 7 сценариях',
    icon: 'Star',
    rarity: 'legendary',
    reward: '+1000 баллов',
    condition: (stats) => {
      const allScenarioIds = ['first_call', 'price_objection', 'angry_patient', 'upsell_cleaning', 'scared_child', 'vip_patient', 'payment_issue'];
      return allScenarioIds.every(id => (stats.scenarioScores[id] || 0) >= 90);
    }
  },
  {
    id: 'all_max_parameters',
    title: 'Максимум во всём',
    description: 'Достигните 95+ во всех 5 параметрах хотя бы раз',
    icon: 'Flame',
    rarity: 'legendary',
    reward: '+750 баллов',
    condition: (stats) => 
      stats.maxEmpathy >= 95 &&
      stats.maxProfessionalism >= 95 &&
      stats.maxEfficiency >= 95 &&
      stats.maxSalesSkill >= 95 &&
      stats.maxConflictResolution >= 95
  },
  {
    id: 'first_try_legend',
    title: 'Легенда с первого раза',
    description: 'Наберите 95+ баллов в 5 сценариях с первой попытки',
    icon: 'Award',
    rarity: 'legendary',
    reward: '+1500 баллов',
    condition: (stats) => stats.firstTryPerfect.length >= 5
  },
  {
    id: 'dialogue_master',
    title: 'Мастер диалогов',
    description: 'Проведите 100 успешных диалогов',
    icon: 'MessageSquare',
    rarity: 'legendary',
    reward: '+800 баллов',
    condition: (stats) => stats.goodChoices >= 100
  }
];

class SimulatorAchievementSystem {
  private static readonly STORAGE_KEY = 'simulator_achievements_data';
  private stats: AchievementStats;
  private unlockedAchievements: UnlockedAchievement[];
  private currentScenarioStartTime: number = 0;
  private currentScenarioBadChoices: number = 0;

  constructor() {
    this.stats = this.loadStats();
    this.unlockedAchievements = this.loadUnlockedAchievements();
  }

  private loadStats(): AchievementStats {
    try {
      const stored = localStorage.getItem(SimulatorAchievementSystem.STORAGE_KEY + '_stats');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load achievement stats:', error);
    }

    return {
      scenariosCompleted: [],
      perfectScenarios: [],
      totalScore: 0,
      averageScore: 0,
      totalDialogues: 0,
      goodChoices: 0,
      neutralChoices: 0,
      badChoices: 0,
      maxEmpathy: 0,
      maxProfessionalism: 0,
      maxEfficiency: 0,
      maxSalesSkill: 0,
      maxConflictResolution: 0,
      scenarioScores: {},
      firstTryPerfect: [],
      noMistakes: false,
      speedrunCompleted: []
    };
  }

  private loadUnlockedAchievements(): UnlockedAchievement[] {
    try {
      const stored = localStorage.getItem(SimulatorAchievementSystem.STORAGE_KEY + '_unlocked');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load unlocked achievements:', error);
    }
    return [];
  }

  private saveStats(): void {
    try {
      localStorage.setItem(
        SimulatorAchievementSystem.STORAGE_KEY + '_stats',
        JSON.stringify(this.stats)
      );
    } catch (error) {
      console.warn('Failed to save achievement stats:', error);
    }
  }

  private saveUnlockedAchievements(): void {
    try {
      localStorage.setItem(
        SimulatorAchievementSystem.STORAGE_KEY + '_unlocked',
        JSON.stringify(this.unlockedAchievements)
      );
    } catch (error) {
      console.warn('Failed to save unlocked achievements:', error);
    }
  }

  startScenario(scenarioId: string): void {
    this.currentScenarioStartTime = Date.now();
    this.currentScenarioBadChoices = 0;
  }

  recordChoice(type: 'good' | 'neutral' | 'bad'): void {
    this.stats.totalDialogues++;
    
    if (type === 'good') {
      this.stats.goodChoices++;
    } else if (type === 'neutral') {
      this.stats.neutralChoices++;
    } else {
      this.stats.badChoices++;
      this.currentScenarioBadChoices++;
    }
  }

  completeScenario(
    scenarioId: string,
    score: number,
    parameters: {
      empathy: number;
      professionalism: number;
      efficiency: number;
      salesSkill: number;
      conflictResolution: number;
    }
  ): UnlockedAchievement[] {
    // Проверяем, первый ли раз проходим сценарий
    const isFirstTry = !this.stats.scenariosCompleted.includes(scenarioId);
    
    // Обновляем статистику
    if (!this.stats.scenariosCompleted.includes(scenarioId)) {
      this.stats.scenariosCompleted.push(scenarioId);
    }

    // Обновляем лучший результат по сценарию
    const previousScore = this.stats.scenarioScores[scenarioId] || 0;
    if (score > previousScore) {
      this.stats.scenarioScores[scenarioId] = score;
    }

    // Проверяем идеальное прохождение
    if (score >= 95 && !this.stats.perfectScenarios.includes(scenarioId)) {
      this.stats.perfectScenarios.push(scenarioId);
      
      if (isFirstTry && !this.stats.firstTryPerfect.includes(scenarioId)) {
        this.stats.firstTryPerfect.push(scenarioId);
      }
    }

    // Проверяем speedrun (быстрое прохождение)
    const timeSpent = Date.now() - this.currentScenarioStartTime;
    const speedrunTime = 120000; // 2 минуты
    if (timeSpent <= speedrunTime && score >= 85 && !this.stats.speedrunCompleted.includes(scenarioId)) {
      this.stats.speedrunCompleted.push(scenarioId);
    }

    // Проверяем отсутствие ошибок
    this.stats.noMistakes = this.currentScenarioBadChoices === 0;

    // Обновляем максимальные параметры
    this.stats.maxEmpathy = Math.max(this.stats.maxEmpathy, parameters.empathy);
    this.stats.maxProfessionalism = Math.max(this.stats.maxProfessionalism, parameters.professionalism);
    this.stats.maxEfficiency = Math.max(this.stats.maxEfficiency, parameters.efficiency);
    this.stats.maxSalesSkill = Math.max(this.stats.maxSalesSkill, parameters.salesSkill);
    this.stats.maxConflictResolution = Math.max(this.stats.maxConflictResolution, parameters.conflictResolution);

    // Обновляем общую статистику
    this.stats.totalScore += score;
    this.stats.averageScore = this.stats.totalScore / this.stats.scenariosCompleted.length;

    this.saveStats();

    // Проверяем новые достижения
    return this.checkNewAchievements(scenarioId);
  }

  private checkNewAchievements(scenarioId?: string): UnlockedAchievement[] {
    const newlyUnlocked: UnlockedAchievement[] = [];

    for (const achievement of SIMULATOR_ACHIEVEMENTS) {
      // Пропускаем уже разблокированные
      if (this.isUnlocked(achievement.id)) continue;

      // Проверяем условие
      if (achievement.condition(this.stats)) {
        const unlocked: UnlockedAchievement = {
          achievementId: achievement.id,
          unlockedAt: Date.now(),
          scenarioId
        };
        
        this.unlockedAchievements.push(unlocked);
        newlyUnlocked.push(unlocked);
      }
    }

    if (newlyUnlocked.length > 0) {
      this.saveUnlockedAchievements();
    }

    return newlyUnlocked;
  }

  isUnlocked(achievementId: string): boolean {
    return this.unlockedAchievements.some(a => a.achievementId === achievementId);
  }

  getUnlockedAchievements(): UnlockedAchievement[] {
    return [...this.unlockedAchievements];
  }

  getStats(): AchievementStats {
    return { ...this.stats };
  }

  getTotalPoints(): number {
    let points = 0;
    for (const unlocked of this.unlockedAchievements) {
      const achievement = SIMULATOR_ACHIEVEMENTS.find(a => a.id === unlocked.achievementId);
      if (achievement) {
        const rewardPoints = parseInt(achievement.reward.match(/\d+/)?.[0] || '0');
        points += rewardPoints;
      }
    }
    return points;
  }

  getProgress(): { unlocked: number; total: number; percentage: number } {
    const unlocked = this.unlockedAchievements.length;
    const total = SIMULATOR_ACHIEVEMENTS.length;
    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
    
    return { unlocked, total, percentage };
  }

  resetProgress(): void {
    this.stats = {
      scenariosCompleted: [],
      perfectScenarios: [],
      totalScore: 0,
      averageScore: 0,
      totalDialogues: 0,
      goodChoices: 0,
      neutralChoices: 0,
      badChoices: 0,
      maxEmpathy: 0,
      maxProfessionalism: 0,
      maxEfficiency: 0,
      maxSalesSkill: 0,
      maxConflictResolution: 0,
      scenarioScores: {},
      firstTryPerfect: [],
      noMistakes: false,
      speedrunCompleted: []
    };
    this.unlockedAchievements = [];
    this.saveStats();
    this.saveUnlockedAchievements();
  }
}

export const achievementSystem = new SimulatorAchievementSystem();
