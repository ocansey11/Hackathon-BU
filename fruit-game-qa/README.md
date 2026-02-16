# FruitGame QA Test Suite

Automated test suite for the [FruitGame](https://editor.p5js.org/ocansey/sketches/66pj6Y7wY) p5.js hackathon project.

The game logic has been extracted from the p5.js rendering layer into testable modules, enabling unit and integration testing with Jest.

## Prerequisites

- Node.js >= 18
- npm

## Setup

```bash
npm install
```

## Run Tests

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Coverage report:

```bash
npm run test:coverage
```

## Project Structure

```
fruit-game-qa/
├── src/
│   ├── constants.js      # Game configuration values
│   ├── player.js         # Player movement and state
│   ├── fruits.js         # Fruit, Poison, PowerUp classes
│   ├── game-control.js   # Pause, game over, rain state
│   └── game-logic.js     # Pure calculation functions
├── __tests__/
│   ├── player.test.js    # Player movement and boundary tests
│   ├── fruits.test.js    # Fruit collision, effects, and lifecycle
│   ├── game-control.test.js  # Game state management
│   ├── game-logic.test.js    # Probability, speed, particle calculations
│   └── integration.test.js   # End-to-end game scenarios
├── jest.config.js
├── package.json
└── README.md
```

## Test Coverage

| Area | What's Tested |
|------|--------------|
| Player Movement | Slot-based horizontal movement, vertical bounds, boundary clamping |
| Collision Detection | X/Y tolerance thresholds, edge-of-hitbox precision |
| Fruit Effects | Score increment, heart loss, size boost caps, heart caps |
| Game State | Pause toggle, game over lock, reset |
| Power-Up Logic | Spawn probability, rain mode distribution, BigBoard unreachable bug |
| Integration | Full lifecycle, stress tests, stacking, boundary edge cases |

## Bugs Found

### 1. BigBoard Power-Up Unreachable

The `generatePowerUps` function checks `powerUpType < 0.2` (BigBoard) *after* already checking `powerUpType < 0.3` (RainyFruits). Since any value under 0.2 also satisfies the 0.3 condition, BigBoards can never spawn during normal gameplay. Verified in `game-logic.test.js` — exhaustive roll sweep from 0 to 1 confirms "bigboard" never appears.

**Fix:** Swap the condition order or adjust thresholds.

### 2. Player Vertical Boundary Overshoot

`moveUp()` checks `if (this.y > this.minY)` then subtracts 10, but does not clamp to `minY`. When the player is within 10px of the boundary (e.g., at `minY + 5`), they overshoot to `minY - 5`. Verified in `player.test.js`.

**Fix:** Use `this.y = Math.max(this.y - 10, this.minY)`.

### 3. Hearts Can Go Negative (No Floor Guard)

Poison reduces hearts without checking for zero. If multiple poisons hit in quick succession, hearts can become negative. Verified in `integration.test.js`.

**Fix:** Add `player.hearts = Math.max(player.hearts - 1, 0)` in Poison's `applyEffect`.

## Author

Kevin Ocansey — [kevinocansey11@gmail.com](mailto:kevinocansey11@gmail.com)
