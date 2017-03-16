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

    this._socket = new WebSocket('ws://localhost:8080', 'display');
    this._socket.binaryType = 'arraybuffer';
    this._socket.onopen = this._onOpen.bind(this, city, station, track);
    this._socket.onmessage = (event) => {
      let decoded = GameSerialization.decodeMessage(new Uint8Array(event.data));

      switch(decoded.opcode) {
        case 'TKN':
          if(this.status === 0) {
            this.status = 1;
            this.onToken(GameSerialization.Token.decode(decoded.message));
          } else {
            this._socket.send(GameSerialization.encodeError(2));
          }
          break;
        case 'CGM':
          if(this.status === 1) {
            this.status = 2;
            this.onCurrentGame(GameSerialization.Game.decode(decoded.message));
            this._socket.send(GameSerialization.encodeMessage('ACK'));
          } else {
            this._socket.send(GameSerialization.encodeError(2));
          }
          break;
        case 'OVR':
          if(this.status === 1) {
            this.status = 3;
            this.onOver();
            this._socket.send(GameSerialization.encodeMessage('ACK'));
          } else {
            this._socket.send(GameSerialization.encodeError(2));
          }
        default:
          this._socket.send(GameSerialization.encodeError(1));
          break;
      }
    }
  }

  onToken(message) {}
  onCurrentGame(message) {}
  onOver() {}

  _onOpen(city, station, track, event) {
    this._socket.send(GameSerialization.encodeMessage('JIN', 'Track', {
      number: track,
      station: {
        name: station,
        team: {
          city: city
        }
      }
    }));
  }
}

class ControlSocket {
  
}

let startSocket = () => {
  let displaySocket = new DisplaySocket('Stuttgart', 'Stadtmitte', 1);

  displaySocket.onToken = (message) => {
    console.log('TKN', message);
  };

  displaySocket.onCurrentGame = (message) => {
    console.log('CGM', message);
  }

  displaySocket.onOver = () => {
    console.log('OVR');
  }
}

GameSerialization.whenReady(startSocket);
