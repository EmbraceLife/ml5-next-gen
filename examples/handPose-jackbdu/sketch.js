let video;
let gridSize = 20;
let handPose;
let hands = [];
let sliders = {};
let stretchSlider; // New slider for synchronized control

// Add oscillation control variables
let lastStretchValue = 0;
let isSliderMoving = false;
let oscillationTimer = 0;
let oscillationDirection = 1;  // 1 or -1
let freqXDirection = 1;
let freqYDirection = -1;



let currentParams;



function setup() {
    currentParams = {
        freqX: 0.5,
        freqY: 1.5,
        phaseX: 0.48 * PI,
        phaseY: 0,
        amplitude: 200,
        widthMultiplier: 0,
        heightMultiplier: 0.1
    };

    createCanvas(windowWidth, windowHeight);
    video = createCapture(VIDEO, { flipped: true });
    video.size(width / gridSize, height / gridSize);
    video.hide();
    noStroke();

    const sliderWidth = 200;
    const sliderX = width - sliderWidth - 40;
    let sliderY = 30;
    const sliderSpacing = 40;

    // Create individual parameter sliders with your specified values
    sliders.freqX = createSlider(0, 3, 0.5, 0.1); // start at 0.5 and end at 1.5
    sliders.freqY = createSlider(0, 40, 1.5, 0.1);
    sliders.phaseX = createSlider(0, TWO_PI, 0.48 * PI, 0.1);
    sliders.phaseY = createSlider(0, TWO_PI, 0, 0.1);
    sliders.amplitude = createSlider(0, 200, 200, 1);
    sliders.widthMultiplier = createSlider(0.01, 2.5, 0, 0.01);
    sliders.heightMultiplier = createSlider(0.1, 1, 0.1, 0.01);

    // Create the new synchronized control slider
    stretchSlider = createSlider(0, 1, 0, 0.01);

    // Position and style all sliders
    Object.values(sliders).forEach(slider => {
        slider.position(sliderX, sliderY);
        slider.style('width', `${sliderWidth}px`);
        sliderY += sliderSpacing;
    });

    // Position stretch slider below others
    stretchSlider.position(sliderX, sliderY + 20);
    stretchSlider.style('width', `${sliderWidth}px`);
}

function draw() {
    background(0);
    video.loadPixels();
    drawVideoGrid();

    let stretchFactor = stretchSlider.value();

    // Detect slider movement
    isSliderMoving = abs(stretchFactor - lastStretchValue) > 0.001;
    lastStretchValue = stretchFactor;

    // Update fixed parameters
    currentParams.phaseX = 0.48 * PI;
    currentParams.phaseY = 0;
    currentParams.amplitude = 200;
    currentParams.heightMultiplier = sliders.heightMultiplier.value();

    if (isSliderMoving) {
        // Direct slider control
        currentParams.freqX = map(stretchFactor, 0, 1, 0.5, 3);
        currentParams.freqY = map(stretchFactor, 0, 1, 1.5, 40);
        currentParams.widthMultiplier = map(stretchFactor, 0, 1, 0, 2.5);
        oscillationTimer = 0;
    } else {
        // Handle oscillation based on slider position
        if (stretchFactor === 0) {
            // At minimum: decrease both to zero
            currentParams.freqX = max(0, currentParams.freqX - 0.05);
            currentParams.freqY = max(0, currentParams.freqY - 0.05);
        } else if (stretchFactor === 1) {
            // At maximum: FreqX stays max, FreqY oscillates
            currentParams.freqX = 3;  // Keep at max
            oscillationTimer += 0.02;
            currentParams.freqY += oscillationDirection * 0.5;

            // Reverse direction at boundaries
            if (currentParams.freqY >= 40 || currentParams.freqY <= 0) {
                oscillationDirection *= -1;
            }
        } else {
            // Normal oscillation
            oscillationTimer += 0.02;

            // Asynchronous oscillation
            currentParams.freqX += freqXDirection * 0.05;
            currentParams.freqY += freqYDirection * 0.5;

            // Boundary checks and direction reversal
            if (currentParams.freqX >= 3 || currentParams.freqX <= 0.5) {
                freqXDirection *= -1;
            }
            if (currentParams.freqY >= 40 || currentParams.freqY <= 1.5) {
                freqYDirection *= -1;
            }
        }
    }

    // Update slider positions
    sliders.freqX.value(currentParams.freqX);
    sliders.freqY.value(currentParams.freqY);
    sliders.widthMultiplier.value(currentParams.widthMultiplier);

    // Draw curve and parameters
    drawLissajousCurve();
    displayParameters();
}


function drawLissajous(freqX, freqY, phaseX, phaseY, amplitude, widthMult, heightMult) {
    beginShape();
    for (let t = 0; t < TWO_PI; t += 0.01) {
        // Apply multipliers to x and y coordinates separately
        let x = amplitude * widthMult * sin(freqX * t + phaseX);
        let y = amplitude * heightMult * sin(freqY * t + phaseY);
        vertex(x, y);
    }
    endShape();
}

function displayParameters() {
    const padding = 20;
    const lineHeight = 30;
    textSize(18);
    textAlign(LEFT);

    let y = padding;

    function displayParam(label, value, unit = "") {
        fill(255, 0, 0);
        text(label + ": " + value + unit, padding, y);
        y += lineHeight;
    }

    // Display all parameters with appropriate formatting
    displayParam("Frequency X", currentParams.freqX.toFixed(2));
    displayParam("Frequency Y", currentParams.freqY.toFixed(2));
    displayParam("Phase X", (currentParams.phaseX / PI).toFixed(2) + "π");
    displayParam("Phase Y", (currentParams.phaseY / PI).toFixed(2) + "π");
    displayParam("Amplitude", currentParams.amplitude.toFixed(0));
    displayParam("Width Multiplier", currentParams.widthMultiplier.toFixed(2), "×");
    displayParam("Height Multiplier", currentParams.heightMultiplier.toFixed(2), "×");

    // Add explanatory text
    fill(255, 0, 0);
    textSize(14);
    text("Width/Height Multipliers: Adjust the curve's aspect ratio", padding, height - 2 * lineHeight);
    text("Values > 1 stretch, values < 1 compress", padding, height - lineHeight);

    // Add stretch slider label
    fill(255, 0, 0);
    textSize(14);
    text("Stretch Control (FreqY + Width)", padding, height - 3 * lineHeight);
    text(`Stretch: ${(stretchSlider.value() * 100).toFixed(0)}%`, padding, height - 1.5 * lineHeight);

    // Add oscillation status
    fill(255, 0, 0);
    textSize(14);
    if (isSliderMoving) {
        text("Status: Slider Control", padding, height - 4 * lineHeight);
    } else if (stretchSlider.value() === 0) {
        text("Status: Decreasing to Zero", padding, height - 4 * lineHeight);
    } else if (stretchSlider.value() === 1) {
        text("Status: Maximum Oscillation", padding, height - 4 * lineHeight);
    } else {
        text("Status: Asynchronous Oscillation", padding, height - 4 * lineHeight);
    }
}

function drawVideoGrid() {
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

function drawLissajousCurve() {
    push();
    translate(width / 2, height / 2);
    noFill();
    stroke(255, 165, 0);
    strokeWeight(4);
    scale(1.2);
    drawLissajous(
        currentParams.freqX,
        currentParams.freqY,
        currentParams.phaseX,
        currentParams.phaseY,
        currentParams.amplitude,
        currentParams.widthMultiplier,
        currentParams.heightMultiplier
    );
    pop();
}