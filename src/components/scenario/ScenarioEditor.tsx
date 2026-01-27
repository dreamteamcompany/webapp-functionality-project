import { useState } from 'react';
import { CustomScenario } from '@/types/scenario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScenarioEditorProps {
  scenario?: CustomScenario;
  onSave: (scenario: CustomScenario) => void;
  onCancel: () => void;
}

export default function ScenarioEditor({ scenario, onSave, onCancel }: ScenarioEditorProps) {
  const [formData, setFormData] = useState<CustomScenario>(scenario || {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    context: {
      role: '',
      situation: '',
      goal: ''
    },
    aiPersonality: {
      character: '',
      emotionalState: 'calm',
      knowledge: 'medium',
      communicationStyle: 'professional'
    },
    initialMessage: '',
    objectives: [],
    challenges: [],
    responsePatterns: {
      positive: [],
      negative: [],
      neutral: []
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: []
  });

  const [newObjective, setNewObjective] = useState('');
  const [newChallenge, setNewChallenge] = useState('');
  const [newTag, setNewTag] = useState('');
  const [patternType, setPatternType] = useState<'positive' | 'negative' | 'neutral'>('positive');
  const [newPattern, setNewPattern] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setFormData({
        ...formData,
        objectives: [...(formData.objectives || []), newObjective.trim()]
      });
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    setFormData({
      ...formData,
      objectives: formData.objectives?.filter((_, i) => i !== index)
    });
  };

  const addChallenge = () => {
    if (newChallenge.trim()) {
      setFormData({
        ...formData,
        challenges: [...(formData.challenges || []), newChallenge.trim()]
      });
      setNewChallenge('');
    }
  };

  const removeChallenge = (index: number) => {
    setFormData({
      ...formData,
      challenges: formData.challenges?.filter((_, i) => i !== index)
    });
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((_, i) => i !== index)
    });
  };

  const addPattern = () => {
    if (newPattern.trim()) {
      setFormData({
        ...formData,
        responsePatterns: {
          ...formData.responsePatterns,
          [patternType]: [...(formData.responsePatterns?.[patternType] || []), newPattern.trim()]
        }
      });
      setNewPattern('');
    }
  };

  const removePattern = (type: 'positive' | 'negative' | 'neutral', index: number) => {
    setFormData({
      ...formData,
      responsePatterns: {
        ...formData.responsePatterns,
        [type]: formData.responsePatterns?.[type]?.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
        <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="FileText" size={20} />
            Основная информация
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Название сценария *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Консультация клиента по продукту"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Опишите сценарий взаимодействия"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Категория</Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="sales, medical, service..."
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="Briefcase" size={20} />
            Контекст разговора
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">Роль сотрудника *</Label>
              <Input
                id="role"
                value={formData.context.role}
                onChange={(e) => setFormData({
                  ...formData,
                  context: { ...formData.context, role: e.target.value }
                })}
                placeholder="Менеджер по продажам, врач, консультант..."
                required
              />
            </div>

            <div>
              <Label htmlFor="situation">Ситуация *</Label>
              <Textarea
                id="situation"
                value={formData.context.situation}
                onChange={(e) => setFormData({
                  ...formData,
                  context: { ...formData.context, situation: e.target.value }
                })}
                placeholder="Клиент интересуется продуктом, но сомневается в цене"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="goal">Цель разговора *</Label>
              <Input
                id="goal"
                value={formData.context.goal}
                onChange={(e) => setFormData({
                  ...formData,
                  context: { ...formData.context, goal: e.target.value }
                })}
                placeholder="Убедить клиента в ценности продукта"
                required
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="User" size={20} />
            Характер ИИ-собеседника
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="character">Описание характера *</Label>
              <Textarea
                id="character"
                value={formData.aiPersonality.character}
                onChange={(e) => setFormData({
                  ...formData,
                  aiPersonality: { ...formData.aiPersonality, character: e.target.value }
                })}
                placeholder="Я - занятой бизнесмен, ценю время и конкретику"
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emotionalState">Эмоциональное состояние</Label>
                <Select
                  value={formData.aiPersonality.emotionalState}
                  onValueChange={(value: any) => setFormData({
                    ...formData,
                    aiPersonality: { ...formData.aiPersonality, emotionalState: value }
                  })}
                >
                  <SelectTrigger id="emotionalState">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calm">Спокойный</SelectItem>
                    <SelectItem value="nervous">Нервный</SelectItem>
                    <SelectItem value="angry">Раздражённый</SelectItem>
                    <SelectItem value="scared">Напуганный</SelectItem>
                    <SelectItem value="happy">Довольный</SelectItem>
                    <SelectItem value="sad">Грустный</SelectItem>
                    <SelectItem value="confused">Растерянный</SelectItem>
                    <SelectItem value="excited">Взволнованный</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="knowledge">Уровень знаний</Label>
                <Select
                  value={formData.aiPersonality.knowledge}
                  onValueChange={(value: any) => setFormData({
                    ...formData,
                    aiPersonality: { ...formData.aiPersonality, knowledge: value }
                  })}
                >
                  <SelectTrigger id="knowledge">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="communicationStyle">Стиль общения</Label>
                <Select
                  value={formData.aiPersonality.communicationStyle}
                  onValueChange={(value: any) => setFormData({
                    ...formData,
                    aiPersonality: { ...formData.aiPersonality, communicationStyle: value }
                  })}
                >
                  <SelectTrigger id="communicationStyle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Формальный</SelectItem>
                    <SelectItem value="casual">Неформальный</SelectItem>
                    <SelectItem value="professional">Профессиональный</SelectItem>
                    <SelectItem value="friendly">Дружелюбный</SelectItem>
                    <SelectItem value="aggressive">Агрессивный</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="initialMessage">Первое сообщение ИИ *</Label>
              <Textarea
                id="initialMessage"
                value={formData.initialMessage}
                onChange={(e) => setFormData({ ...formData, initialMessage: e.target.value })}
                placeholder="Здравствуйте, слушаю вас..."
                rows={2}
                required
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="Target" size={20} />
            Цели и вызовы
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label>Задачи для сотрудника</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Узнать бюджет клиента"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                />
                <Button type="button" onClick={addObjective}>
                  <Icon name="Plus" size={16} />
                </Button>
              </div>
              {formData.objectives && formData.objectives.length > 0 && (
                <ScrollArea className="max-h-32 mt-2">
                  <div className="flex flex-wrap gap-2 pr-4">
                    {formData.objectives.map((obj, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {obj}
                        <button type="button" onClick={() => removeObjective(i)}>
                          <Icon name="X" size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            <div>
              <Label>Сложности в диалоге</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newChallenge}
                  onChange={(e) => setNewChallenge(e.target.value)}
                  placeholder="Клиент не доверяет новым брендам"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChallenge())}
                />
                <Button type="button" onClick={addChallenge}>
                  <Icon name="Plus" size={16} />
                </Button>
              </div>
              {formData.challenges && formData.challenges.length > 0 && (
                <ScrollArea className="max-h-32 mt-2">
                  <div className="flex flex-wrap gap-2 pr-4">
                    {formData.challenges.map((ch, i) => (
                      <Badge key={i} variant="destructive" className="gap-1">
                        {ch}
                        <button type="button" onClick={() => removeChallenge(i)}>
                          <Icon name="X" size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="MessageSquare" size={20} />
            Паттерны ответов ИИ
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Select value={patternType} onValueChange={(v: any) => setPatternType(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Позитивные</SelectItem>
                  <SelectItem value="negative">Негативные</SelectItem>
                  <SelectItem value="neutral">Нейтральные</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                placeholder="Спасибо, это интересно!"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPattern())}
              />
              <Button type="button" onClick={addPattern}>
                <Icon name="Plus" size={16} />
              </Button>
            </div>

            <ScrollArea className="max-h-64">
              <div className="space-y-3 pr-4">
                <div>
                  <Label className="text-green-600">Позитивные ответы</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.responsePatterns?.positive?.map((p, i) => (
                      <Badge key={i} variant="outline" className="gap-1 border-green-600 text-green-600">
                        {p}
                        <button type="button" onClick={() => removePattern('positive', i)}>
                          <Icon name="X" size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-red-600">Негативные ответы</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.responsePatterns?.negative?.map((p, i) => (
                      <Badge key={i} variant="outline" className="gap-1 border-red-600 text-red-600">
                        {p}
                        <button type="button" onClick={() => removePattern('negative', i)}>
                          <Icon name="X" size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-600">Нейтральные ответы</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.responsePatterns?.neutral?.map((p, i) => (
                      <Badge key={i} variant="outline" className="gap-1">
                        {p}
                        <button type="button" onClick={() => removePattern('neutral', i)}>
                          <Icon name="X" size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="Tag" size={20} />
            Теги
          </h3>
          
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="продажи, b2b, сложный клиент..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag}>
              <Icon name="Plus" size={16} />
            </Button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <ScrollArea className="max-h-24 mt-2">
              <div className="flex flex-wrap gap-2 pr-4">
                {formData.tags.map((tag, i) => (
                  <Badge key={i} className="gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(i)}>
                      <Icon name="X" size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          )}
        </Card>
        </div>
      </ScrollArea>

      <div className="flex gap-2 justify-end sticky bottom-4 bg-background p-4 border rounded-lg shadow-lg">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">
          <Icon name="Save" size={16} className="mr-2" />
          Сохранить сценарий
        </Button>
      </div>
    </form>
  );
}