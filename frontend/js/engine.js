class Engine {
    constructor(anchor, width, height) {
        this.parent = anchor;
        this.width = width;
        this.height = height;
        this.pixiApp = null;
        this.snakes = [];
    }

    init() {
        this.pixiApp = new PIXI.Application(this.width, this.height, {backgroundColor: constants.background_color}, true);
        this.parent.appendChild(this.pixiApp.view);

        var headline = new PIXI.Text(constants.headline_text, {font: "bold 32px serif", fill: "yellow"});
        headline.x = this.width/4;
        headline.y = 10;
        this.pixiApp.stage.addChild(headline);
    }

    createSnake(x, y, color) {
        var newSnake = new Snake(x, y, color, this.pixiApp.stage);
        newSnake.addPoint(x + 10, y + 10);
        this.snakes.push(newSnake);
    }

}