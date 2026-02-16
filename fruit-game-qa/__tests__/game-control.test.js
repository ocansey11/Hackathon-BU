const { GameControl } = require("../src/game-control");

describe("GameControl", () => {
  let gc;

  beforeEach(() => {
    gc = new GameControl();
  });

  describe("initialization", () => {
    it("starts unpaused", () => {
      expect(gc.isPaused).toBe(false);
    });

    it("starts with rain inactive", () => {
      expect(gc.isRaining).toBe(false);
    });

    it("starts not game over", () => {
      expect(gc.isGameOver).toBe(false);
    });
  });

  describe("pause toggle", () => {
    it("pauses the game on first toggle", () => {
      gc.togglePause();
      expect(gc.isPaused).toBe(true);
    });

    it("unpauses on second toggle", () => {
      gc.togglePause();
      gc.togglePause();
      expect(gc.isPaused).toBe(false);
    });

    it("does not toggle pause after game over", () => {
      gc.triggerGameOver();
      gc.togglePause();
      expect(gc.isPaused).toBe(true);
    });
  });

  describe("game over", () => {
    it("sets game over flag", () => {
      gc.triggerGameOver();
      expect(gc.isGameOver).toBe(true);
    });

    it("pauses the game on game over", () => {
      gc.triggerGameOver();
      expect(gc.isPaused).toBe(true);
    });
  });

  describe("reset", () => {
    it("clears all flags to initial state", () => {
      gc.isPaused = true;
      gc.isRaining = true;
      gc.isRainyFruitsActive = true;
      gc.isGameOver = true;
      gc.reset();
      expect(gc.isPaused).toBe(false);
      expect(gc.isRaining).toBe(false);
      expect(gc.isRainyFruitsActive).toBe(false);
      expect(gc.isGameOver).toBe(false);
    });
  });
});
