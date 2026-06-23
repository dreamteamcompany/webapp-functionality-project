import { CustomScenario } from '@/types/customScenario';

const CHAT_API_URL = 'https://functions.poehali.dev/4226c312-00a2-4a69-9a73-0f43263a32c5';

export interface PatientChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

interface PatientChatResponse {
  message: string;
}

function buildPersona(scenario: CustomScenario) {
  return {
    context: scenario.context,
    personality: scenario.aiPersonality,
    objectives: scenario.objectives || [],
    challenges: scenario.challenges || [],
  };
}

export async function fetchPatientReply(
  scenario: CustomScenario,
  history: PatientChatHistoryItem[],
  userMessage: string
): Promise<string> {
  const response = await fetch(`${CHAT_API_URL}?action=chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      persona: buildPersona(scenario),
      history,
      message: userMessage,
    }),
  });

  if (!response.ok) {
    throw new Error(`Patient chat API error: ${response.status}`);
  }

  const data: PatientChatResponse = await response.json();
  if (!data.message) {
    throw new Error('Empty patient reply');
  }

  return data.message;
}
