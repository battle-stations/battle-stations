const GameManager = require('./games/game-manager-new');
const ServerSocket = require('../socket/socket');

const mediator = {
  constructor() {
    this.game = {};
    this.server = {};
  }

  initServer() {
    this.game = new GameManager();
    this.server = new ServerSocket();
  }

  initDisplaySocket() {
    this.server.displaySocket.on('join', (uuid, track) => {
      if(this.game.teams[track.station.team.city] == null) {
        this.game.teams[track.station.team.city] = 1;
        this.game.teamsConnected++;
      } else {
        thisgame.teams[track.station.team.city]++;
      }

      this.game._startGame();

      this.server.displaySocket.sendToken(uuid, `${track.station.team.city}_${track.station.name}_${track.number}`);
    }

    this.server.displaySocket.on('gameState', (uuid) => {
      if(this.game.running) {
        this.server.displaySocket.sendGame(uuid, this.game.game);
      } else {
        this.server.displaySocket.sendOver(uuid, this.game.gameStatistics);
      }
    });

    this.server.displaySocket.on('disconnect', (uuid, track) => {
      this.game.teams[track.station.team.city]--;
      if(this.game.teams[track.station.team.city] < 1) {
        this.game.teamsConnected--;
      }

      if(this.game.running && this.game.teamsConnected < 2) {
        this.game._endGame();
      }
    });
  }

  initControlSocket() {
    this.server.controlSocket.on('join', (uuid, token) => {
      if(this.game.clients[this.server.controlSocket.clients[uuid].track.station.team.city] == null) {
        this.game.clients[this.server.controlSocket.clients[uuid].track.station.team.city] = {};
      }
      this.game.clients[this.server.controlSocket.clients[uuid].track.station.team.city][uuid] = 0;
      this.game.playersConnected++;
      if(this.game.playersConnected > this.game.gameStatistics.maxPlayers) {
        this.game.gameStatistics.maxPlayers = this.game.playersConnected;
      }
    });

    this.server.controlSocket.on('rightDown', (uuid) => {
      this.game._countClicks(uuid);
      this.game.clients[this.server.controlSocket.clients[uuid].track.station.team.city][uuid] = 1;
    });

    this.server.controlSocket.on('leftDown', (uuid) => {

      this.game._countClicks(uuid);
      this.game.clients[this.server.controlSocket.clients[uuid].track.station.team.city][uuid] = 2;
    });

    this.server.controlSocket.on('rightUp', (uuid) => {
      this.game.clients[this.server.controlSocket.clients[uuid].track.station.team.city][uuid] = 0;
    });

    this.server.controlSocket.on('leftUp', (uuid) => {
      this.game.clients[this.server.controlSocket.clients[uuid].track.station.team.city][uuid] = 0;
    });

    this.server.controlSocket.on('disconnect', (uuid, track) => {
      delete this.game.clients[track.station.team.city][uuid];
      this.game.playersConnected--;
    });
  }

  broadcastNewGame() {
    this.server.displaySocket.broadcastNew();
  }

  broadcastGameOver(statistics) {
    this.server.displaySocket.broadcastOver(this.gameStatistics);
  }

  broadcastGameUpdate(roundPoints) {
    this.server.displaySocket.broadcastUpdate(roundPoints);
  }

  broadcastTrackIncoming(track){
    this.server.displaySocket.broadcastTrackIncoming(track);
  }

  broadcastTrackOutgoing(track){
    this.server.displaySocket.broadcastTrackOutgoing(track);
  }

  getTeamCity(uuid){
    const city = this.server.controlSocket.clients[uuid].track.station.team.city;
    return city;
  }

};

module.exports = mediator;
