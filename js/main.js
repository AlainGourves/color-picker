const root = document.documentElement;
const wheel = document.querySelector('.wheel');
const rotationValue = document.querySelector('.hue__rotation-content');
const hueSample = document.querySelector('.sample');
const colorPicked = document.querySelector('.picked-color');
const btnNewSwatch = document.querySelector('#wheel__container > button');
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');


// Handle Hue selection :
// - hueStartDrag() -> mousedown event (create event listeners for mousemove & mouseend)
// - hueMoveDrag() -> mousemove event
// - hueEndDrag() -> mouseup event (remove event listeners)
function hueStartDrag(ev) {
    ev.preventDefault();
    // Attach event listeners for 'mousemove' & 'mouseup'
    // Event listener is attached to body : movements are registered even the pointer exits the target
    customAddEventListener(document.body, 'move', hueMoveDrag);
    customAddEventListener(document.body, 'up', hueEndDrag);
}

function hueEndDrag() {
    customRemoveEventListener(document.body, 'move', hueMoveDrag)
    customRemoveEventListener(document.body, 'up', hueEndDrag)
}

function hueMoveDrag(ev) {
    ev.preventDefault();
    let pos = getPosition(ev);
    let angle = Math.round(Math.atan2(pos.y - wheelCenter.y, pos.x - wheelCenter.x) * (180 / Math.PI));
    root.style.setProperty('--hue-rotation-2', `${angle}deg`); // don't forget the 'deg'' unit !
    if (angle < 0) angle += 360;
    if (angle === -0) angle = 0;
    root.style.setProperty('--hue-rotation', `${angle}deg`); // don't forget the 'deg'' unit !
    updateCanvas();
}

// Handle Color selection on the canvas element :
// - colorStartDrag() -> mousedown event (create event listeners for mousemove & mouseend)
// - colorMoveDrag() -> mousemove event
// - colorEndDrag() -> mouseup event (remove event listeners)
function colorStartDrag(ev) {
    ev.preventDefault();
    // Attach event listeners for 'mousemove' & 'mouseup'
    customAddEventListener(document.body, 'move', colorMoveDrag);
    customAddEventListener(document.body, 'up', colorEndDrag);
}

function colorEndDrag() {
    customRemoveEventListener(document.body, 'move', colorMoveDrag)
    customRemoveEventListener(document.body, 'up', colorEndDrag)
}

function colorMoveDrag(ev) {
    ev.preventDefault();
    const rect = canvas.getBoundingClientRect();
    let pos = getPosition(ev);
    posSample = {
        x: Math.floor(pos.x - rect.left),
        y: Math.floor(pos.y - rect.top)
    };
    if (posSample.x < 0) posSample.x = 0;
    if (posSample.x > rect.width) posSample.x = rect.width - 1;
    if (posSample.y < 0) posSample.y = 0;
    if (posSample.y > rect.height) posSample.y = rect.height - 1;
    updateCanvas();
}

function getWheelCenter() {
    // Compute the coordinates of the wheel's center
    const rect = wheel.getBoundingClientRect();
    wheelCenter = {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2
    };
}

function getPosition(ev) {
    getWheelCenter();
    let pos = {};
    if (ev.targetTouches) {
        // Touch event
        pos.x = ev.targetTouches[0].clientX;
        pos.y = ev.targetTouches[0].clientY;
    } else {
        // Mouse or Pointer event
        pos.x = ev.clientX;
        pos.y = ev.clientY;
    }
    // console.log(pos.x, pos.y)
    return pos;
}

function customAddEventListener(el, evt, fct) {
    if (window.PointerEvent) {
        // Pointer event listener
        el.addEventListener(`pointer${evt}`, fct, false);
    } else {
        // Touch listener
        el.addEventListener(`touch${evt}`, fct, false);

        // Mouse listener
        el.addEventListener(`mouse${evt}`, fct, false);
    }
}

function customRemoveEventListener(el, evt, fct) {
    if (window.PointerEvent) {
        // Pointer event listener
        el.removeEventListener(`pointer${evt}`, fct);
    } else {
        // Touch listener
        el.removeEventListener(`touch${evt}`, fct);

        // Mouse listener
        el.removeEventListener(`mouse${evt}`, fct);
    }
}

