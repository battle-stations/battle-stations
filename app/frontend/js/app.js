let engine = null;
let socket = null;

function main() {
    console.log("App.js started!");

    let container = document.getElementById("gameContainer");
    engine = new Engine(container, 800, 600);
    engine.init();

    socket = new DisplaySocket("Stuttgart", "Stadtmitte", 1);
    //socket = new DisplaySocket("München", "Stadtmitte", 2);
    socket.onToken = setToken;
    socket.onCurrentGame = setCurrentGame;
    socket.onUpdate = update;
    socket.onIcomingTrain = togglePause;
    socket.onOutgoingTrain = togglePause;
}

function setToken(token) {
	console.log(token.token);
	$("#token").text(token.token);
}

function update(update) {
	console.log('UPT', update);

	let updatePlayerOne = update.teamPoints[0].point;
	let updatePlayerTwo = (update.teamPoints.length > 1) ? update.teamPoints[1].point : null;

	engine.snakes[0].addPoint(updatePlayerOne.x);
	if(updatePlayerTwo) engine.snakes[1].addPoint(updatePlayerTwo.x);
}

function setCurrentGame(game) {
	console.log(game);

	engine.createSnake(0, 0, 0xff3300);
    engine.createSnake(0, 0, 0x1133ff);
}

function showToken(token) {
	console.log(token.token);
	$("#tokenHolder").html(token.token);
}

function togglePause() {
	$("#pauseModal").toggle();
}

function endGame() {
	$("#endModal").show();
	engine.clear();
}


window.onload = () => {
	GameSerialization.whenReady(main);
};