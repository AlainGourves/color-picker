function addDiv(ev) {
    const template = document.getElementById('tmpl_swatch');
    const clone = template.content.firstElementChild.cloneNode(true);

    let color = parseInt('f14b16', 16) + compteur * 10;
    color = '#' + color.toString(16);
    clone.dataset.bgColor = color;

    clone.style.backgroundColor = color;

    swatchesContainer.insertBefore(clone, swatchesContainer.querySelector('.copyList'));
    compteur++;
}

function getSwatch(ev) {
    // get the parent .swatch from the clicked button
    if (ev.target.classList.contains('btn')) {
        let swatch = ev.target.parentNode.parentNode;
        if (ev.target.classList.contains('cleared')) {
            swatch.classList.add('cleared');
            swatch.addEventListener('transitionend', e => {
                console.log(this)
                swatch.remove();
            }, false);
        } else if (ev.target.classList.contains('copy')) {
            let hex = swatch.dataset.bgColor;
            toClipboard(hex);
        }
    }
}

async function toClipboard(code) {
    if (navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(code);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    } else {
        // alternative method with `document.execCommand('copy')`
        const pasteboard = document.createElement('input');
        pasteboard.setAttribute('readonly', 'readonly');
        pasteboard.className = 'hidden';
        pasteboard.value = code;
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
    }
}

function exportColorList(e) {
    const sw = swatchesContainer.querySelectorAll('.swatch');
    let list = [];
    sw.forEach(e => {
        list.push(e.dataset.bgColor);
    });
    console.log(list.join(', '));
}

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
    // return false;
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

const theButtonPlus = document.querySelector('button.plus');
theButtonPlus.addEventListener('click', addDiv, false);
let compteur;


const swatchesContainer = document.querySelector('#swatches');
const copyList = document.querySelector('.copyList');
// reference to the dragged swatch
let dragSrcEl;

window.addEventListener("load", e => {
    compteur = 1;

    swatchesContainer.addEventListener('dragstart', swatchesDragHandle, false);
    swatchesContainer.addEventListener('click', getSwatch, false);
    copyList.addEventListener('click', exportColorList, false);
});