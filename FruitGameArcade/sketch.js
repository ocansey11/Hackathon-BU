let player1;
let fruits = [];
let splashes = []; // Array to hold splash particles
let gameControl; // Create an instance of the GameControl class
let powerUps = []; // Array to hold power-ups

let slots = 5;
let slotWidth;
let moveCooldown = 0;

// Control settings
const fruit_speed = {
  easy: 3000,
  medium: 2000,
  hard: 1000,
  pro: 500,
};
const player_speed = {
  smooth: 10,
  slow: 15,
  fast: 5,
  pro: 0,
};

const player_size = {
  large: 150,
  medium: 120,
  small: 80,
  pro: 60,
};

// Test settings
let difficulty = fruit_speed.pro;
let movement = player_speed.slow;
let size = player_size.pro;

let score = 0; // Start with 0 score
let hearts = 3; // Start with 3 hearts
const basePowerUpInterval = difficulty * 5;

// Define the GameControl class
class GameControl {
  constructor() {
    this.isPaused = false;
    this.isRaining = false;
  }

  keyPressed() {
    if (key === " ") {
      this.isPaused = !this.isPaused; // Toggle pause
    }
  }

  gameOver() {
    textSize(40);
    fill(255, 0, 0);
    text("GAME OVER!", width / 2, height / 2);
    noLoop(); // Stop the game
  }
}

// Player Class
// Player Class
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color(255, 0, 0);
    this.slotWidth = width / slots;
    this.hearts = hearts;
    this.score = score;

    // Initialize player in the center slot
    this.currentSlot = Math.floor(slots / 2);
    this.updatePosition();

    // Vertical movement bounds
    this.minY = height * 0.5; // Upper limit for vertical movement
    this.maxY = height * 0.9; // Lower limit for vertical movement
  }

  // Update position based on the current slot (horizontal only)
  updatePosition() {
    this.x = this.currentSlot * this.slotWidth + this.slotWidth / 2;
  }

  display() {
    fill(this.color);
    rect(this.x - this.size / 2, this.y, this.size, 20, 20);
  }

  moveRight() {
    if (this.currentSlot < slots - 1) {
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

  // Move player up within the specified bounds
  moveUp() {
    if (this.y > this.minY) {
      this.y -= 10; // Adjust the speed as desired
    }
  }

  // Move player down within the specified bounds
  moveDown() {
    if (this.y < this.maxY) {
      this.y += 10;
    }
  }
}

// Fruit Class
// Fruit Class with depth property
class Fruit {
  constructor(slotIndex, slotWidth) {
    this.x = slotIndex * slotWidth + slotWidth / 2;
    this.y = 0;

    // Depth determines size, speed, and opacity
    this.depth = random(0.5, 1.5); // Random depth, closer fruits are larger
    this.size = 20 * this.depth; // Scale size based on depth
    this.speed = 3 * this.depth; // Scale speed based on depth
    this.opacity = map(this.depth, 0.5, 1.5, 150, 255); // More opaque if closer
    this.color = this.randomColor();
  }

  randomColor() {
    let r = floor(random(256));
    let g = floor(random(256));
    let b = floor(random(256));
    return color(r, g, b, this.opacity);
  }

  fall() {
    this.y += gameControl.isRaining ? 10 : this.speed;
  }

  display() {
    fill(red(this.color), green(this.color), blue(this.color), this.opacity);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size); // Adjust size for 3D effect
  }

  checkCollision(player) {
    let yTolerance = 15;
    let xTolerance = player.size / 2;

    if (
      abs(this.y - player.y) <= yTolerance &&
      abs(this.x - player.x) <= xTolerance
    ) {
      // Create splash effect with variable size depending on depth
      createSplash(this.x, this.y, this.color, this.size);
      return true;
    }
    return false;
  }

  applyEffect(player) {
    // Default effect: increase score
    player.score++;
  }
}

// Poison Class
class Poison extends Fruit {
  constructor(slotIndex, slotWidth) {
    super(slotIndex, slotWidth);
    this.color = color(0, 0, 0); // Black color for poison
    this.baseSpeed = 5; // Starting speed for poison fruits
  }

  // Override fall method to apply dynamic speed
  fall() {
    let speedMultiplier = map(player1.score, 0, 100, 1, 3); // Adjust max score and multiplier
    this.y += this.baseSpeed * speedMultiplier;
  }

  applyEffect(player) {
    player.hearts--; // Decrease hearts on poison collision
  }
}

// RainyFruits Class
class RainyFruits extends Fruit {
  constructor(slotIndex, slotWidth) {
    super(slotIndex, slotWidth);
    this.color = color(135, 206, 250); // Light blue color for a rain-like effect
    this.size = 30; // Size of the teardrop fruit
    this.displayedText = false; // Flag to show the popup message
  }

