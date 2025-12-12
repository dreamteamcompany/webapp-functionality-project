import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

interface Match {
  id: number;
  round: number;
  match_order: number;
  player1_id: number | null;
  player2_id: number | null;
  player1_name?: string;
  player2_name?: string;
  player1_avatar?: string;
  player2_avatar?: string;
  winner_id: number | null;
  score1: number;
  score2: number;
  status: string;
}

interface Tournament {
  id: number;
  name: string;
  company_a_id: number;
  company_b_id: number;
  company_a_name: string;
  company_b_name: string;
  prize_pool: number;
  status: string;
  matches: Match[];
  winner_id: number | null;
}

interface TournamentBracketProps {
  tournament: Tournament;
  onStartMatch: (match: Match) => void;
}

export default function TournamentBracket({
  tournament,
  onStartMatch,
}: TournamentBracketProps) {
  const rounds = tournament.matches.reduce(
    (acc, match) => {
      if (!acc[match.round]) acc[match.round] = [];
      acc[match.round].push(match);
      return acc;
    },
    {} as Record<number, Match[]>
  );

  const getPlayerInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const renderMatch = (match: Match) => (
    <Card key={match.id} className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-blue-500 text-white">
              {getPlayerInitials(match.player1_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-sm">
              {match.player1_name || 'Ожидание'}
            </p>
            {match.status === 'completed' && (
              <Badge variant={match.winner_id === match.player1_id ? 'default' : 'secondary'} className="mt-1">
                {match.score1} очков
              </Badge>
            )}
          </div>
        </div>
        {match.winner_id === match.player1_id && (
          <Icon name="Trophy" size={18} className="text-yellow-500" />
        )}
      </div>

      <div className="flex items-center justify-center">
        <div className="h-px w-full bg-border" />
        <span className="px-2 text-xs text-muted-foreground bg-background">VS</span>
        <div className="h-px w-full bg-border" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-purple-500 text-white">
              {getPlayerInitials(match.player2_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-sm">
              {match.player2_name || 'Ожидание'}
            </p>
            {match.status === 'completed' && (
              <Badge variant={match.winner_id === match.player2_id ? 'default' : 'secondary'} className="mt-1">
                {match.score2} очков
              </Badge>
            )}
          </div>
        </div>
        {match.winner_id === match.player2_id && (
          <Icon name="Trophy" size={18} className="text-yellow-500" />
        )}
      </div>

      {match.status === 'pending' && match.player1_id && match.player2_id && (
        <Button
          className="w-full"
          size="sm"
          onClick={() => onStartMatch(match)}
        >
          <Icon name="Swords" size={16} className="mr-2" />
          Начать бой
        </Button>
      )}

      {match.status === 'in_progress' && (
        <Badge variant="outline" className="w-full justify-center">
          В процессе
        </Badge>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{tournament.name}</h2>
          <p className="text-sm text-muted-foreground">
            Призовой фонд: {tournament.prize_pool.toLocaleString('ru-RU')}₽
          </p>
        </div>
        <Badge variant={tournament.status === 'completed' ? 'default' : 'secondary'}>
          {tournament.status === 'completed' ? 'Завершен' : 'В процессе'}
        </Badge>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {Object.entries(rounds)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([round, matches]) => (
            <div key={round} className="space-y-4">
              <div className="flex items-center gap-2">
                <Icon name="Target" size={18} className="text-primary" />
                <h3 className="font-semibold">
                  {round === '1' && 'Четвертьфинал'}
                  {round === '2' && 'Полуфинал'}
                  {round === '3' && 'Финал'}
                </h3>
              </div>
              <div className="space-y-3">
                {matches
                  .sort((a, b) => a.match_order - b.match_order)
                  .map(renderMatch)}
              </div>
            </div>
          ))}
      </div>

      {tournament.status === 'completed' && tournament.winner_id && (
        <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <div className="flex items-center justify-center gap-4">
            <Icon name="Trophy" size={32} className="text-yellow-500" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Победитель турнира</p>
              <p className="text-2xl font-bold">
                {tournament.matches.find(m => m.player1_id === tournament.winner_id)?.player1_name ||
                  tournament.matches.find(m => m.player2_id === tournament.winner_id)?.player2_name}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
