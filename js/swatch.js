class Swatch {
    static container = document.querySelector('.swatches__container');
    static #copyList = document.querySelector('.copyList');
    static #template = document.getElementById('tmpl_swatch');

    constructor(color) {
        this.color = color.dataset.colorPicked;
        this.angle = color.dataset.angle;
        this.x = color.dataset.canvasX;
        this.y = color.dataset.canvasy;
    }

    create() {
        // create element
        const clone = Swatch.#template.content.firstElementChild.cloneNode(true);
        clone.dataset.bgColor = this.color;
        clone.dataset.angle = this.angle;
        clone.dataset.canvasX = this.x;
        clone.dataset.canvasY = this.y;
        clone.style.backgroundColor = this.color;
        Swatch.container.appendChild(clone);
        if (!Swatch.#copyList.style.display || Swatch.#copyList.style.display === 'none') Swatch.#copyList.style.display = 'block';
    }


    loadSwatch(swatch){
        root.style.setProperty('--hue-rotation', this.angle);
        posSample.x = this.x;
        posSample.y = this.y;
        hueSample.classList.add('load-swatch');
        updateCanvas();
        hueSample.classList.remove('load-swatch');
    }

    getSwatch(ev) {
        console.log("getSwatch !")
        if (ev.target.classList.contains('btn')) {
            let tg = ev.target;
            // get the parent .swatch of the clicked button
            do {
                tg = tg.parentNode;
            } while(!tg.classList.contains('swatch'))
            let swatch = tg;
            if (ev.target.classList.contains('clear')) {
                // Btn to delete swatch
                swatch.classList.add('cleared');
                swatch.addEventListener('transitionend', e => {
                    swatch.remove();
                    let swatches = swContainer.querySelectorAll('.swatch');
                    if (swatches.length === 0) copyList.style.display = 'none';
                }, false);
            } else if (ev.target.classList.contains('copy')) {
                // Btn to copy rbg value to clipboard
                let clr = swatch.dataset.bgColor;
                toClipboard(clr);
            } else if (ev.target.classList.contains('load')) {
                // Btn to load the swatch' color in the color picker
                loadSwatch(swatch);
            } else if (ev.target.classList.contains('cog')) {
                displayTools(swatch);
            }
        }
    }

    cons() {
        console.log("Dragstart ?")
    }

}

export default Swatch;