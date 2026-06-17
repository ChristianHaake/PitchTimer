export interface PitchRecord {
  id: string;
  date: string; // ISO string
  timeMode: number;
  actualDuration: number;
  status: 'completed' | 'cancelled';
}

const STORAGE_KEY = 'pitchtimer_history';
const STORAGE_VERSION = 1;
const MAX_HISTORY_RECORDS = 50;

interface HistoryStorageV1 {
  version: typeof STORAGE_VERSION;
  records: PitchRecord[];
}

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isPitchRecord(value: unknown): value is PitchRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;

  return (
    typeof record.id === 'string' &&
    typeof record.date === 'string' &&
    !Number.isNaN(Date.parse(record.date)) &&
    isFiniteNonNegativeNumber(record.timeMode) &&
    isFiniteNonNegativeNumber(record.actualDuration) &&
    (record.status === 'completed' || record.status === 'cancelled')
  );
}

export function decodeHistoryStorage(value: unknown): PitchRecord[] {
  const records =
    Array.isArray(value)
      ? value
      : value &&
          typeof value === 'object' &&
          (value as Partial<HistoryStorageV1>).version === STORAGE_VERSION &&
          Array.isArray((value as Partial<HistoryStorageV1>).records)
        ? (value as HistoryStorageV1).records
        : null;

  if (!records) return [];

  return records.filter(isPitchRecord).slice(0, MAX_HISTORY_RECORDS);
}

export function getHistory(): PitchRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? decodeHistoryStorage(JSON.parse(saved)) : [];
  } catch (error) {
    console.error('Failed to parse pitch history from local storage:', error);
    return [];
  }
}

export function saveHistory(history: PitchRecord[]) {
  const storage: HistoryStorageV1 = {
    version: STORAGE_VERSION,
    records: history.filter(isPitchRecord).slice(0, MAX_HISTORY_RECORDS),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('Failed to save pitch history to local storage:', error);
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear pitch history from local storage:', error);
  }
}
