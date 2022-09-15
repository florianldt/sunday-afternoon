const canvasEl = document.getElementById("canvas");
const skyDotsEl = document.getElementById("sky-dots");
const skyLowerDotsEl = document.getElementById("sky-lower-dots");
const dropsEl = document.getElementById("drops");

let lastLoop = new Date();
const refreshDelay = 60;

const RainStrength = {
    LIGHT: 10,
    MODERATE: 20,
    HEAVY: 30,
    VIOLENT: 40,
};

function getRandomBoolean() {
    return Math.random() < 0.2;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

class Drop {
    constructor(strength, coordinates) {
        this.strength = strength;
        this.coordinates = coordinates;
    }

    render() {
        const el = this.createElement();
        this.el = el;
        dropsEl.appendChild(el);
    }

    createElement() {
        const root = document.createElement("div");
        const { x, y } = this.coordinates;
        root.setAttribute("class", "drop");
        root.setAttribute("style", `top: ${y}px; left: ${x}px`);
        root.innerHTML =
            "<span class='drop__head'></span><span class='drop__tail'></span>";
        return root;
    }

    update() {
        const newY = this.coordinates.y + this.strength;
        if (newY > canvasEl.clientHeight) {
            const newXOffset = getRandomInt(0, 20);
            this.coordinates.x +=
                newXOffset * (getRandomBoolean() === true ? -1 : 1);
            this.coordinates.y = -getRandomInt(10, 120);
        } else {
            this.coordinates.y = newY;
        }
        const { x, y } = this.coordinates;
        this.el.setAttribute("style", `top: ${y}px; left: ${x}px`);
    }
}

class Rain {
    constructor(strength, DEBUG = false) {
        this.strength =
            typeof strength === "number" ? strength : RainStrength.MODERATE;
        this.DEBUG = DEBUG;

        this.fall = this.fall.bind(this);
        this.init = this.init.bind(this);
        this.updateDropsPosition = this.updateDropsPosition.bind(this);

        this.init();
        this.initalizeEventListener();
    }

    init() {
        const width = canvasEl.clientWidth;
        const height = canvasEl.clientHeight;

        this.xRows = width / 50;
        this.xGap = width / this.xRows;

        this.yRows = height / 100;
        this.yGap = height / this.yRows;

        this.drops = [];
        this.grid = [];

        for (let x = 0; x <= this.xRows; x += 1) {
            const yTmp = [];
            for (let y = 0; y <= this.yRows; y += 1) {
                yTmp.push(getRandomBoolean());
            }

            this.grid.push(yTmp);
        }

        if (this.DEBUG) {
            this.addGrid();
        }

        this.initSkyDots();
        dropsEl.innerHTML = "";

        for (let x = 0; x < this.grid.length; x += 1) {
            for (let y = 0; y < this.grid[x].length; y += 1) {
                if (this.grid[x][y]) {
                    this.drops.push(
                        new Drop(this.strength, {
                            x: this.xGap * x + this.xGap / 2,
                            y: this.yGap * y + this.xGap / 2,
                        })
                    );
                }
            }
        }
        this.drops.forEach((d) => d.render());
    }

    addGrid() {
        for (let x = 0; x <= this.xRows; x += 1) {
            const line = document.createElement("span");
            line.setAttribute(
                "style",
                `position: fixed; top: 0; bottom: 0; left: ${
                    x * this.xGap
                }px; width: 1px; background-color: red;`
            );
            canvasEl.appendChild(line);
        }

        for (let x = 0; x <= this.yRows; x += 1) {
            const line = document.createElement("span");
            line.setAttribute(
                "style",
                `position: fixed; top: ${
                    x * this.yGap
                }px; right: 0; left: 0; height: 1px; background-color: red;`
            );
            canvasEl.appendChild(line);
        }
    }

    initalizeEventListener() {
        window.addEventListener("resize", () => {
            clearInterval(this.interval);
            this.init();
            this.fall();
        });
    }

    initSkyDots() {
        const { clientWidth } = canvasEl;
        skyDotsEl.innerHTML = "";
        skyLowerDotsEl.innerHTML = "";

        for (let x = 0; x <= clientWidth; x += 8) {
            const dot = document.createElement("span");
            dot.className = "sky__dot";
            dot.innerHTML = "<span class='sky__dot-px'></span>";
            dot.setAttribute("style", `left: ${x}px`);
            skyDotsEl.appendChild(dot);
        }

        for (let x = 0; x <= clientWidth; x += 28) {
            const dot = document.createElement("span");
            dot.className = "sky__lower-dot";
            dot.innerHTML =
                "<span class='sky__lower-dot-px'></span><span class='sky__lower-dot-px'></span><span class='sky__lower-dot-px'></span>";
            dot.setAttribute("style", `left: ${x}px`);
            skyLowerDotsEl.appendChild(dot);
        }
    }

    fall() {
        this.interval = setInterval(this.updateDropsPosition, refreshDelay);
    }

    updateDropsPosition() {
        const thisLoop = new Date();
        const fps = 1000 / (thisLoop - lastLoop);
        lastLoop = thisLoop;
        document.getElementById("fps").innerHTML = `FPS: ${Math.round(fps)}`;
        this.drops.forEach((d) => d.update());
    }
}

const rain = new Rain(RainStrength.MODERATE);
rain.fall();
