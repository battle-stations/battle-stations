const Mediator = require('../mediator');

const frames = 25;
const trainTime = 5000;
const trainStayTime = 5000;
const startNewGameTime = 10000;
const width = 800;
const height = 600;

class GameManager {
  constructor() {
    this.mediator = new Mediator();
    //this.server = new ServerSocket();
    this.running = false;
    this.startup = true;
    this.teams = {};
    this.teamsConnected = 0;
    this._startGame();
    this.startup = false;
    this._endGame();

    this.clients = {};
    this.playersConnected = 0;

    this._mockTrainInterval = setInterval(this._incomingTrainMock.bind(this), trainTime);

    mediator.initDisplaySocket();
    mediator.initControlSocket();
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
    if(this.startup || (!this.running && this.teamsConnected > 1)) {
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
        loser: {
          city: ''
        },
        clicksPerTeam: clicksPerTeam,
        maxPlayers: 0
      };
      this.running = true;
      this.mediator.broadcastNewGame();
      this.gameStatistics.maxPlayers = this.playersConnected;
      this.frameInterval = setInterval(this._createFrame.bind(this), 1000/frames);
    }
  }

  _endGame() {
    clearInterval(this.frameInterval);
    this.mediator.broadcastGameOver(this.gameStatistics);
    this.running = false;
    setTimeout(this._startGame.bind(this), startNewGameTime);
  }

  /*_initDisplaySocket() {
    this.server.displaySocket.on('join', (uuid, track) => {
      if(this.teams[track.station.team.city] == null) {
        this.teams[track.station.team.city] = 1;
        this.teamsConnected++;
      } else {
        this.teams[track.station.team.city]++;
      }

      this._startGame();

      this.server.displaySocket.sendToken(uuid, `${track.station.team.city}_${track.station.name}_${track.number}`);
    });

    this.server.displaySocket.on('gameState', (uuid) => {
      if(this.running) {
        this.server.displaySocket.sendGame(uuid, this.game);
      } else {
        this.server.displaySocket.sendOver(uuid, this.gameStatistics);
      }
    });

    this.server.displaySocket.on('disconnect', (uuid, track) => {
      this.teams[track.station.team.city]--;
      if(this.teams[track.station.team.city] < 1) {
        this.teamsConnected--;
      }

      if(this.running && this.teamsConnected < 2) {
        this._endGame();
      }
    });
  }*/

  _countClicks(uuid) {
    for(let i in this.gameStatistics.clicksPerTeam) {
      if(this.gameStatistics.clicksPerTeam[i].team.city == mediator.getTeamCity(uuid)) {
        this.gameStatistics.clicksPerTeam[i].clicks++;
      }
    }
  }

  /*_initControlSocket() {
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
      this._countClicks(uuid);
      this.clients[this.server.controlSocket.clients[uuid].track.station.team.city][uuid] = 1;
    });

    this.server.controlSocket.on('leftDown', (uuid) => {

      this._countClicks(uuid);
      this.clients[this.server.controlSocket.clients[uuid].track.station.team.city][uuid] = 2;
    });

    this.server.controlSocket.on('rightUp', (uuid) => {
      this.clients[this.server.controlSocket.clients[uuid].track.station.team.city][uuid] = 0;
    });

    this.server.controlSocket.on('leftUp', (uuid) => {
      this.clients[this.server.controlSocket.clients[uuid].track.station.team.city][uuid] = 0;
    });

    this.server.controlSocket.on('disconnect', (uuid, track) => {
      delete this.clients[track.station.team.city][uuid];
      this.playersConnected--;
    });
  }*/

  _createFrame() {
    let roundPoints = {
      teamPoints: []
    };

    for(let i in this.teams) {
      if(this.teams[i] > 0) {
        let newPoint = this._calculatePoints(i);
        if (this._checkCollision(newPoint)) {
          this.gameStatistics.loser = {
            city: newPoint.team.city
          };
          this._endGame();
          return;
        }
        roundPoints.teamPoints.push(newPoint);
      }
    }

    this.game.roundPoints.push(roundPoints);
    //this.server.displaySocket.broadcastUpdate(roundPoints);
    mediator.broadcastGameUpdate(roundPoints);
  }

  _checkCollision(teamPoint) {
    for(let i in this.game.roundPoints) {
      for(let j in this.game.roundPoints[i].teamPoints) {
        if(teamPoint.team.city != this.game.roundPoints[i].teamPoints[j].team.city ||
          this.game.roundPoints[i].length - 10 < i) {
          if(Math.abs(teamPoint.point.x - this.game.roundPoints[i].teamPoints[j].point.x) < 4 &&
            Math.abs(teamPoint.point.y - this.game.roundPoints[i].teamPoints[j].point.y) < 4) {
              return true;
          }
        }
      }
    }
    return false;
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
      this.snakeDirection[city] = (this.snakeDirection[city] % 360 < 0) ? 360 + this.snakeDirection[city] % 360 : this.snakeDirection[city] % 360;

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
          x: (x % width < 0) ? width + (x % width) : x % width,
          y: (y % height < 0) ? height + (y % height) : y % height
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

    //this.incomingTrain(track);
    mediator.broadcastTrackIncoming(track);
    setTimeout(mediator.broadcastTrackOutgoing.bind(this, track), trainStayTime);

  }

  /*incomingTrain(track) {
    this.server.displaySocket.broadcastTrackIncoming(track);
  }

  outgoingTrain(track) {
    this.server.displaySocket.broadcastTrackOutgoing(track);
  }*/
}

module.exports = GameManager;
