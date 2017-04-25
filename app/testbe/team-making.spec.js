const assert = require('assert');
const chai = require('chai');
const Mediator = require('../backend/mediator')
const GameManager = require('../backend/games/game-manager-new');
const GameSerialization = require('../backend/socket/game-serialization');
const WebSocket = require('ws');

const should = chai.should();

let gameManager;
let mediator;

describe('#21', () => {
    it('should assign new users according to their token', done => {
      mediator = new Mediator();
      gameManager = mediator.game;

        const controlWS = new WebSocket('ws://localhost:8080', 'control', {
            perMessageDeflate: false,
        });

        // connect control and assign to team stuttgart
        controlWS.on('open', () => {
            controlWS.send(GameSerialization.encodeMessage('JIN', 'Token', {
              token: "Stuttgart_Stadtmitte_1"
            }));
        });

        gameManager.server.controlSocket.on('join', (uuid, token) => {
          gameManager.server.controlSocket.clients[uuid].track.station.team.should.have.property('city', 'Stuttgart');
          done();
        });
    });

    // free port 8080 after test
    after(function() {
        gameManager.server._wss.close();
    });
});
