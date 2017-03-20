const ServerSocket = require('../socket/socket');
const shortid = require('shortid');

let myServer = new ServerSocket();
let players = {};

class Team {
  constructor(cityname) {
    this.teamId = cityname;
    this.stations = {};
  }

  addStation(stationname){
    let station = new Station(stationname);
    this.stations[station.stationId] = station;
  };
}

class Station {
  constructor(stationname) {
    this.stationId = stationname;
    this.tracks = {};
  }

  addTrack(tracknumber){
    let track = new Track(tracknumber);
    this.tracks[track.trackId] = track;
  };
}

class Track {
  constructor(tracknumber) {
    this.trackId = tracknumber;
    this.players = {};
  }

  addPlayer(playerId){
    let player = new Player(playerId);
    this.players[player.playerId] = player;
  };
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

  generateToken(teamId, stationId, trackId) {
    let token = teamId + "_" + stationId + "_" + trackId;
  }

  addTeam(cityname){
    let team = new Team(cityname);
    this.teams[team.teamId] = team;
  }
}

class GameSession {
  constructor(gameId){
    this.gameId = gameId;
    this.inputManager = new InputManager();
  }

  end(){
    delete this;
  }
}

class InputManager {
  constructor(){
    this.left = 0;
    this.right = 0;
  }
}

class GameManager {
  constructor(){
    this.gameId = 0;
    this.currentGame = 0;
  }

  newGame(this.gameId){
    let game = new GameSession(gameId);
    gameId = gameId + 1;
    this.currentGame = game;
  }

  getCurrentGame(){
    return this.currentGame;
  }

  finishCurrentGame(){
    this.currentGame.end();
  }
}

let teamManager = new TeamManager();
let gameManager = new gameManager();
teamManager.addTeam("Stuttgart");
console.log(teamManager.teams);



myServer.controlSocket.on('join',(uuid, token) => {
  players[uuid] = token;
  let token = players[uuid].token.split("_");
  let team = token[0];
  let station = token[1];
  let track = token[2];
  teamManager.teams[team].stations[station].tracks[track].addPlayer(uuid);
});

myServer.controlSocket.on('rightDown',(uuid) => {
  gameManager.getCurrentGame().inputManager.right += 1;
});

myServer.controlSocket.on('leftDown',(uuid) => {
  gameManager.getCurrentGame().inputManager.left += 1;
});

myServer.controlSocket.on('rightUp',(uuid) => {
  gameManager.getCurrentGame().inputManager.right -= 1;
});

myServer.controlSocket.on('leftUp',(uuid) => {
  gameManager.getCurrentGame().inputManager.right += 1;
});

myServer.controlSocket.on('disconnect',(uuid) => {
  let token = players[uuid].token.split("_");
  let team = token[0];
  let station = token[1];
  let track = token[2];
  teamManager.teams[team].stations[station].tracks[track].players[uuid].remove();
});
