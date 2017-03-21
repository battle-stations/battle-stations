class GameSerialization {
  static _generateOpcode(opcode) {
    const opcodeLength = 3;
    if(opcode.length === opcodeLength) {
      let opcodeArray = new Uint8Array(opcodeLength);
      for(let i = 0; i < opcodeLength; i++) {
        opcodeArray[i] = opcode.charCodeAt(i);
      }
      return opcodeArray;
    }
    return null;
  }

  static encodeMessage(opcode, type, message) {
    let opcodeArray = GameSerialization._generateOpcode(opcode);
    if(opcodeArray !== null) {
      if(type !== undefined && type !== null) {
        return new Uint8Array([...opcodeArray, ...GameSerialization[type].encode(message).finish()]);
      } else {
        return opcodeArray;
      }
    }
    return null;
  }

  static decodeMessage(message) {
    let opcode = '';
    let opcodeArray = message.subarray(0, 3);
    for(let i in opcodeArray) {
      opcode += String.fromCharCode(opcodeArray[i]);
    }
    return {
      opcode: opcode,
      message: message.subarray(3)
    }
  }

  static encodeError(errorCode) {
    let errorMessage;
    switch(errorCode) {
      case 1:
        errorMessage = 'This opcode does not exist.';
        break;
      case 2:
        errorMessage = 'Opcode not expected.';
        break;
      default:
        errorMessage = 'Unkown error.';
        break;
    }
    return GameSerialization.encodeMessage('ERR', 'Error', {
      number: errorCode,
      message: errorMessage
    });
  }

  static whenReady(callback) {
    if(!GameSerialization.initialized) {
      GameSerialization.callbacks.push(callback);
    } else {
      callback();
    }
  }

  static _ready() {
    for(let i in GameSerialization.callbacks) {
      GameSerialization.callbacks[i]();
    }
  }
}

GameSerialization.initialized = false;
GameSerialization.callbacks = [];

protobuf.load("/messages/game.proto", (err, root) => {
  if (err) throw err;

  GameSerialization.Point = root.lookup('game.Point');
  GameSerialization.Team = root.lookup('game.Team');
  GameSerialization.Station = root.lookup('game.Station');
  GameSerialization.Track = root.lookup('game.Track');
  GameSerialization.TeamPoint = root.lookup('game.TeamPoint');
  GameSerialization.RoundPoints = root.lookup('game.RoundPoints');
  GameSerialization.Game = root.lookup('game.Game');
  GameSerialization.Token = root.lookup('game.Token');
  GameSerialization.Status = root.lookup('game.Status');
  GameSerialization.Error = root.lookup('game.Error');

  GameSerialization.initialized = true;
  GameSerialization._ready();
});