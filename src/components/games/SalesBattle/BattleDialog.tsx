import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Match {
  id: number;
  player1_name?: string;
  player2_name?: string;
  player1_avatar?: string;
  player2_avatar?: string;
}

interface ChatMessage {
  role: 'manager' | 'client';
  content: string;
  timestamp?: string;
}

interface BattleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMatch: Match | null;
  chatHistory: ChatMessage[];
  playerInput: string;
  onPlayerInputChange: (value: string) => void;
  onSendMessage: () => void;
  isAIThinking: boolean;
  battleTimer: number;
  totalScore: number;
  onEndBattle: () => void;
}

export default function BattleDialog({
  open,
  onOpenChange,
  currentMatch,
  chatHistory,
  playerInput,
  onPlayerInputChange,
  onSendMessage,
  isAIThinking,
  battleTimer,
  totalScore,
  onEndBattle,
}: BattleDialogProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  if (!currentMatch) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPlayerInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Продажа в действии</span>
            <div className="flex items-center gap-4">
              <Badge variant={battleTimer < 60 ? 'destructive' : 'secondary'}>
                <Icon name="Clock" size={14} className="mr-1" />
                {formatTime(battleTimer)}
              </Badge>
              <Badge variant="outline">
                <Icon name="Target" size={14} className="mr-1" />
                {totalScore} очков
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Убедите клиента купить продукт за 5 минут. Чем выше оценка клиента - тем больше очков!
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          <Card className="p-4 text-center">
            <Avatar className="w-16 h-16 mx-auto mb-2">
              <AvatarFallback className="bg-blue-500 text-white text-lg">
                {getPlayerInitials(currentMatch.player1_name)}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold">{currentMatch.player1_name}</p>
            <p className="text-xs text-muted-foreground">Менеджер</p>
          </Card>

          <Card className="p-4 flex items-center justify-center bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <div className="text-center">
              <Icon name="Swords" size={32} className="mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Идёт продажа</p>
            </div>
          </Card>

          <Card className="p-4 text-center">
            <Avatar className="w-16 h-16 mx-auto mb-2">
              <AvatarFallback className="bg-orange-500 text-white text-lg">
                <Icon name="User" size={24} />
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold">AI Клиент</p>
            <p className="text-xs text-muted-foreground">Потенциальный покупатель</p>
          </Card>
        </div>

        <div className="flex-1 min-h-0 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Прогресс убеждения</span>
              <span className="font-medium">{Math.min(100, Math.round((totalScore / 100) * 100))}%</span>
            </div>
            <Progress value={Math.min(100, (totalScore / 100) * 100)} />
          </div>

          <Card className="flex-1 min-h-0 flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${
                      msg.role === 'manager' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'client' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-orange-500 text-white">
                          <Icon name="User" size={16} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg p-3 max-w-[70%] ${
                        msg.role === 'manager'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      {msg.timestamp && (
                        <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                      )}
                    </div>
                    {msg.role === 'manager' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-500 text-white">
                          {getPlayerInitials(currentMatch.player1_name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isAIThinking && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-orange-500 text-white">
                        <Icon name="User" size={16} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 bg-muted">
                      <div className="flex items-center gap-2">
                        <Icon name="Loader2" size={16} className="animate-spin" />
                        <p className="text-sm">Клиент думает...</p>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t space-y-2">
              <Textarea
                placeholder="Напишите ваше сообщение клиенту..."
                value={playerInput}
                onChange={e => onPlayerInputChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSendMessage();
                  }
                }}
                className="min-h-[80px] resize-none"
                disabled={isAIThinking || battleTimer === 0}
              />
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={onSendMessage}
                  disabled={!playerInput.trim() || isAIThinking || battleTimer === 0}
                >
                  <Icon name="Send" size={16} className="mr-2" />
                  Отправить
                </Button>
                <Button variant="outline" onClick={onEndBattle}>
                  <Icon name="Flag" size={16} className="mr-2" />
                  Завершить
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
