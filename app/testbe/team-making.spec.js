const assert = require('assert');
const chai = require('chai');
const GameManager = require('../backend/games/game-manager-new');
const GameSerialization = require('../backend/socket/game-serialization');
const WebSocket = require('ws');

const should = chai.should();

let gameManager;

describe('#21', () => {
    it('team should be assigned according to token', done => {
        gameManager = new GameManager();

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