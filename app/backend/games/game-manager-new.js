const ServerSocket = require('../socket/socket');

class GameManager {
  constructor() {
    this.server = new ServerSocket();
    this.game = {
      roundPoints: []
    }

    this._initDisplaySocket();
  }

  _initDisplaySocket() {
    this.server.displaySocket.on('join', (uuid, track) => {
      this.server.displaySocket.sendToken(`${track.station.team.city}_${track.station.name}_${track.number}`);
    });

    this.server.displaySocket.on('gameState', (uuid) => {
      this.server.displaySocket.sendGame(this.game);
    });
  }
}

module.exports = GameManager;