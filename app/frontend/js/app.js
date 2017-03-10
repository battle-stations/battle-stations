var engine = null;

function main() {
    console.log("App.js started!");

    var container = document.getElementById("gameContainer");
    engine = new Engine(container, 800, 600);
    engine.init();
    engine.createSnake(20, 20, 0xff3300);
    engine.createSnake(300, 300, 0x1133ff);
}


window.onload = main;