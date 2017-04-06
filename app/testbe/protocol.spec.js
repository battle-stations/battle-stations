const assert = require('assert');
const chai = require('chai');
const GameManager = require('../backend/games/game-manager-new');
const GameSerialization = require('../backend/socket/game-serialization');
const WebSocket = require('ws');

const should = chai.should();

let gameManager;

describe('#29', () => {
    it('should delete a client when it disconnects', done => {
        let testUuid;

        gameManager = new GameManager();
        const ws = new WebSocket('ws://localhost:8080', 'control', {
            perMessageDeflate: false,
        });

        ws.on('open', () => {
            ws.send(GameSerialization.encodeMessage('JIN', 'Token', {
                track: 1,
                station: {
                    name: 'Stadtmitte',
                    team: {
                        city: 'Stuttgart'
                    }
                }
            }));
        });
        
        ws.on('message', (msg) => {
            ws.close();
        });

        gameManager.server.controlSocket.on('join', (uuid, token) => {
            testUuid = uuid;
            should.exist(gameManager.server.controlSocket.clients[testUuid]);
        });

        gameManager.server.controlSocket.on('disconnect', () => {
            should.not.exist(gameManager.server.controlSocket.clients[testUuid]);
            done();
        });

    });

    after(function() {
        gameManager.server._wss.close();
    });
});