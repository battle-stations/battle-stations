// let express = require('express');
// let app = express();
// let http = require('http').Server(app);
let events = require('events');
let ws = require('ws');
let uuid = require('uuid');

let GameSerialization = require('./game-serialization');

class DisplaySocket extends events.EventEmitter {
  constructor() {
    super();

    this.clients = {};
  }

  addClient(ws) {
    this.clients[ws.uuid] = ws;
    ws.status = 0;
    this.emit('connect', ws.uuid);

    ws.on('message', (message) => {
      let decoded = GameSerialization.decodeMessage(message);
      switch(decoded.opcode) {
        case 'JIN':
          this._JIN(ws, decoded);
          break;
        case 'ACK':
          this._ACK(ws, decoded);
          break;
        case 'ERR':
          this._ERR(ws, decoded);
          break;
        default:
          ws.send(GameSerialization.encodeError(1));
          break;
      }
    });

    ws.on('close', () => {
      this.emit('disconnect', ws.uuid);
    });
  }

  sendToken(uuid, token) {
    let ws = this.clients[uuid];
    if(ws.status === 0) {
      ws.send(GameSerialization.encodeMessage('TKN', 'Token', {
        token: token
      }));
    }
  }

  sendGame(uuid, currentGame) {
    let ws = this.clients[uuid];
    if(ws.status === 1) {
      ws.send(GameSerialization.encodeMessage('CGM', 'Game', currentGame));
    }
  }

  sendOver(uuid, gameStatistics) {
    let ws = this.clients[uuid];
    if(ws.status === 1) {
      ws.send(GameSerialization.encodeMessage('OVR', 'GameStatistics', gameStatistics));
    }
  }

  broadcastUpdate(roundPoints) {
    for(let uuid in this.clients) {
      let ws = this.clients[uuid];
      if(ws.status === 2) {
        ws.send(GameSerialization.encodeMessage('UDT', 'RoundPoints', roundPoints));
      }
    };
  }

  broadcastOver(gameStatistics) {
    for(let uuid in this.clients) {
      let ws = this.clients[uuid];
      if(ws.status === 2) {
        ws.send(GameSerialization.encodeMessage('OVR', 'GameStatistics', gameStatistics));
      }
    };
  }

  broadcastNew() {
    for(let uuid in this.clients) {
      let ws = this.clients[uuid];
      if(ws.status === 3) {
        ws.send(GameSerialization.encodeMessage('NEW'));
      }
    };
  }

  broadcastTrackIncoming(track) {
    for(let uuid in this.clients) {
      let ws = this.clients[uuid];
      if(ws.status === 2 && ws.track.number == track.number &&
        ws.track.station.name == track.station.name && ws.track.station.team.city == track.station.team.city) {
          ws.send(GameSerialization.encodeMessage('ITN'));
      }
    };
  }

  broadcastTrackOutgoing(track) {
    for(let uuid in this.clients) {
      let ws = this.clients[uuid];
      if(ws.status === 4 && ws.track.number == track.number &&
        ws.track.station.name == track.station.name && ws.track.station.team.city == track.station.team.city) {
          ws.send(GameSerialization.encodeMessage('OTN'));
      }
    };
  }

  _JIN(ws, decoded) {
    if(ws.status === 0) {
      let decodedMessage = GameSerialization.Track.decode(decoded.message);
      ws.track = decodedMessage;
      this.emit('join', ws.uuid, decodedMessage);
    } else {
      ws.send(GameSerialization.encodeError(2));
    }
  }

  _ACK(ws, decoded) {
    let nStatus = GameSerialization.Status.decode(decoded.message).number;
    if(ws.status === 0 || ws.status === 4) {
      ws.status = nStatus;
      this.emit('gameState', ws.uuid);
    } else if(ws.status === 1 || ws.status === 2 || ws.status === 3) {
      ws.status = nStatus;
    } else {
      ws.send(GameSerialization.encodeError(2));
    }
  }

  _ERR(ws, decoded) {
    this.emit('err', ws.uuid, GameSerialization.Error.decode(decoded.message));
  }
}

