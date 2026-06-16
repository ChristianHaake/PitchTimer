import { useState, useCallback } from 'react';
import { type PitchRecord, getHistory, saveHistory, clearHistory as clearStorageHistory } from '../utils/history';

export function useHistory() {
  const [history, setHistory] = useState<PitchRecord[]>(() => getHistory());

  const addRecord = useCallback((record: Omit<PitchRecord, 'id' | 'date'>) => {
    const current = getHistory();
    const newRecord: PitchRecord = {
      ...record,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    const newHistory = [newRecord, ...current].slice(0, 50);
    saveHistory(newHistory);
    setHistory(newHistory);
  }, []);

  const clearHistory = useCallback(() => {
    clearStorageHistory();
    setHistory([]);
  }, []);

  return {
    history,
    addRecord,
    clearHistory
  };
}
