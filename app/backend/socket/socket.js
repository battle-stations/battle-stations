let express = require('express');
let app = express();
let http = require('http').Server(app);
let events = require('events');
let ws = require('ws');
let uuid = require('uuid');

let GameSerialization = require('./game-serialization');

class BindingEventEmitter extends events.EventEmitter {
  constructor() {
    super();
  }

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }
}

class DisplaySocket extends BindingEventEmitter {
  constructor() {
    super();

    this.clients = {};
  }

  addDisplayClient(ws) {
    this.clients[ws.uuid] = ws;
    ws.status = 0;
    this.emit('connect', ws.uuid);

    ws.on('message', (message) => {
      let decoded = GameSerialization.decodeMessage(message);
      switch(decoded.opcode) {
        case 'JIN':
          this._displayJIN(ws, decoded);
          break;
        case 'ACK':
          this._displayACK(ws, decoded);
          break;
        case 'ERR':
          this._displayERR(ws, decoded);
          break;
        default:
          ws.send(GameSerialization.encodeError(1));
          break;
      }
    });
  }

  sendToken(uuid, token) {
    let ws = this.clients[uuid];
    if(ws.status === 0) {
      ws.send(GameSerialization.encodeMessage('TKN', 'Token', {
        token: token
      }));
      ws.status = 1;
    }
  }

  sendGame(uuid, currentGame) {
    let ws = this.clients[uuid];
    if(ws.status === 1) {
      ws.send(GameSerialization.encodeMessage('CGM', 'Game', currentGame));
      ws.status = 2;
    }
  }

  sendOver(uuid) {
    let ws = this.clients[uuid];
    if(ws.status === 1) {
      ws.send(GameSerialization.encodeMessage('OVR'));
      ws.status = 3;
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

  broadcastOver() {
    for(let uuid in this.clients) {
      let ws = this.clients[uuid];
      if(ws.status === 2) {
        ws.send(GameSerialization.encodeMessage('OVR'));
        ws.status = 3;
      }
    };
  }

  broadcastNew() {
    for(let uuid in this.clients) {
      let ws = this.clients[uuid];
      if(ws.status === 3) {
        ws.send(GameSerialization.encodeMessage('NEW'));
        ws.status = 2;
      }
    };
  }

  broadcastTrackIncoming(track) {
    for(let uuid in this.clients) {
      let ws = this.clients[uuid];
      if(ws.status === 2 && ws.track.number == track.number &&
        ws.track.station.name == track.station.name && ws.track.station.team.city == track.station.team.city) {
          ws.send(GameSerialization.encodeMessage('ITN'));
          ws.status = 4;
      }
    };
  }

  broadcastTrackOutgoing(track) {
    for(let uuid in this.clients) {
      let ws = this.clients[uuid];
      if(ws.status === 4 && ws.track.number == track.number &&
        ws.track.station.name == track.station.name && ws.track.station.team.city == track.station.team.city) {
          ws.send(GameSerialization.encodeMessage('OTN'));
          ws.status = 1;
      }
    };
  }

  _displayJIN(ws, decoded) {
    if(ws.status === 0) {
      let decodedMessage = GameSerialization.Track.decode(decoded.message);
      ws.track = decodedMessage;
      this.emit('join', ws.uuid, decodedMessage);
    } else {
      ws.send(GameSerialization.encodeError(2));
    }
  }

  _displayACK(ws, decoded) {
    if(ws.status === 1) {
      this.emit('ack1', ws.uuid);
    } else if(ws.status === 2) {
      this.emit('ack2', ws.uuid);
    } else if(ws.status === 3) {
      this.emit('ack3', ws.uuid);
    } else if(ws.status === 4) {
      this.emit('ack4', ws.uuid);
    } else {
      ws.send(GameSerialization.encodeError(2));
    }
  }

  _displayERR(ws, decoded) {
    this.emit('err', ws.uuid, GameSerialization.Error.decode(decoded.message));
  }
}

class ServerSocket extends BindingEventEmitter {
  constructor() {
    super();

    this.displaySocket = new DisplaySocket();
    this._wss = new ws.Server({port: 8080});

    this._wss.on('connection', (ws) => {
      ws.uuid = uuid.v4();

      switch(ws.protocol) {
        case 'display':
          this.displaySocket.addDisplayClient(ws);
          break;
        default:
          ws.send('Nope, sorry.');
          break;
      }
    });
  }
}

app.use('/', express.static(__dirname + '/../../frontend/'));
app.use('/messages', express.static(__dirname + '/../../messages/'));

let socket = new ServerSocket(http);
let track = {
  number: 1,
  station: {
    name: 'Stadtmitte',
    team: {
      city: 'Stuttgart'
    }
  }
};

// Testing
socket.displaySocket.on('join', (uuid, track) => {
  socket.displaySocket.sendToken(uuid, 'aToken');
  socket.displaySocket.sendGame(uuid, {roundPoints: [{teamPoints: [{point: {x: 1, y: 2}, team: track.station.team}]}]});
});

socket.displaySocket.on('ack1', (uuid) => {
  console.log('ack1');
});

socket.displaySocket.on('ack2', (uuid) => {
  console.log('ack2');
  socket.displaySocket.broadcastUpdate({teamPoints: [{point: {x: 1, y: 2}, team: track.station.team}]});
  socket.displaySocket.broadcastTrackIncoming(track);
});

socket.displaySocket.on('ack3', (uuid) => {
  console.log('ack3');
});

socket.displaySocket.on('ack4', (uuid) => {
  console.log('ack4');
  socket.displaySocket.broadcastTrackOutgoing(track);
});


http.listen(3000, () => {
  console.log('listening on *:3000');
});