  applyEffect(player) {
    startRainEffect(); // Trigger rain effect when the fruit is collected
    this.displayedText = true; // Show the popup text when the power-up is collected
    setTimeout(() => {
      this.displayedText = false; // Hide the popup after a short duration (e.g., 2 seconds)
    }, 2000); // Show for 2 seconds
  }

  display() {
    // Draw the teardrop shape
    fill(this.color);
    noStroke();

    // Starting with the point of the teardrop (bottom)
    beginShape();
    vertex(this.x, this.y - this.size / 2); // Bottom point of the teardrop
    bezierVertex(
      this.x + this.size / 3,
      this.y - this.size, // Right curve control point (sharper)
      this.x + this.size / 3,
      this.y + this.size / 2, // Right curve control point (sharper)
      this.x,
      this.y + this.size / 2 // The round base of the teardrop
    );
    bezierVertex(
      this.x - this.size / 3,
      this.y + this.size / 2, // Left curve control point (sharper)
      this.x - this.size / 3,
      this.y - this.size, // Left curve control point (sharper)
      this.x,
      this.y - this.size / 2 // Bottom point of the teardrop (back to the top)
    );
    endShape(CLOSE); // Close the shape

    // Display the "RAIN!!" text when the power-up is collected
    if (this.displayedText) {
      fill(255, 255, 255); // White text
      textSize(32);
      textAlign(CENTER, CENTER);
      text("RAIN!!", this.x, this.y - this.size); // Display text slightly above the fruit
    }
  }
}

// BigBoards Class
class BigBoards extends Fruit {
  constructor(slotIndex, slotWidth) {
    super(slotIndex, slotWidth);
    this.size = 30; // Bigger size
  }

  display() {
    fill(this.color);
    stroke(0);
    strokeWeight(3);
    rect(this.x - this.size / 2, this.y, this.size, this.size);
  }

  applyEffect(player) {
    // Increase player size for 20 seconds
    const originalSize = player.size;
    player.size = min(player.size + 20, 150); // Maximum size 150
    player.updatePosition();

    // Revert player size back to original after 20 seconds
    setTimeout(() => {
      player.size = originalSize;
      player.updatePosition();
    }, 20000); // 20 seconds in milliseconds
  }
}

// ExtraHeart Class
class ExtraHeart extends Fruit {
  display() {
    fill(this.color);
    noStroke();
    beginShape();
    vertex(this.x, this.y - this.size / 4);
    bezierVertex(
      this.x + this.size / 2,
      this.y - this.size / 2,
      this.x + this.size / 2,
      this.y + this.size / 4,
      this.x,
      this.y + this.size / 2
    );
    bezierVertex(
      this.x - this.size / 2,
      this.y + this.size / 4,
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.x,
      this.y - this.size / 4
    );
    endShape(CLOSE);
  }

  applyEffect(player) {
    // Increase hearts
    player.hearts = min(player.hearts + 1, 3); // Maximum 5 hearts
  }
}
// Splash particle class for 3D-ish splash effect
class SplashParticle {
  constructor(x, y, color, maxSize) {
    this.x = x;
    this.y = y;
    this.size = random(5, maxSize); // Random size for a varied splash effect
    this.color = color;
    this.alpha = 255;

    // Think of how to pass in velocity for a more realistic splash effect depending on player size and fruit speed
    this.vx = random(-3, 2.5); // Random velocity for 3D effect
    this.vy = random(1, 3);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 5; // Gradually fade out
  }

  display() {
    fill(red(this.color), green(this.color), blue(this.color), this.alpha);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size * 1.2); // Slightly elongated for realism
  }
}

// COOL FEARTURE
// Function to create splash effect with particles. Find way of placing in SplashParticle class
function createSplash(x, y, color, playerSize) {
  let numParticles = map(playerSize, 60, 150, 10, 25); // More particles for larger sizes
  for (let i = 0; i < numParticles; i++) {
    let maxSize = map(playerSize, 60, 150, 10, 20);
    splashes.push(new SplashParticle(x, y, color, maxSize));
  }
}

// Power-up generation frequency
// Adjust as needed

