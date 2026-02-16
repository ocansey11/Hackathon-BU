const { Player } = require("../src/player");
const { CANVAS, DEFAULTS } = require("../src/constants");

describe("Player", () => {
  let player;
  const slotWidth = CANVAS.width / DEFAULTS.slots;

  beforeEach(() => {
    player = new Player(CANVAS.width / 2, CANVAS.height * 0.9, 60);
  });

  describe("initialization", () => {
    it("starts in the center slot", () => {
      expect(player.currentSlot).toBe(Math.floor(DEFAULTS.slots / 2));
    });

    it("calculates x position from slot index", () => {
      const expectedX =
        player.currentSlot * slotWidth + slotWidth / 2;
      expect(player.x).toBe(expectedX);
    });

    it("initializes with default hearts", () => {
      expect(player.hearts).toBe(DEFAULTS.hearts);
    });

    it("initializes with zero score", () => {
      expect(player.score).toBe(0);
    });

    it("sets vertical movement bounds correctly", () => {
      expect(player.minY).toBe(CANVAS.height * 0.5);
      expect(player.maxY).toBe(CANVAS.height * 0.9);
    });
  });

  describe("horizontal movement", () => {
    it("moves right by incrementing slot", () => {
      const initialSlot = player.currentSlot;
      player.moveRight();
      expect(player.currentSlot).toBe(initialSlot + 1);
    });

    it("moves left by decrementing slot", () => {
      const initialSlot = player.currentSlot;
      player.moveLeft();
      expect(player.currentSlot).toBe(initialSlot - 1);
    });

    it("does not move right beyond the last slot", () => {
      player.currentSlot = DEFAULTS.slots - 1;
      player.updatePosition();
      player.moveRight();
      expect(player.currentSlot).toBe(DEFAULTS.slots - 1);
    });

    it("does not move left beyond slot 0", () => {
      player.currentSlot = 0;
      player.updatePosition();
      player.moveLeft();
      expect(player.currentSlot).toBe(0);
    });

    it("updates x position after moving right", () => {
      player.moveRight();
      const expectedX =
        player.currentSlot * slotWidth + slotWidth / 2;
      expect(player.x).toBe(expectedX);
    });

    it("updates x position after moving left", () => {
      player.moveLeft();
      const expectedX =
        player.currentSlot * slotWidth + slotWidth / 2;
      expect(player.x).toBe(expectedX);
    });

    it("can traverse all slots left to right", () => {
      player.currentSlot = 0;
      player.updatePosition();
      for (let i = 0; i < DEFAULTS.slots - 1; i++) {
        player.moveRight();
      }
      expect(player.currentSlot).toBe(DEFAULTS.slots - 1);
    });

    it("can traverse all slots right to left", () => {
      player.currentSlot = DEFAULTS.slots - 1;
      player.updatePosition();
      for (let i = 0; i < DEFAULTS.slots - 1; i++) {
        player.moveLeft();
      }
      expect(player.currentSlot).toBe(0);
    });
  });

  describe("vertical movement", () => {
    it("moves up by 10 pixels", () => {
      player.y = CANVAS.height * 0.7;
      const initialY = player.y;
      player.moveUp();
      expect(player.y).toBe(initialY - 10);
    });

    it("moves down by 10 pixels", () => {
      player.y = CANVAS.height * 0.7;
      const initialY = player.y;
      player.moveDown();
      expect(player.y).toBe(initialY + 10);
    });

    it("does not move above the minimum Y boundary", () => {
      player.y = player.minY;
      player.moveUp();
      expect(player.y).toBe(player.minY);
    });

    it("does not move below the maximum Y boundary", () => {
      player.y = player.maxY;
      player.moveDown();
      expect(player.y).toBe(player.maxY);
    });

    it("BUG: overshoots minY when within step size of boundary", () => {
      player.y = player.minY + 5;
      player.moveUp();
      expect(player.y).toBe(player.minY - 5);
      expect(player.y).toBeLessThan(player.minY);
    });
  });

  describe("lifecycle", () => {
    it("reports alive when hearts > 0", () => {
      expect(player.isAlive()).toBe(true);
    });

    it("reports dead when hearts reach 0", () => {
      player.hearts = 0;
      expect(player.isAlive()).toBe(false);
    });

    it("reports dead when hearts go negative", () => {
      player.hearts = -1;
      expect(player.isAlive()).toBe(false);
    });
  });
});
