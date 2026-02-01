import { Level } from '../Level';
import { Player } from '../Player';
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

describe('Player', () => {
  describe('movement', () => {
    test('moves into empty space', () => {
      const level = createTestLevel(`
#####
#   #
# @ #
#####
      `);
      const player = new Player(2, 2);
      const result = player.move('up', level, false);
      expect(result.moved).toBe(true);
      expect(player.y).toBe(1);
      expect(player.x).toBe(2);
    });

    test('moves left into empty space', () => {
      const level = createTestLevel(`
#####
#   #
#####
      `);
      const player = new Player(2, 1);
      const result = player.move('left', level, false);
      expect(result.moved).toBe(true);
      expect(player.x).toBe(1);
    });

    test('moves right into empty space', () => {
      const level = createTestLevel(`
#####
#   #
#####
      `);
      const player = new Player(2, 1);
      const result = player.move('right', level, false);
      expect(result.moved).toBe(true);
      expect(player.x).toBe(3);
    });

    test('moves down into empty space', () => {
      const level = createTestLevel(`
#####
#   #
#   #
#####
      `);
      const player = new Player(2, 1);
      const result = player.move('down', level, false);
      expect(result.moved).toBe(true);
      expect(player.y).toBe(2);
    });

    test('cannot move into wall', () => {
      const level = createTestLevel(`
#####
# @ #
#####
      `);
      const player = new Player(2, 1);
      const result = player.move('up', level, false);
      expect(result.moved).toBe(false);
      expect(player.y).toBe(1);
    });
  });

  describe('digging', () => {
    test('digs through dirt and moves', () => {
      const level = createTestLevel(`
#####
#:::#
# @ #
#####
      `);
      const player = new Player(2, 2);
      const result = player.move('up', level, false);
      expect(result.moved).toBe(true);
      expect(result.dugDirt).toBe(true);
      expect(level.isEmpty(2, 1)).toBe(true);
      expect(player.y).toBe(1);
    });

    test('dig-only mode removes dirt without moving', () => {
      const level = createTestLevel(`
#####
# : #
# @ #
#####
      `);
      const player = new Player(2, 2);
      const result = player.move('up', level, true);
      expect(result.dugDirt).toBe(true);
      expect(result.moved).toBe(false);
      expect(player.y).toBe(2);
      expect(level.isEmpty(2, 1)).toBe(true);
    });
  });

  describe('collecting gems', () => {
    test('collects gem and moves', () => {
      const level = createTestLevel(`
#####
# * #
# @ #
#####
      `);
      const player = new Player(2, 2);
      const result = player.move('up', level, false);
      expect(result.moved).toBe(true);
      expect(result.collected).toBe('gem');
      expect(level.isEmpty(2, 1)).toBe(true);
      expect(player.y).toBe(1);
    });

    test('dig-only does not collect gem', () => {
      const level = createTestLevel(`
#####
# * #
# @ #
#####
      `);
      const player = new Player(2, 2);
      const result = player.move('up', level, true);
      expect(result.moved).toBe(false);
      expect(result.collected).toBeNull();
      expect(level.isGem(2, 1)).toBe(true);
    });
  });

  describe('pushing boulders', () => {
    test('pushes boulder right', () => {
      const level = createTestLevel(`
#####
#@O #
#####
      `);
      const player = new Player(1, 1);
      const result = player.move('right', level, false);
      expect(result.moved).toBe(true);
      expect(result.pushed).toBe(true);
      expect(level.getTile(3, 1)?.type).toBe('boulder');
      expect(player.x).toBe(2);
    });

    test('pushes boulder left', () => {
      const level = createTestLevel(`
#####
# O@#
#####
      `);
      const player = new Player(3, 1);
      const result = player.move('left', level, false);
      expect(result.moved).toBe(true);
      expect(result.pushed).toBe(true);
      expect(level.getTile(1, 1)?.type).toBe('boulder');
      expect(player.x).toBe(2);
    });

    test('cannot push boulder up', () => {
      const level = createTestLevel(`
#####
# O #
# @ #
#####
      `);
      const player = new Player(2, 2);
      const result = player.move('up', level, false);
      expect(result.moved).toBe(false);
      expect(result.pushed).toBe(false);
    });

    test('cannot push boulder down', () => {
      const level = createTestLevel(`
#####
# @ #
# O #
#   #
#####
      `);
      const player = new Player(2, 1);
      const result = player.move('down', level, false);
      expect(result.moved).toBe(false);
      expect(result.pushed).toBe(false);
    });

    test('cannot push boulder into wall', () => {
      const level = createTestLevel(`
#####
#@O##
#####
      `);
      const player = new Player(1, 1);
      const result = player.move('right', level, false);
      expect(result.moved).toBe(false);
      expect(result.pushed).toBe(false);
    });

    test('cannot push boulder into another boulder', () => {
      const level = createTestLevel(`
######
#@OO #
######
      `);
      const player = new Player(1, 1);
      const result = player.move('right', level, false);
      expect(result.moved).toBe(false);
      expect(result.pushed).toBe(false);
    });
  });

  describe('exit', () => {
    test('can move into exit', () => {
      const level = createTestLevel(`
#####
# E #
# @ #
#####
      `);
      const player = new Player(2, 2);
      const result = player.move('up', level, false);
      expect(result.moved).toBe(true);
      expect(player.y).toBe(1);
    });
  });

  describe('helper methods', () => {
    test('canMoveTo returns true for valid tiles', () => {
      const level = createTestLevel(`
#####
# :*#
#####
      `);
      const player = new Player(1, 1);
      expect(player.canMoveTo(1, 1, level)).toBe(true); // empty
      expect(player.canMoveTo(2, 1, level)).toBe(true); // dirt
      expect(player.canMoveTo(3, 1, level)).toBe(true); // gem
      expect(player.canMoveTo(0, 0, level)).toBe(false); // wall
    });

    test('canPush returns true for pushable boulder', () => {
      const level = createTestLevel(`
#####
# O #
#####
      `);
      const player = new Player(1, 1);
      expect(player.canPush(2, 1, 'right', level)).toBe(true);
      expect(player.canPush(2, 1, 'left', level)).toBe(true);
      expect(player.canPush(2, 1, 'up', level)).toBe(false);
      expect(player.canPush(2, 1, 'down', level)).toBe(false);
    });

    test('die sets alive to false', () => {
      const player = new Player(1, 1);
      expect(player.alive).toBe(true);
      player.die();
      expect(player.alive).toBe(false);
    });

    test('getPosition returns current position', () => {
      const player = new Player(3, 5);
      expect(player.getPosition()).toEqual({ x: 3, y: 5 });
    });
  });
});
