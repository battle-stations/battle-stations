let engine = null;
let socket = null;
let container = null;
let firstOnOver = true;

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
    socket.onOver = endGame;
}

function setToken(token) {
	console.log("onToken", token.token);
	let tokenUrl = 'http://<host>:<port>/player-control.html?token=' + token.token;
	$("#token").text(tokenUrl);
}

function update(update) {
	//console.log('UPT', update);

	let updatePlayerOne = update.teamPoints[0].point;
	let updatePlayerTwo = (update.teamPoints.length > 1) ? update.teamPoints[1].point : null;

	//console.log('Drawing: ', updatePlayerOne.y + count);
	engine.snakes.get(0).addPoint(updatePlayerOne.x, updatePlayerOne.y);
	if(updatePlayerTwo) engine.snakes.get(1).addPoint(updatePlayerTwo.x, updatePlayerTwo.y);
}

function setCurrentGame(game) {
	console.log('OnGame', game);

	engine.clear();
    engine.init();

    $("#endModal").hide();
	$("#overlay").hide();

    engine.createSnake(400, 300, 0x1133ff);
    engine.createSnake(400, 300, 0xff3300);

    if(game && game.roundPoints) {
    	for(let i in game.roundPoints) {
    		let currentRound = game.roundPoints[i];
    		//console.log('CR: ', currentRound);
    		for(let j in currentRound.teamPoints) {
    			let currentTeam = currentRound.teamPoints[j];
    			//console.log('CT: ', currentTeam);
    			engine.snakes.get(j).addPoint(currentTeam.point.x, currentTeam.point.y);
    		}
    	} 
    }
}

function togglePause() {
	console.log('Train incomig!!!!');
	$("#pauseModal").toggle();
	$("#overlay").toggle();
}

function endGame(message) {
	console.log('OnOver', message);

	//if(!firstOnOver) {
		$("#endModal").show();
		$("#overlay").show();
	//}

	let clicks = 1;

	if(message.clicksPerTeam == undefined || message.clicksPerTeam.length < 2) {
		message.clicksPerTeam = [];
	} else {
		clicks = message.clicksPerTeam[0].clicks > message.clicksPerTeam[1].clicks ? message.clicksPerTeam[0].clicks : message.clicksPerTeam[1].clicks; 
	}

	$("#winner").text(message.loser.city);
	$("#clicksPerTeam").text(clicks);
	$("#maxPlayers").text(message.maxPlayers);
	engine.clear();
}


window.onload = () => {
	GameSerialization.whenReady(main);
};