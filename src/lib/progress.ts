import { LEARNING_API_URL } from './learning';

export interface ProgressUpdateRequest {
  item_type: 'course' | 'trainer';
  item_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percent: number;
  attempts_count?: number;
  best_score?: number;
}

export const progressService = {
  async getProgress(sessionToken: string) {
    const response = await fetch(`${LEARNING_API_URL}?entity_type=progress`, {
      headers: { 'X-Session-Token': sessionToken },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch progress');
    }
    
    return response.json();
  },

  async updateProgress(sessionToken: string, data: ProgressUpdateRequest) {
    const response = await fetch(LEARNING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': sessionToken,
      },
      body: JSON.stringify({
        entity_type: 'progress',
        ...data,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update progress');
    }
    
    return response.json();
  },

  async startCourse(sessionToken: string, courseId: number) {
    return this.updateProgress(sessionToken, {
      item_type: 'course',
      item_id: courseId,
      status: 'in_progress',
      progress_percent: 0,
    });
  },

  async completeCourse(sessionToken: string, courseId: number) {
    return this.updateProgress(sessionToken, {
      item_type: 'course',
      item_id: courseId,
      status: 'completed',
      progress_percent: 100,
    });
  },

  async startTrainer(sessionToken: string, trainerId: number) {
    return this.updateProgress(sessionToken, {
      item_type: 'trainer',
      item_id: trainerId,
      status: 'in_progress',
      progress_percent: 0,
    });
  },

  async completeTrainer(sessionToken: string, trainerId: number, score?: number) {
    return this.updateProgress(sessionToken, {
      item_type: 'trainer',
      item_id: trainerId,
      status: 'completed',
      progress_percent: 100,
      attempts_count: 1,
      best_score: score,
    });
  },
};
