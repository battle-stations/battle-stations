class Snake {
    constructor(x,y, color, stage) {
        this.points = [];
        this.color = color;
        this.parentStage = stage;
        this.graphics = new PIXI.Graphics();
        this.addPoint(x, y);
    }

    addPoint(x, y) {
        var currentPoint = {x, y};
        this.points.push(currentPoint);

        this.graphics.beginFill(this.color);
        this.graphics.drawCircle(x, y, 3);
        this.graphics.endFill();

        this.parentStage.addChild(this.graphics);
    }
}