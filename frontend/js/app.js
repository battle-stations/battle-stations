function main() {
    console.log("App.js started!");

    var container = document.getElementById("gameContainer");
    var engine = new Engine(container, 800, 600);
    engine.init();
}


window.onload = main;