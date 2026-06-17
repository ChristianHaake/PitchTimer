import { describe, expect, it } from 'vitest';
import { decodeHistoryStorage, type PitchRecord } from './history';

const validRecord: PitchRecord = {
  id: 'pitch-1',
  date: '2026-06-17T12:00:00.000Z',
  timeMode: 60,
  actualDuration: 58,
  status: 'completed',
};

describe('decodeHistoryStorage', () => {
  it('accepts the current versioned storage format', () => {
    expect(decodeHistoryStorage({ version: 1, records: [validRecord] })).toEqual([validRecord]);
  });

  it('migrates the legacy array format', () => {
    expect(decodeHistoryStorage([validRecord])).toEqual([validRecord]);
  });

  it('drops invalid records instead of returning unsafe data', () => {
    const decoded = decodeHistoryStorage({
      version: 1,
      records: [
        validRecord,
        { ...validRecord, id: 123 },
        { ...validRecord, date: 'not-a-date' },
        { ...validRecord, status: 'unknown' },
      ],
    });

    expect(decoded).toEqual([validRecord]);
  });

  it('rejects unsupported shapes and future versions', () => {
    expect(decodeHistoryStorage({ bad: true })).toEqual([]);
    expect(decodeHistoryStorage({ version: 999, records: [validRecord] })).toEqual([]);
  });

  it('limits history to 50 records', () => {
    const records = Array.from({ length: 60 }, (_, index) => ({
      ...validRecord,
      id: `pitch-${index}`,
    }));

    expect(decodeHistoryStorage({ version: 1, records })).toHaveLength(50);
  });
});
