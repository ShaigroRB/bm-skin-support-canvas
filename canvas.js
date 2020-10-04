// -------------- Classes -----------------
//#region 
/**
 * Represents the settings of a sprite
 */
class SpriteSettings {
    /**
     * @param {HTMLCanvasElement} spriteCanvas 
     * @param {number} widthPattern 
     * @param {number} heightPattern 
     * @param {number} nbPatterns 
     */
    constructor(spriteCanvas, widthPattern, heightPattern, nbPatterns) {
        this.canvas = spriteCanvas;
        this.widthPattern = widthPattern;
        this.heightPattern = heightPattern;
        this.nbPatterns = nbPatterns;
        this.isDefWeapDrawn = false;
    }

    setWidthPattern = (width) => {
        this.widthPattern = width;
    }

    setHeightPattern = (height) => {
        this.heightPattern = height;
    }

    setNbPatterns = (nb) => {
        this.nbPatterns = nb;
    }

    setIsDefWeapDrawn = (bool) => {
        this.isDefWeapDrawn = bool;
    }
}

/**
 * Represents the color of a pixel
 */
class PixelColor {
    /**
     * @param {number} red 
     * @param {number} green 
     * @param {number} blue 
     * @param {number} alpha 
     */
    constructor(red, green, blue, alpha) {
        this.r = red;
        this.g = green;
        this.b = blue;
        this.a = alpha;
    }

    setUniformValues = (value, alpha = 255) => {
        this.r = value;
        this.g = value;
        this.b = value;
        this.a = alpha;
    }

    setLightestColor = () => {
        this.setUniformValues(255);
    }

    setNormalColor = () => {
        this.setUniformValues(226);
    }

    setDarkestColor = () => {
        this.setUniformValues(149);
    }

    setEraseColor = () => {
        this.setUniformValues(0, 0);
    }
}

//#endregion

// --------------- Variables -------------
//#region 
// define zoom factor
const RESIZE_FACTOR = 15;

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
const ID_BTN_ENABLE_SAVE = "btn-enable-img-save";
const ID_BTN_SLICE = "btn-slice";
const ID_BTN_ZOOM_IN = "btn-zoom-in";
const ID_BTN_ZOOM_OUT = "btn-zoom-out";
const ID_BTN_LIGHTEST = "btn-lightest-color";
const ID_BTN_NORMAL = "btn-normal-color";
const ID_BTN_DARKEST = "btn-darkest-color";
const ID_BTN_ERASE = "btn-erase-color";
const ID_BTN_CLEAR = "btn-clear";
const ID_DIV_MODIF = "div-modification";
const ID_DIV_ZOOM_IN = "div-zoom-in";
const ID_DIV_ZOOM_OUT = "div-zoom-out";

// canvases
const originalCanvas = document.getElementById(ID_CANVAS_ORIGINAL_SPRITE);
const defWeaponCanvas = document.getElementById(ID_CANVAS_DEF_WEAP);
const tmpCanvas = document.getElementById(ID_CANVAS_TMP);
const modifPatternCanvas = document.getElementById(ID_CANVAS_MODIF_PATTERN);

const currPixelColor = new PixelColor(0, 0, 0, 0);
const defSpriteSettings = new SpriteSettings(originalCanvas, 96, 64, 14);

let pattern = 0;
let beginModif = false;
let imageDataPatterns = [];

//#endregion

// ------------- Functions ---------------
//#region Independant functions (use only parameters)

/**
 * Enable/disable an element
 * @param {string} elmId 
 * @param {bool} isDisabled 
 */
const setDisabled = (elmId, isDisabled) => {
    document.getElementById(elmId).disabled = isDisabled;
};

/**
 * Handler for when an image is loaded
 * @param {HTMLImageElement} img 
 * @param {SpriteSettings} defSpriteSettings
 */
const handleImgLoad = (img, defSpriteSettings) => {
    defSpriteSettings.heightPattern = img.height;
    draw(img, defSpriteSettings);
};

/**
 * Draw an image on a canvas given its id
 * @param {HTMLImageElement} img
 * @param {SpriteSettings} defSpriteSettings
 */
const draw = (img, defSpriteSettings) => {
    let canvas = defSpriteSettings.canvas;
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext("2d");
    context.drawImage(img, 0, 0);
};

/**
 * Handler for loading failure
 */
