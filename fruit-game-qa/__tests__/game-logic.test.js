const {
  calculateExtraHeartProbability,
  determinePowerUpType,
  calculatePoisonSpeed,
  calculateSplashParticles,
} = require("../src/game-logic");

describe("calculateExtraHeartProbability", () => {
  it("returns 0.5 when hearts <= 1", () => {
    expect(calculateExtraHeartProbability(1)).toBe(0.5);
    expect(calculateExtraHeartProbability(0)).toBe(0.5);
  });

  it("returns 0.2 when hearts === 2", () => {
    expect(calculateExtraHeartProbability(2)).toBe(0.2);
  });

  it("returns 0.05 when hearts >= 3", () => {
    expect(calculateExtraHeartProbability(3)).toBe(0.05);
    expect(calculateExtraHeartProbability(5)).toBe(0.05);
  });
});

describe("determinePowerUpType", () => {
  describe("during rain mode", () => {
    it("returns poison for roll < 0.6", () => {
      expect(determinePowerUpType(0.3, true, 3)).toBe("poison");
    });

    it("returns fruit for roll >= 0.6", () => {
      expect(determinePowerUpType(0.7, true, 3)).toBe("fruit");
    });

    it("returns poison at the boundary 0.59", () => {
      expect(determinePowerUpType(0.59, true, 3)).toBe("poison");
    });

    it("returns fruit at the boundary 0.6", () => {
      expect(determinePowerUpType(0.6, true, 3)).toBe("fruit");
    });
  });

  describe("normal mode", () => {
    it("returns poison for roll < 0.1", () => {
      expect(determinePowerUpType(0.05, false, 3)).toBe("poison");
    });

    it("returns rainy for roll in [0.1, 0.3)", () => {
      expect(determinePowerUpType(0.15, false, 3)).toBe("rainy");
    });

    it("returns none for high rolls with full hearts", () => {
      expect(determinePowerUpType(0.9, false, 3)).toBe("none");
    });
  });

  describe("BUG: bigboard unreachable range", () => {
    it("never returns bigboard because 0.2 < 0.3 condition is checked after 0.3", () => {
      const results = [];
      for (let roll = 0; roll <= 1; roll += 0.01) {
        results.push(determinePowerUpType(roll, false, 3));
      }
      expect(results).not.toContain("bigboard");
    });
  });
});

describe("calculatePoisonSpeed", () => {
  it("returns base speed at score 0", () => {
    expect(calculatePoisonSpeed(5, 0)).toBe(5);
  });

  it("returns 3x base speed at score 100", () => {
    expect(calculatePoisonSpeed(5, 100)).toBe(15);
  });

  it("clamps score to 100 for speed calculation", () => {
    expect(calculatePoisonSpeed(5, 100)).toBe(calculatePoisonSpeed(5, 500));
  });

  it("scales linearly between 0 and 100", () => {
    const mid = calculatePoisonSpeed(5, 50);
    expect(mid).toBe(10);
  });
});

describe("calculateSplashParticles", () => {
  it("returns 10 particles for minimum player size 60", () => {
    expect(calculateSplashParticles(60)).toBe(10);
  });

  it("returns 25 particles for maximum player size 150", () => {
    expect(calculateSplashParticles(150)).toBe(25);
  });

  it("scales proportionally for intermediate sizes", () => {
    const mid = calculateSplashParticles(105);
    expect(mid).toBeGreaterThan(10);
    expect(mid).toBeLessThan(25);
  });
});
