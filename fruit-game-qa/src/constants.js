const FRUIT_SPEED = {
  easy: 3000,
  medium: 2000,
  hard: 1000,
  pro: 500,
};

const PLAYER_SPEED = {
  smooth: 10,
  slow: 15,
  fast: 5,
  pro: 0,
};

const PLAYER_SIZE = {
  large: 150,
  medium: 120,
  small: 80,
  pro: 60,
};

const CANVAS = {
  width: 800,
  height: 400,
};

const DEFAULTS = {
  slots: 5,
  hearts: 3,
  maxHearts: 3,
  bigBoardSizeBoost: 20,
  bigBoardMaxSize: 150,
  bigBoardDuration: 20000,
  rainDuration: 5000,
  rainInterval: 100,
  rainPoisonChance: 0.3,
};

module.exports = {
  FRUIT_SPEED,
  PLAYER_SPEED,
  PLAYER_SIZE,
  CANVAS,
  DEFAULTS,
};
