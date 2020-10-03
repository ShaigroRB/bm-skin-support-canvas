// define zoom factor
const POWER = 10;

// ids of elements
const ID_CANVAS_ORIGINAL_SPRITE = "canvas-original-sprite";
const ID_CANVAS_DEF_WEAP = "canvas-default-weapon";
const ID_CANVAS_TMP = "canvas-tmp";
const ID_CANVAS_MODIF_PATTERN = "canvas-modif-pattern";
const ID_INPUT_SPRITE_WIDTH = "input-sprite-width";
const ID_INPUT_SPRITE_HEIGHT = "input-sprite-height";
const ID_INPUT_NB_PATTERNS = "input-number-patterns";
const ID_INPUT_IMG = "input-img";
const ID_BTN_START_MODIF = "btn-start-modification";
const ID_BTN_SLICE = "btn-slice";
const ID_BTN_ZOOM_IN = "btn-zoom-in";
const ID_BTN_ZOOM_OUT = "btn-zoom-out";
const ID_BTN_CLEAR = "btn-clear";
const ID_DIV_MODIF = "div-modification";
const ID_DIV_ZOOM_IN = "div-zoom-in";
const ID_DIV_ZOOM_OUT = "div-zoom-out";

let widthWeapon = 96;
let heightWeapon = 64;
let nbPatterns = 14;

let originalCanvas = document.getElementById(ID_CANVAS_ORIGINAL_SPRITE);

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
};

const failed = () => {
    console.error("The provided file could not be loaded as an Image.");
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

callbackOnchangeForElm(ID_INPUT_SPRITE_WIDTH, (val) => { widthWeapon = val });
callbackOnchangeForElm(ID_INPUT_SPRITE_HEIGHT, (val) => { heightWeapon = val });
callbackOnchangeForElm(ID_INPUT_NB_PATTERNS, (val) => { nbPatterns = val });

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

const sliceCanvasGivenPattern = (canvasId, pattern) => {
    let canvas = document.createElement("canvas");
    canvas = document.getElementById(canvasId);
    canvas.width = widthWeapon;
    canvas.height = heightWeapon;

    const context = canvas.getContext("2d");
    context.drawImage(originalCanvas, widthWeapon * pattern, 0, widthWeapon, heightWeapon, 0, 0, widthWeapon, heightWeapon);
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
const resizeCanvas = (canvasId, newCanvasId, resizeFactor, resizeFunc) => {
    let canvas = document.getElementById(canvasId);
    const width = canvas.width;
    const height = canvas.height;

    let newCanvas = document.getElementById(newCanvasId);
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
 * Zoom in based on the value of POWER
 * @param {string} fromCanvasId Id of the canvas to zoom
 * @param {string} toCanvasId Id of the canvas of the resulting zoom
 */
const zoomInCanvas = (fromCanvasId, toCanvasId) => {

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

    resizeCanvas(fromCanvasId, toCanvasId, POWER, resizeFunc);
};

/**
 * Zoom out based on the value of POWER
 * @param {string} fromCanvasId Id of the canvas to zoom
 * @param {string} toCanvasId Id of the canvas of the resulting zoom
 */
const zoomOutCanvas = (fromCanvasId, toCanvasId) => {

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

    resizeCanvas(fromCanvasId, toCanvasId, 1 / POWER, resizeFunc);
};

const copyCanvas = (fromCanvasId, toCanvasId) => {
    const fromCanvas = document.getElementById(fromCanvasId);
    let toCanvas = document.getElementById(toCanvasId);
    toCanvas.width = fromCanvas.width;
    toCanvas.height = fromCanvas.height;
    const contextToCanvas = toCanvas.getContext("2d");
    contextToCanvas.drawImage(fromCanvas, 0, 0);
};

const clearCanvas = (canvasId) => {
    const canvas = document.getElementById(canvasId);
    canvas.width = 0;
    canvas.height = 0;
};


document.getElementById(ID_INPUT_IMG).onchange = (evt) => {
    let img = new Image();
    img.onload = () => handleImgLoad(img);
    img.onerror = () => failed();
    img.src = URL.createObjectURL(evt.target.files[0]);
};

let pattern = 1;
document.getElementById(ID_BTN_SLICE).onclick = () => {
    if (pattern > 14) {
        pattern = 0;
    }
    sliceCanvasGivenPattern(ID_CANVAS_DEF_WEAP, pattern++);
};

document.getElementById(ID_BTN_ZOOM_IN).onclick = () => {
    zoomInCanvas(ID_CANVAS_TMP, ID_CANVAS_DEF_WEAP);
    copyCanvas(ID_CANVAS_DEF_WEAP, ID_CANVAS_TMP);
}
document.getElementById(ID_BTN_ZOOM_OUT).onclick = () => {
    zoomOutCanvas(ID_CANVAS_TMP, ID_CANVAS_DEF_WEAP);
    copyCanvas(ID_CANVAS_DEF_WEAP, ID_CANVAS_TMP);
}
document.getElementById(ID_BTN_CLEAR).onclick = () => {
    clearCanvas(ID_CANVAS_DEF_WEAP);
    clearCanvas(ID_CANVAS_TMP);
};

document.getElementById(ID_BTN_START_MODIF).onclick = () => {
    if (pattern > nbPatterns) {
        pattern = 1;
    }
    sliceCanvasGivenPattern(ID_CANVAS_TMP, 0);
    zoomInCanvas(ID_CANVAS_TMP, ID_CANVAS_DEF_WEAP);
    copyCanvas(ID_CANVAS_DEF_WEAP, ID_CANVAS_TMP);

    sliceCanvasGivenPattern(ID_CANVAS_TMP, pattern++);
    zoomInCanvas(ID_CANVAS_TMP, ID_CANVAS_MODIF_PATTERN);
    copyCanvas(ID_CANVAS_MODIF_PATTERN, ID_CANVAS_TMP);
};