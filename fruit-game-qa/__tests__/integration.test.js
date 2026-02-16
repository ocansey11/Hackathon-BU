const { Player } = require("../src/player");
const { Fruit, Poison, ExtraHeart, BigBoards } = require("../src/fruits");
const { GameControl } = require("../src/game-control");
const { CANVAS, DEFAULTS } = require("../src/constants");

describe("Integration: Game Scenarios", () => {
  const slotWidth = CANVAS.width / DEFAULTS.slots;
  let player;
  let gc;

  beforeEach(() => {
    player = new Player(CANVAS.width / 2, CANVAS.height * 0.9, 60);
    gc = new GameControl();
  });

  describe("full game lifecycle", () => {
    it("player catches fruit and gains score", () => {
      const fruit = new Fruit(player.currentSlot, slotWidth);
      fruit.y = player.y;
      expect(fruit.checkCollision(player)).toBe(true);
      fruit.applyEffect(player);
      expect(player.score).toBe(1);
    });

    it("player loses all hearts from poison and game ends", () => {
      for (let i = 0; i < DEFAULTS.hearts; i++) {
        const poison = new Poison(player.currentSlot, slotWidth);
        poison.applyEffect(player);
      }
      expect(player.isAlive()).toBe(false);
      gc.triggerGameOver();
      expect(gc.isGameOver).toBe(true);
      expect(gc.isPaused).toBe(true);
    });

    it("extra heart saves player from death", () => {
      player.hearts = 1;
      new ExtraHeart(0, slotWidth).applyEffect(player);
      expect(player.hearts).toBe(2);
      new Poison(0, slotWidth).applyEffect(player);
      expect(player.hearts).toBe(1);
      expect(player.isAlive()).toBe(true);
    });
  });

  describe("movement under game states", () => {
    it("fruit does not fall when game is paused (simulated)", () => {
      const fruit = new Fruit(0, slotWidth);
      if (!gc.isPaused) {
        fruit.fall(false);
      }
      gc.togglePause();
      const yAfterPause = fruit.y;
      if (!gc.isPaused) {
        fruit.fall(false);
      }
      expect(fruit.y).toBe(yAfterPause);
    });
  });

  describe("scoring edge cases", () => {
    it("score never goes negative from fruit catches", () => {
      for (let i = 0; i < 100; i++) {
        new Fruit(0, slotWidth).applyEffect(player);
      }
      expect(player.score).toBeGreaterThanOrEqual(0);
    });

    it("hearts can go negative from poison (no floor guard)", () => {
      for (let i = 0; i < 5; i++) {
        new Poison(0, slotWidth).applyEffect(player);
      }
      expect(player.hearts).toBeLessThan(0);
    });
  });

  describe("power-up stacking", () => {
    it("multiple big boards stack up to max size", () => {
      for (let i = 0; i < 10; i++) {
        new BigBoards(0, slotWidth).applyEffect(player);
      }
      expect(player.size).toBe(DEFAULTS.bigBoardMaxSize);
    });

    it("extra hearts cap at max even with multiple pickups", () => {
      player.hearts = 1;
      for (let i = 0; i < 10; i++) {
        new ExtraHeart(0, slotWidth).applyEffect(player);
      }
      expect(player.hearts).toBe(DEFAULTS.maxHearts);
    });
  });

  describe("fruit lifecycle simulation", () => {
    it("fruit spawns, falls, and goes offscreen", () => {
      const fruit = new Fruit(2, slotWidth, 1.0);
      expect(fruit.y).toBe(0);
      expect(fruit.isOffScreen()).toBe(false);

      while (!fruit.isOffScreen()) {
        fruit.fall(false);
      }
      expect(fruit.y).toBeGreaterThan(CANVAS.height);
    });

    it("poison accelerates as player scores", () => {
      const p1 = new Poison(0, slotWidth);
      const p2 = new Poison(0, slotWidth);

      p1.fall(false, 0);
      const slowY = p1.y;

      p2.fall(false, 80);
      const fastY = p2.y;

      expect(fastY).toBeGreaterThan(slowY);
    });
  });

  describe("boundary stress tests", () => {
    it("player rapidly alternating left-right stays in bounds", () => {
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) player.moveRight();
        else player.moveLeft();
      }
      expect(player.currentSlot).toBeGreaterThanOrEqual(0);
      expect(player.currentSlot).toBeLessThan(DEFAULTS.slots);
    });

    it("player rapidly alternating up-down stays in bounds", () => {
      player.y = CANVAS.height * 0.7;
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) player.moveUp();
        else player.moveDown();
      }
      expect(player.y).toBeGreaterThanOrEqual(player.minY);
      expect(player.y).toBeLessThanOrEqual(player.maxY);
    });
  });
});
