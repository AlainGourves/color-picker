class Swatch {
    static container = document.querySelector('.swatches__container');
    static #copyList = document.querySelector('.copyList');
    static #template = document.getElementById('tmpl_swatch');
    // static theSwatches = [];
    static isPads = false;
    static draggedEl = undefined;
    static draggedSwatchIdx = -1;
    static dataTrans = new DataTransfer(); // holds data being dragged during drag&drop


    constructor(color) {
        this.color = color.dataset.colorPicked;
        this.angle = color.dataset.angle;
        this.raw = color.dataset.rawAngle;
        this.x = color.dataset.canvasX;
        this.y = color.dataset.canvasY;
        this.el;
        // Compute a unique ID for the swatch
        this.id = Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
        this.create();
    }

    create() {
        // create element
        const clone = Swatch.#template.content.firstElementChild.cloneNode(true);
        clone.dataset.bgColor = this.color;
        clone.dataset.id = this.id;
        clone.style.backgroundColor = this.color;
        //clone.addEventListener('click', this.getClick.bind(this), false);
        this.el = Swatch.container.appendChild(clone);
        if (!Swatch.#copyList.style.display || Swatch.#copyList.style.display === 'none') {
            Swatch.#copyList.style.display = 'block';
        }
        // Swatch.theSwatches.push(this);
    }

    static getClick(ev) {
        let tg = ev.target;
        // get the parent .swatch of the clicked button
        while (!tg.classList.contains('swatch')) {
            tg = tg.parentNode;
        }
        let swatch = tg;
        let id = swatch.dataset.id
        console.log('???', swatch instanceof Swatch)
        if (ev.target.nodeName == 'BUTTON') {
            let fn = ev.target.dataset.function;
            switch (fn) {
                case 'options':
                    this.el.classList.add('tools');
                    break;
                case 'load':
                    this.loadSwatch();
                    break;
                case 'copy':
                    Swatch.toClipboard(this.color);
                    break;
                case 'delete':
                    this.deleteSwatch();
                    break;
                default:
                    return false;
            }
        } else {
            if (this.el.classList.contains('tools')) {
                this.el.classList.remove('tools');
            }
            return;
        }
    }

    deleteSwatch() {
        this.el.classList.add('cleared');
        this.el.addEventListener('transitionend', e => {
            // NB: transitionend is fired twice, once for each property (opacity & transform)
            this.el.remove();
            let swatches = Swatch.container.querySelectorAll('.swatch');
            if (swatches.length === 0) {
                Swatch.#copyList.style.display = 'none';
            }
        }, false);
    }

    loadSwatch() {
        console.log('angle:', this.angle, ' raw:', this.raw)
        let bim = root.style.getPropertyValue('--hue-rotation')
        let diff = parseInt(bim) - parseInt(this.angle)
        console.log('diff=>', diff)
        if (Math.abs(diff) > 180) {
            document.documentElement.style.setProperty('--hue-rotation', this.raw);
        } else {
            document.documentElement.style.setProperty('--hue-rotation', this.angle);
        }
        posSample.x = this.x;
        posSample.y = this.y;
        let theWheel = document.querySelector('#wheel__container');
        theWheel.classList.add('load-swatch');
        updateCanvas();
        setTimeout(() => {
            theWheel.classList.remove('load-swatch');
        }, 500);
    }

    static async toClipboard(src) {
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

    static exportColorList() {
        let swatches = Swatch.container.querySelectorAll('.swatch');
        let list = Array.from(swatches).map(sw => {
            return sw.dataset.bgColor;
        });
        Swatch.toClipboard(list);
    }

    // DRAG & DROP

    static swatchDragStart(e) {
        Swatch.container.classList.add('dragged');
        if (!Swatch.isPads) {
            Swatch.createPads();
        }
        Swatch.container.addEventListener('dragenter', Swatch.swatchDragEnter, false);
        Swatch.container.addEventListener('dragover', Swatch.swatchDragOver, false);
        Swatch.container.addEventListener('dragleave', Swatch.swatchDragLeave, false);
        Swatch.container.addEventListener('dragend', Swatch.swatchDragEnd, false);
        Swatch.container.addEventListener('drop', Swatch.swatchDrop, false);
        Swatch.draggedEl = e.target;


        Swatch.dataTrans.effectAllowed = 'move';
        Swatch.dataTrans.setData('text/html', Swatch.draggedEl.outerHTML);
        Swatch.dataTrans.dropEffect = 'move';

        // Get the index of the dragged swatch
        let swatches = Swatch.container.querySelectorAll('.swatch');
        Swatch.draggedSwatchIdx = Array.from(swatches).findIndex(sw => sw === Swatch.draggedEl);
        if (Swatch.draggedSwatchIdx !== -1) {
            Swatch.draggedEl.style.opacity = '.4';
        } else {
            throw new Error('Index of Swatch not found');
        }
    }

    static swatchDragEnter(e) {
        if (e.target.classList.contains('swatch') || e.target.classList.contains('swatch__pad')) {
            e.target.classList.add('over');
        }
    }

    static swatchDragOver(e) {
        // necessary to make the drop event possible !!
        e.preventDefault();
    }

    static swatchDragLeave(e) {
        if (e.target.classList.contains('swatch') || e.target.classList.contains('swatch__pad')) {
            e.target.classList.remove('over');
        }
    }

    static swatchDragEnd(e) {
        // remove events listeners
        Swatch.container.removeEventListener('dragenter', Swatch.swatchDragEnter);
        Swatch.container.removeEventListener('dragover', Swatch.swatchDragOver);
        Swatch.container.removeEventListener('dragleave', Swatch.swatchDragLeave);
        Swatch.container.removeEventListener('dragend', Swatch.swatchDragEnd);
        Swatch.container.removeEventListener('drop', Swatch.swatchDrop);
        Swatch.postDragCleaning();
    }

    static swatchDrop(e) {
        e.preventDefault();
        if (e.target !== Swatch.draggedEl) {
            let swatches = Swatch.container.getElementsByClassName('swatch');
            console.log(swatches)
            // Uses `getElementsByClassName()` to create a live nodelist (vs. 'static')
            // cf. https://developer.mozilla.org/en-US/docs/Web/API/NodeList
            if (e.target.classList.contains('swatch')) {
                // Swatches position are swapped
                swatches[Swatch.draggedSwatchIdx].outerHTML = e.target.outerHTML;
                e.target.outerHTML = Swatch.dataTrans.getData('text/html');
            } else if (e.target.classList.contains('swatch__pad')) {
                // Swatch was dropped on a pad
                // get dropped pad idx
                let pads = Swatch.container.querySelectorAll('.swatch__pad');
                // `pads` is a nodeList -> convert to array
                let padIdx = Array.from(pads).findIndex(p => p === e.target);
                if (padIdx !== -1) {
                    if (padIdx == swatches.length) {
                        // swatch moved to the end
                        swatches.appendChild(swatches[Swatch.draggedSwatchIdx]);
                    } else {
                        let old = swatches.replaceChild(swatches[Swatch.draggedSwatchIdx], swatches[padIdx]);
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
            // Swatch.theSwatches.forEach(sw => {
            //     console.log('>>>', this)
            //     this.addListeners(sw.el);
            // });
        }
        Swatch.postDragCleaning();
    }


    // Utility functions
    static createPads() {
        // place a landing pad before every swatch
        let swatches = Swatch.container.querySelectorAll('.swatch');
        swatches.forEach(sw => {
            const pad = document.createElement('div');
            pad.className = 'swatch__pad';
            Swatch.container.insertBefore(pad, sw);
        });
        // and one last at the end
        const pad = document.createElement('div');
        pad.className = 'swatch__pad last';
        Swatch.container.append(pad);
        Swatch.isPads = true;
    }

    static deletePads() {
        let pads = Swatch.container.querySelectorAll('.swatch__pad');
        pads.forEach(p => {
            p.remove();
        });
        Swatch.isPads = false;
    }

    static postDragCleaning() {
        if (Swatch.draggedEl !== undefined) {
            Swatch.deletePads();
            Swatch.draggedEl.style.opacity = '1';
            Swatch.draggedEl = undefined;
            Swatch.draggedSwatchIdx = -1;
        }
        Swatch.container.classList.remove('dragged');
        // remove 'over' classes
        Swatch.container.querySelectorAll('.swatch').forEach(c => c.classList.remove('over'));
    }
}