class Engine {
    constructor(anchor, width, height) {
        this.parent = anchor;
        this.width = width;
        this.height = height;
        this.pixiApp = null;
        this.snakes = new List(null);
    }

    init() {
        this.pixiApp = new PIXI.Application(this.width, this.height, {backgroundColor: constants.background_color}, true);
        this.parent.innerHTML = '';
        this.parent.appendChild(this.pixiApp.view);

        var headline = new PIXI.Text(constants.headline_text, {font: "bold 32px serif", fill: "yellow"});
        headline.x = this.width/4;
        headline.y = 10;
        this.pixiApp.stage.addChild(headline);
    }

    clear() {
        let it = this.snakes.iterator();
        while(it.hasNext()) {
            let snake = it.next();
            snake.graphics.destroy();
            snake = null;
        }
        this.snakes = new List(null);
        //if(this.pixiApp)
            //this.pixiApp.destroy();
    }

    createSnake(x, y, color) {
        var newSnake = new Snake(x, y, color, this.pixiApp.stage);
        this.snakes.pushBack(newSnake);
    }
}