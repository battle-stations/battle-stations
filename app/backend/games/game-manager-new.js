const ServerSocket = require('../socket/socket');

class GameManager {
  constructor() {
    this.server = new ServerSocket();
    this.game = {
      roundPoints: []
    }
    this.teams = {};

    setInterval(this._createFrame.bind(this), 40);

    this._initDisplaySocket();
  }

  _initDisplaySocket() {
    this.server.displaySocket.on('join', (uuid, track) => {
      if(this.teams[track.station.team.city] == null) {
        this.teams[track.station.team.city] = 1;
      } else {
        this.teams[track.station.team.city]++;
      }
      this.server.displaySocket.sendToken(uuid, `${track.station.team.city}_${track.station.name}_${track.number}`);
    });

    this.server.displaySocket.on('gameState', (uuid) => {
      this.server.displaySocket.sendGame(uuid, this.game);
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
    return {
      point: {
        x: 0,
        y: 0
      },
      team: {
        city: city
      }
    };
  }
}

module.exports = GameManager;