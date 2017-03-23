let engine = null;
let socket = null;
let container = null;

let count = 0, inc = -2;

function main() {
    console.log("App.js started!");

    container = document.getElementById("gameContainer");
    engine = new Engine(container, 800, 600);

    //socket = new DisplaySocket("Stuttgart", "Stadtmitte", 1);
    socket = new DisplaySocket("München", "Stadtmitte", 1);
    socket.onToken = setToken;
    socket.onCurrentGame = setCurrentGame;
    socket.onUpdate = update;
    socket.onIncomingTrain = togglePause;
    socket.onOutgoingTrain = togglePause;
}

function setToken(token) {
	console.log(token.token);
	$("#token").text(token.token);
}

function update(update) {
	//console.log('UPT', update);
	count += inc;

	let updatePlayerOne = update.teamPoints[0].point;
	let updatePlayerTwo = (update.teamPoints.length > 1) ? update.teamPoints[1].point : null;


	console.log('Drawing: ', updatePlayerOne.y + count);
	engine.snakes[0].addPoint(updatePlayerOne.x + count, updatePlayerOne.y + count);
	if(updatePlayerTwo) engine.snakes[1].addPoint(updatePlayerTwo.x + 100, updatePlayerTwo.y + count);
}

function setCurrentGame(game) {
	console.log(game);
	engine.clear();
    engine.init();

    inc *= -1;

	let lastRound = game.roundPoints[game.roundPoints.length-1];

	let firstPlayer = lastRound.teamPoints[0].point;
	let secondPlayer = (lastRound.teamPoints.length > 1) ? lastRound.teamPoints[1].point : null;

	engine.createSnake(firstPlayer.x, firstPlayer.y, 0xff3300);
    if(secondPlayer) 
    	engine.createSnake(secondPlayer.x, secondPlayer.y, 0x1133ff);
}

function showToken(token) {
	console.log(token.token);
	$("#tokenHolder").html(token.token);
}

function togglePause() {
	console.log('Train incomig!!!!');
	$("#pauseModal").toggle();
}

function endGame() {
	$("#endModal").show();
	engine.clear();
}


window.onload = () => {
	GameSerialization.whenReady(main);
};