const assert = require('assert');
const chai = require('chai');
const GameManager = require('../backend/games/game-manager-new');
const GameSerialization = require('../backend/socket/game-serialization');
const WebSocket = require('ws');

const should = chai.should();

let gameManager;

const track0 = {
    track: 1,
    station: {
        name: 'Stadtmitte',
        team: {
            city: 'Stuttgart'
        }
    }
};

const track1 = {
    track: 1,
    station: {
        name: 'Platz',
        team: {
            city: 'Ulm'
        }
    }
};


describe('#26', () => {

    it('should automatically start a new game', done => {
        gameManager = new GameManager();

        // first display
        const display0 = new WebSocket('ws://localhost:8080', 'display', {
            perMessageDeflate: false,
        });
        display0.binaryType = 'arraybuffer';
        display0.on('open', () => {
            gameManager.should.have.property('running', false);
            // send join request
            display0.send(GameSerialization.encodeMessage('JIN', 'Track', track0));
        });



        // second display
        const display1 = new WebSocket('ws://localhost:8080', 'display', {
            perMessageDeflate: false,
        });
        display1.binaryType = 'arraybuffer';
        display1.on('open', () => {
            // send join request
            display1.send(GameSerialization.encodeMessage('JIN', 'Track', track1));
        });

        
        display0.on('message', (event) => {
            let decoded = GameSerialization.decodeMessage(new Uint8Array(event));

            switch (decoded.opcode) {
                // agree on token
                case 'TKN':
                    display0.status = 1;
                    display0.send(GameSerialization.encodeMessage('ACK', 'Status', {number: display0.status}));
                    break;

                // confirm game over
                case 'OVR':
                    display0.status = 3;
                    display0.send(GameSerialization.encodeMessage('ACK', 'Status', {number: display0.status}));
                    break;
                
                // current game state
                case 'CGM':
                    display0.status = 2;
                    display0.send(GameSerialization.encodeMessage('ACK', 'Status', {number: display0.status}));
                    break;
                
                // updated game state
                case 'UDT':
                    gameManager.should.have.property('running', true);
                    done();
                    break;
            
                default:
                    break;
            }
        });

        display1.on('message', (event) => {
            let decoded = GameSerialization.decodeMessage(new Uint8Array(event));

            switch (decoded.opcode) {
                // agree on token
                case 'TKN':
                    display1.status = 1;
                    display1.send(GameSerialization.encodeMessage('ACK', 'Status', {number: display1.status}));
                    break;

                // confirm game over
                case 'OVR':
                    display1.status = 3;
                    display1.send(GameSerialization.encodeMessage('ACK', 'Status', {number: display1.status}));
                    break;

                // running game
                case 'CGM':
                    display1.status = 2;
                    display1.send(GameSerialization.encodeMessage('ACK', 'Status', {number: display1.status}));
                    break;
            
                default:
                    break;
            }
        });
        
    });

    // free port 8080 after test
    after(() => {
        gameManager.server._wss.close();
    });
});
