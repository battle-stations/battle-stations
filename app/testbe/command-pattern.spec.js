const assert = require('assert');
const chai = require('chai');
const GameManager = require('../backend/games/game-manager-new');
const GameSerialization = require('../backend/socket/game-serialization');
const WebSocket = require('ws');

const should = chai.should();

let gameManager;

describe('command pattern', () => {
    it('should send an error message when connecting with a wrong protocol', done => {
      gameManager = new GameManager();
      const ws = new WebSocket('ws://localhost:8080', 'noprotocol', {
          perMessageDeflate: false
      });

      ws.on('message', msg => {
        should.exist(msg);
        ws.close();
        done();
      });
    });

    after(() => {
        gameManager.server._wss.close();
    });
});