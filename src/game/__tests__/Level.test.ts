import { Level } from '../Level';
import { LevelDef } from '../types';

const createTestLevel = (grid: string): Level => {
  const lines = grid.trim().split('\n');
  const height = lines.length;
  const width = lines[0].length;
  
  // Find player and exit positions
  let playerStart = { x: 1, y: 1 };
  let exitPos = { x: width - 2, y: height - 2 };
  
  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {
      if (lines[y][x] === '@') playerStart = { x, y };
      if (lines[y][x] === 'E') exitPos = { x, y };
    }
  }
  
  const def: LevelDef = {
    name: 'Test',
    width,
    height,
    gemsRequired: 1,
    timeLimit: 60,
    grid: grid.trim(),
    playerStart,
    exitPos,
  };
  
  return new Level(def);
};

describe('Level', () => {
  describe('parsing', () => {
    test('parses grid correctly', () => {
      const level = createTestLevel(`
#####
#:*:#
#####
      `);
      expect(level.getTile(0, 0)?.type).toBe('wall');
      expect(level.getTile(1, 1)?.type).toBe('dirt');
      expect(level.getTile(2, 1)?.type).toBe('gem');
    });

    test('parses boulders', () => {
      const level = createTestLevel(`
#####
#:O:#
#####
      `);
      expect(level.getTile(2, 1)?.type).toBe('boulder');
    });

    test('parses empty spaces', () => {
      const level = createTestLevel(`
#####
#   #
#####
      `);
      expect(level.getTile(1, 1)?.type).toBe('empty');
      expect(level.getTile(2, 1)?.type).toBe('empty');
    });

    test('parses exit', () => {
      const level = createTestLevel(`
#####
#::E#
#####
      `);
      expect(level.getTile(3, 1)?.type).toBe('exit');
    });

    test('player start becomes empty', () => {
      const level = createTestLevel(`
#####
#@::#
#####
      `);
      expect(level.getTile(1, 1)?.type).toBe('empty');
    });
  });

  describe('bounds checking', () => {
    test('returns null for out of bounds negative', () => {
      const level = createTestLevel(`
#####
#:::#
#####
      `);
      expect(level.getTile(-1, 0)).toBeNull();
      expect(level.getTile(0, -1)).toBeNull();
    });

    test('returns null for out of bounds positive', () => {
      const level = createTestLevel(`
#####
#:::#
#####
      `);
      expect(level.getTile(10, 0)).toBeNull();
      expect(level.getTile(0, 10)).toBeNull();
    });
  });

  describe('type checks', () => {
    test('isEmpty returns true for empty cells', () => {
      const level = createTestLevel(`
#####
#   #
#####
      `);
      expect(level.isEmpty(1, 1)).toBe(true);
      expect(level.isEmpty(0, 0)).toBe(false);
    });

    test('isDirt returns true for dirt cells', () => {
      const level = createTestLevel(`
#####
#:::#
#####
      `);
      expect(level.isDirt(1, 1)).toBe(true);
      expect(level.isDirt(0, 0)).toBe(false);
    });

    test('isWall returns true for wall cells', () => {
      const level = createTestLevel(`
#####
#:::#
#####
      `);
      expect(level.isWall(0, 0)).toBe(true);
      expect(level.isWall(1, 1)).toBe(false);
    });

    test('isBoulder returns true for boulder cells', () => {
      const level = createTestLevel(`
#####
#:O:#
#####
      `);
      expect(level.isBoulder(2, 1)).toBe(true);
      expect(level.isBoulder(1, 1)).toBe(false);
    });

    test('isGem returns true for gem cells', () => {
      const level = createTestLevel(`
#####
#:*:#
#####
      `);
      expect(level.isGem(2, 1)).toBe(true);
      expect(level.isGem(1, 1)).toBe(false);
    });
  });

  describe('isRounded', () => {
    test('wall is rounded', () => {
      const level = createTestLevel(`
#####
#:::#
#####
      `);
      expect(level.isRounded(0, 0)).toBe(true);
    });

    test('boulder is rounded', () => {
      const level = createTestLevel(`
#####
#:O:#
#####
      `);
      expect(level.isRounded(2, 1)).toBe(true);
    });

    test('gem is rounded', () => {
      const level = createTestLevel(`
#####
#:*:#
#####
      `);
      expect(level.isRounded(2, 1)).toBe(true);
    });

    test('dirt is not rounded', () => {
      const level = createTestLevel(`
#####
#:::#
#####
      `);
      expect(level.isRounded(1, 1)).toBe(false);
    });

    test('empty is not rounded', () => {
      const level = createTestLevel(`
#####
#   #
#####
      `);
      expect(level.isRounded(1, 1)).toBe(false);
    });
  });

  describe('modifications', () => {
    test('removeTile makes cell empty', () => {
      const level = createTestLevel(`
#####
#:*:#
#####
      `);
      level.removeTile(2, 1);
      expect(level.isEmpty(2, 1)).toBe(true);
    });

    test('moveTile moves object', () => {
      const level = createTestLevel(`
#####
# O #
#   #
#####
      `);
      level.moveTile({ x: 2, y: 1 }, { x: 2, y: 2 });
      expect(level.isEmpty(2, 1)).toBe(true);
      expect(level.getTile(2, 2)?.type).toBe('boulder');
    });

    test('moveTile preserves falling state', () => {
      const level = createTestLevel(`
#####
# O #
#   #
#####
      `);
      level.getTile(2, 1)!.falling = true;
      level.moveTile({ x: 2, y: 1 }, { x: 2, y: 2 });
      expect(level.getTile(2, 2)?.falling).toBe(true);
    });

    test('moveTile does nothing if dest not empty', () => {
      const level = createTestLevel(`
#####
# O #
# : #
#####
      `);
      level.moveTile({ x: 2, y: 1 }, { x: 2, y: 2 });
      expect(level.getTile(2, 1)?.type).toBe('boulder');
      expect(level.getTile(2, 2)?.type).toBe('dirt');
    });
  });

  describe('countGems', () => {
    test('counts gems correctly', () => {
      const level = createTestLevel(`
#####
#*:*#
#:*:#
#####
      `);
      expect(level.countGems()).toBe(3);
    });

    test('returns 0 for no gems', () => {
      const level = createTestLevel(`
#####
#:::#
#####
      `);
      expect(level.countGems()).toBe(0);
    });
  });
});
