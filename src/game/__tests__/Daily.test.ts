import {
  SeededRNG,
  todayString,
  seedForDate,
  todaySeed,
  DailyLeaderboard,
  generateShareCode,
  parseShareCode,
  getDailyLevelIds,
} from '../Daily';

describe('SeededRNG', () => {
  it('produces deterministic sequence', () => {
    const rng1 = new SeededRNG(12345);
    const rng2 = new SeededRNG(12345);
    expect(rng1.next()).toBe(rng2.next());
  });

  it('nextInt returns values in range', () => {
    const rng = new SeededRNG(42);
    for (let i = 0; i < 100; i++) {
      const val = rng.nextInt(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThan(10);
    }
  });

  it('shuffle shuffles array deterministically', () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(42);
    const arr1 = [1, 2, 3, 4, 5];
    const arr2 = [1, 2, 3, 4, 5];
    rng1.shuffle(arr1);
    rng2.shuffle(arr2);
    expect(arr1).toEqual(arr2);
  });
});

describe('Date functions', () => {
  it('todayString returns YYYY-MM-DD format', () => {
    expect(todayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('seedForDate produces consistent seed', () => {
    expect(seedForDate('2026-03-06')).toBe(seedForDate('2026-03-06'));
    expect(seedForDate('2026-03-06')).not.toBe(seedForDate('2026-03-07'));
  });

  it('todaySeed uses today date', () => {
    expect(todaySeed()).toBe(seedForDate(todayString()));
  });
});

describe('Share codes', () => {
  it('generateShareCode creates correct format', () => {
    const code = generateShareCode('2026-03-06', 45, 3);
    expect(code).toBe('EXCAVATION-20260306-3L-45G');
  });

  it('parseShareCode extracts data', () => {
    const result = parseShareCode('EXCAVATION-20260306-3L-45G');
    expect(result).toEqual({ date: '2026-03-06', gems: 45, levels: 3 });
  });

  it('parseShareCode returns null for invalid codes', () => {
    expect(parseShareCode('INVALID')).toBeNull();
    expect(parseShareCode('CONDUIT-20260306-3L-500')).toBeNull();
  });

  it('roundtrips share code', () => {
    const date = '2026-03-06';
    const gems = 60;
    const levels = 3;
    const code = generateShareCode(date, gems, levels);
    const parsed = parseShareCode(code);
    expect(parsed).toEqual({ date, gems, levels });
  });
});

describe('getDailyLevelIds', () => {
  it('returns correct number of levels', () => {
    const levels = getDailyLevelIds(8);
    expect(levels.length).toBe(3);
  });

  it('returns deterministic levels for same day', () => {
    const levels1 = getDailyLevelIds(8);
    const levels2 = getDailyLevelIds(8);
    expect(levels1).toEqual(levels2);
  });

  it('returns valid level indices', () => {
    const levels = getDailyLevelIds(8);
    for (const level of levels) {
      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThan(8);
    }
  });
});

describe('DailyLeaderboard', () => {
  beforeEach(() => {
    DailyLeaderboard.resetCache();
  });

  it('getToday returns empty array initially', () => {
    expect(DailyLeaderboard.getToday()).toEqual([]);
  });

  it('getBest returns null when empty', () => {
    expect(DailyLeaderboard.getBest()).toBeNull();
  });

  it('wouldRank returns true when board empty', () => {
    expect(DailyLeaderboard.wouldRank(3, 45)).toBe(true);
  });
});
