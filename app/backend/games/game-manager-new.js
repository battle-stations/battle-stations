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

    this._mockTrainInterval = setInterval(this._incomingTrainMock.bind(this), trainTime);

    this._initDisplaySocket();
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
    let clicksPerTeam = [];
    let cTeam = this._currentTeamArray();
    for(let i in cTeam) {
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

    });
  }

  _createFrame() {
    let roundPoints = {
      teamPoints: []
    };

    for(let i in this.teams) {
      if(this.teams[i] > 0) {
        roundPoints.teamPoints.push(this._calculatePoints(i));
      }
    }

    this.game.roundPoints.push(roundPoints);
    this.server.displaySocket.broadcastUpdate(roundPoints);
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
      for(let i in lastRoundPoints) {
        if(lastRoundPoints[i].team.city == city) {
          const lastPoint = lastRoundPoints[i];
          break;
        }
        return {
          point: {
            x: lastPoint.x+1,
            y: lastPoint.y+1
          },
          team: {
            city: city
          }
        };
      }
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