class Engine {
    constructor(anchor, width, height) {
        this.parent = anchor;
        this.width = width;
        this.height = height;
        this.pixiApp = null;
    }

    init() {
        this.pixiApp = new PIXI.Application(this.width, this.height, {backgroundColor : constants.background_color});
        this.parent.appendChild(this.pixiApp.view);

        var headline = new PIXI.Text(constants.headline_text, {font: "bold 32px serif", fill: "yellow"});
        headline.x = this.width/4;
        headline.y = 10;
        this.pixiApp.stage.addChild(headline);
    }

    createSnake(x, y) {

    }

}