const { CANVAS, DEFAULTS } = require("./constants");

class Fruit {
  constructor(slotIndex, slotWidth, depth = 1.0) {
    this.x = slotIndex * slotWidth + slotWidth / 2;
    this.y = 0;
    this.depth = depth;
    this.size = 20 * this.depth;
    this.speed = 3 * this.depth;
    this.opacity = this._mapRange(this.depth, 0.5, 1.5, 150, 255);
    this.type = "fruit";
  }

  _mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  fall(isRaining = false) {
    this.y += isRaining ? 10 : this.speed;
  }

  checkCollision(player) {
    const yTolerance = 15;
    const xTolerance = player.size / 2;
    return (
      Math.abs(this.y - player.y) <= yTolerance &&
      Math.abs(this.x - player.x) <= xTolerance
    );
  }

  applyEffect(player) {
    player.score++;
  }

  isOffScreen() {
    return this.y > CANVAS.height;
  }
}

class Poison extends Fruit {
  constructor(slotIndex, slotWidth, depth = 1.0) {
    super(slotIndex, slotWidth, depth);
    this.baseSpeed = 5;
    this.type = "poison";
  }

  fall(isRaining = false, playerScore = 0) {
    const speedMultiplier = this._mapRange(
      Math.min(playerScore, 100),
      0,
      100,
      1,
      3
    );
    this.y += this.baseSpeed * speedMultiplier;
  }

  applyEffect(player) {
    player.hearts--;
  }
}

class RainyFruits extends Fruit {
  constructor(slotIndex, slotWidth, depth = 1.0) {
    super(slotIndex, slotWidth, depth);
    this.size = 30;
    this.type = "rainy";
  }

  applyEffect(_player) {
    return { triggerRain: true };
  }
}

class BigBoards extends Fruit {
  constructor(slotIndex, slotWidth, depth = 1.0) {
    super(slotIndex, slotWidth, depth);
    this.size = 30;
    this.type = "bigboard";
  }

  applyEffect(player) {
    const originalSize = player.size;
    player.size = Math.min(
      player.size + DEFAULTS.bigBoardSizeBoost,
      DEFAULTS.bigBoardMaxSize
    );
    return { originalSize, boosted: true };
  }
}

class ExtraHeart extends Fruit {
  constructor(slotIndex, slotWidth, depth = 1.0) {
    super(slotIndex, slotWidth, depth);
    this.type = "extraHeart";
  }

  applyEffect(player) {
    player.hearts = Math.min(player.hearts + 1, DEFAULTS.maxHearts);
  }
}

module.exports = { Fruit, Poison, RainyFruits, BigBoards, ExtraHeart };
