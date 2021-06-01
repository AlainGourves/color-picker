const root = document.documentElement;
const light = document.querySelector('#light');
const wheel = document.querySelector('.wheel');
const hueSample = document.querySelector('.sample');
const colorSample = document.querySelector('.sample-color');
const canvas = document.querySelector('#canvas');
let ctx;

let hueDragging = false;
let colorDragging = false;
let wheelCenter;
let posSample;

// Handle Hue selection :
// - hueStartDrag() -> mousedown event (create event listeners for mousemove & mouseend)
// - hueMoveDrag() -> mousemove event
// - hueEndDrag() -> mouseup event (remove event listeners)
function hueStartDrag(ev) {
    hueDragging = true;
    // Attach event listeners for 'mousemove' & 'mouseup'
    document.body.addEventListener('mousemove', hueMoveDrag);
    document.body.addEventListener('mouseup', hueEndDrag);
}

function hueEndDrag() {
    if (hueDragging) {
        document.body.removeEventListener('mousemove', hueMoveDrag);
        document.body.removeEventListener('mouseup', hueEndDrag);
        hueDragging = false;
    }
}

function hueMoveDrag(ev) {
    if (hueDragging) {
        let pos = {
            x: ev.clientX,
            y: ev.clientY
        };
        let angle = Math.round((Math.atan2(pos.y - wheelCenter.y, pos.x - wheelCenter.x) * 180) / Math.PI);
        if (angle < 0) angle += 360;
        root.style.setProperty('--hue-rotation', `${angle}deg`); // error without the 'deg' part !!
        updateCanvas();
    }
}


// Handle Color selection on the canvas element :
// - colorStartDrag() -> mousedown event (create event listeners for mousemove & mouseend)
// - colorMoveDrag() -> mousemove event
// - colorEndDrag() -> mouseup event (remove event listeners)
function colorStartDrag(ev) {
    colorDragging = true;
    // Attach event listeners for 'mousemove' & 'mouseup'
    canvas.addEventListener('mousemove', colorMoveDrag);
    canvas.addEventListener('mouseup', colorEndDrag);
}

function colorEndDrag() {
    if (colorDragging) {
        canvas.removeEventListener('mousemove', colorMoveDrag);
        canvas.removeEventListener('mouseup', colorEndDrag);
        colorDragging = false;
    }
}

function colorMoveDrag(ev) {
    if (colorDragging) {
        const rect = canvas.getBoundingClientRect();
        posSample = {
            x: Math.floor(ev.clientX - rect.left),
            y: Math.floor(ev.clientY - rect.top)
        };
        if (posSample.x < 0) posSample.x = 0;
        if (posSample.x > rect.width) posSample.x = rect.width;
        if (posSample.y < 0) posSample.y = 0;
        if (posSample.y > rect.height) posSample.y = rect.height;
        updateCanvas();
    }
}

function getPixelColor() {
    let imgDataObj = ctx.getImageData(posSample.x, posSample.y, 1, 1);
    let data = imgDataObj.data;
    let clr = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
    root.style.setProperty('--color-sample', clr);
    colorSample.dataset.colorSample = clr;
}

function drawCircle() {
    // pos -> {x, y}
    // récupère les infos CSS
    const r = parseInt(window.getComputedStyle(hueSample).paddingLeft);
    const bdrWidth = parseInt(window.getComputedStyle(hueSample).borderLeftWidth);
    const bdrColor = window.getComputedStyle(hueSample).borderLeftColor;
    ctx.strokeStyle = bdrColor;
    ctx.lineWidth = bdrWidth;
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.ellipse(posSample.x, posSample.y, r, r, 0, 0, 2 * Math.PI);
    ctx.stroke();
}

function updateCanvas(){
    let clr = window.getComputedStyle(canvas).backgroundColor;
    drawCanvas(clr);
}

function drawCanvas(clr) {
    // erase canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // background color
    ctx.fillStyle = clr;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // white/transparent gradient
    ctx.globalCompositeOperation = 'screen';
    let gradientH = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradientH.addColorStop(0, 'white');
    gradientH.addColorStop(1, 'transparent');
    ctx.fillStyle = gradientH;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // black/transparent gradient
    ctx.globalCompositeOperation = 'multiply';
    let gradientV = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradientV.addColorStop(0, 'transparent');
    gradientV.addColorStop(1, 'black');
    ctx.fillStyle = gradientV;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCircle();
    getPixelColor()
}

window.addEventListener("load", e => {
    // Calcule le centre de la roue
    const rect = wheel.getBoundingClientRect();
    wheelCenter = {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2
    };

    ctx = canvas.getContext('2d');
    canvas.width = parseInt(window.getComputedStyle(canvas).width);
    canvas.height = parseInt(window.getComputedStyle(canvas).height);

    // Récupère la couleur de fond
    posSample = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };
    updateCanvas();
    
    hueSample.addEventListener('mousedown', hueStartDrag);
    canvas.addEventListener('mousedown', colorStartDrag);
});