import { Level } from '../Level';
import { Physics } from '../Physics';
import { LevelDef } from '../types';

const createTestLevel = (grid: string): Level => {
  const lines = grid.trim().split('\n');
  const height = lines.length;
  const width = lines[0].length;
  
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

describe('Physics', () => {
  describe('shouldFall', () => {
    test('boulder falls when empty below', () => {
      const level = createTestLevel(`
#####
# O #
#   #
#####
      `);
      const physics = new Physics(level);
      expect(physics.shouldFall(2, 1)).toBe(true);
    });

    test('boulder does not fall on dirt', () => {
      const level = createTestLevel(`
#####
# O #
# : #
#####
      `);
      const physics = new Physics(level);
      expect(physics.shouldFall(2, 1)).toBe(false);
    });

    test('boulder does not fall on wall', () => {
      const level = createTestLevel(`
#####
# O #
#####
      `);
      const physics = new Physics(level);
      expect(physics.shouldFall(2, 1)).toBe(false);
    });

    test('gem falls when empty below', () => {
      const level = createTestLevel(`
#####
# * #
#   #
#####
      `);
      const physics = new Physics(level);
      expect(physics.shouldFall(2, 1)).toBe(true);
    });
  });

  describe('shouldRoll', () => {
    test('boulder rolls left off boulder', () => {
      const level = createTestLevel(`
#####
# O #
# O #
#####
      `);
      const physics = new Physics(level);
      expect(physics.shouldRoll(2, 1)).toBe('left');
    });

    test('boulder rolls right if left blocked', () => {
      const level = createTestLevel(`
#####
#:O #
# O #
#####
      `);
      const physics = new Physics(level);
      expect(physics.shouldRoll(2, 1)).toBe('right');
    });

    test('boulder does not roll if both sides blocked', () => {
      const level = createTestLevel(`
#####
#:O:#
# O #
#####
      `);
      const physics = new Physics(level);
      expect(physics.shouldRoll(2, 1)).toBeNull();
    });

    test('boulder rolls off wall', () => {
      const level = createTestLevel(`
#####
# O #
# # #
#   #
#####
      `);
      const physics = new Physics(level);
      expect(physics.shouldRoll(2, 1)).toBe('left');
    });

    test('boulder rolls off gem', () => {
      const level = createTestLevel(`
#####
# O #
# * #
#####
      `);
      const physics = new Physics(level);
      expect(physics.shouldRoll(2, 1)).toBe('left');
    });

    test('boulder does not roll on dirt', () => {
      const level = createTestLevel(`
#####
# O #
# : #
#####
      `);
      const physics = new Physics(level);
      expect(physics.shouldRoll(2, 1)).toBeNull();
    });
  });

  describe('tick - falling', () => {
    test('boulder falls one cell', () => {
      const level = createTestLevel(`
#####
# O #
#   #
#####
      `);
      const physics = new Physics(level);
      physics.tick();
      expect(level.getTile(2, 1)?.type).toBe('empty');
      expect(level.getTile(2, 2)?.type).toBe('boulder');
    });

    test('falling flag set during fall', () => {
      const level = createTestLevel(`
#####
# O #
#   #
#####
      `);
      const physics = new Physics(level);
      physics.tick();
      expect(level.getTile(2, 2)?.falling).toBe(true);
    });

    test('falling flag cleared when landed', () => {
      const level = createTestLevel(`
#####
# O #
#   #
# # #
#####
      `);
      const physics = new Physics(level);
      physics.tick();  // Fall
      physics.tick();  // Land
      expect(level.getTile(2, 2)?.falling).toBe(false);
    });

    test('gem falls when empty below', () => {
      const level = createTestLevel(`
#####
# * #
#   #
#####
      `);
      const physics = new Physics(level);
      physics.tick();
      expect(level.getTile(2, 1)?.type).toBe('empty');
      expect(level.getTile(2, 2)?.type).toBe('gem');
    });
  });

  describe('tick - rolling', () => {
    test('boulder rolls left off boulder', () => {
      const level = createTestLevel(`
#####
# O #
# O #
#####
      `);
      const physics = new Physics(level);
      physics.tick();
      expect(level.getTile(1, 1)?.type).toBe('boulder');
      expect(level.getTile(2, 1)?.type).toBe('empty');
    });

    test('boulder rolls right if left blocked', () => {
      const level = createTestLevel(`
#####
#:O #
# O #
#####
      `);
      const physics = new Physics(level);
      physics.tick();
      expect(level.getTile(3, 1)?.type).toBe('boulder');
      expect(level.getTile(2, 1)?.type).toBe('empty');
    });
  });

  describe('chain reactions', () => {
    test('multiple boulders fall in same tick', () => {
      const level = createTestLevel(`
######
#  O #
#  O #
#    #
######
      `);
      const physics = new Physics(level);
      physics.tick();
      // Both should have fallen
      expect(level.getTile(3, 2)?.type).toBe('boulder');
      expect(level.getTile(3, 3)?.type).toBe('boulder');
    });

    test('boulder falls then next tick lands and causes roll', () => {
      const level = createTestLevel(`
######
#  O #
#    #
#  O #
######
      `);
      const physics = new Physics(level);
      physics.tick();  // Top boulder falls
      expect(level.getTile(3, 2)?.type).toBe('boulder');
      physics.tick();  // Lands on bottom boulder, should roll
      expect(level.getTile(3, 3)?.type).toBe('boulder'); // Bottom still there
      // Top boulder now on bottom boulder, should roll
      expect(level.getTile(2, 2)?.type).toBe('boulder'); // Rolled left
    });
  });

  describe('isDangerous', () => {
    test('returns true when boulder above is falling', () => {
      const level = createTestLevel(`
#####
# O #
#   #
#####
      `);
      const physics = new Physics(level);
      physics.tick(); // Boulder falls to (2,2), now falling
      expect(physics.isDangerous(2, 3)).toBe(true);
    });

    test('returns false when no falling boulder above', () => {
      const level = createTestLevel(`
#####
# O #
# # #
#####
      `);
      const physics = new Physics(level);
      expect(physics.isDangerous(2, 2)).toBe(false);
    });

    test('returns false when boulder above but not falling', () => {
      const level = createTestLevel(`
#####
# O #
# # #
#####
      `);
      const physics = new Physics(level);
      expect(physics.isDangerous(2, 2)).toBe(false);
    });
  });

  describe('processFalling', () => {
    test('returns new position when object falls', () => {
      const level = createTestLevel(`
#####
# O #
#   #
#####
      `);
      const physics = new Physics(level);
      const result = physics.processFalling(2, 1);
      expect(result).toEqual({ x: 2, y: 2 });
    });

    test('returns null when object cannot fall', () => {
      const level = createTestLevel(`
#####
# O #
# # #
#####
      `);
      const physics = new Physics(level);
      const result = physics.processFalling(2, 1);
      expect(result).toBeNull();
    });
  });

  describe('processRolling', () => {
    test('returns new position when object rolls left', () => {
      const level = createTestLevel(`
#####
# O #
# O #
#####
      `);
      const physics = new Physics(level);
      const result = physics.processRolling(2, 1);
      expect(result).toEqual({ x: 1, y: 1 });
    });

    test('returns null when object cannot roll', () => {
      const level = createTestLevel(`
#####
#:O:#
# O #
#####
      `);
      const physics = new Physics(level);
      const result = physics.processRolling(2, 1);
      expect(result).toBeNull();
    });
  });
});


