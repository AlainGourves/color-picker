const canvas = document.querySelector('#canvas');
const hueSample = document.querySelector('.sample');

let ctx;
let clrDrag = false;

function getPixelPos(ev) {
    const rect = canvas.getBoundingClientRect();
    // console.log(rect)
    const pos = {
        x: Math.floor(ev.clientX - rect.left),
        y: Math.floor(ev.clientY - rect.top)
    };
    console.log(pos)
    let imgDataObj = ctx.getImageData(pos.x, pos.y, 1, 1);
    let data = imgDataObj.data;
    console.log(`rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3]/255})`)
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
    gradientH.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradientH;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // black/transparent gradient
    ctx.globalCompositeOperation = 'multiply';
    let gradientV = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradientV.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradientV.addColorStop(1, 'black');
    ctx.fillStyle = gradientV;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function test() {
    //var ctx = document.getElementById('canvas').getContext('2d');
    const r = window.getComputedStyle(hueSample).paddingLeft;
    const bdrWidth = window.getComputedStyle(hueSample).borderLeftWidth;
    const bdrColor = window.getComputedStyle(hueSample).borderLeftColor;
    ctx.strokeStyle = bdrColor;
    ctx.lineWidth = 4; //bdrWidth;
    ctx.globalCompositeOperation = 'source-over';
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {
            ctx.beginPath();
            //ctx.arc(12.5 + j * 25, 12.5 + i * 25, 10, 0, Math.PI * 2, true);
            ctx.ellipse((i * 40 + 5), j * 40 + 5, 12, 12, 0, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }
}

function colorStartDrag(ev) {
    clrDrag = true;
    // Attach event listeners for 'mousemove' & 'mouseup'
    document.body.addEventListener('mousemove', colorDragging);
    document.body.addEventListener('mouseup', colorEndDrag);
}


function colorEndDrag() {
    if (clrDrag) {
        document.body.removeEventListener('mousemove', colorDragging);
        document.body.removeEventListener('mouseup', colorEndDrag);
        clrDrag = false;
    }
}

function colorDragging(ev) {
    if (clrDrag) {
        const rect = canvas.getBoundingClientRect();
        let pos = {
            x: Math.floor(ev.clientX - rect.left),
            y: Math.floor(ev.clientY - rect.top)
        };
        if (pos.x < 0) pos.x = 0;
        if (pos.x > rect.width) pos.x = rect.width;
        if (pos.y < 0) pos.y = 0;
        if (pos.y > rect.height) pos.y = rect.height;
        // update canvas
        drawCanvas(`hsl(0, 100%, 50%)`);
        drawCircle(pos);
    }
}
window.addEventListener("load", e => {
    ctx = canvas.getContext('2d');
    canvas.width = parseInt(window.getComputedStyle(canvas).width);
    canvas.height = parseInt(window.getComputedStyle(canvas).height);

    // Récupère la couleur de fond
    let clr = window.getComputedStyle(canvas).backgroundColor;
    drawCanvas(clr);

    canvas.addEventListener('mousedown', colorStartDrag);
    // canvas.addEventListener('click', getPixelPos)
});