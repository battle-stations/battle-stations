const ServerSocket = require('../socket/socket');
const shortid = require('shortid');
const timer = require('timers');

let myServer = new ServerSocket();
let players = {};

class Team {
  constructor(cityname) {
    this.teamId = cityname;
    this.stations = {};
    this.currentGame = 0;
    this.currentTeamNo = 0;
  }

  addStation(stationname){
    let station = new Station(stationname, this);
    this.stations[station.stationId] = station;
  };

  setCurrentGame(game, teamNumber){
    this.currentGame = game;
    this.currentTeamNo = teamNumber;
  }

  getCurrentGame(){
    return this.currentGame;
  }

  getCurrentTeamNo(){
    return this.currentTeamNo;
  }
}

class Station {
  constructor(stationname, team) {
    this.stationId = stationname;
    this.tracks = {};
    this.team = team;
  }

  addTrack(tracknumber){
    let track = new Track(tracknumber, this);
    this.tracks[track.trackId] = track;
  };
}

class Track {
  constructor(tracknumber, station) {
    this.trackId = tracknumber;
    this.players = {};
    this.screens = [];
    this.active = true;
    this.station = station;
  }

  addPlayer(playerId){
    let player = new Player(playerId);
    this.players[player.playerId] = player;
  };

  addScreen(screenUuid){
    this.screens.push(screenUuid);
  }

  generateToken() {
    let token = this.station.team.teamId + "_" + this.station.stationId + "_" + this.trackId;
    for(let i = 0; i < this.screens.length(); i++) {
      myServer.DisplaySocket.sendToken(screens[i], token);
    }
  }

  sendGame(game) {
    for(let i = 0; i < this.screens.length(); i++) {
      myServer.DisplaySocket.sendGame(screens[i], game);
    }
  }

  sendOver() {
    for(let i = 0; i < this.screens.length(); i++) {
      myServer.DisplaySocket.sendOver(screens[i]);
    }
  }
}

class Player {
  constructor(uuid) {
    this.playerId = uuid;
  }

  remove(){
    delete this;
  }
}

class TeamManager {
  constructor(){
    this.teams = {};
  }

  addTeam(cityname){
    let team = new Team(cityname);
    this.teams[team.teamId] = team;
  }
}

class GameSession {
  constructor(gameId, sizeX, sizeY, gameManager){
    this.gameManager = gameManager;
    this.gameId = gameId;
    this.interval = 40;
    this.inputManagerOne = new InputManager();
    this.inputManagerTwo = new InputManager();
    this.teamOneX = [];
    this.teamOneY = [];
    this.teamOneDir = Math.round((Math.random() * 4) + 1); //1 = +X, 2 = -X, 3 = +Y, 4 = -Y
    this.teamTwoX = [];
    this.teamTwoY = [];
    this.teamTwoDir = Math.round((Math.random() * 4) + 1);
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.gameInterval = 0;
    teamOneX.push = Math.round(Math.random() * sizeX);
    teamOneY.push = Math.round(Math.random() * sizeY);
    teamTwoX.push = Math.round(Math.random() * sizeX);
    teamTwoY.push = Math.round(Math.random() * sizeY);
  }

  startGame(){
    const game = 0;
    //TODO DEFINE GAME
    const teamOne = this.gameManager.teamOne;
    const teamTwo = this.gameManager.teamTwo;
    for(let i=0; i < teamOne.stations.length(); i++){
      for(let s=0; s < teamOne.stations[i].tracks.length(); s++){
        teamOne.stations[i].tracks[s].sendGame(game);
      }
    }
    for(let i=0; i < teamTwo.stations.length(); i++){
      for(let s=0; s < teamTwo.stations[i].tracks.length(); s++){
        teamTwo.stations[i].tracks[s].sendGame(game);
      }
    }
    this.gameInterval = timer.setInterval(function() {
        this.updatePosition(1);
        this.updatePosition(2);
        let result = this.detectCollision();
        if (result < 0) {
          this.end(result);
        }
    }, this.interval;);
  }