class ControlSocket extends events.EventEmitter {
  constructor() {
    super();

    this.clients = {};
  }

  addClient(ws) {
    this.clients[ws.uuid] = ws;
    ws.status = 0;
    this.emit('connect', ws.uuid);

    ws.on('message', (message) => {
      let decoded = GameSerialization.decodeMessage(message);
      switch(decoded.opcode) {
        case 'JIN':
          this._JIN(ws, decoded);
          break;
        case 'RDN':
          this._RDN(ws, decoded);
          break;
        case 'LDN':
          this._LDN(ws, decoded);
          break;
        case 'RUP':
          this._RUP(ws, decoded);
          break;
        case 'LUP':
          this._LUP(ws, decoded);
          break;
        case 'ERR':
          this._ERR(ws, decoded);
          break;
        default:
          ws.send(GameSerialization.encodeError(1));
          break;
      }
    });
  }

  _JIN(ws, decoded) {
    let token = GameSerialization.Token.decode(decoded.message);
    let tokenArray = token.split('_');
    ws.track = {
      number: parseInt(tokenArray[2]),
      station: {
        name: tokenArray[1],
        team: {
          city: tokenArray[0]
        }
      }
    };
    this.emit('join', ws.uuid, );
    this._changeAndSendStatus(ws, 1);
  }

  _RDN(ws, decoded) {
    this.emit('rightDown', ws.uuid);
    this._changeAndSendStatus(ws, 2);
  }

  _LDN(ws, decoded) {
    this.emit('leftDown', ws.uuid);
    this._changeAndSendStatus(ws, 3);
  }

  _RUP(ws, decoded) {
    this.emit('rightUp', ws.uuid);
    this._changeAndSendStatus(ws, 1);
  }

  _LUP(ws, decoded) {
    this.emit('leftUp', ws.uuid);
    this._changeAndSendStatus(ws, 1);
  }

  _changeAndSendStatus(ws, status) {
    ws.status = status;
    ws.send(GameSerialization.encodeMessage('ACK', 'Status', {number: ws.status}));
  }
}

class ServerSocket {
  constructor() {
    this.displaySocket = new DisplaySocket();
    this.controlSocket = new ControlSocket();
    this._wss = new ws.Server({port: 8080});

    this._wss.on('connection', (ws) => {
      ws.uuid = uuid.v4();

      switch(ws.protocol) {
        case 'display':
          this.displaySocket.addClient(ws);
          break;
        case 'control':
          this.controlSocket.addClient(ws);
          break;
        default:
          ws.send('Nope, sorry.');
          break;
      }
    });
  }
}

module.exports = ServerSocket;

// app.use('/', express.static(__dirname + '/../../frontend/'));
// app.use('/messages', express.static(__dirname + '/../../messages/'));

// let socket = new ServerSocket(http);
// let track = {
//   number: 1,
//   station: {
//     name: 'Stadtmitte',
//     team: {
//       city: 'Stuttgart'
//     }
//   }
// };

// // Testing
// socket.displaySocket.on('join', (uuid, track) => {
//   socket.displaySocket.sendToken(uuid, 'aToken');
// });

// socket.displaySocket.on('gameState', (uuid) => {
//   socket.displaySocket.sendGame(uuid, {roundPoints: [{teamPoints: [{point: {x: 1, y: 2}, team: track.station.team}]}]});
// });

// setInterval(() => {
//   socket.displaySocket.broadcastUpdate({teamPoints: [{point: {x: 1, y: 2}, team: track.station.team}]});
// }, 2000);

// setInterval(() => {
//   socket.displaySocket.broadcastTrackIncoming(track);
//   setTimeout(() => {
//     socket.displaySocket.broadcastTrackOutgoing(track);
//   }, 2000);
// }, 11111);

// setInterval(() => {
//   socket.displaySocket.broadcastOver();
//   setTimeout(() => {
//     socket.displaySocket.broadcastNew();
//   }, 2000);
// }, 30000);

// http.listen(3000, () => {
//   console.log('listening on *:3000');
// });
