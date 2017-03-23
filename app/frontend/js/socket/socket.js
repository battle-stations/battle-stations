/**
 * Creates a socket object for the display client.
 *
 * @class DisplaySocket
 */
class DisplaySocket {
  /**
   * Creates an instance of DisplaySocket.
   * @param {string} city The identity string of the city (i.e. stuttgart, munich)
   *
   * @memberOf DisplaySocket
   */
  constructor(city, station, track) {
    this.status = 0;
    this.track = {
      number: track,
      station: {
        name: station,
        team: {
          city: city
        }
      }
    };

    this._socket = new WebSocket('ws://localhost:8080', 'display');
    this._socket.binaryType = 'arraybuffer';
    this._socket.onopen = this._onOpen;
    this._socket.onmessage = (event) => {
      let decoded = GameSerialization.decodeMessage(new Uint8Array(event.data));

      switch(decoded.opcode) {
        case 'TKN':
          if(this.status === 0) {
            this.onToken(GameSerialization.Token.decode(decoded.message));
            this.status = 1;
            this._socket.send(GameSerialization.encodeMessage('ACK', 'Status', {number: this.status}));
          } else {
            this._socket.send(GameSerialization.encodeError(2));
          }
          break;
        case 'CGM':
          if(this.status === 1) {
            this.onCurrentGame(GameSerialization.Game.decode(decoded.message));
            this.status = 2;
            this._socket.send(GameSerialization.encodeMessage('ACK', 'Status', {number: this.status}));
          } else {
            this._socket.send(GameSerialization.encodeError(2));
          }
          break;
        case 'OVR':
          if(this.status === 1 || this.status === 2) {
            this.onOver();
            this.status = 3;
            this._socket.send(GameSerialization.encodeMessage('ACK', 'Status', {number: this.status}));
          } else {
            this._socket.send(GameSerialization.encodeError(2));
          }
          break;
        case 'UDT':
          if(this.status === 2) {
            this.onUpdate(GameSerialization.RoundPoints.decode(decoded.message));
          } else {
            this._socket.send(GameSerialization.encodeError(2));
          }
          break;
        case 'ITN':
          if(this.status === 2) {
            this.onIncomingTrain();
            this.status = 4;
            this._socket.send(GameSerialization.encodeMessage('ACK', 'Status', {number: this.status}));
          } else {
            this._socket.send(GameSerialization.encodeError(2));
          }
          break;
        case 'NEW':
          if(this.status === 3) {
            this.onNew();
            this.status = 2;
            this._socket.send(GameSerialization.encodeMessage('ACK', 'Status', {number: this.status}));
          } else {
            this._socket.send(GameSerialization.encodeError(2));
          }
          break;
        case 'OTN':
          if(this.status === 4) {
            this.onOutgoingTrain();
            this.status = 1;
            this._socket.send(GameSerialization.encodeMessage('ACK', 'Status', {number: this.status}));
          } else {
            this._socket.send(GameSerialization.encodeError(2));
          }
          break;
        case 'ERR':
          this.onError(GameSerialization.Error.decode(decoded.message));
          break;
        default:
          this._socket.send(GameSerialization.encodeError(1));
          break;
      }
    }
  }

  onToken(message) {}
  onCurrentGame(message) {}
  onOver() {}
  onUpdate(message) {}
  onIncomingTrain() {}
  onNew() {}
  onOutgoingTrain() {}

  onError(message) {
    console.log(message);
  }

  _onOpen(event) {
    this._socket.send(GameSerialization.encodeMessage('JIN', 'Track', this.track));
  }
}

class ControlSocket {
  constructor(token) {
    this.status = 0;
    this.token = {
      token: token
    };

    this._socket = new WebSocket('ws://localhost:8080', 'display');
    this._socket.binaryType = 'arraybuffer';
    this._socket.onopen = this._onOpen;
    this._socket.onmessage = (event) => {
      let decoded = GameSerialization.decodeMessage(new Uint8Array(event.data));

      switch(decoded.opcode) {
        case 'ACK':
          this.status = GameSerialization.Status.decode(decoded.message).number;
          break;
        case 'ERR':
          this.onError(GameSerialization.Error.decode(decoded.message));
          break;
        default:
          this._socket.send(GameSerialization.encodeError(1));
          break;
      }
    }
  }

  sendRightDown() {
    if(this.status == 1) {
      this._socket.send(GameSerialization.encodeMessage(`RDN`));
    }
  }

  sendLeftDown() {
    if(this.status == 1) {
      this._socket.send(GameSerialization.encodeMessage(`LDN`));
    }
  }

  sendRightUp() {
    if(this.status == 2) {
      this._socket.send(GameSerialization.encodeMessage(`RUP`));
    }
  }

  sendLeftUp() {
    if(this.status == 3) {
      this._socket.send(GameSerialization.encodeMessage(`LUP`));
    }
  }

  onError(message) {
    console.log(message);
  }

  _onOpen(event) {
    this._socket.send(GameSerialization.encodeMessage('JIN', 'Token', this.token));
  }
}

// let startSocket = () => {
//   let displaySocket = new DisplaySocket('Stuttgart', 'Stadtmitte', 1);

//   displaySocket.onToken = (message) => {
//     console.log('TKN', message);
//   };

//   displaySocket.onCurrentGame = (message) => {
//     console.log('CGM', message);
//   }

//   displaySocket.onOver = () => {
//     console.log('OVR');
//   }

//   displaySocket.onUpdate = (message) => {
//     console.log('UDT', message);
//   }

//   displaySocket.onIncomingTrain = () => {
//     console.log('ITN');
//   }

//   displaySocket.onNew = () => {
//     console.log('NEW');
//   }

//   displaySocket.onOutgoingTrain = () => {
//     console.log('OTN')
//   }
// }

// GameSerialization.whenReady(startSocket);