function generatePowerUps() {
  if (!gameControl.isPaused) {
    let slotIndex = floor(random(slots));
    let powerUpType = random();

    // Adjust extra heart probability based on player hearts
    let extraHeartProbability;
    if (player1.hearts <= 1) {
      extraHeartProbability = 0.5; // Higher chance if only 1 heart
    } else if (player1.hearts === 2) {
      extraHeartProbability = 0.2; // Medium chance if 2 hearts
    } else {
      extraHeartProbability = 0.05; // Lower chance if at full health
    }

    // Determine which power-up to spawn based on probabilities
    if (gameControl.isRainyFruitsActive) {
      // Increase poison density during RainyFruits effect
      if (powerUpType < 0.6) {
        powerUps.push(new Poison(slotIndex, slotWidth));
      } else {
        fruits.push(new Fruit(slotIndex, slotWidth));
      }
    } else {
      // Normal game state power-up distribution
      if (powerUpType < 0.1) {
        powerUps.push(new Poison(slotIndex, slotWidth));
      } else if (powerUpType < 0.3) {
        powerUps.push(new RainyFruits(slotIndex, slotWidth));
      } else if (powerUpType < 0.2) {
        powerUps.push(new BigBoards(slotIndex, slotWidth));
      } else if (powerUpType < extraHeartProbability) {
        powerUps.push(new ExtraHeart(slotIndex, slotWidth));
      }
    }
  }
}

function startRainEffect() {
  // Set the rain duration and interval
  const rainDuration = 5000; // Rain lasts for 5 seconds
  const rainInterval = 100; // Every 100ms, generate fruits/poisons

  const rainEffect = setInterval(() => {
    let slotIndex = floor(random(slots));
    if (random() < 0.7) {
      // 70% chance of fruit
      fruits.push(new Fruit(slotIndex, slotWidth));
    } else {
      // 30% chance of poison
      fruits.push(new Poison(slotIndex, slotWidth));
    }
  }, rainInterval);

  // Stop rain effect after rainDuration
  setTimeout(() => clearInterval(rainEffect), rainDuration);
}

function setup() {
  createCanvas(800, 400);
  slotWidth = width / slots;
  player1 = new Player(width / 2, height * 0.9);
  gameControl = new GameControl(); // Initialize GameControl

  setInterval(() => {
    if (!gameControl.isPaused) {
      let slotIndex = floor(random(slots));
      fruits.push(new Fruit(slotIndex, slotWidth));
    }
  }, difficulty);
  setInterval(generatePowerUps, difficulty * 5);

  // Create restart button
  let restartButton = createButton("Restart");
  restartButton.position(width / 2, height / 2);
  restartButton.mousePressed(restartGame);
  restartButton.hide(); // Hide button initially
}

function draw() {
  // Paused screen

  if (gameControl.isPaused) {
    textSize(20);
    textAlign(CENTER, CENTER);
    text("PAUSED", width / 2, height / 2);
    return;
  }
  background(220);

  // Player controls (horizontal and vertical)
  if (moveCooldown <= 0) {
    // Horizontal movement
    if (
      (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) &&
      player1.currentSlot < slots - 1
    ) {
      player1.moveRight();
      moveCooldown = movement;
    }
    if ((keyIsDown(LEFT_ARROW) || keyIsDown(65)) && player1.currentSlot > 0) {
      player1.moveLeft();
      moveCooldown = movement;
    }

    // Vertical movement
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
      // UP_ARROW or 'W'
      player1.moveUp();
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
      // DOWN_ARROW or 'S'
      player1.moveDown();
    }
  } else {
    moveCooldown--;
  }
  // Display player
  player1.display();

  // Fruits falling
  for (let i = fruits.length - 1; i >= 0; i--) {
    fruits[i].fall();
    fruits[i].display();

    if (fruits[i].checkCollision(player1)) {
      fruits[i].applyEffect(player1); // Apply effect on collision
      fruits.splice(i, 1); // Remove fruit after collision
    } else if (fruits[i].y > height) {
      fruits.splice(i, 1); // Remove fruit if it falls out of bounds
    }
  }

  // Power-ups falling
  for (let i = powerUps.length - 1; i >= 0; i--) {
    powerUps[i].fall();
    powerUps[i].display();

    if (powerUps[i].checkCollision(player1)) {
      powerUps[i].applyEffect(player1); // Apply effect on collision
      powerUps.splice(i, 1); // Remove power-up after collision
    } else if (powerUps[i].y > height) {
      powerUps.splice(i, 1); // Remove power-up if it falls out of bounds
    }
  }

  // Splash particles
  for (let i = splashes.length - 1; i >= 0; i--) {
    splashes[i].update();
    splashes[i].display();
    if (splashes[i].alpha <= 0) {
      splashes.splice(i, 1); // Remove faded particles
    }
  }

  // Show score and hearts
  fill(0);
  textSize(20);
  textAlign(LEFT, TOP);
  text("Score: " + player1.score, 20, 30);
  text("Hearts: " + player1.hearts, 20, 60);

  // Check if game is over
  if (player1.hearts <= 0) {
    gameControl.gameOver(); // Call gameOver from GameControl
    select("button").show(); // Show restart button
  }
}

function keyPressed() {
  gameControl.keyPressed(); // Delegate key press handling to GameControl
}

function restartGame() {
  location.reload(); // Reload the game
}
