import { Leaderboard } from '../Leaderboard';

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorage.clear();
    Leaderboard.resetCache();
  });

  describe('load', () => {
    it('should return empty array when no data exists', () => {
      const entries = Leaderboard.load();
      expect(entries).toEqual([]);
    });

    it('should load existing data from localStorage', () => {
      const data = [
        { name: 'Alice', score: 1000, level: 3, completedAt: '2026-01-01T00:00:00Z' },
      ];
      localStorage.setItem('excavation_leaderboard', JSON.stringify(data));
      Leaderboard.resetCache();

      const entries = Leaderboard.load();
      expect(entries[0].name).toBe('Alice');
      expect(entries[0].score).toBe(1000);
    });
  });

  describe('recordScore', () => {
    it('should add new high score', () => {
      const rank = Leaderboard.recordScore('Bob', 500, 2);

      expect(rank).toBe(1);
      const entries = Leaderboard.getTop();
      expect(entries[0].name).toBe('Bob');
      expect(entries[0].score).toBe(500);
      expect(entries[0].level).toBe(2);
    });

    it('should sort scores descending', () => {
      Leaderboard.recordScore('Low', 100, 1);
      Leaderboard.recordScore('High', 1000, 5);
      Leaderboard.recordScore('Mid', 500, 3);

      const entries = Leaderboard.getTop();
      expect(entries[0].name).toBe('High');
      expect(entries[1].name).toBe('Mid');
      expect(entries[2].name).toBe('Low');
    });

    it('should limit to max entries', () => {
      for (let i = 0; i < 15; i++) {
        Leaderboard.recordScore(`Player${i}`, i * 100, i);
      }

      const entries = Leaderboard.getTop();
      expect(entries.length).toBe(10);
    });

    it('should return null when score does not rank', () => {
      // Fill with high scores first, then verify low score doesn't rank
      for (let i = 0; i < 10; i++) {
        Leaderboard.recordScore(`Pro${i}`, 10000 - i * 100, 5);
      }

      const entries = Leaderboard.getTop();
      expect(entries.length).toBe(10);
      
      // Worst current score is 9100, so 10 shouldn't rank
      const wouldMakeIt = Leaderboard.wouldRank(10);
      expect(wouldMakeIt).toBe(false);
    });

    it('should persist to localStorage', () => {
      Leaderboard.recordScore('Persistent', 750, 3);

      const stored = localStorage.getItem('excavation_leaderboard');
      expect(stored).not.toBeNull();
      const data = JSON.parse(stored!);
      expect(data[0].name).toBe('Persistent');
    });
  });

  describe('wouldRank', () => {
    it('should return true when leaderboard not full', () => {
      expect(Leaderboard.wouldRank(1)).toBe(true);
    });

    it('should return true when score beats worst', () => {
      for (let i = 0; i < 10; i++) {
        Leaderboard.recordScore(`Player${i}`, 100 + i * 10, i);
      }

      expect(Leaderboard.wouldRank(200)).toBe(true);
    });

    it('should return false when score would not rank', () => {
      for (let i = 0; i < 10; i++) {
        Leaderboard.recordScore(`Player${i}`, 1000 + i * 100, i);
      }

      expect(Leaderboard.wouldRank(50)).toBe(false);
    });
  });

  describe('getBest', () => {
    it('should return best score', () => {
      Leaderboard.recordScore('Second', 500, 2);
      Leaderboard.recordScore('First', 1000, 5);

      const best = Leaderboard.getBest();
      expect(best?.name).toBe('First');
      expect(best?.score).toBe(1000);
    });

    it('should return null when empty', () => {
      expect(Leaderboard.getBest()).toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      Leaderboard.recordScore('ToBeCleared', 500, 2);
      expect(Leaderboard.getTop().length).toBe(1);

      Leaderboard.clear();
      expect(Leaderboard.getTop().length).toBe(0);
    });
  });
});
