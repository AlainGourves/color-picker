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
        if (!Swatch.#copyList.style.display || Swatch.#copyList.style.display === 'none') Swatch.#copyList.style.display = 'block';
        Swatch.theSwatches.push(this);
    }

    getClick(ev) {
        let self = this;
        if (ev.target.nodeName == 'BUTTON') {
            let fn = ev.target.dataset.function;
            console.log(fn)
            switch (fn) {
                case 'options':
                    this.el.classList.add('tools');
                    break;
                case 'load':
                    this.loadSwatch();
                    break;
                case 'copy':
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
            // TODO supprimer l'instance du array de swatches
            // let swatches = swContainer.querySelectorAll('.swatch');
            // if (swatches.length === 0) copyList.style.display = 'none';
        }, false);
    }

    loadSwatch() {
        document.documentElement.style.setProperty('--hue-rotation', this.angle);
        window.posSample.x = this.x;
        window.posSample.y = this.y;
        window.hueSample.classList.add('load-swatch');
        window.updateCanvas();
        window.hueSample.classList.remove('load-swatch');
    }

    // getSwatch(ev) {
    //     if (ev.target.classList.contains('btn')) {
    //         let tg = ev.target;
    //         // get the parent .swatch of the clicked button
    //         do {
    //             tg = tg.parentNode;
    //         } while(!tg.classList.contains('swatch'))
    //         let swatch = tg;
    //         if (ev.target.classList.contains('clear')) {
    //             // Btn to delete swatch
    //             swatch.classList.add('cleared');
    //             swatch.addEventListener('transitionend', e => {
    //                 swatch.remove();
    //                 let swatches = swContainer.querySelectorAll('.swatch');
    //                 if (swatches.length === 0) copyList.style.display = 'none';
    //             }, false);
    //         } else if (ev.target.classList.contains('copy')) {
    //             // Btn to copy rbg value to clipboard
    //             let clr = swatch.dataset.bgColor;
    //             toClipboard(clr);
    //         } else if (ev.target.classList.contains('load')) {
    //             // Btn to load the swatch' color in the color picker
    //             loadSwatch(swatch);
    //         } else if (ev.target.classList.contains('cog')) {
    //             displayTools(swatch);
    //         }
    //     }
    // }

    cons() {
        console.log("Dragstart ?")
    }

}

export default Swatch;