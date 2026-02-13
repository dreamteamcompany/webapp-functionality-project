import { authService } from '@/lib/auth';

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

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    mode: 'cors',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Ошибка: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // ignore parse error
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

function getCurrentUserId(): string {
  const userId = authService.getUserId();
  return userId ? String(userId) : 'anonymous';
}

export const trainingApi = {
  async getScenarios(): Promise<Scenario[]> {
    const data = await apiRequest<{ scenarios: Scenario[] }>(
      `${API_URL}?action=scenarios`
    );
    return data.scenarios;
  },

  async startTraining(scenarioId: string): Promise<{ dialog_id: string; scenario: Scenario }> {
    return apiRequest(`${API_URL}?action=start`, {
      method: 'POST',
      body: JSON.stringify({
        scenario_id: scenarioId,
        user_id: getCurrentUserId(),
      }),
    });
  },

  async sendMessage(dialogId: string, message: string): Promise<{ user_message: Message; assistant_response: Message }> {
    return apiRequest(`${API_URL}?action=message`, {
      method: 'POST',
      body: JSON.stringify({
        dialog_id: dialogId,
        message,
      }),
    });
  },

  async getHistory(dialogId: string): Promise<Dialog> {
    return apiRequest(`${API_URL}?action=history&dialog_id=${dialogId}`);
  },
};