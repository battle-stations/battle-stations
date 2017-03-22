const ServerSocket = require('../socket/socket');
const shortid = require('shortid');
const timer = require('timers');

let myServer = new ServerSocket();
let players = {};

class GameProto {
  constructor(roundPoints){
    this.roundPoints = roundPoints;
  }

  constructor(){

  }

  addRoundPoint(roundPoints){
    this.roundPoints.push();
  }
}

class RoundPointProto {
  constructor(teamPoints){
    this.teamPoints = teamPoints;
  }
}

class TeamPointProto {
  constructor(point,teamid){
    this.point = point;
    this.team = teamid;
  }
}

class PointProto{
  constructor(xPoint,yPoint){
    this.x = xPoint;
    this.y = zPoint;
  }
}

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

  sendOver(screenUuid) {
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
    this.teamOneDir = Math.floor((Math.random() * 4) + 1); //1 = +X, 2 = -X, 3 = +Y, 4 = -Y
    this.teamTwoX = [];
    this.teamTwoY = [];
    this.teamTwoDir = Math.floor((Math.random() * 4) + 1);
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.gameInterval = 0;
  }

  updatePosition(team) {
    let move = 0;
    if (team == 1) {
      move = this.inputManagerOne.getDirection();
      let currentX = this.teamOneX[this.teamOneX.length-1];
      let currentY = this.teamOneY[this.teamOneY.length-1];
      let newPos = this.calculateNewPosition(move,currentX,currentY,this.teamOneDir);
      if(newPos[0] < 0){
        newPos[0] = this.sizeX;
      }else if(newPos[0] > this.sizeX){
        newPos[0] = 0;
      }

      if(newPos[1] < 0){
        newPos[1] = this.sizeY;
      }else if(newPos[1] > this.sizeY){
        newPos[1] = 0;
      }
      this.teamOneX.push(newPos[0]);
      this.teamOneY.push(newPos[1]);
      this.teamOneDir = newPos[2];
    } else if (team == 2) {
      move = this.inputManagerTwo.getDirection();
      let currentX = this.teamTwoX[this.teamTwoX.length-1];
      let currentY = this.teamTwoY[this.teamTwoY.length-1];
      let newPos = this.calculateNewPosition(move,currentX,currentY,this.teamTwoDir);
      if(newPos[0] < 0){
        newPos[0] = this.sizeX;
      }else if(newPos[0] > this.sizeX){
        newPos[0] = 0;
      }

      if(newPos[1] < 0){
        newPos[1] = this.sizeY;
      }else if(newPos[1] > this.sizeY){
        newPos[1] = 0;
      }
      this.teamTwoX.push(newPos[0]);
      this.teamTwoY.push(newPos[1]);
      this.teamTwoDir = newPos[2];
    }
  }


  startGame(){
    const that = this;
    this.teamOneX.push(Math.round(Math.random() * this.sizeX));
    this.teamOneY.push(Math.round(Math.random() * this.sizeY));
    this.teamTwoX.push(Math.round(Math.random() * this.sizeX));
    this.teamTwoY.push(Math.round(Math.random() * this.sizeY));
    const game = 0;
    //TODO DEFINE GAME
    const teamOne = this.gameManager.teamOne;
    const teamTwo = this.gameManager.teamTwo;
    for(let i=0; i < teamOne.stations.length; i++){
      for(let s=0; s < teamOne.stations[i].tracks.length; s++){
        teamOne.stations[i].tracks[s].sendGame(game);
      }
    }
    for(let i=0; i < teamTwo.stations.length; i++){
      for(let s=0; s < teamTwo.stations[i].tracks.length; s++){
        teamTwo.stations[i].tracks[s].sendGame(game);
      }
    }
    this.gameInterval = timer.setInterval(function() {
        that.updatePosition(1);
        that.updatePosition(2);
        let result = that.detectCollision();
        if (result < 0) {
          that.end(result);
        }
        console.log(that.teamOneX[that.teamOneX.length-1] + " " + that.teamOneY[that.teamOneY.length-1] + " " + that.teamOneDir);
        console.log(that.teamTwoX[that.teamTwoX.length-1] + " " + that.teamTwoY[that.teamTwoY.length-1] + " " + that.teamTwoDir);
    }, this.interval);
  }


  calculateNewPosition(move, currentX, currentY, currentDir){
    let pos = [currentX, currentY, currentDir];
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
    let currentX = this.teamOneX[this.teamOneX.length-1];
    let currentY = this.teamOneY[this.teamOneY.length-1];
    let s = 0;
    while(this.teamTwoX.indexOf(currentX,s) != -1){
      if(this.teamTwoY[this.teamTwoX.indexOf(currentX,s)] == currentY){
        return -1; //team One lost
      }else{
        s = this.teamTwoX.indexOf(currentX,s) + 1;
      }
    }
    //DetectCollision on Y for teamOne
    currentX = this.teamTwoX[this.teamTwoX.length-1];
    currentY = this.teamTwoY[this.teamTwoY.length-1];
    s = 0;
    while(this.teamOneX.indexOf(currentX,s) != -1){
      if(this.teamOneY[this.teamOneX.indexOf(currentX,s)] == currentY){
        return -2; //team One lost
      }else{
        s = this.teamOneX.indexOf(currentX,s) + 1;
      }
    }
    return 0;
  }

  end(result){
    clearInterval(this.gameInterval);
    myServer.displaySocket.broadcastOver();
    this.gameInterval.setTimeout(function () {
        this.gameManager.newGame();
    }, 60000);
    clearTimeout(this.gameInterval);
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
    this.teamOne.setCurrentGame(game, 1);
    this.teamTwo.setCurrentGame(game, 2);
    this.currentGame = game;
    return game;
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
  token = players[uuid].token.split("_");
  let team = token[0];
  let station = token[1];
  let track = token[2];
  teamManager.teams[team].stations[station].tracks[track].addPlayer(uuid);
});

