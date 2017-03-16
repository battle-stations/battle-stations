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
  constructor(city) {
    this._socket = new WebSocket('ws://localhost:8080', 'display');
    this._socket.binaryType = 'arraybuffer';
    this._socket.onopen = (event) => {
      this._socket.send(GameSerialization.encodeMessage('JIN', 'Track', {
        number: 1,
        station: {
          name: 'Stadtmitte',
          team: {
            city: 'Stuttgart'
          }
        }
      }));
    };
    this._socket.onmessage = (event) => {
      let decoded = GameSerialization.decodeMessage(new Uint8Array(event.data));
      switch(decoded.opcode) {
        case 'TKN':
          this.onToken(GameSerialization.Token.decode(decoded.message));
          break;
      }
    }
  }

  onToken(message) {
    
  }
}

class ControlSocket {
  
}

let startSocket = () => {
  let displaySocket = new DisplaySocket('test');
  
  displaySocket.onToken = (message) => {
    console.log('TKN', message);
  };
}

GameSerialization.whenReady(startSocket);