const handleFailure = () => {
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

/**
 * Slice a pattern from a sprite to a canvas using the settings of the sprite
 * @param {SpriteSettings} defSpriteSettings
 * @param {HTMLCanvasElement} toCanvas
 * @param {number} pattern
 */
const sliceSpriteGivenPattern = (defSpriteSettings, toCanvas, pattern) => {
    toCanvas.width = defSpriteSettings.widthPattern;
    toCanvas.height = defSpriteSettings.heightPattern;

    const context = toCanvas.getContext("2d");
    context.drawImage(
        defSpriteSettings.canvas,
        defSpriteSettings.widthPattern * pattern, 0,
        defSpriteSettings.widthPattern, defSpriteSettings.heightPattern,
        0, 0,
        defSpriteSettings.widthPattern, defSpriteSettings.heightPattern
    );
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
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLCanvasElement} newCanvas
 * @param {number} resizeFactor 
 * @param {(width, height, newWidth, newHeight, data, newData) => {}} resizeFunc 
 */
const resizeCanvas = (canvas, newCanvas, resizeFactor, resizeFunc) => {
    const width = canvas.width;
    const height = canvas.height;

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
 * Zoom in based on the value of RESIZE_FACTOR
 * @param {HTMLCanvasElement} fromCanvas Canvas to zoom
 * @param {HTMLCanvasElement} toCanvas Canvas of the resulting zoom
 */
const zoomInCanvas = (fromCanvas, toCanvas) => {

    const resizeFunc = (width, height, newWidth, _, data, newData) => {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const newCoords = getZoomedInCoords(x * RESIZE_FACTOR, y * RESIZE_FACTOR, RESIZE_FACTOR);
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

    resizeCanvas(fromCanvas, toCanvas, RESIZE_FACTOR, resizeFunc);
};

/**
 * Zoom out based on the value of RESIZE_FACTOR
 * @param {HTMLCanvasElement} fromCanvas Canvas to zoom
 * @param {HTMLCanvasElement} toCanvas Canvas of the resulting zoom
 */
const zoomOutCanvas = (fromCanvas, toCanvas) => {

    const resizeFunc = (width, _, newWidth, newHeight, data, newData) => {
        for (let y = 0; y < newHeight; y++) {
            for (let x = 0; x < newWidth; x++) {
                const [zoomedOutRed, zoomedOutGreen, zoomedOutBlue, zoomedOutAlpha] = getColorIndicesForCoords(x, y, newWidth);
                const [red, green, blue, alpha] = getColorIndicesForCoords(x * RESIZE_FACTOR, y * RESIZE_FACTOR, width);

                newData[zoomedOutRed] = data[red];
                newData[zoomedOutGreen] = data[green];
                newData[zoomedOutBlue] = data[blue];
                newData[zoomedOutAlpha] = data[alpha];
            }
        }
    };

    resizeCanvas(fromCanvas, toCanvas, 1 / RESIZE_FACTOR, resizeFunc);
};

/**
 * Copy content of a canvas to another one
 * @param {HTMLCanvasElement} fromCanvas
 * @param {HTMLCanvasElement} toCanvas
 */
const copyCanvas = (fromCanvas, toCanvas) => {
    toCanvas.width = fromCanvas.width;
    toCanvas.height = fromCanvas.height;
    const contextToCanvas = toCanvas.getContext("2d");
    contextToCanvas.drawImage(fromCanvas, 0, 0);
};

/**
 * Clear content of a canvas
 * @param {HTMLCanvasElement} canvas 
 */
const clearCanvas = (canvas) => {
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
};


/**
 * Redraw a pixel
 * @param {HTMLCanvasElement} canvas
 * @param {number} pixelX 
 * @param {number} pixelY 
 * @param {PixelColor} color
 */
const drawPixel = (canvas, pixelX, pixelY, color) => {
    const width = canvas.width;
    const height = canvas.height;

    const context = canvas.getContext("2d");
    const imageData = context.getImageData(0, 0, width, height);
    let data = imageData.data;

    for (let y = pixelY; y < pixelY + RESIZE_FACTOR; y++) {
        for (let x = pixelX; x < pixelX + RESIZE_FACTOR; x++) {
            const [r, g, b, a] = getColorIndicesForCoords(x, y, width);
            data[r] = color.r;
            data[g] = color.g;
            data[b] = color.b;
            data[a] = color.a;
        }
    }

    context.putImageData(imageData, 0, 0);
};

//#endregion

//#region Dependant functions (use global variables)
/**
 * Globally reset the settings
 */
const globalReset = () => {
    defSpriteSettings.setIsDefWeapDrawn(false);
    pattern = 0;
    setDisabled(ID_BTN_SAVE_MODIF, true);
};
//#endregion

// ----------------- Listeners --------------------
//#region

callbackOnchangeForElm(ID_INPUT_SPRITE_WIDTH, (val) => { defSpriteSettings.setWidthPattern(val); });
callbackOnchangeForElm(ID_INPUT_SPRITE_HEIGHT, (val) => { defSpriteSettings.setHeightPattern(val); });
callbackOnchangeForElm(ID_INPUT_NB_PATTERNS, (val) => { defSpriteSettings.setNbPatterns(val); });

document.getElementById(ID_INPUT_IMG).onchange = (evt) => {
    let img = new Image();
    img.onload = () => {
        handleImgLoad(img, defSpriteSettings);
        globalReset();
    };
    img.onerror = () => handleFailure();
    img.src = URL.createObjectURL(evt.target.files[0]);
};

//#region Invisible buttons
document.getElementById(ID_BTN_SLICE).onclick = () => {
    if (pattern > 14) {
        pattern = 0;
    }
    sliceSpriteGivenPattern(defSpriteSettings, defWeaponCanvas, pattern++);
};

document.getElementById(ID_BTN_ZOOM_IN).onclick = () => {
    zoomInCanvas(tmpCanvas, defWeaponCanvas);
    copyCanvas(defWeaponCanvas, tmpCanvas);
}
document.getElementById(ID_BTN_ZOOM_OUT).onclick = () => {
    zoomOutCanvas(tmpCanvas, defWeaponCanvas);
    copyCanvas(defWeaponCanvas, tmpCanvas);
}
//#endregion

//#region Switch patterns and image saving
document.getElementById(ID_BTN_START_MODIF).onclick = () => {
    // save the image data of the current pattern before going to the next one
    const tmpContext = tmpCanvas.getContext("2d");
    copyCanvas(modifPatternCanvas, tmpCanvas);
    imageDataPatterns[pattern] = tmpContext.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
    pattern++;

    if (pattern > defSpriteSettings.nbPatterns) {
        pattern = 1;
    }

    // avoid drawing the default weapon each time we change pattern
    if (!defSpriteSettings.isDefWeapDrawn) {
        sliceSpriteGivenPattern(defSpriteSettings, tmpCanvas, 0);
        zoomInCanvas(tmpCanvas, defWeaponCanvas);
        defSpriteSettings.setIsDefWeapDrawn(true);
    }

    // if there is no data for the current pattern, draw the one from the original image
    if (imageDataPatterns[pattern] == null || imageDataPatterns[pattern] == undefined) {
        sliceSpriteGivenPattern(defSpriteSettings, tmpCanvas, pattern);
        zoomInCanvas(tmpCanvas, modifPatternCanvas);
    }
    else {
        tmpContext.putImageData(imageDataPatterns[pattern], 0, 0);
        copyCanvas(tmpCanvas, modifPatternCanvas);
    }
};

//#endregion

//#region Event listeners on the pattern canvas
document.getElementById(ID_CANVAS_MODIF_PATTERN).onmousedown = () => {
    beginModif = true;
};
document.getElementById(ID_CANVAS_MODIF_PATTERN).onmouseup = () => {
    beginModif = false;
};

document.getElementById(ID_CANVAS_MODIF_PATTERN).onmousemove = (evt) => {
    if (beginModif) {
        const clickX = evt.layerX;
        const clickY = evt.layerY;

        const originPixelX = clickX - (clickX % RESIZE_FACTOR);
        const originPixelY = clickY - (clickY % RESIZE_FACTOR);

        drawPixel(modifPatternCanvas, originPixelX, originPixelY, currPixelColor);
    }
};
//#endregion

//#region Options buttons
document.getElementById(ID_BTN_LIGHTEST).onclick = () => {
    currPixelColor.setLightestColor();
};
document.getElementById(ID_BTN_NORMAL).onclick = () => {
    currPixelColor.setNormalColor();
};
document.getElementById(ID_BTN_DARKEST).onclick = () => {
    currPixelColor.setDarkestColor();
};
document.getElementById(ID_BTN_ERASE).onclick = () => {
    currPixelColor.setEraseColor();
};
document.getElementById(ID_BTN_CLEAR).onclick = () => {
    clearCanvas(modifPatternCanvas);
};
//#endregion

//#endregion