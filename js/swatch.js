class Swatch {
    static container = document.querySelector('.swatches__container');
    static #copyList = document.querySelector('.copyList');
    static #template = document.getElementById('tmpl_swatch');
    static theSwatches = [];

    constructor(color) {
        this.color = color.dataset.colorPicked;
        this.angle = color.dataset.angle;
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
        clone.dataset.angle = this.angle;
        clone.dataset.canvasX = this.x;
        clone.dataset.canvasY = this.y;
        clone.style.backgroundColor = this.color;
        let btns = clone.querySelector('.btns');
        btns.addEventListener('click', this.getClick.bind(this), false);
        this.el = Swatch.container.appendChild(clone);
        if (!Swatch.#copyList.style.display || Swatch.#copyList.style.display === 'none') {
            Swatch.#copyList.style.display = 'block';
        }
        Swatch.theSwatches.push(this);
    }

    getClick(ev) {
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
                    let clr = this.color;
                    Swatch.toClipboard(clr);
                    break;
                case 'delete':
                    this.deleteSwatch();
                    break;
                default:
                    return false;
            }
        } else {
            // TODO enlever class 'tools' quand nécessaire
            return;
        }
    }

    deleteSwatch() {
        this.el.classList.add('cleared');
        this.el.addEventListener('transitionend', e => {
            // NB: transitionend is fired twice, once for each property (opacity & transform)
            this.el.remove();
        }, false);
        // Remove the swatch from the array theSwatches
        let delenda = this.id;
        Swatch.theSwatches = Swatch.theSwatches.filter(sw => {
            return sw.id !== delenda;
        });
        if (Swatch.theSwatches.length === 0) {
            Swatch.#copyList.style.display = 'none';
        }
    }

    loadSwatch() {
        document.documentElement.style.setProperty('--hue-rotation', this.angle);
        posSample.x = this.x;
        posSample.y = this.y;
        hueSample.classList.add('load-swatch');
        updateCanvas();
        hueSample.classList.remove('load-swatch');
    }

    static async toClipboard(src) {
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

    static exportColorList() {
        let list = Swatch.theSwatches.map(sw => {
            return sw.color;
        });
        Swatch.toClipboard(list);
    }
}
