const root = document.documentElement;
const wheel = document.querySelector('.wheel');
const rotationValue = document.querySelector('.hue__rotation-content');
const hueSample = document.querySelector('.sample');
const colorPicked = document.querySelector('.picked-color');
const btnNewSwatch = document.querySelector('#wheel__container > button');
const canvas = document.querySelector('#canvas');
let ctx;


// handle the hue rotation value text flipping around the wheel
let isFlipped = false;
let prevRotationMatrix = [];

// stores the coordinates of the wheel's center (to cumpute the angle of rotation)
let wheelCenter;
// stores the coordinates of the selected color in the canvas
let posSample;

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
    let angle = Math.round((Math.atan2(pos.y - wheelCenter.y, pos.x - wheelCenter.x) * 180) / Math.PI);
    if (angle < 0) angle += 360;
    if (angle === -0) angle = 0;
    root.style.setProperty('--hue-rotation', `${angle}deg`); // don't forget the 'deg'' unit !
    
    // if (angle >= 0 && angle < 180 && !isFlipped) {
    //     /* Between 0 & 180 degrees, the text is flipped, we need to compute a new transformation matrix as it's not possible to simply add a new class : the different transformations must be chained.
    //     */
    //     // stores previous rotation matrix
    //     let m = window.getComputedStyle(rotationValue).transform; // "matrix(a,b,c,d,e,f)"
    //     m = m.replace(/matrix\((.*)\)/, '$1').split(',');
    //     m.forEach((el, idx) => {
    //         prevRotationMatrix[idx] = parseFloat(el);
    //     });
    //     // computes new rotation matrix
    //     const flipMatrix = [-1, 0, 0, -1]; // rotation matrix for "rotateZ(180deg)"
    //     let newMatrix = [];
    //     newMatrix[0] = (prevRotationMatrix[0] * flipMatrix[0]) + (prevRotationMatrix[2] * flipMatrix[1]);
    //     newMatrix[1] = (prevRotationMatrix[1] * flipMatrix[0]) + (prevRotationMatrix[3] * flipMatrix[1]);
    //     newMatrix[2] = (prevRotationMatrix[0] * flipMatrix[2]) + (prevRotationMatrix[2] * flipMatrix[3]);
    //     newMatrix[3] = (prevRotationMatrix[1] * flipMatrix[2]) + (prevRotationMatrix[3] * flipMatrix[3]);
    //     newMatrix[4] = parseFloat(prevRotationMatrix[4]);
    //     newMatrix[5] = parseFloat(prevRotationMatrix[5]);
    //     rotationValue.style.setProperty('transform', `matrix(${newMatrix.join(',')})`);

    //     isFlipped = true;
    // }
    // if (angle >= 180 && angle <360 && isFlipped) {
    //     // restores previous rotation matrix
    //     rotationValue.style.setProperty('transform', `matrix(${prevRotationMatrix.join(',')})`);
        
    //     isFlipped = false;
    // }
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

