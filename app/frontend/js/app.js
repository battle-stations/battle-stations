let engine = null;
let socket = null;
let container = null;

function main() {
    console.log("App.js started!");

    container = document.getElementById("gameContainer");
    engine = new Engine(container, 800, 600);

    //socket = new DisplaySocket("Stuttgart", "Stadtmitte", 1);
    socket = new DisplaySocket(window.location.search.split('=')[1], "Stadtmitte", 1);
    socket.onToken = setToken;
    socket.onCurrentGame = setCurrentGame;
    socket.onUpdate = update;
    socket.onNew = setCurrentGame;
    socket.onIncomingTrain = togglePause;
    socket.onOutgoingTrain = togglePause;
}

function setToken(token) {
	console.log(token.token);
	$("#token").text(token.token);
}

function update(update) {
	//console.log('UPT', update);

	let updatePlayerOne = update.teamPoints[0].point;
	let updatePlayerTwo = (update.teamPoints.length > 1) ? update.teamPoints[1].point : null;

	//console.log('Drawing: ', updatePlayerOne.y + count);
	engine.snakes[0].addPoint(updatePlayerOne.x, updatePlayerOne.y);
	if(updatePlayerTwo) engine.snakes[1].addPoint(updatePlayerTwo.x, updatePlayerTwo.y);
}

function setCurrentGame(game) {
	console.log(game);
	engine.clear();
    engine.init();

    engine.createSnake(400, 300, 0x1133ff);
    engine.createSnake(400, 300, 0xff3300);

    if(game && game.roundPoints) {
    	for(let i in game.roundPoints) {
    		let currentRound = game.roundPoints[i];
    		//console.log('CR: ', currentRound);
    		for(let j in currentRound.teamPoints) {
    			let currentTeam = currentRound.teamPoints[j];
    			//console.log('CT: ', currentTeam);
    			engine.snakes[j].addPoint(currentTeam.point.x, currentTeam.point.y);
    		}
    	} 
    }
}

function showToken(token) {
	console.log(token.token);
	$("#tokenHolder").html(token.token);
}

function togglePause() {
	console.log('Train incomig!!!!');
	$("#pauseModal").toggle();
	$("#overlay").toggle();
}

function endGame() {
	$("#endModal").show();
	$("#overlay").show();

	$("#winner").text(Math.floor(Math.random() * 2));
	$("#clicksPerTeam").text(Math.floor(Math.random() * 1000));
	$("#maxPlayers").text(Math.floor(Math.random() * 5));
	engine.clear();
}


window.onload = () => {
	GameSerialization.whenReady(main);
};