//  Author : Yu Chang 
//  Github: cyu0330  

let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };
let score = 0;
let items = [];
let lastSpawnTime = 0;
let particleSystem = [];
let foodImages = [];
let bombImage;
let explosionImages = [];

let mouthImage;  // Variable for the mouth replacement image
let gameStopped = false;  // Flag to check if the game is paused
let gameOver = false;  // Flag to check if the game is over

function preload() {
  faceMesh = ml5.faceMesh(options);

  // Load food and bomb images
  foodImages.push(loadImage('assets/images/avocado.png'));
  foodImages.push(loadImage('assets/images/black_cherry.png'));
  foodImages.push(loadImage('assets/images/kiwi.png'));
  foodImages.push(loadImage('assets/images/lemon.png'));
  foodImages.push(loadImage('assets/images/pair.png'));
  foodImages.push(loadImage('assets/images/peach.png'));
  foodImages.push(loadImage('assets/images/pineapple.png'));
  foodImages.push(loadImage('assets/images/raspberry.png'));
  foodImages.push(loadImage('assets/images/watermelon.png'));

  bombImage = loadImage('assets/images/bomb.png');
  explosionImages.push(loadImage('assets/images/color-bomb.png'));

  // Load mouth replacement image
  mouthImage = loadImage('assets/images/lips.png');  // Ensure the path for the mouth image is correct
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  faceMesh.detectStart(video, gotFaces);
}

function draw() {
  if (gameOver) {
    // If the game is over, display a "Game Over" message
    background(0, 0, 0);
    fill(255);
    textSize(50);
    textAlign(CENTER, CENTER);
    text("Game Over", width / 2, height / 2);
    textSize(20);
    text("Press 'R' to Restart", width / 2, height / 2 + 60);
    return;
  }

  if (gameStopped) {
    // If the game is paused, display a "Paused" message
    background(0, 0, 0, 150);
    fill(255);
    textSize(50);
    textAlign(CENTER, CENTER);
    text("Paused", width / 2, height / 2);
    return;
  }

  background(200, 200, 255);

  if (faces.length > 0) {
    const face = faces[0];
    const mouth = face.keypoints[62];

    if (mouth && !isNaN(mouth.x)) {
      let mirroredMouthX = constrain(width - mouth.x, 0, width);
      let faceX = mirroredMouthX - 40;
      let faceY = constrain(mouth.y - 40, 0, height - 80);

      // Use the replacement mouth image
      let mouthWidth = 80;  // Adjust the image size
      let mouthHeight = 80;
      image(mouthImage, mirroredMouthX - mouthWidth / 2, faceY, mouthWidth, mouthHeight);

      let mirroredMouth = { x: mirroredMouthX, y: mouth.y };
      checkCollisionsWithMouth(mirroredMouth);
    }
  }

  updateItems();
  drawItems();
  updateParticles();
  drawParticles();

  if (millis() - lastSpawnTime > 1000) {
    spawnItem();
    lastSpawnTime = millis();
  }

  // 1. Set the font for the score
  textSize(40);
  textAlign(CENTER, CENTER);
  fill(255, 223, 0); // Bright yellow
  textFont('Georgia');  // You can change to other nice fonts like 'Courier New', 'Arial', 'Impact', etc.

  // 2. Add shadow effect
  textStyle(BOLD);
  textSize(50);
  fill(0, 0, 0, 150); // Shadow color (black with transparency)
  text("Score: " + score, width / 2, 30);

  fill(255, 223, 0);  // The actual score color
  text("Score: " + score, width / 2 + 2, 32);  // Adjust position to avoid overlapping with shadow
  
  // Display explanation at the bottom of the screen
  textSize(20);
  fill(255);
  text("Press 'P' to Pause/Resume | Press 'R' to Restart", width / 2, height - 20);
}

//Randomly Spawning Fruits and Bombs
function spawnItem() {
  const isFood = random() > 0.3;
  const isBomb = random() > 0.7;

  let itemImage = isBomb ? bombImage : random(foodImages);
  const scoreValue = isBomb ? -10 : 10;
  const x = random(20, width - 20);
  items.push({ x, y: 0, image: itemImage, score: scoreValue, size: 40, exploded: false, type: isBomb ? "bomb" : "food" });
}

function updateItems() {
  for (let i = items.length - 1; i >= 0; i--) {
    items[i].y += 5;
    if (items[i].y > height) {
      items.splice(i, 1);
    }
  }
}

function drawItems() {
  for (const item of items) {
    if (item.exploded) {
      if (item.type === "bomb") {
        image(explosionImages[0], item.x - item.size / 2, item.y - item.size / 2, item.size * 2, item.size * 2);
      } else {
        triggerExplosion(item.x, item.y, item.type);
      }
    } else {
      image(item.image, item.x - item.size / 2, item.y - item.size / 2, item.size, item.size);
    }
  }
}

//Collision Detection
function checkCollisionsWithMouth(mouth) {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];

    if (item.x > mouth.x - 40 && item.x < mouth.x + 40 && item.y > mouth.y - 20 && item.y < mouth.y + 20) {
      score += item.score;
      item.exploded = true;
      triggerExplosion(item.x, item.y, item.type);
      setTimeout(() => {
        items.splice(i, 1);
      }, 500);
    }
  }
}

// Special Effects for Bomb Explosion
function triggerExplosion(x, y, type) {
  if (type === "bomb") {
    for (let i = 0; i < 10; i++) {
      let p = {
        x: x,
        y: y,
        speedX: random(-3, 3),
        speedY: random(-3, 3),
        image: random(explosionImages),
        size: random(10, 30),
        lifetime: 255,
      };
      particleSystem.push(p);
    }
  } else if (type === "food") {
    for (let i = 0; i < 20; i++) {
      let p = {
        x: x,
        y: y,
        speedX: random(-3, 3),
        speedY: random(-3, 3),
        color: color(random(255), random(255), random(255)),
        size: random(5, 15),
        lifetime: 255,
      };
      particleSystem.push(p);
    }
  }
}
//Special Effects for Fruit Particles after explosion
function updateParticles() {
  for (let i = particleSystem.length - 1; i >= 0; i--) {
    let p = particleSystem[i];
    p.x += p.speedX;
    p.y += p.speedY;
    p.lifetime -= 5;
    p.size *= 0.98;
    if (p.lifetime <= 0 || p.size <= 1) {
      particleSystem.splice(i, 1);
    }
  }
}

function drawParticles() {
  noStroke();
  for (let p of particleSystem) {
    if (p.color) {
      fill(p.color.levels[0], p.color.levels[1], p.color.levels[2], p.lifetime);
    } else {
      fill(255, p.lifetime);
    }
    ellipse(p.x, p.y, p.size);
  }
}

function gotFaces(results) {
  faces = results;
}

// Function to handle key press for pausing, resuming, and restarting the game
function keyPressed() {
  if (key === 'P' || key === 'p') {
    gameStopped = !gameStopped;  // Toggle pause state
  }

  if (key === 'R' || key === 'r') {
    resetGame();  // Reset the game
  }
}

// Function to reset the game state
function resetGame() {
  gameOver = false;
  gameStopped = false;
  score = 0;
  items = [];
  particleSystem = [];
  lastSpawnTime = 0;
}
