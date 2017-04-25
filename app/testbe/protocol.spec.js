const assert = require('assert');
const chai = require('chai');
const Mediator = require('../backend/mediator');
const GameSerialization = require('../backend/socket/game-serialization');
const WebSocket = require('ws');

const should = chai.should();

let mediator;

describe('#29', () => {
    it('should delete a client when it disconnects', done => {
        let testUuid;

        mediator = new Mediator();
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

        mediator.server.controlSocket.on('join', (uuid, token) => {
            testUuid = uuid;
            should.exist(mediator.server.controlSocket.clients[testUuid]);
        });

        mediator.server.controlSocket.on('disconnect', () => {
            should.not.exist(mediator.server.controlSocket.clients[testUuid]);
            done();
        });

    });

    after(function() {
        mediator.server._wss.close();
    });
});
