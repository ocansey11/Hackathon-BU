const { CANVAS, DEFAULTS } = require("./constants");

class GameControl {
  constructor() {
    this.isPaused = false;
    this.isRaining = false;
    this.isRainyFruitsActive = false;
    this.isGameOver = false;
  }

  togglePause() {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
  }

  triggerGameOver() {
    this.isGameOver = true;
    this.isPaused = true;
  }

  reset() {
    this.isPaused = false;
    this.isRaining = false;
    this.isRainyFruitsActive = false;
    this.isGameOver = false;
  }
}

module.exports = { GameControl };
