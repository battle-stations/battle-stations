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

class ServerSocket extends BindingEventEmitter {
  constructor() {
    super();

    this.clients = {};
    this.wss = new ws.Server({port: 8080});

    this.wss.on('connection', (ws) => {
      ws.uuid = uuid.v4();
      this.clients[ws.uuid] = ws;
      ws.status = 0;
      this.emit('displayconnect', ws.uuid);

      switch(ws.protocol) {
        case 'display':
          ws.on('message', (message) => {
            let decoded = GameSerialization.decodeMessage(message);
            switch(decoded.opcode) {
              case 'JIN':
                this._displayJIN(ws, decoded);
                break;
              case 'TKN':
                break;
              default:
                ws.send(GameSerialization.encodeError(1));
                break;
            }
          });
          break;
        default:
          ws.send('Nope, sorry.');
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

  _displayJIN(ws, decoded) {
    if(ws.status === 0) {
      this.emit('displayjoin', ws.uuid, GameSerialization.Track.decode(decoded.message));
    } else {
      ws.send(GameSerialization.encodeError(2));
    }
  }

  _disconnect() {
    // console.log(`user disconnected`);
  }
}

app.use('/', express.static(__dirname + '/../../frontend/'));
app.use('/messages', express.static(__dirname + '/../../messages/'));

let socket = new ServerSocket(http);

// Testing
socket.on('displayjoin', (uuid, track) => {
  socket.sendToken(uuid, 'aToken');
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});