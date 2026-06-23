import { describe, expect, it } from 'vitest';
import { clearAllLocalData, LOCAL_DATA_KEYS } from './localData';

describe('clearAllLocalData', () => {
  it('removes every documented PitchTimer localStorage key', () => {
    for (const key of LOCAL_DATA_KEYS) {
      localStorage.setItem(key, 'value');
    }

    clearAllLocalData();

    for (const key of LOCAL_DATA_KEYS) {
      expect(localStorage.getItem(key)).toBeNull();
    }
  });
});
