import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { authService, API_URL as AUTH_API_URL } from '@/lib/auth';
import TournamentSetup from './SalesBattle/TournamentSetup';
import TournamentBracket from './SalesBattle/TournamentBracket';
import BattleDialog from './SalesBattle/BattleDialog';

const API_URL = AUTH_API_URL;

interface Company {
  id: string;
  name: string;
  color: string;
}

interface SalesManager {
  id: number;
  name: string;
  avatar: string;
  level: number;
  wins: number;
  losses: number;
  company_id: number;
}

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

interface ChatMessage {
  role: 'manager' | 'client';
  content: string;
  timestamp?: string;
}

export default function SalesBattle() {
  const { toast } = useToast();
  const [setupDialog, setSetupDialog] = useState(false);
  const [battleDialog, setBattleDialog] = useState(false);
  const [selectedCompanyA, setSelectedCompanyA] = useState<string>('');
  const [selectedCompanyB, setSelectedCompanyB] = useState<string>('');
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [battleTimer, setBattleTimer] = useState(300);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [playerInput, setPlayerInput] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [managers, setManagers] = useState<SalesManager[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (!battleDialog || battleTimer <= 0) return;

    const timer = setInterval(() => {
      setBattleTimer(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [battleDialog, battleTimer]);

  const loadCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      const response = await fetch(
        `${API_URL}?entity_type=company`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': authService.getSessionToken() || '',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load companies');

      const data = await response.json();
      if (data.companies && Array.isArray(data.companies)) {
        const loadedCompanies: Company[] = data.companies.map((c: any, idx: number) => ({
          id: c.id.toString(),
          name: c.name,
          color: ['blue', 'purple', 'green', 'orange', 'red', 'pink'][idx % 6],
        }));
        setCompanies(loadedCompanies);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список компаний',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const loadManagers = async (companyId: string) => {
    try {
      const response = await fetch(
        `${API_URL}?entity_type=sales_manager&company_id=${companyId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': authService.getSessionToken() || '',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load managers');

      const data = await response.json();
      return data.managers || [];
    } catch (error) {
      console.error('Error loading managers:', error);
      return [];
    }
  };

  const handleCreateTournament = async () => {
    if (!selectedCompanyA || !selectedCompanyB) {
      toast({
        title: 'Ошибка',
        description: 'Выберите обе компании для турнира',
        variant: 'destructive',
      });
      return;
    }

    if (selectedCompanyA === selectedCompanyB) {
      toast({
        title: 'Ошибка',
        description: 'Компании должны быть разными',
        variant: 'destructive',
      });
      return;
    }

    const companyA = companies.find(c => c.id === selectedCompanyA)!;
    const companyB = companies.find(c => c.id === selectedCompanyB)!;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          entity_type: 'tournament',
          name: `${companyA.name} VS ${companyB.name}`,
          company_a_id: parseInt(selectedCompanyA),
          company_b_id: parseInt(selectedCompanyB),
          prize_pool: 20000,
        }),
      });

      if (!response.ok) throw new Error('Failed to create tournament');

      const data = await response.json();
      
      await loadTournament(data.tournament_id);
      setSetupDialog(false);
      
      toast({
        title: 'Турнир создан!',
        description: `${companyA.name} против ${companyB.name}. Призовой фонд: 20 000₽`,
      });
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать турнир',
        variant: 'destructive',
      });
    }
  };

  const loadTournament = async (tournamentId: number) => {
    try {
      const response = await fetch(
        `${API_URL}?entity_type=tournament&tournament_id=${tournamentId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': authService.getSessionToken() || '',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load tournament');

      const data = await response.json();
      setTournament(data.tournament);
    } catch (error) {
      console.error('Error loading tournament:', error);
    }
  };

  const handleStartMatch = async (match: Match) => {
    if (!match.player1_id || !match.player2_id) {
      toast({
        title: 'Ошибка',
        description: 'Не хватает участников для боя',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          entity_type: 'battle',
          action: 'start_match',
          match_id: match.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to start match');

      const data = await response.json();
      
      setCurrentMatch(match);
      setSessionId(data.session_id);
      setBattleTimer(300);
      setTotalScore(0);
      setChatHistory([
        {
          role: 'client',
          content: data.initial_message || 'Здравствуйте! Чем могу помочь?',
          timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setBattleDialog(true);
    } catch (error) {
      console.error('Error starting match:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось начать бой',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!playerInput.trim() || !sessionId) return;

    const userMessage: ChatMessage = {
      role: 'manager',
      content: playerInput,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory(prev => [...prev, userMessage]);
    setPlayerInput('');
    setIsAIThinking(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          entity_type: 'battle',
          action: 'send_message',
          session_id: sessionId,
          message: playerInput,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();

      const aiMessage: ChatMessage = {
        role: 'client',
        content: data.response,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };

      setChatHistory(prev => [...prev, aiMessage]);
      setTotalScore(data.score || 0);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive',
      });
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleEndBattle = async () => {
    if (!sessionId || !currentMatch) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          entity_type: 'battle',
          action: 'end_battle',
          session_id: sessionId,
          match_id: currentMatch.id,
          final_score: totalScore,
        }),
      });

      if (!response.ok) throw new Error('Failed to end battle');

      const data = await response.json();

      toast({
        title: 'Бой завершен!',
        description: `Финальный результат: ${data.final_score} очков`,
      });

      setBattleDialog(false);
      setCurrentMatch(null);
      setSessionId(null);
      setChatHistory([]);
      
      if (tournament) {
        await loadTournament(tournament.id);
      }
    } catch (error) {
      console.error('Error ending battle:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось завершить бой',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Icon name="Swords" size={32} className="text-primary" />
            Sales Battle Arena
          </h1>
          <p className="text-muted-foreground mt-1">
            Турниры продаж между компаниями. Докажите, что ваши менеджеры - лучшие!
          </p>
        </div>
        <Button onClick={() => setSetupDialog(true)} size="lg">
          <Icon name="Plus" size={20} className="mr-2" />
          Создать турнир
        </Button>
      </div>

      {!tournament && (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Icon name="Trophy" size={40} className="text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Нет активных турниров</h3>
              <p className="text-muted-foreground">
                Создайте турнир между двумя компаниями и начните соревнование!
              </p>
            </div>
            <Button onClick={() => setSetupDialog(true)} size="lg">
              <Icon name="Plus" size={20} className="mr-2" />
              Создать первый турнир
            </Button>
          </div>
        </Card>
      )}

      {tournament && (
        <TournamentBracket
          tournament={tournament}
          onStartMatch={handleStartMatch}
        />
      )}

      <TournamentSetup
        open={setupDialog}
        onOpenChange={setSetupDialog}
        companies={companies}
        isLoadingCompanies={isLoadingCompanies}
        selectedCompanyA={selectedCompanyA}
        selectedCompanyB={selectedCompanyB}
        onCompanyAChange={setSelectedCompanyA}
        onCompanyBChange={setSelectedCompanyB}
        onCreateTournament={handleCreateTournament}
      />

      <BattleDialog
        open={battleDialog}
        onOpenChange={setBattleDialog}
        currentMatch={currentMatch}
        chatHistory={chatHistory}
        playerInput={playerInput}
        onPlayerInputChange={setPlayerInput}
        onSendMessage={handleSendMessage}
        isAIThinking={isAIThinking}
        battleTimer={battleTimer}
        totalScore={totalScore}
        onEndBattle={handleEndBattle}
      />
    </div>
  );
}