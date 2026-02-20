/**
 * Leaderboard - High score tracking
 */

export interface HighScore {
  name: string;
  score: number;
  level: number; // highest level reached
  completedAt: string;
}

const STORAGE_KEY = 'excavation_leaderboard';
const MAX_ENTRIES = 10;

export class Leaderboard {
  private static entries: HighScore[] | null = null;

  /**
   * Load leaderboard from localStorage
   */
  static load(): HighScore[] {
    if (this.entries !== null) {
      return this.entries;
    }

    if (typeof window === 'undefined') {
      this.entries = [];
      return this.entries;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.entries = JSON.parse(stored);
      } else {
        this.entries = [];
      }
    } catch {
      this.entries = [];
    }

    return this.entries ?? [];
  }

  /**
   * Save leaderboard to localStorage
   */
  private static save(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch {
      // localStorage may be full or unavailable
    }
  }

  /**
   * Record a high score
   * Returns rank (1-indexed) if made leaderboard, null otherwise
   */
  static recordScore(playerName: string, score: number, level: number): number | null {
    const entries = this.load();
    const now = new Date().toISOString();

    const newEntry: HighScore = {
      name: playerName,
      score,
      level,
      completedAt: now,
    };

    entries.push(newEntry);

    // Sort by score descending
    entries.sort((a, b) => b.score - a.score);

    // Find rank of new entry
    const rank = entries.findIndex(e => e.completedAt === now);

    // Keep only top entries
    this.entries = entries.slice(0, MAX_ENTRIES);
    this.save();

    // Return rank if made leaderboard
    if (rank >= 0 && rank < MAX_ENTRIES) {
      return rank + 1;
    }
    return null;
  }

  /**
   * Get top entries
   */
  static getTop(count: number = 10): HighScore[] {
    return this.load().slice(0, count);
  }

  /**
   * Check if score would make leaderboard
   */
  static wouldRank(score: number): boolean {
    const entries = this.load();
    if (entries.length < MAX_ENTRIES) return true;
    return score > entries[entries.length - 1].score;
  }

  /**
   * Get the best score
   */
  static getBest(): HighScore | null {
    const entries = this.load();
    return entries[0] || null;
  }

  /**
   * Clear all data
   */
  static clear(): void {
    this.entries = [];
    this.save();
  }

  /**
   * Reset cache (for testing)
   */
  static resetCache(): void {
    this.entries = null;
  }
}
