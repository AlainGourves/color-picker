class Swatches {
    static #swatchTemplate = document.getElementById('tmpl_swatch');

    constructor(el) {
        this.container = el.querySelector('.swatches__container');
        this.export = el.querySelector('.copyList');
        this.exportBtn = this.export.querySelector('button');
        this.theSwatchesIds = [];
        this.draggedSwatch = undefined;
        this.draggedSwatchIdx = -1;
        this.dataTrans = new DataTransfer(); // holds data being dragged during drag&drop
        this.isPads = false

        // Event listeners :
        // 1) clicks on this.container
        this.container.addEventListener('click', this.getClick.bind(this), false);
        // 2) swatches drag&drop
        this.container.addEventListener('dragstart', this.swatchDragStart.bind(this), false);
        // 3) clicks on this.exportBtn
        this.exportBtn.addEventListener('click', this.exportColorList.bind(this), false);
    }

    addSwatch() {
        const clone = Swatches.#swatchTemplate.content.firstElementChild.cloneNode(true);
        clone.dataset.color = colorPicked.dataset.colorPicked;
        clone.dataset.angle = colorPicked.dataset.angle;
        clone.dataset.rawAngle = colorPicked.dataset.rawAngle;
        clone.dataset.x = colorPicked.dataset.canvasX;
        clone.dataset.y = colorPicked.dataset.canvasY;
        // Compute a unique ID for the swatch
        clone.dataset.id = Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
        clone.style.backgroundColor = colorPicked.dataset.colorPicked;
        this.container.appendChild(clone);
        this.theSwatchesIds.push(clone.dataset.id);
        if (!this.export.style.display || this.export.style.display === 'none') {
            this.export.style.display = 'block';
        }
    }

    listSwatches() {
        return this.container.querySelectorAll('.swatch');
    }

    getSwatch(id) {
        let swatches = this.listSwatches();
        return Array.from(swatches).find(sw => sw.dataset.id === id);
    }

    getClick(ev) {
        let tmp = ev.target;
        while (!tmp.classList.contains('swatch')) {
            if (tmp === this.container) return false;
            tmp = tmp.parentNode;
        }
        let swatch = tmp
        if (ev.target.nodeName == 'BUTTON') {
            let fn = ev.target.dataset.function;
            switch (fn) {
                case 'options':
                    swatch.classList.add('tools');
                    break;
                case 'load':
                    this.loadSwatch(swatch);
                    break;
                case 'copy':
                    this.toClipboard(swatch.dataset.color);
                    break;
                case 'delete':
                    this.deleteSwatch(swatch);
                    break;
                default:
                    return false;
            }
        } else {
            if (swatch.classList.contains('tools')) {
                swatch.classList.remove('tools');
            }
            return;
        }
    }

    loadSwatch(sw) {
        // let prev = parseInt(root.style.getPropertyValue('--hue-rotation'))
        // let next = parseInt(sw.dataset.angle)
        // let diff = Math.abs(prev - next)
        // console.log(prev - next)
        // if (diff > 180) {
            // console.log('>> ', next - 360)
            // root.style.setProperty('--hue-rotation', `${next - 360}deg`);
        // } else {
            root.style.setProperty('--hue-rotation', sw.dataset.angle);
        // }
        posSample.x = sw.dataset.x;
        posSample.y = sw.dataset.y;
        let theWheel = document.querySelector('#wheel__container');
        theWheel.classList.add('load-swatch');
        updateCanvas();
        setTimeout(() => {
            theWheel.classList.remove('load-swatch');
        }, 500);
    }

    deleteSwatch(sw) {
        sw.classList.add('cleared');
        let id = sw.dataset.id;
        let idx = this.theSwatchesIds.findIndex(v => v === id);
        let once = true;
        sw.addEventListener('transitionend', e => {
            // NB: transitionend is fired twice, once for each property (opacity & transform)
            if (once) {
                sw.remove();
                this.theSwatchesIds.splice(idx, 1);
                let swatches = this.listSwatches();
                if (swatches.length === 0) {
                    this.export.style.display = 'none';
                }
                once = false;
            }
        }, false);
    }

    async toClipboard(src) {
        let message;
        if (typeof (src) === 'string') {
            // single color
            message = "Color copied to clipboard";
        } else {
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

    exportColorList() {
        let swatches = this.listSwatches();
        let list = Array.from(swatches).map(sw => {
            return sw.dataset.color;
        });
        this.toClipboard(list);
    }

    // Drag & Drop
    swatchDragStart(e) {
        this.container.classList.add('dragged');
        if (!this.isPads) this.createPads();
        this.container.addEventListener('dragenter', this.swatchDragEnter, false);
        this.container.addEventListener('dragover', this.swatchDragOver, false);
        this.container.addEventListener('dragleave', this.swatchDragLeave, false);
        this.container.addEventListener('dragend', this.swatchDragEnd.bind(this), false);
        this.container.addEventListener('drop', this.swatchDrop.bind(this), false);
        this.draggedSwatch = e.target;


        this.dataTrans.effectAllowed = 'move';
        this.dataTrans.setData('text/html', this.draggedSwatch.outerHTML);
        this.dataTrans.dropEffect = 'move';

        // Get the index of the dragged swatch
        let swatches = this.listSwatches();
        this.draggedSwatchIdx = Array.from(swatches).findIndex(sw => sw === this.draggedSwatch);
        console.log('idx début:',this.draggedSwatchIdx)
        if (this.draggedSwatchIdx !== -1) {
            this.draggedSwatch.style.opacity = '.4';
        } else {
            throw new Error('Index of Swatch not found');
        }
    }


    swatchDragEnter(e) {
        if (e.target.classList.contains('swatch') || e.target.classList.contains('swatch__pad')) {
            e.target.classList.add('over');
        }
    }

    swatchDragOver(e) {
        // necessary to make the drop event possible !!
        e.preventDefault();
    }

    swatchDragLeave(e) {
        if (e.target.classList.contains('swatch') || e.target.classList.contains('swatch__pad')) {
            e.target.classList.remove('over');
        }
    }

    swatchDragEnd(e) {
        // remove events listeners
        this.container.removeEventListener('dragenter', this.swatchDragEnter);
        this.container.removeEventListener('dragover', this.swatchDragOver);
        this.container.removeEventListener('dragleave', this.swatchDragLeave);
        this.container.removeEventListener('dragend', this.swatchDragEnd);
        this.container.removeEventListener('drop', this.swatchDrop);
        this.postDragCleaning();
    }

    swatchDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        let swatches = this.listSwatches();
        if (e.target !== this.draggedSwatch) {
            console.log('idx:', this.draggedSwatchIdx, swatches, e.target)
            if (e.target.classList.contains('swatch')) {
                // Swatches position are swapped
                if (this.draggedSwatchIdx !== -1){
                    swatches[this.draggedSwatchIdx].outerHTML = e.target.outerHTML;
                    e.target.outerHTML = this.dataTrans.getData('text/html');
                }
            } else if (e.target.classList.contains('swatch__pad')) {
                // Swatch was dropped on a pad
                // get dropped pad idx
                let pads = this.container.querySelectorAll('.swatch__pad');
                // `pads` is a nodeList -> convert to array
                let padIdx = Array.from(pads).findIndex(p => p === e.target);
                if (padIdx !== -1) {
                    if (padIdx == swatches.length) {
                        // swatch moved to the end
                        swatches.appendChild(swatches[this.draggedSwatchIdx]);
                    } else {
                        let old = swatches.replaceChild(swatches[this.draggedSwatchIdx], swatches[padIdx]);
                        if (padIdx >= draggedSwatchIdx) {
                            swatches.insertBefore(old, swatches[padIdx]);
                        } else {
                            swatches.insertBefore(old, swatches[padIdx + 1]);
                        }
                    }
                } else {
                    throw new Error('Unknown pad index');
                }
            }
        }else{
            console.log('Hey Ducon !!!!')
        }
        // this.postDragCleaning();
    }

    // Utility functions
    createPads() {
        // place a landing pad before every swatch
        let swatches = this.listSwatches();
        swatches.forEach(sw => {
            const pad = document.createElement('div');
            pad.className = 'swatch__pad';
            this.container.insertBefore(pad, sw);
        });
        // and one last at the end
        const pad = document.createElement('div');
        pad.className = 'swatch__pad last';
        this.container.append(pad);
        this.isPads = true;
    }

    deletePads() {
        let pads = this.container.querySelectorAll('.swatch__pad');
        pads.forEach(p => p.remove());
        this.isPads = false;
    }

    postDragCleaning() {
        // remove 'over' classes
        let swatches = this.listSwatches();
        swatches.forEach(c => c.classList.remove('over'));
        this.container.classList.remove('dragged');
        if (this.draggedSwatch !== undefined) {
            console.log('cleaning')
            this.draggedSwatch.style.opacity = '1';
            this.draggedSwatch = undefined;
            this.draggedSwatchIdx = -1;
            this.deletePads();
        }
    }
}