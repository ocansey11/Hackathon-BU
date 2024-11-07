let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };
let controlledRectX; // Position of the controlled rectangle (mouth)
const rectWidth = 80; // Width of the rectangle
const rectHeight = 30; // Height of the rectangle
let score = 0; // Score variable
let items = []; // Array to store falling items
let lastSpawnTime = 0; // Time of the last item spawn

function preload() {
  // Load the faceMesh model
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(640, 480);
  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  // Start detecting faces from the webcam video
  faceMesh.detectStart(video, gotFaces);
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);

  // Draw all the tracked face points
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    for (let j = 0; j < face.keypoints.length; j++) {
      let keypoint = face.keypoints[j];
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 5);
    }
  }

  // Control the rectangle using the mouth position
  if (faces.length > 0) {
    const mouth = faces[0].keypoints[62]; // Use the mouth center keypoint
    controlledRectX = map(mouth.x, 0, video.width, 0, width - rectWidth);
    controlledRectX = constrain(controlledRectX, 0, width - rectWidth);
  }

  // Draw the controlled rectangle
  fill("blue");
  rect(controlledRectX, height - rectHeight, rectWidth, rectHeight);

  // Update and draw falling items
  updateItems();
  drawItems();

  // Check for collisions  
  checkCollisions();

  // Spawn new items periodically
  if (millis() - lastSpawnTime > 1000) {
    spawnItem();
    lastSpawnTime = millis();
  }

  // Display score
  fill(0);
  textSize(24);
  text("Score: " + score, 10, 30);
}

// Spawn a new item (food or obstacle)
function spawnItem() {
  const isFood = random() > 0.3; // 70% chance to spawn food
  const color = isFood ? "green" : "red"; // Green for food, red for obstacle
  const scoreValue = isFood ? 10 : -5; // Food gives +10 points, obstacle gives -5
  const x = random(20, width - 20);
  items.push({ x, y: 0, color, score: scoreValue, size: 20 });
}

// Update the positions of falling items
function updateItems() {
  for (let i = items.length - 1; i >= 0; i--) {
    items[i].y += 5; // Move items downwards
    if (items[i].y > height) {
      items.splice(i, 1); // Remove off-screen items
    }
  }
}

// Draw the falling items
function drawItems() {
  for (const item of items) {
    fill(item.color);
    ellipse(item.x, item.y, item.size);
  }
}

// Check for collisions between the rectangle and falling items
function checkCollisions() {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    // Check if the item has collided with the controlled rectangle
    if (item.y + item.size / 2 >= height - rectHeight && 
        item.x > controlledRectX && 
        item.x < controlledRectX + rectWidth) {
      // Update score
      score += item.score; 
      items.splice(i, 1); // Remove the item after it is collected
    }
  }
}

// Callback function for when faceMesh outputs data
function gotFaces(results) {
  // Save the output to the faces variable
  faces = results;
}
