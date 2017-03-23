let engine = null;
let socket = null;

function main() {
    console.log("App.js started!");

    let container = document.getElementById("gameContainer");
    engine = new Engine(container, 800, 600);
    engine.init();

    socket = new DisplaySocket("Stuttgart", "Stadmitte", 2);
    socket.onToken = showToken;
}

function showToken(token) {
	console.log(token.token);
	$("#tokenHolder").html(token.token);
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


window.onload = () => {
	GameSerialization.whenReady(main);
};