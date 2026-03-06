/**
 * Daily Challenge System for Excavation
 *
 * Provides date-based seeded gameplay for competitive daily runs.
 */

export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

export function todayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function seedForDate(dateStr: string): number {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return 0;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  return Math.abs((year * 31337 + month * 1337 + day * 37) | 0);
}

export function todaySeed(): number {
  return seedForDate(todayString());
}

/** Daily score entry - higher gems collected is better */
export interface DailyScore {
  name: string;
  totalGems: number;
  levelsCompleted: number;
  timeSeconds: number;
  completedAt: string;
}

const DAILY_STORAGE_KEY = 'excavation_daily_leaderboard';
const MAX_DAILY_ENTRIES = 10;

export class DailyLeaderboard {
  private static cache: Map<string, DailyScore[]> = new Map();

  private static loadForDate(date: string): DailyScore[] {
    if (this.cache.has(date)) return this.cache.get(date)!;

    if (typeof window === 'undefined') {
      this.cache.set(date, []);
      return [];
    }

    try {
      const stored = localStorage.getItem(DAILY_STORAGE_KEY);
      if (!stored) {
        this.cache.set(date, []);
        return [];
      }
      const all: Record<string, DailyScore[]> = JSON.parse(stored);
      const entries = all[date] || [];
      this.cache.set(date, entries);
      return entries;
    } catch {
      this.cache.set(date, []);
      return [];
    }
  }

  private static saveForDate(date: string, entries: DailyScore[]): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(DAILY_STORAGE_KEY);
      const all: Record<string, DailyScore[]> = stored ? JSON.parse(stored) : {};
      all[date] = entries;

      const dates = Object.keys(all).sort().reverse();
      if (dates.length > 30) {
        for (const oldDate of dates.slice(30)) {
          delete all[oldDate];
        }
      }

      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(all));
    } catch {}
  }

  static recordScore(
    name: string,
    totalGems: number,
    levelsCompleted: number,
    timeSeconds: number
  ): number | null {
    const date = todayString();
    const entries = this.loadForDate(date);
    const now = new Date().toISOString();

    entries.push({ name, totalGems, levelsCompleted, timeSeconds, completedAt: now });
    
    // Sort: more levels completed, then more gems, then faster time
    entries.sort((a, b) => {
      if (b.levelsCompleted !== a.levelsCompleted) {
        return b.levelsCompleted - a.levelsCompleted;
      }
      if (b.totalGems !== a.totalGems) {
        return b.totalGems - a.totalGems;
      }
      return a.timeSeconds - b.timeSeconds;
    });

    const rank = entries.findIndex((e) => e.completedAt === now);
    const trimmed = entries.slice(0, MAX_DAILY_ENTRIES);
    this.cache.set(date, trimmed);
    this.saveForDate(date, trimmed);

    return rank >= 0 && rank < MAX_DAILY_ENTRIES ? rank + 1 : null;
  }

  static getToday(): DailyScore[] {
    return this.loadForDate(todayString());
  }

  static getForDate(date: string): DailyScore[] {
    return this.loadForDate(date);
  }

  static wouldRank(levelsCompleted: number, totalGems: number): boolean {
    const entries = this.getToday();
    if (entries.length < MAX_DAILY_ENTRIES) return true;
    
    const worst = entries[entries.length - 1];
    if (levelsCompleted > worst.levelsCompleted) return true;
    if (levelsCompleted === worst.levelsCompleted && totalGems > worst.totalGems) return true;
    return false;
  }

  static getBest(): DailyScore | null {
    return this.getToday()[0] || null;
  }

  static resetCache(): void {
    this.cache.clear();
  }
}

export function generateShareCode(date: string, gems: number, levels: number): string {
  const dateCompact = date.replace(/-/g, '');
  return `EXCAVATION-${dateCompact}-${levels}L-${gems}G`;
}

export function parseShareCode(code: string): { date: string; gems: number; levels: number } | null {
  const parts = code.split('-');
  if (parts.length !== 4 || parts[0] !== 'EXCAVATION') return null;

  const dateCompact = parts[1];
  if (dateCompact.length !== 8) return null;

  const year = dateCompact.slice(0, 4);
  const month = dateCompact.slice(4, 6);
  const day = dateCompact.slice(6, 8);
  const date = `${year}-${month}-${day}`;

  const levelsStr = parts[2];
  if (!levelsStr.endsWith('L')) return null;
  const levels = parseInt(levelsStr.slice(0, -1), 10);
  if (isNaN(levels)) return null;

  const gemsStr = parts[3];
  if (!gemsStr.endsWith('G')) return null;
  const gems = parseInt(gemsStr.slice(0, -1), 10);
  if (isNaN(gems)) return null;

  return { date, gems, levels };
}

export function getDailyLevelIds(totalLevels: number): number[] {
  const rng = new SeededRNG(todaySeed());
  const allLevels = Array.from({ length: totalLevels }, (_, i) => i);
  rng.shuffle(allLevels);
  return allLevels.slice(0, Math.min(3, totalLevels));
}
