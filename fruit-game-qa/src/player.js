const { CANVAS, DEFAULTS } = require("./constants");

class Player {
  constructor(x, y, size, slots = DEFAULTS.slots) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.hearts = DEFAULTS.hearts;
    this.score = 0;
    this.slots = slots;
    this.slotWidth = CANVAS.width / slots;
    this.currentSlot = Math.floor(slots / 2);
    this.minY = CANVAS.height * 0.5;
    this.maxY = CANVAS.height * 0.9;
    this.updatePosition();
  }

  updatePosition() {
    this.x = this.currentSlot * this.slotWidth + this.slotWidth / 2;
  }

  moveRight() {
    if (this.currentSlot < this.slots - 1) {
      this.currentSlot++;
      this.updatePosition();
    }
  }

  moveLeft() {
    if (this.currentSlot > 0) {
      this.currentSlot--;
      this.updatePosition();
    }
  }

  moveUp() {
    if (this.y > this.minY) {
      this.y -= 10;
    }
  }

  moveDown() {
    if (this.y < this.maxY) {
      this.y += 10;
    }
  }

  isAlive() {
    return this.hearts > 0;
  }
}

module.exports = { Player };
