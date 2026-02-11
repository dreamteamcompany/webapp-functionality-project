const API_URL = 'https://functions.poehali.dev/4226c312-00a2-4a69-9a73-0f43263a32c5';

export interface Scenario {
  id: string;
  title: string;
  description: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface Dialog {
  id: string;
  scenario: Scenario;
  messages: Message[];
  total_tokens: number;
  created_at: string;
  updated_at: string;
}

export const trainingApi = {
  async getScenarios(): Promise<Scenario[]> {
    const response = await fetch(`${API_URL}?action=scenarios`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка загрузки сценариев: ${response.statusText}`);
    }

    const data = await response.json();
    return data.scenarios;
  },

  async startTraining(scenarioId: string): Promise<{ dialog_id: string; scenario: Scenario }> {
    const response = await fetch(`${API_URL}?action=start`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scenario_id: scenarioId,
        user_id: 'user123',
      }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка старта тренировки: ${response.statusText}`);
    }

    return response.json();
  },

  async sendMessage(dialogId: string, message: string): Promise<{ user_message: Message; assistant_response: Message }> {
    const response = await fetch(`${API_URL}?action=message`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dialog_id: dialogId,
        message,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Ошибка отправки сообщения: ${response.statusText}`);
    }

    return response.json();
  },

  async getHistory(dialogId: string): Promise<Dialog> {
    const response = await fetch(`${API_URL}?action=history&dialog_id=${dialogId}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка загрузки истории: ${response.statusText}`);
    }

    return response.json();
  },
};
