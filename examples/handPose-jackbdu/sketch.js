let video;
let gridSize = 20;
let handPose;
let hands = [];

// Add variables to store parameters for smooth visualization
let currentParams = {
    freqX: 1,
    freqY: 1,
    phaseX: 0,
    phaseY: 0,
    amplitude: 100
};

function preload() {
    handPose = ml5.handPose({
        maxHands: 2,
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

    // Draw video grid as before
    drawVideoGrid();

    // Update and draw Lissajous curve if hands are detected
    if (hands.length >= 2) {
        let leftHand = hands[0];
        let rightHand = hands[1];

        // Update parameters with mapped values
        currentParams.freqX = map(leftHand.keypoints[THUMB_TIP].x, 0, video.width, 1, 5);
        currentParams.freqY = map(leftHand.keypoints[INDEX_FINGER_TIP].x, 0, video.width, 1, 5);
        currentParams.phaseX = map(rightHand.keypoints[THUMB_TIP].y, 0, video.height, 0, TWO_PI);
        currentParams.phaseY = map(rightHand.keypoints[INDEX_FINGER_TIP].y, 0, video.height, 0, TWO_PI);
        currentParams.amplitude = dist(
            leftHand.keypoints[THUMB_TIP].x * gridSize,
            leftHand.keypoints[THUMB_TIP].y * gridSize,
            rightHand.keypoints[THUMB_TIP].x * gridSize,
            rightHand.keypoints[THUMB_TIP].y * gridSize
        ) / 4;

        // Draw the curve
        push();
        translate(width / 2, height / 2);
        noFill();
        stroke(255, 200);
        strokeWeight(2);
        drawLissajous(
            currentParams.freqX,
            currentParams.freqY,
            currentParams.phaseX,
            currentParams.phaseY,
            currentParams.amplitude
        );
        pop();

        // Draw connecting lines between controlling fingers
        stroke(255, 100);
        strokeWeight(1);
        line(
            leftHand.keypoints[THUMB_TIP].x * gridSize,
            leftHand.keypoints[THUMB_TIP].y * gridSize,
            rightHand.keypoints[THUMB_TIP].x * gridSize,
            rightHand.keypoints[THUMB_TIP].y * gridSize
        );
    }

    // Display parameter values
    displayParameters();
}

function displayParameters() {
    const padding = 20;
    const lineHeight = 20;
    fill(255);
    noStroke();
    textSize(14);
    textAlign(LEFT);

    let y = padding;
    text(`Frequency X: ${currentParams.freqX.toFixed(2)}`, padding, y); y += lineHeight;
    text(`Frequency Y: ${currentParams.freqY.toFixed(2)}`, padding, y); y += lineHeight;
    text(`Phase X: ${(currentParams.phaseX / PI).toFixed(2)}π`, padding, y); y += lineHeight;
    text(`Phase Y: ${(currentParams.phaseY / PI).toFixed(2)}π`, padding, y); y += lineHeight;
    text(`Amplitude: ${currentParams.amplitude.toFixed(0)}`, padding, y);

    // Add visual hints
    text("Left hand X position: Controls frequencies", padding, height - 3 * lineHeight);
    text("Right hand Y position: Controls phases", padding, height - 2 * lineHeight);
    text("Distance between hands: Controls amplitude", padding, height - lineHeight);
}

function drawLissajous(freqX, freqY, phaseX, phaseY, amplitude) {
    beginShape();
    for (let t = 0; t < TWO_PI; t += 0.01) {
        let x = amplitude * sin(freqX * t + phaseX);
        let y = amplitude * sin(freqY * t + phaseY);
        vertex(x, y);
    }
    endShape();
}



function gotHands(results) {
    hands = results;
}

const THUMB_TIP = 4;
const INDEX_FINGER_TIP = 8;


function drawVideoGrid() {
    // Draw the grid
    for (let y = 0; y < video.height; y++) {
        for (let x = 0; x < video.width; x++) {
            let index = (x + y * video.width) * 4;
            let r = video.pixels[index] * 1.2;
            let g = video.pixels[index + 1] * 1.2;
            let b = video.pixels[index + 2] * 1.2;

            let posX = x * gridSize + gridSize / 2;
            let posY = y * gridSize + gridSize / 2;

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
