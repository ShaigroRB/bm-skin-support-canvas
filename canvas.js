const POWER = 10;
let widthWeapon = 96;
let heightWeapon = 64;
let nbPatterns = 14;

let originalCanvasImage = new Image();
let originalCanvas = document.getElementById("skin-support-canvas");

/**
 * Handler for when an image is loaded
 * @param {HTMLImageElement} img 
 */
const handleImgLoad = (img) => {
    heightWeapon = img.height;
    draw(img);
};

/**
 * Draw an image on a canvas given its id
 * @param {HTMLImageElement} img
 */
const draw = (img) => {
    let canvas = originalCanvas;
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext("2d");
    context.drawImage(img, 0, 0);
    originalCanvasImage.src = originalCanvas.toDataURL();
};

const failed = () => {
    console.error("The provided file could not be loaded as an Image.");
};

document.getElementById("input-img").onchange = (evt) => {
    let img = new Image();
    img.onload = () => handleImgLoad(img);
    img.onerror = () => failed();
    img.src = URL.createObjectURL(evt.target.files[0]);
};

/**
 * Call a callback when onchange of element is triggered
 * @param {string} id id of the element
 * @param {(value) => {}} callback 
 */
const callbackOnchangeForElm = (id, callback) => {
    document.getElementById(id).onchange = (evt) => {
        callback(+evt.target.value);
    };
};

callbackOnchangeForElm("input-sprite-width", (val) => { widthWeapon = val });
callbackOnchangeForElm("input-sprite-height", (val) => { heightWeapon = val });
callbackOnchangeForElm("input-number-patterns", (val) => { nbPatterns = val });

const debugCanvas = document.getElementById("debug-canvas");

/**
 * Create a canvas
 * @param {string} id
 * @returns {HTMLCanvasElement} newly created canvas
 */
const createCanvas = (canvasId, parentId) => {
    const parentElm = document.getElementById(parentId);
    let canvas = document.createElement("canvas");
    canvas.id = canvasId;
    parentElm.appendChild(canvas);
    return canvas;
};

/**
 * Sleep for given milliseconds
 * @param {number} ms
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sliceMainCanvasIntoMultipleCanvas = () => {
    debugCanvas.innerHTML = "";

    const drawOnNewCanvas = (canvasId, pattern) => {
        const idCanvas = `${canvasId}`;
        let canvas = createCanvas(idCanvas, "debug-canvas");
        canvas.width = widthWeapon;
        canvas.height = heightWeapon;

        const context = canvas.getContext("2d");
        context.drawImage(originalCanvas, widthWeapon * pattern, 0, widthWeapon, heightWeapon, 0, 0, widthWeapon, heightWeapon);
    };

    drawOnNewCanvas("canvas-default-skin", 0);

    // for (let pattern = 1; pattern <= nbPatterns; pattern++) {
    //     drawOnNewCanvas(`canvas-pattern-${pattern}`, pattern);
    // }
};

document.getElementById("slice-canvas").onclick = () => {
    debugCanvas.innerHTML = "";
    sliceMainCanvasIntoMultipleCanvas();
};

/**
 * Get color indices for coordinates
 * @param {number} x 
 * @param {number} y 
 * @param {number} width 
 */
const getColorIndicesForCoords = (x, y, width) => {
    const red = y * (width * 4) + x * 4;
    return [red, red + 1, red + 2, red + 3];
};

/**
 * Get zoomed in coordinates based on a given size
 * 
 * @param {number} X 
 * @param {number} Y 
 * @param {number} newSize
 */
const getZoomedInCoords = (X, Y, newSize) => {
    let zoomedInCoords = [];
    for (let diffX = 0; diffX < newSize; diffX++) {
        for (let diffY = 0; diffY < newSize; diffY++) {
            zoomedInCoords.push({ "X": X + diffX, "Y": Y + diffY });
        }
    }
    return zoomedInCoords;
};

