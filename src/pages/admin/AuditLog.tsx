import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { authService, API_URL } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const AUDIT_API_URL = `${API_URL}/audit`;

interface AuditLog {
  id: number;
  user_id: number;
  username: string;
  action_type: string;
  entity_type: string;
  entity_id: number | null;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

const actionTypeLabels: Record<string, string> = {
  'auth.login': 'Вход',
  'auth.logout': 'Выход',
  'user.create': 'Создание пользователя',
  'user.update': 'Обновление пользователя',
  'user.block': 'Блокировка',
  'user.unblock': 'Разблокировка',
  'role.create': 'Создание роли',
  'role.update': 'Обновление роли',
};

const actionTypeColors: Record<string, string> = {
  'auth.login': 'default',
  'auth.logout': 'secondary',
  'user.create': 'default',
  'user.update': 'secondary',
  'user.block': 'destructive',
  'user.unblock': 'default',
  'role.create': 'default',
  'role.update': 'secondary',
};

const actionTypeIcons: Record<string, string> = {
  'auth.login': 'LogIn',
  'auth.logout': 'LogOut',
  'user.create': 'UserPlus',
  'user.update': 'UserCog',
  'user.block': 'Lock',
  'user.unblock': 'Unlock',
  'role.create': 'ShieldPlus',
  'role.update': 'ShieldCheck',
};

export default function AuditLog() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filterActionType, setFilterActionType] = useState<string>('all');
  const limit = 50;

  useEffect(() => {
    fetchLogs();
  }, [page, filterActionType]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });

      if (filterActionType !== 'all') {
        params.append('action_type', filterActionType);
      }

      const response = await fetch(`${AUDIT_API_URL}?${params}`, {
        headers: {
          'X-Session-Token': authService.getSessionToken() || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось загрузить логи', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить логи', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">История действий</h1>
                <p className="text-sm text-muted-foreground">Аудит-лог системы • Всего записей: {total}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={filterActionType} onValueChange={setFilterActionType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Все действия" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все действия</SelectItem>
                  <SelectItem value="auth.login">Входы</SelectItem>
                  <SelectItem value="auth.logout">Выходы</SelectItem>
                  <SelectItem value="user.create">Создание польз.</SelectItem>
                  <SelectItem value="user.block">Блокировки</SelectItem>
                  <SelectItem value="role.create">Создание ролей</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchLogs}>
                <Icon name="RefreshCw" size={18} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <Icon name="Loader2" size={48} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Card>
              <div className="divide-y">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon 
                          name={actionTypeIcons[log.action_type] as any || 'Activity'} 
                          size={18} 
                          className="text-primary" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={actionTypeColors[log.action_type] as any || 'secondary'}>
                                {actionTypeLabels[log.action_type] || log.action_type}
                              </Badge>
                              <span className="text-sm font-medium">@{log.username}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Icon name="Globe" size={12} />
                            {log.ip_address}
                          </div>
                          {log.entity_id && (
                            <div className="flex items-center gap-1">
                              <Icon name="Hash" size={12} />
                              {log.entity_type} #{log.entity_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  <Icon name="ChevronLeft" size={16} className="mr-1" />
                  Назад
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Страница {page + 1} из {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Вперёд
                  <Icon name="ChevronRight" size={16} className="ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}