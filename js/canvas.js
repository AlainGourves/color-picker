const canvas = document.querySelector('#canvas');
let ctx;

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
    let imgDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imgDataObj.data;
    console.log(data[n], data[n + 1], data[n + 2], data[n + 3])
}

function drawCanvas(clr) {
    // erase canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // background color
    ctx.fillStyle = clr;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // white/transparent gradient
    ctx.globalCompositeOperation = 'lighten';
    let gradientH = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradientH.addColorStop(0, 'white');
    gradientH.addColorStop(1, 'transparent');
    ctx.fillStyle = gradientH;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // black/transparent gradient
    ctx.globalCompositeOperation = 'darken';
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

    canvas.addEventListener('click', getPixelPos)
});