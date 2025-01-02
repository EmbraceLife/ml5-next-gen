let video;
let gridSize = 20; // Size of each square in the grid
let rotations = []; // Array to store rotation angles
let collectiveRotationTime = 0; // Timer for collective rotation change


let handPose;
let video;
let hands = [];

// Common finger indexes we might use
const THUMB_TIP = 4;
const INDEX_FINGER_TIP = 8;



function preload() {
    // Load the handPose model
    handPose = ml5.handpose({ maxHands: 2, flipped: true });
}



function setup() {
    // Create a full-screen canvas and initialize video capture
    createCanvas(windowWidth, windowHeight);
    video = createCapture(VIDEO, { flipped: true });
    // video = createCapture({ video: { flipped: true } });
    video.size(width / gridSize, height / gridSize);
    video.hide();

    // Start detection and specify callback function
    handPose.detectStart(video, gotHands);


    noStroke();

    // Initialize random rotations for each grid cell
    for (let y = 0; y < video.height; y++) {
        rotations[y] = [];
        for (let x = 0; x < video.width; x++) {
            rotations[y][x] = random(-PI / 8, PI / 8);
        }
    }
}

function draw() {
    // Clear the background
    background(0);
    video.loadPixels();

    // Check if it's time to change collective rotations
    if (millis() - collectiveRotationTime > 3000) {
        for (let y = 0; y < rotations.length; y++) {
            for (let x = 0; x < rotations[y].length; x++) {
                rotations[y][x] = random(-PI / 8, PI / 8);
            }
        }
        collectiveRotationTime = millis(); // Reset timer
    }

    // Draw the grid of rounded squares
    for (let y = 0; y < video.height; y++) {
        for (let x = 0; x < video.width; x++) {
            let index = (x + y * video.width) * 4; // Get color data from video
            let r = video.pixels[index] * 1.2;
            let g = video.pixels[index + 1] * 1.2;
            let b = video.pixels[index + 2] * 1.2;
            fill(r, g, b);

            let posX = x * gridSize + gridSize / 2;
            let posY = y * gridSize + gridSize / 2;

            push();
            translate(posX, posY);
            rotate(rotations[y][x]); // Apply unique rotation
            rectMode(CENTER);
            rect(0, 0, gridSize * 0.9, gridSize * 0.9, gridSize * 0.3); // Rounded squares
            pop();
        }
    }
}

function windowResized() {
    // Adjust canvas size when the window is resized
    resizeCanvas(windowWidth, windowHeight);
    video.size(width / gridSize, height / gridSize);
}
