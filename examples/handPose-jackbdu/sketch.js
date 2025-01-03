let video;
let gridSize = 20;
let handPose;
let hands = [];

function preload() {
    handPose = ml5.handPose({
        maxHands: 2,  // Changed to detect 2 hands
        flipped: true
    });
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    video = createCapture(VIDEO, { flipped: true });
    video.size(width / gridSize, height / gridSize);
    video.hide();
    noStroke();
    handPose.detectStart(video, gotHands);
}

function draw() {
    background(0);
    video.loadPixels();

    // Store finger positions for all hands
    let fingerPositions = [];
    if (hands.length > 0) {
        // Process each hand
        hands.forEach((hand, index) => {
            // Get thumb and index positions for this hand
            let thumb = hand.keypoints[THUMB_TIP];
            let index_finger = hand.keypoints[INDEX_FINGER_TIP];

            // Store positions with different colors for each hand
            fingerPositions.push({
                x: floor(thumb.x),
                y: floor(thumb.y),
                color: index === 0 ? color(255, 0, 0) : color(0, 255, 0)  // Red for first hand, Green for second
            });

            fingerPositions.push({
                x: floor(index_finger.x),
                y: floor(index_finger.y),
                color: index === 0 ? color(255, 100, 100) : color(100, 255, 100)  // Lighter colors for index fingers
            });
        });
    }

    // Draw the grid
    for (let y = 0; y < video.height; y++) {
        for (let x = 0; x < video.width; x++) {
            let index = (x + y * video.width) * 4;
            let r = video.pixels[index] * 1.2;
            let g = video.pixels[index + 1] * 1.2;
            let b = video.pixels[index + 2] * 1.2;

            let posX = x * gridSize + gridSize / 2;
            let posY = y * gridSize + gridSize / 2;

            push();
            translate(posX, posY);

            // Check if this cell contains any tracked finger
            let fingerAtPosition = fingerPositions.find(pos =>
                pos.x === x && pos.y === y
            );

            // Color the cell based on finger position
            if (fingerAtPosition) {
                fill(fingerAtPosition.color);
            } else {
                fill(r, g, b);
            }

            rectMode(CENTER);
            rect(0, 0, gridSize * 0.9, gridSize * 0.9, gridSize * 0.3);
            pop();
        }
    }
}

function gotHands(results) {
    hands = results;
}

const THUMB_TIP = 4;
const INDEX_FINGER_TIP = 8;
