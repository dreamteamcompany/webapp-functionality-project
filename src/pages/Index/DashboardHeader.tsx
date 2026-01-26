import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

interface DashboardHeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigateToAdmin: () => void;
  onNavigateToScenarios?: () => void;
}

export default function DashboardHeader({
  currentUser,
  onLogout,
  onNavigateToAdmin,
  onNavigateToScenarios,
}: DashboardHeaderProps) {
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="GraduationCap" size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Learning Hub</h1>
              <p className="text-xs text-muted-foreground">Платформа обучения и развития</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {onNavigateToScenarios && (
              <Button variant="outline" onClick={onNavigateToScenarios} className="gap-2">
                <Icon name="Layers" size={18} />
                <span className="hidden md:inline">Конструктор сценариев</span>
              </Button>
            )}
            
            <Button variant="ghost" size="icon">
              <Icon name="Bell" size={20} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {currentUser ? getUserInitials(currentUser.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{currentUser?.full_name || 'Пользователь'}</span>
                  <Icon name="ChevronDown" size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onNavigateToAdmin}>
                  <Icon name="Settings" size={16} className="mr-2" />
                  Администрирование
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icon name="User" size={16} className="mr-2" />
                  Профиль
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icon name="Trophy" size={16} className="mr-2" />
                  Достижения
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <Icon name="LogOut" size={16} className="mr-2" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}