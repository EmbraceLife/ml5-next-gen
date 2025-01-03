let video;
let gridSize = 20;
let handPose;
let hands = [];
let sliders = {};  // Object to store our sliders

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

    // Create sliders with default values and ranges
    const sliderWidth = 200;
    const sliderX = width - sliderWidth - 40;
    let sliderY = 30;
    const sliderSpacing = 40;

    sliders.freqX = createSlider(0, 10, 1, 0.1);
    sliders.freqY = createSlider(0, 10, 1, 0.1);
    sliders.phaseX = createSlider(0, TWO_PI, 0, 0.1);
    sliders.phaseY = createSlider(0, TWO_PI, 0, 0.1);
    sliders.amplitude = createSlider(0, 300, 100, 1);

    // Position and style all sliders
    Object.values(sliders).forEach(slider => {
        slider.position(sliderX, sliderY);
        slider.style('width', `${sliderWidth}px`);
        sliderY += sliderSpacing;
    });
}

function draw() {
    background(0);
    video.loadPixels();

    // Draw video grid
    drawVideoGrid();

    // Update parameters from sliders only
    currentParams.freqX = sliders.freqX.value();
    currentParams.freqY = sliders.freqY.value();
    currentParams.phaseX = sliders.phaseX.value();
    currentParams.phaseY = sliders.phaseY.value();
    currentParams.amplitude = sliders.amplitude.value();

    // Draw the curve with enhanced appearance
    push();
    translate(width / 2, height / 2);
    noFill();
    stroke(255, 165, 0);  // Mango color
    strokeWeight(4);      // Thicker line
    scale(1.2);          // Make curve larger
    drawLissajous(
        currentParams.freqX,
        currentParams.freqY,
        currentParams.phaseX,
        currentParams.phaseY,
        currentParams.amplitude
    );
    pop();

    // Display parameter values with enhanced visibility
    displayParameters();
}

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

            push();
            translate(posX, posY);
            fill(r, g, b);
            rectMode(CENTER);
            rect(0, 0, gridSize * 0.9, gridSize * 0.9, gridSize * 0.3);
            pop();
        }
    }
}

function displayParameters() {
    const padding = 20;
    const lineHeight = 30;  // Increased line height
    textSize(18);          // Larger text
    textAlign(LEFT);

    let y = padding;

    // Function to display parameter and its slider label
    function displayParam(label, value) {
        fill(255, 0, 0);  // Red text
        text(label + ": " + value, padding, y);
        y += lineHeight;
    }

    displayParam("Frequency X", currentParams.freqX.toFixed(2));
    displayParam("Frequency Y", currentParams.freqY.toFixed(2));
    displayParam("Phase X", (currentParams.phaseX / PI).toFixed(2) + "π");
    displayParam("Phase Y", (currentParams.phaseY / PI).toFixed(2) + "π");
    displayParam("Amplitude", currentParams.amplitude.toFixed(0));
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
