const ServerSocket = require('../socket/socket');
const shortid = require('shortid');
const timer = require('timers');

let myServer = new ServerSocket();
let players = {};


class StatisticProto {
  constructor(winner, clicksPerTeam, maxPlayers) {
    this.winner = winner;
    this.clicksPerTeam = clicksPerTeam;
    this.maxPlayers = maxPlayers;
  }
}

class ClicksPerTeamProto {
  constructor(team, clicks){
    this.team = team;
    this.clicks = clicks;
  }
}

class GameProto {
  constructor(){
    this.roundPoints = [];
  }

  addRoundPoint(roundPoint){
    this.roundPoints.push(roundPoint);
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
    this.y = yPoint;
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
    const game = this.station.team.currentGame.gameProto;
    this.screens.push(screenUuid);
    myServer.displaySocket.sendGame(screenUuid, game);
  }

  generateToken() {
    let token = this.station.team.teamId + "_" + this.station.stationId + "_" + this.trackId;
    for(let i = 0; i < this.screens.length; i++) {
      myServer.displaySocket.sendToken(this.screens[i], token);
    }
  }

  //sendOver(screenUuid) {
    //for(let i = 0; i < this.screens.length(); i++) {
      //myServer.DisplaySocket.sendOver(screens[i]);
    //}
  //}
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
  constructor(gameId, sizeX, sizeY, gameManager, gameProto){
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
    this.gameProto = gameProto;
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
    myServer.displaySocket.broadcastNew();
    const teamOne = this.gameManager.teamOne;
    const teamTwo = this.gameManager.teamTwo;
    this.gameInterval = timer.setInterval(function() {
        that.updatePosition(1);
        that.updatePosition(2);
        const point1 = new PointProto(that.teamOneX[that.teamOneX.length-1],that.teamOneY[that.teamOneY.length-1]);
        const point2 = new PointProto(that.teamTwoX[that.teamTwoX.length-1],that.teamTwoY[that.teamTwoY.length-1]);
        const teamPoint1 = new TeamPointProto(point1, that.gameManager.teamOne.teamId);
        const teamPoint2 = new TeamPointProto(point2, that.gameManager.teamTwo.teamId);
        const roundPoint = new RoundPointProto([teamPoint1,teamPoint2]);
        that.gameProto.addRoundPoint(roundPoint);
        myServer.displaySocket.broadcastUpdate(roundPoint);
        let result = that.detectCollision();
        if (result < 0) {
          that.end(result);
        }
        //console.log(that.teamOneX[that.teamOneX.length-1] + " " + that.teamOneY[that.teamOneY.length-1] + " " + that.teamOneDir);
        //console.log(that.teamTwoX[that.teamTwoX.length-1] + " " + that.teamTwoY[that.teamTwoY.length-1] + " " + that.teamTwoDir);
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
        return -2; //team Two lost
      }else{
        s = this.teamOneX.indexOf(currentX,s) + 1;
      }
    }
    return 0;
  }

  end(result){
    const that = this;
    clearInterval(this.gameInterval);
    const statistic = this.sendStatistics(result);
    myServer.displaySocket.broadcastOver(statistic);
    setTimeout(function () {
        that.gameManager.newGame();
    }, 60000);
    console.log("end timeout");
  }

  sendStatistics(result){
    if(result == -1){
      result = this.gameManager.teamTwo.teamId;
    }else if(result == -2){
      result = this.gameManager.teamOne.teamId;
    }
    const clicksTeam1 = new ClicksPerTeamProto(this.gameManager.teamOne.teamId, this.inputManagerOne.clicksTeam1);
    const clicksTeam2 = new ClicksPerTeamProto(this.gameManager.teamTwo.teamId, this.inputManagerTwo.clicksTeam2);
    const statistic = new StatisticProto(result, [clicksTeam1, clicksTeam2], players.length);
    return statistic;
  }
}

class InputManager {
  constructor(){
    this.left = 0;
    this.right = 0;
    this.clicks = 1;
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
    this.clicks += 1;
    this.left += 1;
  }

  increaseRight(){
    this.clicks += 1;
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
  constructor(){
    this.gameId = 0;
    this.currentGame = 0;
    this.sizeX = 300;
    this.sizeY = 300;
    this.teamOne = 0;
    this.teamTwo = 0;
  }

  addTeamOne(team){
    this.teamOne = team;
  }

  addTeamTwo(team){
    this.teamTwo = team;
  }

  newGame(){
    this.gameId = shortid.generate();
    const protoGame = new GameProto();
    let game = new GameSession(this.gameId, this.sizeX, this.sizeY, this, protoGame);
    this.teamOne.setCurrentGame(game, 1);
    this.teamTwo.setCurrentGame(game, 2);
    this.currentGame = game;
    return game;
  }

  getCurrentGame(){
    myServer.displaySocket.sendGame(displayUuid, game);
  }

  finishCurrentGame(displayUuid){
    this.currentGame.end();
    //myServer.DisplaySocket.sendOver(displayUuid);
  }
}

let teamManager = new TeamManager();
teamManager.addTeam("Muenchen");
teamManager.teams["Muenchen"].addStation("Hauptbahnhof");
teamManager.teams["Muenchen"].stations["Hauptbahnhof"].addTrack(1);
teamManager.teams["Muenchen"].stations["Hauptbahnhof"].addTrack(2);
teamManager.teams["Muenchen"].addStation("Marienplatz");
teamManager.teams["Muenchen"].stations["Marienplatz"].addTrack(1);
teamManager.teams["Muenchen"].stations["Marienplatz"].addTrack(2);
const gameManager = new GameManager();
gameManager.addTeamOne(teamManager.teams["Muenchen"])
let game = 0;


myServer.controlSocket.on('join',(uuid, token) => {
  console.log("Player " + uuid + " joined the game [BACKEND]");
  players[uuid] = token;
  token = players[uuid].token.split("_");
  let team = token[0];
  let station = token[1];
  let track = token[2];
  teamManager.teams[team].stations[station].tracks[track].addPlayer(uuid);
});

myServer.controlSocket.on('rightDown',(uuid) => {
  console.log("Player " + uuid + " rightDown [BACKEND]");
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
  console.log("Player " + uuid + " leftDown [BACKEND]");
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
  console.log("Player " + uuid + " rightUp [BACKEND]");
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
  console.log("Player " + uuid + " leftUp [BACKEND]");
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
  console.log("Player " + uuid + " disconnected [BACKEND]");
  token = players[uuid].token.split("_");
  let team = token[0];
  let station = token[1];
  let track = token[2];
  teamManager.teams[team].stations[station].tracks[track].players[uuid].remove();
  delete players[uuid];
});

myServer.displaySocket.on('join', (uuid,track) => {
  teamManager.addTeam(track.station.team.city);
  teamManager.teams[track.station.team.city].addStation(track.station.name);
  teamManager.teams[track.station.team.city].stations[track.station.name].addTrack(track.number);
  console.log(teamManager.teams[track.station.team.city].stations[track.station.name]);
  teamManager.teams[track.station.team.city].stations[track.station.name].tracks[track.number].addScreen(uuid);
  teamManager.teams[track.station.team.city].stations[track.station.name].tracks[track.number].generateToken();
  gameManager.addTeamTwo(teamManager.teams[track.station.team.city]);
  game = gameManager.newGame();
});




