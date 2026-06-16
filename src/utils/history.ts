export interface PitchRecord {
  id: string;
  date: string; // ISO string
  timeMode: number;
  actualDuration: number;
  status: 'completed' | 'cancelled';
}

const STORAGE_KEY = 'pitchtimer_history';

export function getHistory(): PitchRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to parse pitch history from local storage:', error);
    return [];
  }
}

export function saveHistory(history: PitchRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}



export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