function getPixelColor() {
    let imgDataObj = ctx.getImageData(posSample.x, posSample.y, 1, 1);
    let data = imgDataObj.data;
    let clr = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
    root.style.setProperty('--color-picked', clr);
    colorPicked.dataset.colorPicked = clr;
    colorPicked.dataset.angle1 = window.getComputedStyle(root).getPropertyValue('--hue-rotation').trim(); // 0-360 deg
    colorPicked.dataset.angle2 = window.getComputedStyle(root).getPropertyValue('--hue-rotation-2').trim(); //-180 180 deg
    colorPicked.dataset.canvasX = posSample.x;
    colorPicked.dataset.canvasY = posSample.y;
}

function drawCircle() {
    // récupère les infos CSS
    const r = Math.floor(parseInt(window.getComputedStyle(hueSample).width) * .5);
    const bdrWidth = parseInt(window.getComputedStyle(hueSample).borderLeftWidth);
    const bdrColor = window.getComputedStyle(hueSample).borderLeftColor;
    ctx.strokeStyle = bdrColor;
    ctx.lineWidth = bdrWidth;
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.ellipse(posSample.x, posSample.y, r, r, 0, 0, 2 * Math.PI);
    ctx.stroke();
}

function updateCanvas() {
    // display hue rotation value
    let angle = window.getComputedStyle(root).getPropertyValue('--hue-rotation-2');
    if (parseInt(angle) < 0) angle = `${parseInt(angle) + 360}deg`;
    rotationValue.innerText = angle.replace('deg','°');
    let clr = window.getComputedStyle(canvas).backgroundColor;
    // erase canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // background color
    ctx.fillStyle = clr;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // white/transparent gradient
    ctx.globalCompositeOperation = 'luminosity';
    let gradientH = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradientH.addColorStop(0, 'hsl(0, 0%, 100%)'); // white
    gradientH.addColorStop(1, 'hsla(0, 0%, 100%, 0)'); // transparent white
    ctx.fillStyle = gradientH;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // black/transparent gradient
    ctx.globalCompositeOperation = 'luminosity';
    let gradientV = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradientV.addColorStop(0, 'hsla(0, 0%, 0%, 0)'); // transparent black
    gradientV.addColorStop(1, 'hsl(0, 0%, 0%)'); // black
    ctx.fillStyle = gradientV;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCircle();
    getPixelColor()
}

// stores the coordinates of the wheel's center (to cumpute the angle of rotation)
let wheelCenter;
getWheelCenter();
// stores the coordinates of the selected color in the canvas
let posSample;
let colorSwatches;

window.addEventListener("load", e => {

    canvas.width = parseInt(window.getComputedStyle(canvas).width);
    canvas.height = parseInt(window.getComputedStyle(canvas).height);

    // Initiate the selected color (by default center of the canvas)
    posSample = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };
    updateCanvas();

    customAddEventListener(hueSample, 'down', hueStartDrag);
    customAddEventListener(canvas, 'down', colorStartDrag);

    // ----------------------------------------------Color swatches
    colorSwatches = new Swatches(document.querySelector('#swatches'));
    btnNewSwatch.addEventListener('click', e => colorSwatches.addSwatch(), false);
 
    const popu = document.querySelector('#populate')
    popu.addEventListener('click', populate, false)
}, false);



// ----------------------------------------------Utility functions
function notif(message){
    const notif = document.querySelector('.notif');
    notif.innerText = message;
    notif.classList.add('visible');
    notif.addEventListener('transitionend', notifUp, false)
}

function notifUp() {
    this.classList.remove('visible');
    this.removeEventListener('transitionend', notifUp);
}


function populate() {
    let objs = [{
        clr: [74, 142, 201],
        angle: 208,
        raw: -152,
        x: 99,
        y: 33
    },
    {
        clr: [164,177,29],
        angle: 65,
        raw: 65,
        x: 130,
        y: 48
    },
    {
        clr: [209,65,142],
        angle: 328,
        raw: -32,
        x: 108,
        y: 28
    },
    {
        clr: [203,94,26],
        angle: 23,
        raw: 23,
        x: 137,
        y: 32
    }];
    objs.forEach(o => {
        colorPicked.dataset.colorPicked = `rgb(${o.clr.join(',')})`;
        colorPicked.dataset.angle1 = `${o.angle}deg`;
        colorPicked.dataset.angle2 = `${o.raw}deg`;
        colorPicked.dataset.canvasX = o.x;
        colorPicked.dataset.canvasY = o.y;
        
        colorSwatches.addSwatch()
    })
}