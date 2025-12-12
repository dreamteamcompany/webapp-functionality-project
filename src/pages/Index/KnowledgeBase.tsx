import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KnowledgeBaseProps {
  knowledgeCategories: any[];
  selectedKnowledgeCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  selectedArticle: any;
  onArticleSelect: (article: any) => void;
  onBackToList: () => void;
  isCreatingCategory: boolean;
  onCreateCategoryToggle: () => void;
  newCategoryName: string;
  onCategoryNameChange: (value: string) => void;
  newCategoryDescription: string;
  onCategoryDescriptionChange: (value: string) => void;
  onSaveCategory: () => void;
  isCreatingArticle: boolean;
  onCreateArticleToggle: () => void;
  newArticleTitle: string;
  onArticleTitleChange: (value: string) => void;
  newArticleContent: string;
  onArticleContentChange: (value: string) => void;
  onSaveArticle: () => void;
  knowledgeSearchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedKnowledgeTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export default function KnowledgeBase({
  knowledgeCategories,
  selectedKnowledgeCategory,
  onCategorySelect,
  selectedArticle,
  onArticleSelect,
  onBackToList,
  isCreatingCategory,
  onCreateCategoryToggle,
  newCategoryName,
  onCategoryNameChange,
  newCategoryDescription,
  onCategoryDescriptionChange,
  onSaveCategory,
  isCreatingArticle,
  onCreateArticleToggle,
  newArticleTitle,
  onArticleTitleChange,
  newArticleContent,
  onArticleContentChange,
  onSaveArticle,
  knowledgeSearchQuery,
  onSearchQueryChange,
  selectedKnowledgeTag,
  onTagSelect,
}: KnowledgeBaseProps) {
  const selectedCategory = knowledgeCategories.find(c => c.id === selectedKnowledgeCategory);
  
  const filteredArticles = selectedCategory?.articles.filter((article: any) => {
    const matchesSearch = !knowledgeSearchQuery || 
      article.title.toLowerCase().includes(knowledgeSearchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(knowledgeSearchQuery.toLowerCase());
    
    const matchesTag = !selectedKnowledgeTag || article.tags.includes(selectedKnowledgeTag);
    
    return matchesSearch && matchesTag;
  }) || [];

  const allTags = selectedCategory?.articles.reduce((tags: string[], article: any) => {
    article.tags.forEach((tag: string) => {
      if (!tags.includes(tag)) tags.push(tag);
    });
    return tags;
  }, []) || [];

  if (selectedArticle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBackToList}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{selectedArticle.title}</h2>
            <p className="text-sm text-muted-foreground">
              Обновлено: {selectedArticle.updatedAt} • {selectedArticle.views} просмотров
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className="prose prose-sm max-w-none">
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedArticle.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="whitespace-pre-wrap">{selectedArticle.content}</div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="Link" size={18} />
            Связанные материалы
          </h3>
          <div className="space-y-2">
            {selectedArticle.relatedArticles?.map((related: any) => (
              <Button
                key={related.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => onArticleSelect(related)}
              >
                <Icon name="FileText" size={16} className="mr-2" />
                {related.title}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (isCreatingCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Создание категории</h2>
          <Button variant="ghost" onClick={onCreateCategoryToggle}>
            Отмена
          </Button>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название категории</Label>
              <Input
                placeholder="Введите название"
                value={newCategoryName}
                onChange={(e) => onCategoryNameChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                placeholder="Краткое описание категории"
                value={newCategoryDescription}
                onChange={(e) => onCategoryDescriptionChange(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={onSaveCategory} className="w-full">
              Создать категорию
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isCreatingArticle && selectedKnowledgeCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Новая статья</h2>
          <Button variant="ghost" onClick={onCreateArticleToggle}>
            Отмена
          </Button>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Заголовок статьи</Label>
              <Input
                placeholder="Введите заголовок"
                value={newArticleTitle}
                onChange={(e) => onArticleTitleChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Содержание</Label>
              <Textarea
                placeholder="Введите текст статьи"
                value={newArticleContent}
                onChange={(e) => onArticleContentChange(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
            </div>

            <Button onClick={onSaveArticle} className="w-full">
              Опубликовать статью
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (selectedKnowledgeCategory && selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => onCategorySelect(null)}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
              <p className="text-muted-foreground">{selectedCategory.description}</p>
            </div>
          </div>
          <Button onClick={onCreateArticleToggle}>
            <Icon name="Plus" size={18} className="mr-2" />
            Создать статью
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Поиск по статьям..."
                className="pl-10"
                value={knowledgeSearchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
              />
            </div>
          </div>
          {allTags.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant={selectedKnowledgeTag === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTagSelect(null)}
              >
                Все теги
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedKnowledgeTag === tag ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onTagSelect(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article: any) => (
            <Card
              key={article.id}
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onArticleSelect(article)}
            >
              <h3 className="font-semibold mb-2">{article.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {article.content.substring(0, 150)}...
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{article.updatedAt}</span>
                <span>{article.views} просмотров</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {article.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <Card className="p-12 text-center">
            <Icon name="FileQuestion" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Статьи не найдены</h3>
            <p className="text-muted-foreground mb-4">
              {knowledgeSearchQuery || selectedKnowledgeTag
                ? 'Попробуйте изменить параметры поиска'
                : 'В этой категории пока нет статей'}
            </p>
            <Button onClick={onCreateArticleToggle}>
              <Icon name="Plus" size={18} className="mr-2" />
              Создать первую статью
            </Button>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">База знаний</h2>
          <p className="text-muted-foreground">Документация, руководства и справочные материалы</p>
        </div>
        <Button onClick={onCreateCategoryToggle}>
          <Icon name="FolderPlus" size={18} className="mr-2" />
          Создать категорию
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {knowledgeCategories.map(category => (
          <Card
            key={category.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onCategorySelect(category.id)}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name={category.icon} size={24} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1">{category.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {category.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="FileText" size={12} />
                    {category.articles.length} статей
                  </span>
                  <span>Обновлено: {category.lastUpdated}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
