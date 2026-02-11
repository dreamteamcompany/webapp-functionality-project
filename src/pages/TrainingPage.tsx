import { useState, useEffect } from 'react';
import { trainingApi, Scenario, Message } from '@/services/training-api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

export default function TrainingPage() {
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

    setLoading(true);
    setError('');

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');

    try {
      const result = await trainingApi.sendMessage(dialogId, inputMessage);
      
      const assistantMessage: Message = {
        role: result.assistant_response.role as 'assistant',
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Тренировка диалогов
            </h1>
            <p className="text-gray-600">
              Выберите сценарий для отработки навыков общения
            </p>
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
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => !loading && startTraining(scenario)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <Icon name="MessageSquare" className="text-blue-600 flex-shrink-0" size={24} />
                  <h3 className="font-semibold text-lg text-gray-900">
                    {scenario.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  {scenario.description}
                </p>
                <Button
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Загрузка...' : 'Начать тренировку'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedScenario?.title}
            </h2>
            <p className="text-sm text-gray-600">
              {selectedScenario?.description}
            </p>
          </div>
          <Button variant="outline" onClick={resetTraining}>
            <Icon name="X" size={18} className="mr-2" />
            Завершить
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {error && (
            <Card className="p-4 bg-red-50 border-red-200">
              <p className="text-red-600">{error}</p>
            </Card>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`p-4 max-w-[70%] ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    name={msg.role === 'user' ? 'User' : 'Bot'}
                    size={20}
                    className={msg.role === 'user' ? 'text-white' : 'text-blue-600'}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">
                      {msg.role === 'user' ? 'Вы (Администратор)' : 'Пациент'}
                    </p>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <Card className="p-4 bg-gray-100">
                <div className="flex items-center gap-2">
                  <Icon name="Loader" size={18} className="animate-spin text-gray-600" />
                  <span className="text-gray-600">Пациент печатает...</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
            placeholder="Введите ваше сообщение..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !inputMessage.trim()}
          >
            <Icon name="Send" size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}