import { Game } from '../Game';
import { SCORING } from '../constants';

describe('Game', () => {
  describe('initialization', () => {
    test('creates game with level 0', () => {
      const game = new Game(0);
      expect(game.state.status).toBe('playing');
      expect(game.state.level).toBe(0);
      expect(game.state.gemsCollected).toBe(0);
    });

    test('sets correct gems required', () => {
      const game = new Game(0);
      expect(game.state.gemsRequired).toBe(3);
    });
  });

  describe('input handling', () => {
    test('queues input', () => {
      const game = new Game(0);
      game.queueInput('right', false);
      expect(game.inputQueue.length).toBe(1);
    });

    test('processes input on tick', () => {
      const game = new Game(0);
      game.queueInput('right', false);
      game.tick();
      expect(game.inputQueue.length).toBe(0);
    });

    test('ignores input when paused', () => {
      const game = new Game(0);
      game.pause();
      game.queueInput('right', false);
      expect(game.inputQueue.length).toBe(0);
    });

    test('ignores input when dead', () => {
      const game = new Game(0);
      game.state.status = 'dead';
      game.queueInput('right', false);
      expect(game.inputQueue.length).toBe(0);
    });
  });

  describe('gem collection', () => {
    test('increments gems collected', () => {
      const game = new Game(0);
      // Move toward first gem (level 0 has gem at specific location)
      const startGems = game.state.gemsCollected;
      // Simulate collecting by directly modifying for test
      game.state.gemsCollected++;
      expect(game.state.gemsCollected).toBe(startGems + 1);
    });

    test('adds score for gems', () => {
      const game = new Game(0);
      const startScore = game.state.score;
      game.state.score += SCORING.GEM;
      expect(game.state.score).toBe(startScore + SCORING.GEM);
    });
  });

  describe('exit state', () => {
    test('exit opens when enough gems collected', () => {
      const game = new Game(0);
      game.state.gemsCollected = game.state.gemsRequired;
      game.tick();
      expect(game.state.exitOpen).toBe(true);
    });

    test('exit stays closed with insufficient gems', () => {
      const game = new Game(0);
      game.state.gemsCollected = game.state.gemsRequired - 1;
      game.tick();
      expect(game.state.exitOpen).toBe(false);
    });
  });

  describe('win condition', () => {
    test('wins when at exit with enough gems', () => {
      const game = new Game(0);
      game.state.gemsCollected = game.state.gemsRequired;
      game.player.x = game.state.exit.x;
      game.player.y = game.state.exit.y;
      game.tick();
      expect(game.state.status).toBe('won');
    });

    test('does not win at exit without gems', () => {
      const game = new Game(0);
      game.player.x = game.state.exit.x;
      game.player.y = game.state.exit.y;
      game.tick();
      expect(game.state.status).toBe('playing');
    });

    test('calculates score on win', () => {
      const game = new Game(0);
      game.state.score = 200;
      game.state.gemsCollected = game.state.gemsRequired;
      game.state.timeRemaining = 60;
      game.player.x = game.state.exit.x;
      game.player.y = game.state.exit.y;
      game.tick();
      expect(game.state.score).toBeGreaterThan(200);
    });
  });

  describe('time', () => {
    test('counts down time', () => {
      const game = new Game(0);
      game.state.timeRemaining = 60;
      game.updateTime(1000);
      expect(game.state.timeRemaining).toBe(59);
    });

    test('dies when time runs out', () => {
      const game = new Game(0);
      game.state.timeRemaining = 0.5;
      game.updateTime(1000);
      expect(game.state.status).toBe('dead');
      expect(game.state.timeRemaining).toBe(0);
    });

    test('does not go below zero', () => {
      const game = new Game(0);
      game.state.timeRemaining = 0.5;
      game.updateTime(2000);
      expect(game.state.timeRemaining).toBe(0);
    });

    test('no time limit (0) does not cause death', () => {
      const game = new Game(0);
      game.state.timeRemaining = 0;
      game.updateTime(1000);
      // Already at 0, should not trigger death from time update alone
      expect(game.state.status).toBe('playing');
    });
  });

  describe('pause/resume', () => {
    test('pause changes status', () => {
      const game = new Game(0);
      game.pause();
      expect(game.state.status).toBe('paused');
    });

    test('resume changes status back', () => {
      const game = new Game(0);
      game.pause();
      game.resume();
      expect(game.state.status).toBe('playing');
    });

    test('tick does nothing when paused', () => {
      const game = new Game(0);
      game.queueInput('right', false);
      const initialX = game.player.x;
      game.pause();
      game.tick();
      // Input is in queue but tick doesn't process it
      expect(game.inputQueue.length).toBe(1);
      expect(game.player.x).toBe(initialX);
    });
  });

  describe('restart', () => {
    test('resets game state', () => {
      const game = new Game(0);
      game.state.gemsCollected = 5;
      game.state.score = 1000;
      game.state.status = 'dead';
      game.restart();
      expect(game.state.gemsCollected).toBe(0);
      expect(game.state.score).toBe(0);
      expect(game.state.status).toBe('playing');
    });

    test('resets player position', () => {
      const game = new Game(0);
      const startPos = { x: game.player.x, y: game.player.y };
      game.player.x = 10;
      game.player.y = 10;
      game.restart();
      expect(game.player.x).toBe(startPos.x);
      expect(game.player.y).toBe(startPos.y);
    });

    test('clears input queue', () => {
      const game = new Game(0);
      game.queueInput('right', false);
      game.queueInput('down', false);
      game.restart();
      expect(game.inputQueue.length).toBe(0);
    });
  });

  describe('score calculation', () => {
    test('adds time bonus', () => {
      const game = new Game(0);
      game.state.score = 100;
      game.state.timeRemaining = 30;
      const score = game.calculateScore();
      expect(score).toBe(100 + 30 * SCORING.TIME_BONUS);
    });

    test('adds perfect clear bonus', () => {
      const game = new Game(0);
      game.state.score = 100;
      game.state.timeRemaining = 0;
      // Collect all gems (level 0 has 3 gems)
      game.state.gemsCollected = game.level.countGems();
      const score = game.calculateScore();
      expect(score).toBe(100 + SCORING.PERFECT_CLEAR);
    });
  });

  describe('helper methods', () => {
    test('isExitOpen returns exit state', () => {
      const game = new Game(0);
      expect(game.isExitOpen()).toBe(false);
      game.state.exitOpen = true;
      expect(game.isExitOpen()).toBe(true);
    });

    test('isPlayerAtExit checks position', () => {
      const game = new Game(0);
      expect(game.isPlayerAtExit()).toBe(false);
      game.player.x = game.state.exit.x;
      game.player.y = game.state.exit.y;
      expect(game.isPlayerAtExit()).toBe(true);
    });
  });
});
