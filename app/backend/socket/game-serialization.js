let protobuf = require('protobufjs');

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
}

GameSerialization.initialized = false;

protobuf.load("messages/game.proto", (err, root) => {
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

  // Create a new message
  // var message = AwesomeMessage.create({ awesomeField: "AwesomeString" });

  // // Encode a message to an Uint8Array (browser) or Buffer (node)
  // var buffer = AwesomeMessage.encode(message).finish();
  // // ... do something with buffer

  // // Or, encode a plain object
  // var buffer = AwesomeMessage.encode({ awesomeField: "AwesomeString" }).finish();
  // // ... do something with buffer

  // // Decode an Uint8Array (browser) or Buffer (node) to a message
  // var message = AwesomeMessage.decode(buffer);
  // ... do something with message

  // If your application uses length-delimited buffers, there is also encodeDelimited and decodeDelimited.
});

module.exports = GameSerialization;