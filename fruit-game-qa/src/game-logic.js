const { DEFAULTS } = require("./constants");

function calculateExtraHeartProbability(currentHearts) {
  if (currentHearts <= 1) return 0.5;
  if (currentHearts === 2) return 0.2;
  return 0.05;
}

function determinePowerUpType(roll, isRainyActive, currentHearts) {
  const extraHeartProb = calculateExtraHeartProbability(currentHearts);

  if (isRainyActive) {
    if (roll < 0.6) return "poison";
    return "fruit";
  }

  if (roll < 0.1) return "poison";
  if (roll < 0.3) return "rainy";
  if (roll < 0.2) return "bigboard";
  if (roll < extraHeartProb) return "extraHeart";
  return "none";
}

function calculatePoisonSpeed(baseSpeed, playerScore) {
  const clampedScore = Math.min(playerScore, 100);
  const multiplier =
    ((clampedScore - 0) * (3 - 1)) / (100 - 0) + 1;
  return baseSpeed * multiplier;
}

function calculateSplashParticles(playerSize) {
  return Math.round(
    ((playerSize - 60) * (25 - 10)) / (150 - 60) + 10
  );
}

module.exports = {
  calculateExtraHeartProbability,
  determinePowerUpType,
  calculatePoisonSpeed,
  calculateSplashParticles,
};
