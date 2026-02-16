const {
  Fruit,
  Poison,
  RainyFruits,
  BigBoards,
  ExtraHeart,
} = require("../src/fruits");
const { Player } = require("../src/player");
const { CANVAS, DEFAULTS } = require("../src/constants");

describe("Fruit", () => {
  const slotWidth = CANVAS.width / DEFAULTS.slots;

  describe("initialization", () => {
    it("positions at the center of the given slot", () => {
      const fruit = new Fruit(0, slotWidth);
      expect(fruit.x).toBe(slotWidth / 2);
    });

    it("starts at y = 0", () => {
      const fruit = new Fruit(2, slotWidth);
      expect(fruit.y).toBe(0);
    });

    it("scales size proportional to depth", () => {
      const shallow = new Fruit(0, slotWidth, 0.5);
      const deep = new Fruit(0, slotWidth, 1.5);
      expect(deep.size).toBeGreaterThan(shallow.size);
    });

    it("scales speed proportional to depth", () => {
      const shallow = new Fruit(0, slotWidth, 0.5);
      const deep = new Fruit(0, slotWidth, 1.5);
      expect(deep.speed).toBeGreaterThan(shallow.speed);
    });

    it("positions correctly for each slot index", () => {
      for (let i = 0; i < DEFAULTS.slots; i++) {
        const fruit = new Fruit(i, slotWidth);
        expect(fruit.x).toBe(i * slotWidth + slotWidth / 2);
      }
    });
  });

  describe("fall", () => {
    it("increases y by speed under normal conditions", () => {
      const fruit = new Fruit(0, slotWidth, 1.0);
      const expectedSpeed = fruit.speed;
      fruit.fall(false);
      expect(fruit.y).toBe(expectedSpeed);
    });

    it("increases y by 10 during rain", () => {
      const fruit = new Fruit(0, slotWidth, 1.0);
      fruit.fall(true);
      expect(fruit.y).toBe(10);
    });

    it("accumulates position over multiple ticks", () => {
      const fruit = new Fruit(0, slotWidth, 1.0);
      fruit.fall(false);
      fruit.fall(false);
      fruit.fall(false);
      expect(fruit.y).toBe(fruit.speed * 3);
    });
  });

  describe("collision detection", () => {
    let player;

    beforeEach(() => {
      player = new Player(CANVAS.width / 2, CANVAS.height * 0.9, 60);
    });

    it("detects collision when fruit overlaps player", () => {
      const fruit = new Fruit(player.currentSlot, slotWidth);
      fruit.y = player.y;
      expect(fruit.checkCollision(player)).toBe(true);
    });

    it("misses when fruit is too far above", () => {
      const fruit = new Fruit(player.currentSlot, slotWidth);
      fruit.y = player.y - 50;
      expect(fruit.checkCollision(player)).toBe(false);
    });

    it("misses when fruit is in a different slot", () => {
      const fruit = new Fruit(0, slotWidth);
      player.currentSlot = DEFAULTS.slots - 1;
      player.updatePosition();
      fruit.y = player.y;
      expect(fruit.checkCollision(player)).toBe(false);
    });

    it("detects collision within y tolerance of 15", () => {
      const fruit = new Fruit(player.currentSlot, slotWidth);
      fruit.y = player.y + 14;
      expect(fruit.checkCollision(player)).toBe(true);
    });

    it("misses when just outside y tolerance", () => {
      const fruit = new Fruit(player.currentSlot, slotWidth);
      fruit.y = player.y + 16;
      expect(fruit.checkCollision(player)).toBe(false);
    });

    it("detects collision at the edge of x tolerance", () => {
      const fruit = new Fruit(player.currentSlot, slotWidth);
      fruit.x = player.x + player.size / 2 - 1;
      fruit.y = player.y;
      expect(fruit.checkCollision(player)).toBe(true);
    });

    it("misses when just outside x tolerance", () => {
      const fruit = new Fruit(player.currentSlot, slotWidth);
      fruit.x = player.x + player.size / 2 + 1;
      fruit.y = player.y;
      expect(fruit.checkCollision(player)).toBe(false);
    });
  });

  describe("effect", () => {
    it("increments player score by 1", () => {
      const player = new Player(CANVAS.width / 2, CANVAS.height * 0.9, 60);
      const fruit = new Fruit(0, slotWidth);
      fruit.applyEffect(player);
      expect(player.score).toBe(1);
    });

    it("accumulates score across multiple catches", () => {
      const player = new Player(CANVAS.width / 2, CANVAS.height * 0.9, 60);
      for (let i = 0; i < 10; i++) {
        new Fruit(0, slotWidth).applyEffect(player);
      }
      expect(player.score).toBe(10);
    });
  });

  describe("offscreen detection", () => {
    it("reports offscreen when below canvas", () => {
      const fruit = new Fruit(0, slotWidth);
      fruit.y = CANVAS.height + 1;
      expect(fruit.isOffScreen()).toBe(true);
    });

    it("reports onscreen when within canvas", () => {
      const fruit = new Fruit(0, slotWidth);
      fruit.y = CANVAS.height - 1;
      expect(fruit.isOffScreen()).toBe(false);
    });

    it("reports onscreen at exact canvas boundary", () => {
      const fruit = new Fruit(0, slotWidth);
      fruit.y = CANVAS.height;
      expect(fruit.isOffScreen()).toBe(false);
    });
  });
});

