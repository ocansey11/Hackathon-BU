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

// Define the GameControl class
class GameControl {
  constructor() {
    this.isPaused = false;
  }

  keyPressed() {
    if (key === " ") {
      this.isPaused = !this.isPaused; // Toggle pause
    }
  }

  gameOver() {
    textSize(40);
    fill(255, 0, 0);
    text("GAME OVER!", width / 2 - 100, height / 2);
    noLoop(); // Stop the game
  }
}

// Player Class
class Player {
  constructor(x, y) {
    this.y = y;
    this.size = size;
    this.color = color(255, 0, 0);
    this.slotWidth = width / slots;

    // Initialize player in the center slot
    this.currentSlot = Math.floor(slots / 2);
    this.updatePosition();
  }

  // Update position based on the current slot
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
}

// Fruit Class
class Fruit {
  constructor(slotIndex, slotWidth, isPoison = false) {
    this.x = slotIndex * slotWidth + slotWidth / 2;
    this.y = 0;
    this.size = 20;
    this.isPoison = isPoison;
    this.isPowerUp = false;
    this.color = this.isPoison ? color(0, 0, 0) : this.randomColor(); // Black color for poison
  }

  randomColor() {
    let r = floor(random(256));
    let g = floor(random(256));
    let b = floor(random(256));
    return color(r, g, b);
  }

  fall() {
    this.y += 5;
  }

  display() {
    fill(this.color);
    circle(this.x, this.y, this.size);
  }

  checkCollision(player) {
    let yTolerance = 15; // Tolerance for y-axis to allow slight margin for collision
    let xTolerance = player.size / 2; // Based on player size

    if (
      abs(this.y - player.y) <= yTolerance &&
      abs(this.x - player.x) <= xTolerance
    ) {
      // Create splash effect with variable size depending on player size
      createSplash(this.x, this.y, this.color, player.size);
      return true; // Collision detected
    }
    return false; // No collision
  }
}

// PowerUp Class
class PowerUp extends Fruit {
  constructor(slotIndex, slotWidth, playerSize, fruitSpeed) {
    super(slotIndex, slotWidth, false);
    this.playerSize = playerSize;
    this.fruitSpeed = fruitSpeed;
    this.color = color(255, 215, 0); // Gold color for power-ups
  }

  applyEffect(player) {
    // To be overridden by subclasses
  }
}

// RainyFruits Class
class RainyFruits extends PowerUp {
  applyEffect(player) {
    // Increase the frequency of falling fruits
    difficulty = max(difficulty - 500, 500); // Increase speed, minimum 500ms
  }
}

// BigBoards Class
class BigBoards extends PowerUp {
  constructor(slotIndex, slotWidth, playerSize, fruitSpeed) {
    super(slotIndex, slotWidth, playerSize, fruitSpeed);
    this.size = 30; // Bigger size
  }

  display() {
    fill(this.color);
    stroke(0);
    strokeWeight(3);
    rect(this.x - this.size / 2, this.y, this.size, this.size);
  }

  applyEffect(player) {
    // Increase player size
    player.size = min(player.size + 20, 150); // Maximum size 150
    player.updatePosition();
  }
}

// ExtraHeart Class
class ExtraHeart extends PowerUp {
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
    hearts = min(hearts + 1, 5); // Maximum 5 hearts
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

// Function to create splash effect with particles. Find way of placing in SplashParticle class
function createSplash(x, y, color, playerSize) {
  let numParticles = map(playerSize, 60, 150, 10, 25); // More particles for larger sizes
  for (let i = 0; i < numParticles; i++) {
    let maxSize = map(playerSize, 60, 150, 10, 20);
    splashes.push(new SplashParticle(x, y, color, maxSize));
  }
}

function setup() {
  createCanvas(800, 400);
  slotWidth = width / slots;
  player1 = new Player(width / 2, height * 0.9);
  gameControl = new GameControl(); // Initialize GameControl

  setInterval(() => {
    if (!gameControl.isPaused) {
      let slotIndex = floor(random(slots));
      let isPoison = random() < 0.2; // 20% chance of poison
      fruits.push(new Fruit(slotIndex, slotWidth, isPoison));
    }
  }, difficulty);

  // Initialize power-ups
  setInterval(() => {
    if (!gameControl.isPaused) {
      let slotIndex = floor(random(slots));
      if (random() < 0.05) {
        // 5% chance of power-up
        let powerUpType = random([RainyFruits, BigBoards, ExtraHeart]);
        powerUps.push(
          new powerUpType(slotIndex, slotWidth, player1.size, difficulty)
        );
      }
    }
  }, 10000); // Power-ups appear every 10 seconds
}

function draw() {
  // Paused screen
  if (gameControl.isPaused) {
    textSize(50);
    textAlign(CENTER, CENTER);
    text("PAUSED", width / 2, height / 2);
    return;
  }

  background(220);
  // Player controls
  if (moveCooldown <= 0) {
    if (
      (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) &&
      player1.currentSlot < slots - 1
    ) {
      player1.moveRight();
      moveCooldown = movement; // Adjust cooldown based on movement speed
    }
    if ((keyIsDown(LEFT_ARROW) || keyIsDown(65)) && player1.currentSlot > 0) {
      player1.moveLeft();
      moveCooldown = movement;
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
      if (fruits[i].isPoison) {
        hearts--; // Decrease hearts on poison collision
      } else {
        score++; // Increase score on fruit collision
      }
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
  text("Score: " + score, 20, 30);
  text("Hearts: " + hearts, 20, 60);

  // Check if game is over
  if (hearts <= 0) {
    gameControl.gameOver(); // Call gameOver from GameControl
  }
}

function keyPressed() {
  gameControl.keyPressed(); // Delegate key press handling to GameControl
}