/**
 * Generic resize function
 * @param {string} canvasId
 * @param {string} newCanvasId
 * @param {string} newCanvasDivId 
 * @param {number} resizeFactor 
 * @param {(width, height, newWidth, newHeight, data, newData) => {}} resizeFunc 
 */
const resizeCanvas = (canvasId, newCanvasId, newCanvasDivId, resizeFactor, resizeFunc) => {
    let canvas = document.createElement("canvas");
    canvas = document.getElementById(canvasId);
    const width = canvas.width;
    const height = canvas.height;

    let newCanvas = createCanvas(newCanvasId, newCanvasDivId);
    newCanvas.width = width * resizeFactor;
    newCanvas.height = height * resizeFactor;
    const newWidth = newCanvas.width;
    const newHeight = newCanvas.height;

    const contextCanvas = canvas.getContext("2d");
    const contextNewCanvas = newCanvas.getContext("2d");

    const imageDataCanvas = contextCanvas.getImageData(0, 0, width, height);
    const data = imageDataCanvas.data;

    let imageDataNewCanvas = contextNewCanvas.getImageData(0, 0, newWidth, newHeight);
    let newData = imageDataNewCanvas.data;

    resizeFunc(width, height, newWidth, newHeight, data, newData);

    contextNewCanvas.putImageData(imageDataNewCanvas, 0, 0);
};

/**
 * Zoom in given canvas based on the value of POWER
 * @param {string} canvasId Id of the canvas to zoom in
 */
const zoomInCanvas = (canvasId) => {
    const newCanvasId = `zoomed-in-${canvasId}`;
    const newCanvasDivId = "debug-zoom-in";

    const resizeFunc = (width, height, newWidth, _, data, newData) => {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const newCoords = getZoomedInCoords(x * POWER, y * POWER, POWER);
                const colorIndices = getColorIndicesForCoords(x, y, width);
                const [red, green, blue, alpha] = colorIndices;

                for (let coord of newCoords) {
                    const newColorIndices = getColorIndicesForCoords(coord.X, coord.Y, newWidth);
                    const [zoomedInRed, zoomedInGreen, zoomedInBlue, zoomedInAlpha] = newColorIndices;

                    newData[zoomedInRed] = data[red];
                    newData[zoomedInGreen] = data[green];
                    newData[zoomedInBlue] = data[blue];
                    newData[zoomedInAlpha] = data[alpha];
                }
            }
        }
    };

    resizeCanvas(canvasId, newCanvasId, newCanvasDivId, POWER, resizeFunc);
};

/**
 * Zoom out given canvas based on the value of POWER
 * @param {string} canvasId Id of the canvas to zoom out
 */
const zoomOutCanvas = (canvasId) => {
    const newCanvasId = `zoomed-out-${canvasId}`;
    const newCanvasDivId = "debug-zoom-out";

    const resizeFunc = (width, _, newWidth, newHeight, data, newData) => {
        for (let y = 0; y < newHeight; y++) {
            for (let x = 0; x < newWidth; x++) {
                const [zoomedOutRed, zoomedOutGreen, zoomedOutBlue, zoomedOutAlpha] = getColorIndicesForCoords(x, y, newWidth);
                const [red, green, blue, alpha] = getColorIndicesForCoords(x * POWER, y * POWER, width);

                newData[zoomedOutRed] = data[red];
                newData[zoomedOutGreen] = data[green];
                newData[zoomedOutBlue] = data[blue];
                newData[zoomedOutAlpha] = data[alpha];
            }
        }
    };

    resizeCanvas(canvasId, newCanvasId, newCanvasDivId, 1 / POWER, resizeFunc);
};

document.getElementById("zoom-in-canvas").onclick = () => zoomInCanvas("canvas-default-skin");
document.getElementById("zoom-out-canvas").onclick = () => zoomOutCanvas("zoomed-in-canvas-default-skin");
document.getElementById("clear-all").onclick = () => {
    document.getElementById("debug-canvas").innerHTML = "";
    document.getElementById("debug-zoom-in").innerHTML = "";
};