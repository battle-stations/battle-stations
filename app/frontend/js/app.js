let engine = null;
let socket = null;

function main() {
    console.log("App.js started!");

    let container = document.getElementById("gameContainer");
    engine = new Engine(container, 800, 600);
    engine.init();

    //socket = new DisplaySocket("Stuttgart", 1, 2);
}

function showToken(token) {
	$("#tokenHolder").html(token);
}

function pauseGame() {
	$("#pauseModal").show();
}

function endGame() {
	$("#endModal").show();
	engine.clear();
}

function createPlayer(data) {
	//ToDo
	//engine.createSnake(20, 20, 0xff3300);
    //engine.createSnake(300, 300, 0x1133ff);
}


window.onload = main;