describe("Poison", () => {
  const slotWidth = CANVAS.width / DEFAULTS.slots;

  it("has type poison", () => {
    const poison = new Poison(0, slotWidth);
    expect(poison.type).toBe("poison");
  });

  it("decrements player hearts on collision", () => {
    const player = new Player(CANVAS.width / 2, CANVAS.height * 0.9, 60);
    const poison = new Poison(0, slotWidth);
    poison.applyEffect(player);
    expect(player.hearts).toBe(DEFAULTS.hearts - 1);
  });

  it("can kill the player with repeated hits", () => {
    const player = new Player(CANVAS.width / 2, CANVAS.height * 0.9, 60);
    for (let i = 0; i < DEFAULTS.hearts; i++) {
      new Poison(0, slotWidth).applyEffect(player);
    }
    expect(player.isAlive()).toBe(false);
  });

  it("falls faster as player score increases", () => {
    const p1 = new Poison(0, slotWidth);
    const p2 = new Poison(0, slotWidth);
    p1.fall(false, 0);
    p2.fall(false, 100);
    expect(p2.y).toBeGreaterThan(p1.y);
  });

  it("caps speed multiplier at score 100", () => {
    const p1 = new Poison(0, slotWidth);
    const p2 = new Poison(0, slotWidth);
    p1.fall(false, 100);
    p2.fall(false, 200);
    expect(p1.y).toBe(p2.y);
  });
});

describe("RainyFruits", () => {
  const slotWidth = CANVAS.width / DEFAULTS.slots;

  it("has type rainy", () => {
    const rainy = new RainyFruits(0, slotWidth);
    expect(rainy.type).toBe("rainy");
  });

  it("has fixed size of 30", () => {
    const rainy = new RainyFruits(0, slotWidth);
    expect(rainy.size).toBe(30);
  });

  it("returns rain trigger signal on effect", () => {
    const player = new Player(CANVAS.width / 2, CANVAS.height * 0.9, 60);
    const rainy = new RainyFruits(0, slotWidth);
    const result = rainy.applyEffect(player);
    expect(result).toEqual({ triggerRain: true });
  });

  it("does not modify player score or hearts", () => {
    const player = new Player(CANVAS.width / 2, CANVAS.height * 0.9, 60);
    const rainy = new RainyFruits(0, slotWidth);
    rainy.applyEffect(player);
    expect(player.score).toBe(0);
    expect(player.hearts).toBe(DEFAULTS.hearts);
  });
});

describe("BigBoards", () => {
  const slotWidth = CANVAS.width / DEFAULTS.slots;

  it("has type bigboard", () => {
    const bb = new BigBoards(0, slotWidth);
    expect(bb.type).toBe("bigboard");
  });

  it("increases player size by 20", () => {
    const player = new Player(CANVAS.width / 2, CANVAS.height * 0.9, 60);
    new BigBoards(0, slotWidth).applyEffect(player);
    expect(player.size).toBe(80);
  });

  it("caps player size at 150", () => {
    const player = new Player(CANVAS.width / 2, CANVAS.height * 0.9, 140);
    new BigBoards(0, slotWidth).applyEffect(player);
    expect(player.size).toBe(DEFAULTS.bigBoardMaxSize);
  });

  it("returns original size for timeout restoration", () => {
    const player = new Player(CANVAS.width / 2, CANVAS.height * 0.9, 60);
    const result = new BigBoards(0, slotWidth).applyEffect(player);
    expect(result.originalSize).toBe(60);
    expect(result.boosted).toBe(true);
  });
});

describe("ExtraHeart", () => {
  const slotWidth = CANVAS.width / DEFAULTS.slots;

  it("has type extraHeart", () => {
    const eh = new ExtraHeart(0, slotWidth);
    expect(eh.type).toBe("extraHeart");
  });

  it("adds one heart to the player", () => {
    const player = new Player(CANVAS.width / 2, CANVAS.height * 0.9, 60);
    player.hearts = 2;
    new ExtraHeart(0, slotWidth).applyEffect(player);
    expect(player.hearts).toBe(3);
  });

  it("does not exceed max hearts", () => {
    const player = new Player(CANVAS.width / 2, CANVAS.height * 0.9, 60);
    player.hearts = DEFAULTS.maxHearts;
    new ExtraHeart(0, slotWidth).applyEffect(player);
    expect(player.hearts).toBe(DEFAULTS.maxHearts);
  });

  it("restores a heart after poison damage", () => {
    const player = new Player(CANVAS.width / 2, CANVAS.height * 0.9, 60);
    new Poison(0, slotWidth).applyEffect(player);
    expect(player.hearts).toBe(2);
    new ExtraHeart(0, slotWidth).applyEffect(player);
    expect(player.hearts).toBe(3);
  });
});