  updatePosition(team){
    let move = 0;
    if (team == 1) {
      move = inputManagerOne.getDirection();
      let currentX = teamOneX[teamOneX.length()-1];
      let currentY = teamOneY[teamOneY.length()-1];
      let newPos = calculateNewPosition(move,currentX,currentY,teamOneDir);
      teamOneX.push(newPos[0]);
      teamOneY.push(newPos[1]);
      teamOneDir = newPos[2];
    } else if (team == 2) {
      move = inputManagerTwo.getDirection();
      let currentX = teamTwoX[teamTwoX.length()-1];
      let currentY = teamTwoY[teamTwoY.length()-1];
      let newPos = calculateNewPosition(move,currentX,currentY,teamTwoDir);
      teamTwoX.push(newPos[0]);
      teamTwoY.push(newPos[1]);
      teamTwoDir = newPos[2];
    }
  }

  calculateNewPosition(move, currentX, currentY, currentDir){
    let pos = [currentX, currentY, move];
    switch(move){
      //same direction
      case 0:
        switch(currentDir){
          //increaseX
          case 1:
            pos[0] += 1;
            break;
          //decreaseX
          case 2:
            pos[0] -= 1;
            break;
          //increaseY
          case 3:
            pos[1] += 1;
            break;
          //decreaseY
          case 4:
            pos[1] -= 1;
            break;
        }
        return pos;
        break;
      //turn right
      case 1:
        switch(currentDir){
          //decreaseY
          case 1:
            pos[1] -= 1;
            pos[2] = 4;
            break;
          //increaseY
          case 2:
            pos[1] += 1;
            pos[2] = 3;
            break;
          //increaseX
          case 3:
            pos[0] += 1;
            pos[2] = 1;
            break;
          //decreaseX
          case 4:
            pos[0] -= 1;
            pos[2] = 2;
            break;
          }
        return pos;
        break;
      //turn left
      case -1:
        switch(currentDir){
          //increaseY
          case 1:
            pos[1] += 1;
            pos[2] = 3;
            break;
          //decreaseY
          case 2:
            pos[1] -= 1;
            pos[2] = 4;
            break;
          //decreaseX
          case 3:
            pos[0] -= 1;
            pos[2] = 2;
            break;
          //increaseX
          case 4:
            pos[0] += 1;
            pos[2] = 1;
            break;
          }
        return pos;
        break;
    }
  }

  detectCollision(){
    //DetectCollision on X for teamOne
    let currentX = teamOneX[teamOneX.length()-1];
    let currentY = teamOneY[teamOneY.length()-1];
    let s = 0;
    while(teamTwoX.indexOf(currentX,s) != -1){
      if(teamTwoY[teamTwoX.indexOf(currentX,s)] == currentY){
        return -1; //team One lost
      }else{
        s = teamTwoX.indexOf(currentX,s) + 1;
      }
    }
    //DetectCollision on Y for teamOne
    currentX = teamTwoX[teamTwoX.length()-1];
    currentY = teamTwoY[teamTwoY.length()-1];
    s = 0;
    while(teamOneX.indexOf(currentX,s) != -1){
      if(teamOneY[teamOneX.indexOf(currentX,s)] == currentY){
        return -2; //team One lost
      }else{
        s = teamOneX.indexOf(currentX,s) + 1;
      }
    }
    return 0;
  }

  end(result){
    clearInterval(this.gameInterval);

    myServer.displaySocket.sendOver(displayUuids);
    delete this;
  }
}

class InputManager {
  constructor(){
    this.left = 0;
    this.right = 0;
  }

  getDirection(){
    if(this.left > this.right){
      return -1;
    } else if (this.left < this.right) {
      return 1;
    } else {
      return 0;
    }
  }

