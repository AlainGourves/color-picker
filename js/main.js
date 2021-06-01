const root = document.documentElement;
const light = document.querySelector('#light');
const wheel = document.querySelector('.wheel');
const hueSample = document.querySelector('.sample');
const canvas = document.querySelector('#canvas');
let ctx;

let dragging = false;
let touch = false;
let center;

function updateLigthness(l) {
    root.style.setProperty('--light', l / 100);
    light.value = l;
}

function rangeChange(ev) {
    let l = ev.target.value;
    updateLigthness(l);
}

// Touch events
function hueTouchStartDrag(ev) {
    touch = true;
    hueStartDrag(ev);
}

function hueStartDrag(ev) {
    dragging = true;
    center = getElementCenter(wheel);
    // Attach event listeners for 'mousemove' & 'mouseup'
    document.body.addEventListener('mousemove', hueDragging);
    document.body.addEventListener('mouseup', hueEndDrag);
    document.body.addEventListener('touchmove', hueDragging);
    document.body.addEventListener('touchend', hueEndDrag);
}

function hueEndDrag() {
    if (dragging) {
        document.body.removeEventListener('mousemove', hueDragging);
        document.body.removeEventListener('mouseup', hueEndDrag);
        dragging = false;
    }
}

function hueDragging(ev) {
    if (dragging) {
        let pos = {};
        if (touch) {
            pos = {
                x: ev.touches[0].clientX,
                y: ev.touches[0].clientY
            };
        } else {
            pos = {
                x: ev.clientX,
                y: ev.clientY
            };
        }
        let angle = Math.round((Math.atan2(pos.y - center.y, pos.x - center.x) * 180) / Math.PI);
        if (angle < 0) angle += 360;
        root.style.setProperty('--hue-rotation', `${angle}deg`);
        // update canvas
        drawCanvas(`hsl(${angle + 90}, 100%, 50%)`);
    }
}

function getElementCenter(el) {
    const rect = el.getBoundingClientRect();
    return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2
    };
}

function getPixelPos(ev) {
    const rect = canvas.getBoundingClientRect();
    // console.log(rect)
    console.log(ev)
    const pos = {
        x: Math.floor(ev.clientX - rect.left),
        y: Math.floor(ev.clientY - rect.top)
    };
    console.log(pos)
    // return pos;
    let n = ((pos.y * rect.width) + pos.x) * 4;
    let imgDataObj = ctx.getImageData(pos.x, pos.y, 1, 1);
    let data = imgDataObj.data;
    console.log(`rgb(${data[0]}, ${data[1]}, ${data[2]})`);
    drawCircle(pos);
}

function drawCircle(pos) {
    // pos -> {x, y}
    // récupère les infos CSS
    const r = parseInt(window.getComputedStyle(hueSample).paddingLeft);
    const bdrWidth = parseInt(window.getComputedStyle(hueSample).borderLeftWidth);
    const bdrColor = window.getComputedStyle(hueSample).borderLeftColor;
    ctx.strokeStyle = bdrColor;
    ctx.lineWidth = bdrWidth;
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y, r, r, 0, 0, 2 * Math.PI);
    ctx.stroke();
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
}

window.addEventListener("load", e => {
    ctx = canvas.getContext('2d');
    canvas.width = parseInt(window.getComputedStyle(canvas).width);
    canvas.height = parseInt(window.getComputedStyle(canvas).height);

    // Récupère la couleur de fond
    let clr = window.getComputedStyle(canvas).backgroundColor;
    drawCanvas(clr);
    let pos = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };
    drawCircle(pos);

    canvas.addEventListener('click', getPixelPos);

    hueSample.addEventListener('mousedown', hueStartDrag);
    hueSample.addEventListener('touchstart', hueTouchStartDrag);
});