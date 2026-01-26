import { CustomScenario, ScenarioCategory } from '@/types/scenario';

export class ScenarioManager {
  private static readonly SCENARIOS_KEY = 'custom_scenarios';
  private static readonly CATEGORIES_KEY = 'scenario_categories';

  static getScenarios(): CustomScenario[] {
    try {
      const stored = localStorage.getItem(this.SCENARIOS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load scenarios:', error);
      return [];
    }
  }

  static getScenario(id: string): CustomScenario | null {
    const scenarios = this.getScenarios();
    return scenarios.find(s => s.id === id) || null;
  }

  static saveScenario(scenario: CustomScenario): void {
    const scenarios = this.getScenarios();
    const index = scenarios.findIndex(s => s.id === scenario.id);
    
    if (index >= 0) {
      scenarios[index] = { ...scenario, updatedAt: Date.now() };
    } else {
      scenarios.push(scenario);
    }
    
    localStorage.setItem(this.SCENARIOS_KEY, JSON.stringify(scenarios));
  }

  static deleteScenario(id: string): void {
    const scenarios = this.getScenarios();
    const filtered = scenarios.filter(s => s.id !== id);
    localStorage.setItem(this.SCENARIOS_KEY, JSON.stringify(filtered));
  }

  static getCategories(): ScenarioCategory[] {
    try {
      const stored = localStorage.getItem(this.CATEGORIES_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultCategories();
    } catch (error) {
      console.error('Failed to load categories:', error);
      return this.getDefaultCategories();
    }
  }

  static saveCategory(category: ScenarioCategory): void {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
  }

  static deleteCategory(id: string): void {
    const categories = this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(filtered));
  }

  private static getDefaultCategories(): ScenarioCategory[] {
    return [
      { id: 'sales', name: 'Продажи', description: 'Работа с клиентами и возражениями', icon: 'ShoppingCart' },
      { id: 'medical', name: 'Медицина', description: 'Общение с пациентами', icon: 'Heart' },
      { id: 'service', name: 'Сервис', description: 'Клиентская поддержка', icon: 'Headphones' },
      { id: 'management', name: 'Управление', description: 'Переговоры и управление', icon: 'Users' },
      { id: 'custom', name: 'Другое', description: 'Пользовательские сценарии', icon: 'Star' }
    ];
  }

  static searchScenarios(query: string, category?: string): CustomScenario[] {
    let scenarios = this.getScenarios();
    
    if (category) {
      scenarios = scenarios.filter(s => s.category === category);
    }
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      scenarios = scenarios.filter(s => 
        s.name.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery) ||
        s.context.role.toLowerCase().includes(lowerQuery) ||
        s.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
    
    return scenarios;
  }
}
