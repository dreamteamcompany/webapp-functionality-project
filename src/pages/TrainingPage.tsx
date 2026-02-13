import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainingApi, Scenario, Message } from '@/services/training-api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

function ScenarioSelector({
  scenarios,
  loading,
  error,
  onSelect,
  onBack,
}: {
  scenarios: Scenario[];
  loading: boolean;
  error: string;
  onSelect: (s: Scenario) => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Тренировка диалогов
            </h1>
            <p className="text-gray-600">
              Выберите сценарий для отработки навыков общения
            </p>
          </div>
        </div>

        {error && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-200"
              onClick={() => !loading && onSelect(scenario)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="MessageSquare" className="text-blue-600" size={20} />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {scenario.title}
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {scenario.description}
              </p>
              <Button className="w-full" disabled={loading}>
                {loading ? 'Загрузка...' : 'Начать тренировку'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <Card
        className={`p-4 max-w-[75%] ${
          isUser ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'
        }`}
      >
        <div className="flex items-start gap-3">
          <Icon
            name={isUser ? 'User' : 'Bot'}
            size={20}
            className={`flex-shrink-0 mt-0.5 ${isUser ? 'text-blue-200' : 'text-blue-600'}`}
          />
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-medium mb-1 ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
              {isUser ? 'Вы (Администратор)' : 'Пациент'}
            </p>
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <Card className="p-4 bg-gray-100">
        <div className="flex items-center gap-2">
          <Icon name="Loader" size={18} className="animate-spin text-gray-600" />
          <span className="text-gray-600">Пациент печатает...</span>
        </div>
      </Card>
    </div>
  );
}

function ChatView({
  scenario,
  messages,
  inputMessage,
  loading,
  error,
  onSend,
  onInputChange,
  onReset,
}: {
  scenario: Scenario;
  messages: Message[];
  inputMessage: string;
  loading: boolean;
  error: string;
  onSend: () => void;
  onInputChange: (value: string) => void;
  onReset: () => void;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="Bot" size={20} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {scenario.title}
              </h2>
              <p className="text-xs text-gray-500 truncate">
                {scenario.description}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onReset}>
            <Icon name="X" size={16} className="mr-1" />
            Завершить
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="MessageCircle" size={32} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Начните диалог
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Вы — администратор клиники. Напишите приветствие пациенту, чтобы начать тренировку.
              </p>
            </div>
          )}

          {error && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-2">
                <Icon name="AlertCircle" size={18} className="text-red-500" />
                <p className="text-red-600">{error}</p>
              </div>
            </Card>
          )}

          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))}

          {loading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите ваше сообщение..."
            disabled={loading}
            className="flex-1"
            autoFocus
          />
          <Button
            onClick={onSend}
            disabled={loading || !inputMessage.trim()}
          >
            <Icon name="Send" size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TrainingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'select' | 'chat'>('select');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [dialogId, setDialogId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const data = await trainingApi.getScenarios();
      setScenarios(data);
    } catch (err) {
      setError('Не удалось загрузить сценарии');
      console.error(err);
    }
  };

  const startTraining = async (scenario: Scenario) => {
    setLoading(true);
    setError('');
    try {
      const result = await trainingApi.startTraining(scenario.id);
      setDialogId(result.dialog_id);
      setSelectedScenario(result.scenario);
      setMessages([]);
      setStep('chat');
    } catch (err) {
      setError('Не удалось начать тренировку');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !dialogId) return;

    const text = inputMessage;
    setLoading(true);
    setError('');

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');

    try {
      const result = await trainingApi.sendMessage(dialogId, text);

      const assistantMessage: Message = {
        role: 'assistant',
        content: result.assistant_response.content,
        timestamp: result.assistant_response.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка отправки сообщения';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetTraining = () => {
    setStep('select');
    setDialogId('');
    setMessages([]);
    setSelectedScenario(null);
    setInputMessage('');
    setError('');
  };

  if (step === 'select') {
    return (
      <ScenarioSelector
        scenarios={scenarios}
        loading={loading}
        error={error}
        onSelect={startTraining}
        onBack={() => navigate('/')}
      />
    );
  }

  if (!selectedScenario) return null;

  return (
    <ChatView
      scenario={selectedScenario}
      messages={messages}
      inputMessage={inputMessage}
      loading={loading}
      error={error}
      onSend={sendMessage}
      onInputChange={setInputMessage}
      onReset={resetTraining}
    />
  );
}