  increaseLeft(){
    this.left += 1;
  }

  increaseRight(){
    this.right += 1;
  }

  decreaseLeft(){
    this.left -= 1;
  }

  decreaseRight(){
    this.right -= 1;
  }
}

class GameProtocol {
  const
}

class GameManager {
  constructor(teamOne, teamTwo){
    this.gameId = 0;
    this.currentGame = 0;
    this.sizeX = 300;
    this.sizeY = 300;
    this.teamOne = teamOne;
    this.teamTwo = teamTwo;
  }

  newGame(){
    this.gameId = shortid.generate();
    let protoGame = [];
    let game = new GameSession(this.gameId, this.sizeX, this.sizeY, this);
    teamManager.teams[teamOne].setCurrentGame(game, 1);
    teamManager.teams[teamTwo].setCurrentGame(game, 2);
    this.currentGame = game;
  }

  getCurrentGame(){
    myServer.DisplaySocket.sendGame(displayUuid, game);
  }

  finishCurrentGame(displayUuid){
    this.currentGame.end();
    myServer.DisplaySocket.sendOver(displayUuid);
  }
}


myServer.controlSocket.on('join',(uuid, token) => {
  players[uuid] = token;
  let token = players[uuid].token.split("_");
  let team = token[0];
  let station = token[1];
  let track = token[2];
  teamManager.teams[team].stations[station].tracks[track].addPlayer(uuid);
});

myServer.controlSocket.on('rightDown',(uuid) => {
  players[uuid] = token;
  let token = players[uuid].token.split("_");
  let team = token[0];
  let station = token[1];
  let track = token[2];
  let game = teamManager.teams[team].getCurrentGame();
  let teamNo = teamManager.teams[team].getCurrentTeamNo();
  if (teamNo == 1) {
    game.inputManagerOne.increaseRight();
  } else if (teamNo == 2) {
    game.inputManagerTwo.increaseRight();
  }
});

myServer.controlSocket.on('leftDown',(uuid) => {
  players[uuid] = token;
  let token = players[uuid].token.split("_");
  let team = token[0];
  let station = token[1];
  let track = token[2];
  let game = teamManager.teams[team].getCurrentGame();
  let teamNo = teamManager.teams[team].getCurrentTeamNo();
  if (teamNo == 1) {
    game.inputManagerOne.increaseLeft();
  } else if (teamNo == 2) {
    game.inputManagerTwo.increaseLeft();
  }
});

myServer.controlSocket.on('rightUp',(uuid) => {
  players[uuid] = token;
  let token = players[uuid].token.split("_");
  let team = token[0];
  let station = token[1];
  let track = token[2];
  let game = teamManager.teams[team].getCurrentGame();
  let teamNo = teamManager.teams[team].getCurrentTeamNo();
  if (teamNo == 1) {
    game.inputManagerOne.decreaseRight();
  } else if (teamNo == 2) {
    game.inputManagerTwo.decreaseRight();
  }
});

myServer.controlSocket.on('leftUp',(uuid) => {
  players[uuid] = token;
  let token = players[uuid].token.split("_");
  let team = token[0];
  let station = token[1];
  let track = token[2];
  let game = teamManager.teams[team].getCurrentGame();
  let teamNo = teamManager.teams[team].getCurrentTeamNo();
  if (teamNo == 1) {
    game.inputManagerOne.decreaseLeft();
  } else if (teamNo == 2) {
    game.inputManagerTwo.decreaseLeft();
  }
});

myServer.controlSocket.on('disconnect',(uuid) => {
  //remove from players array
  let token = players[uuid].token.split("_");
  let team = token[0];
  let station = token[1];
  let track = token[2];
  teamManager.teams[team].stations[station].tracks[track].players[uuid].remove();
});

let teamManager = new TeamManager();
let gameManager = new gameManager();
teamManager.addTeam("Stuttgart");
console.log(teamManager.teams);
