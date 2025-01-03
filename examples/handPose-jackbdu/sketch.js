let video;
let gridSize = 20;
let handPose;
let hands = [];
let sliders = {};
let stretchSlider; // New slider for synchronized control

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
    sliders.freqX = createSlider(0, 1.5, 0.5, 0.1); // start at 0.5 and end at 1.5
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

    // Get stretch factor from new slider
    let stretchFactor = stretchSlider.value();

    // Update fixed parameters
    currentParams.freqX = sliders.freqX.value();
    currentParams.phaseX = 0.48 * PI;
    currentParams.phaseY = 0;
    currentParams.amplitude = 200;
    currentParams.heightMultiplier = sliders.heightMultiplier.value();

    // Update synchronized parameters
    // Map stretch factor to both freqY and widthMultiplier
    currentParams.freqY = map(stretchFactor, 0, 1, 1.5, 40);  // from 1.5 to 40
    currentParams.widthMultiplier = map(stretchFactor, 0, 1, 0, 2.5);  // from 0 to 2.5

    // Update slider positions to match (optional)
    sliders.freqY.value(currentParams.freqY);
    sliders.widthMultiplier.value(currentParams.widthMultiplier);

    // Draw the curve
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
