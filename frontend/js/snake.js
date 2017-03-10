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

        if(this.points.length < 2) {
            this.graphics.lineStyle(5, this.color);
            this.graphics.moveTo(currentPoint.x, currentPoint.y);
        }

        this.graphics.lineTo(currentPoint.x, currentPoint.y);
        this.parentStage.addChild(this.graphics);
    }
}