const ServerSocket = require('../socket/socket');

class GameManager {
  constructor() {
    this.server = new ServerSocket();
    this.game = {
      roundPoints: []
    }

    setInterval(this._createFrame.bind(this), 40);

    this._initDisplaySocket();
  }

  _initDisplaySocket() {
    this.server.displaySocket.on('join', (uuid, track) => {
      this.server.displaySocket.sendToken(uuid, `${track.station.team.city}_${track.station.name}_${track.number}`);
    });

    this.server.displaySocket.on('gameState', (uuid) => {
      this.server.displaySocket.sendGame(uuid, this.game);
    });
  }

  _createFrame() {
    
  }
}

module.exports = GameManager;