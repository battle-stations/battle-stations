let engine = null;
let socket = null;

function main() {
    console.log("App.js started!");

    let container = document.getElementById("gameContainer");
    engine = new Engine(container, 800, 600);
    engine.init();

    socket = new DisplaySocket("Stuttgart", "Stadtmitte", 2);
    socket.onToken = setToken;
    socket.onCurrentGame = setCurrentGame;
    socket.onUpdate = update;
}

function setToken(token) {
	//console.log(token.token);
	$("#token").text(token.token);
}

function setCurrentGame(game) {
	console.log(game);

	engine.createSnake(100, 100, 0xff3300);
    engine.createSnake(200, 200, 0x1133ff);
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


window.onload = () => {
	GameSerialization.whenReady(main);
};