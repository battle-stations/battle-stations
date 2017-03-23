const ServerSocket = require('../socket/socket');

const frames = 25;
const trainTime = 10000;
const trainStayTime = 5000;
const width = 800;
const height = 600;

class GameManager {
  constructor() {
    this.server = new ServerSocket();
    this.running = false;
    this.teams = {};
    this.teamsConnected = 0;
    this._startGame();
    this._endGame();

    this.clients = {};
    this.playersConnected = 0;

    this._mockTrainInterval = setInterval(this._incomingTrainMock.bind(this), trainTime);

    this._initDisplaySocket();
    this._initControlSocket();
  }

  _currentTeamArray() {
    let teams = [];
    for(let i in this.teams) {
      if(this.teams[i] > 0) {
        teams.push(i);
      }
    }
    return teams;
  }

  _startGame() {
    this.game = {
      roundPoints: []
    };
    this.snakeDirection = {};
    let clicksPerTeam = [];
    let cTeam = this._currentTeamArray();
    for(let i in cTeam) {
      this.snakeDirection[cTeam[i]] = Math.floor(Math.random()*8)*45;
      clicksPerTeam.push({
        team: {
          city: cTeam[i]
        },
        clicks: 0
      });
    }
    this.gameStatistics = {
      winner: {
        city: ''
      },
      clicksPerTeam: clicksPerTeam,
      maxPlayers: 0
    };
    this.running = true;
    this.server.displaySocket.broadcastNew();
    this.frameInterval = setInterval(this._createFrame.bind(this), 1000/frames);
  }

  _endGame() {
    clearInterval(this.frameInterval);
    this.server.displaySocket.broadcastOver(this.gameStatistics);
    this.running = false;
  }

  _initDisplaySocket() {
    this.server.displaySocket.on('join', (uuid, track) => {
      if(this.teams[track.station.team.city] == null) {
        this.teams[track.station.team.city] = 1;
        this.teamsConnected++;
      } else {
        this.teams[track.station.team.city]++;
      }

      if(!this.running && this.teamsConnected > 1) {
        this._startGame();
      }

      this.server.displaySocket.sendToken(uuid, `${track.station.team.city}_${track.station.name}_${track.number}`);
    });

    this.server.displaySocket.on('gameState', (uuid) => {
      if(this.running) {
        this.server.displaySocket.sendGame(uuid, this.game);
      } else {
        this.server.displaySocket.sendOver(uuid, this.gameStatistics);
      }
    });

    this.server.displaySocket.on('disconnect', (uuid) => {
      this.teams[this.server.displaySocket.clients[uuid].track.station.team.city]--;
      if(this.teams[this.server.displaySocket.clients[uuid].track.station.team.city] < 1) {
        this.teamsConnected--;
      }

      if(this.running && this.teamsConnected < 2) {
        this._endGame();
      }
    });
  }

  _initControlSocket() {
    this.server.controlSocket.on('join', (uuid, token) => {
      if(this.clients[this.server.controlSocket.clients[uuid].track.station.team.city] == null) {
        this.clients[this.server.controlSocket.clients[uuid].track.station.team.city] = {};
      }
      this.clients[this.server.controlSocket.clients[uuid].track.station.team.city][uuid] = 0;
      this.playersConnected++;
      if(this.playersConnected > this.gameStatistics.maxPlayers) {
        this.gameStatistics.maxPlayers = this.playersConnected;
      }
    });

    this.server.controlSocket.on('rightDown', (uuid) => {
      this.clients[this.server.controlSocket.clients[uuid].track.station.team.city][uuid] = 1;
    });

    this.server.controlSocket.on('leftDown', (uuid) => {
      this.clients[this.server.controlSocket.clients[uuid].track.station.team.city][uuid] = 2;
    });

    this.server.controlSocket.on('rightUp', (uuid) => {
      this.clients[this.server.controlSocket.clients[uuid].track.station.team.city][uuid] = 0;
    });

    this.server.controlSocket.on('leftUp', (uuid) => {
      this.clients[this.server.controlSocket.clients[uuid].track.station.team.city][uuid] = 0;
    });

    this.server.controlSocket.on('disconnect', (uuid) => {
      delete this.clients[this.server.controlSocket.clients[uuid].track.station.team.city][uuid];
      this.playersConnected--;
    });
  }

  _createFrame() {
    let roundPoints = {
      teamPoints: []
    };

    for(let i in this.teams) {
      if(this.teams[i] > 0) {
        let newPoint = this._calculatePoints(i);
        this._checkCollision(newPoint);
        roundPoints.teamPoints.push(newPoint);
      }
    }

    this.game.roundPoints.push(roundPoints);
    this.server.displaySocket.broadcastUpdate(roundPoints);
  }

  _checkCollision(point) {
    for(let i in this.game.roundPoints) {
      for(let j in this.game.roundPoints[i]) {
        // if(point.x this.game.roundPoints[i][j].x )
      }
    }
  }

  _calculatePoints(city) {
    if(this.game.roundPoints.length === 0) {
      return {
        point: {
          x: Math.floor(Math.random()*width),
          y: Math.floor(Math.random()*height)
        },
        team: {
          city: city
        }
      };
    } else {
      const lastRoundPoints = this.game.roundPoints[this.game.roundPoints.length-1].teamPoints;
      let lastPoint;
      for(let i in lastRoundPoints) {
        if(lastRoundPoints[i].team.city == city) {
          lastPoint = lastRoundPoints[i];
          break;
        }
      }

      let directions = [0, 0, 0];
      for(let i in this.clients[city]) {
        directions[this.clients[city][i]]++;
      }

      if(directions[1] > directions[0] && directions[1] > directions[2]) {
        this.snakeDirection[city] += 45;
      } else if(directions[2] > directions[0]) {
        this.snakeDirection[city] -= 45;
      }
      this.snakeDirection[city] = this.snakeDirection[city] % 360;

      let x = lastPoint.point.x;
      let y = lastPoint.point.y;

      switch(this.snakeDirection[city]) {
        case 0:
          y -= 1;
          break;
        case 45:
          x += 1;
          y -= 1;
          break;
        case 90:
          x += 1;
          break;
        case 135:
          x += 1;
          y += 1;
          break;
        case 180:
          y += 1;
          break;
        case 225:
          x -= 1;
          y += 1;
          break;
        case 270:
          x -= 1;
          break;
        case 315:
          x -= 1;
          y -= 1;
          break;
      }

      return {
        point: {
          x: x % width,
          y: y % height
        },
        team: {
          city: city
        }
      };
    }
  }

  _incomingTrainMock() {
    let teams = this._currentTeamArray();
    const theTeam = teams[Math.floor(Math.random()*teams.length)];
    const track = {
      number: 1,
      station: {
        name: 'Stadtmitte',
        team: {
          city: theTeam
        }
      }
    };

    this.incomingTrain(track);

    setTimeout(this.outgoingTrain.bind(this, track), trainStayTime);
  }

  incomingTrain(track) {
    this.server.displaySocket.broadcastTrackIncoming(track);
  }

  outgoingTrain(track) {
    this.server.displaySocket.broadcastTrackOutgoing(track);
  }
}

module.exports = GameManager;