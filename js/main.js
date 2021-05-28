const root = document.documentElement;
const light = document.querySelector('#light');
const wheel = document.querySelector('.wheel');
const hueSample = document.querySelector('.sample-hue');
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
    console.log(ev)
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
        console.log(angle)
        root.style.setProperty('--hue-rotation', `${angle}deg`);
        // get the corresponding color
    }
}

function getElementCenter(el) {
    const rect = el.getBoundingClientRect();
    return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2
    };
}

window.addEventListener("load", e => {
    let l = window.getComputedStyle(root).getPropertyValue('--light');
    updateLigthness(parseInt(l));
    light.addEventListener('input', rangeChange);

    hueSample.addEventListener('mousedown', hueStartDrag);
    hueSample.addEventListener('touchstart', hueTouchStartDrag);
});