const assert = require('assert');
const chai = require('chai');
const Mediator = require('../backend/mediator');
const GameSerialization = require('../backend/socket/game-serialization');
const WebSocket = require('ws');

const should = chai.should();

let mediator;

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


describe('#22', () => {

    before(() => {
        mediator = new Mediator();

        // first display
        const display0 = new WebSocket('ws://localhost:8080', 'display', {
            perMessageDeflate: false,
        });
        display0.binaryType = 'arraybuffer';
        display0.on('open', () => {
            // send join request
            display0.send(GameSerialization.encodeMessage('JIN', 'Track', track0));
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

                default:
                    break;
            }
        });


    });

    it('should average the steering of users ', done => {
        // flag to specify if both players should press down -> only one down does not change direction
        let directions = [];
        let counter = 2;



        // second display
        const display1 = new WebSocket('ws://localhost:8080', 'display', {
            perMessageDeflate: false,
        });
        display1.binaryType = 'arraybuffer';
        display1.on('open', () => {
            // send join request
            display1.send(GameSerialization.encodeMessage('JIN', 'Track', track1));
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

                case 'UDT':
                    // check if direction changed over last two frames
                    if (counter > 0) {
                        directions.push(mediator.game.snakeDirection.Stuttgart);
                        counter --;
                    } else {
                        directions[0].should.not.be.equal(directions[1]);
                        done();
                    }
                    break;

                default:
                    break;
            }
        });

        // first control client
        let control0 = new WebSocket('ws://localhost:8080', 'control', {
            perMessageDeflate: false,
        });
        control0.binaryType = 'arraybuffer';
        control0.on('open', () => {
            // send join request
            control0.send(GameSerialization.encodeMessage('JIN', 'Token', {token: 'Stuttgart_Stadtmitte_1'}));
            control0.status = 0;
        });

        // second control client
        let control1 = new WebSocket('ws://localhost:8080', 'control', {
            perMessageDeflate: false,
        });
        control1.binaryType = 'arraybuffer';
        control1.on('open', () => {
            // send join request
            control1.send(GameSerialization.encodeMessage('JIN', 'Token', {token: 'Stuttgart_Stadtmitte_1'}));
            control1.status = 0;
        });


        control0.on('message', (event) => {

            let decoded = GameSerialization.decodeMessage(new Uint8Array(event));

            switch (decoded.opcode) {
                // agree on token
                case 'ACK':
                    control0.send(GameSerialization.encodeMessage(`RDN`));
                    break;

                default:
                    break;
            }
        });

        control1.on('message', (event) => {

            let decoded = GameSerialization.decodeMessage(new Uint8Array(event));

            switch (decoded.opcode) {
                // agree on token
                case 'ACK':
                    control1.send(GameSerialization.encodeMessage(`RDN`));
                    break;

                default:
                    break;
            }
        });




    });

    // free port 8080 after test
    after(() => {
        //console.log(gameManager.snakeDirection);
        mediator.server._wss.close();
    });
});