function getWheelCenter(){
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
    colorPicked.dataset.angle = root.style.getPropertyValue('--hue-rotation');
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
    rotationValue.innerText = getComputedStyle(root).getPropertyValue('--hue-rotation')
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

// ----------------------------------------------Color swatches
const swatchesContainer = document.querySelector('#swatches');
const copyList = document.querySelector('.copyList');
// reference to the dragged swatch
let dragSrcEl;

// Drag events handlers
function handleDragEnd(e) {
    let swatches = swatchesContainer.querySelectorAll('.swatch');
    swatches.forEach(s => {
        s.classList.remove('over');
        //remove event listeners
        s.removeEventListener('dragenter', handleDragEnter);
        s.removeEventListener('dragover', handleDragOver);
        s.removeEventListener('dragleave', handleDragLeave);
        s.removeEventListener('dragend', handleDragEnd);
        s.removeEventListener('drop', handleDrop);
    });
    this.style.opacity = '1';
}

function handleDragEnter(e) {
    this.classList.add('over');
}

function handleDragOver(e) {
    // necessary to make the drop event possible !!
    e.preventDefault();
}

function handleDragLeave(e) {
    this.classList.remove('over');
}

function handleDrop(e) {
    if (dragSrcEl !== this) {
        dragSrcEl.outerHTML = this.outerHTML;
        this.outerHTML = e.dataTransfer.getData('text/html');
    }
}

function swatchesDragHandle(e) {
    let swatches = swatchesContainer.querySelectorAll('.swatch');
    swatches.forEach(s => {
        if (s === e.target) {
            dragSrcEl = s;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.dropEffect = 'move';
            e.dataTransfer.setData('text/html', s.outerHTML);
            s.style.opacity = '0.4';
        }
        s.addEventListener('dragenter', handleDragEnter, false);
        s.addEventListener('dragover', handleDragOver, false);
        s.addEventListener('dragleave', handleDragLeave, false);
        s.addEventListener('dragend', handleDragEnd, false);
        s.addEventListener('drop', handleDrop, false);
    });
}

function addSwatch(ev) {
    const template = document.getElementById('tmpl_swatch');
    const clone = template.content.firstElementChild.cloneNode(true);
    clone.dataset.bgColor = colorPicked.dataset.colorPicked;
    clone.dataset.angle = colorPicked.dataset.angle;
    clone.dataset.canvasX = colorPicked.dataset.canvasX;
    clone.dataset.canvasY = colorPicked.dataset.canvasY;
    clone.style.backgroundColor = colorPicked.dataset.colorPicked;
    swatchesContainer.insertBefore(clone, swatchesContainer.querySelector('.copyList'));
}

function loadSwatch(swatch){
    let angle = swatch.dataset.angle;
    root.style.setProperty('--hue-rotation', angle);
    posSample.x = swatch.dataset.canvasX;
    posSample.y = swatch.dataset.canvasY;
    hueSample.classList.add('load-swatch');
    updateCanvas();
    hueSample.classList.remove('load-swatch');
}

function getSwatch(ev) {
    // get the parent .swatch from the clicked button
    if (ev.target.classList.contains('btn')) {
        let swatch = ev.target.parentNode.parentNode.parentNode;
        if (ev.target.classList.contains('clear')) {
            swatch.classList.add('cleared');
            swatch.addEventListener('transitionend', e => {
                swatch.remove();
            }, false);
        } else if (ev.target.classList.contains('copy')) {
            let clr = swatch.dataset.bgColor;
            toClipboard(clr);
        } else if (ev.target.classList.contains('load')) {
            loadSwatch(swatch);
        } else if (ev.target.classList.contains('cog')) {
            displayTools(swatch);
        }
    }
}

function displayTools(clickedSwatch){
    const swatches = swatchesContainer.querySelectorAll('.swatch');
    swatches.forEach(sw => {
        if (sw === clickedSwatch) {
            sw.classList.add('tools');
        }else{
            sw.classList.remove('tools');
        }
    })
}

async function toClipboard(src) {
    let message;
    let type = typeof(src);
    if (type === 'string'){
        // single color
        message = "Color copied to clipboard";
    }else{
        // list of colors
        // src = src.join(', '); // comma separated list
        src = src.join('\n');
        message = "List of colors copied to clipboard";
    }
    if (navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(src);
            notif(message);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    } else {
        // alternative method with `document.execCommand('copy')`
        const pasteboard = document.createElement('input');
        pasteboard.setAttribute('readonly', 'readonly');
        pasteboard.className = 'hidden';
        pasteboard.value = src;
        document.body.appendChild(pasteboard);
        // save & restore user's selection
        const selected = (document.getSelection().rangeCount > 0) ? document.getSelection().getRangeAt(0) : false;
        pasteboard.select();
        const result = document.execCommand('copy');
        document.body.removeChild(pasteboard);
        if (selected) {
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(selected);
        }
        notif(message);
    }
}

function exportColorList(e) {
    const sw = swatchesContainer.querySelectorAll('.swatch');
    let list = [];
    sw.forEach(e => {
        list.push(e.dataset.bgColor);
    });
    toClipboard(list);
}

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

// ----------------------------------------------Page Load
window.addEventListener("load", e => {

    getWheelCenter();

    ctx = canvas.getContext('2d');
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
    btnNewSwatch.addEventListener('click', addSwatch, false);
    swatchesContainer.addEventListener('dragstart', swatchesDragHandle, false);
    swatchesContainer.addEventListener('click', getSwatch, false);
    copyList.addEventListener('click', exportColorList, false);
}, false);