myServer.controlSocket.on('rightDown',(uuid) => {
  players[uuid] = token;
  token = players[uuid].token.split("_");
  let team = token[0];
  let station = token[1];
  let track = token[2];
  if(teamManger.teams[team].stations[station].track[track].active == true){
    let game = teamManager.teams[team].getCurrentGame();
    let teamNo = teamManager.teams[team].getCurrentTeamNo();
    if (teamNo == 1) {
      game.inputManagerOne.increaseRight();
    } else if (teamNo == 2) {
      game.inputManagerTwo.increaseRight();
    }
  }
});

myServer.controlSocket.on('leftDown',(uuid) => {
  players[uuid] = token;
  token = players[uuid].token.split("_");
  let team = token[0];
  let station = token[1];
  let track = token[2];
  if(teamManger.teams[team].stations[station].track[track].active == true){
    let game = teamManager.teams[team].getCurrentGame();
    let teamNo = teamManager.teams[team].getCurrentTeamNo();
    if (teamNo == 1) {
      game.inputManagerOne.increaseLeft();
    } else if (teamNo == 2) {
      game.inputManagerTwo.increaseLeft();
    }
  }
});

myServer.controlSocket.on('rightUp',(uuid) => {
  players[uuid] = token;
  token = players[uuid].token.split("_");
  let team = token[0];
  let station = token[1];
  let track = token[2];
  if(teamManger.teams[team].stations[station].track[track].active == true){
    let game = teamManager.teams[team].getCurrentGame();
    let teamNo = teamManager.teams[team].getCurrentTeamNo();
    if (teamNo == 1) {
      game.inputManagerOne.decreaseRight();
    } else if (teamNo == 2) {
      game.inputManagerTwo.decreaseRight();
    }
  }
});

myServer.controlSocket.on('leftUp',(uuid) => {
  players[uuid] = token;
  token = players[uuid].token.split("_");
  let team = token[0];
  let station = token[1];
  let track = token[2];
  if(teamManger.teams[team].stations[station].track[track].active == true){
    let game = teamManager.teams[team].getCurrentGame();
    let teamNo = teamManager.teams[team].getCurrentTeamNo();
    if (teamNo == 1) {
      game.inputManagerOne.decreaseLeft();
    } else if (teamNo == 2) {
      game.inputManagerTwo.decreaseLeft();
    }
  }
});

myServer.controlSocket.on('disconnect',(uuid) => {
  token = players[uuid].token.split("_");
  let team = token[0];
  let station = token[1];
  let track = token[2];
  teamManager.teams[team].stations[station].tracks[track].players[uuid].remove();
  delete players[uuid];
});

let teamManager = new TeamManager();
teamManager.addTeam("Stuttgart");
teamManager.teams["Stuttgart"].addStation("Stadtmitte");
teamManager.teams["Stuttgart"].stations["Stadtmitte"].addTrack(1);
teamManager.teams["Stuttgart"].stations["Stadtmitte"].addTrack(2);
teamManager.teams["Stuttgart"].addStation("Feuersee");
teamManager.teams["Stuttgart"].stations["Feuersee"].addTrack(1);
teamManager.teams["Stuttgart"].stations["Feuersee"].addTrack(2);
teamManager.addTeam("Muenchen");
teamManager.teams["Muenchen"].addStation("Hauptbahnhof");
teamManager.teams["Muenchen"].stations["Hauptbahnhof"].addTrack(1);
teamManager.teams["Muenchen"].stations["Hauptbahnhof"].addTrack(2);
teamManager.teams["Muenchen"].addStation("Marienplatz");
teamManager.teams["Muenchen"].stations["Marienplatz"].addTrack(1);
teamManager.teams["Muenchen"].stations["Marienplatz"].addTrack(2);
const gameManager = new GameManager(teamManager.teams["Stuttgart"], teamManager.teams["Muenchen"]);
const game = gameManager.newGame();
game.startGame();
console.log(game);
game.inputManagerOne.increaseRight();
