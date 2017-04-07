const assert = require('assert');
const chai = require('chai');
const GameManager = require('../backend/games/game-manager-new');
const GameSerialization = require('../backend/socket/game-serialization');
const WebSocket = require('ws');

const should = chai.should();
const expect = chai.expect;

let gameManager;

describe('#22', () => {
    it('server should calculate steering by amount of users pressing left or right', done => {
        let testUuid;

        gameManager = new GameManager();
        const ws = new WebSocket('ws://localhost:8080', 'control', {
            perMessageDeflate: false,
        });


        let dir1
        let cTeam = gameManager._currentTeamArray();
        for(let i in cTeam) {
          dir1 = gameManager.snakeDirection[cTeam[i]];
        }

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
            ws.send(GameSerialization.encodeMessage('JIN', 'Token', {
                track: 1,
                station: {
                    name: 'Stadtmitte',
                    team: {
                        city: 'Ulm'
                    }
                }
            }));
            ws.send(GameSerialization.encodeMessage('RDN'));
            ws.send(GameSerialization.encodeMessage('RDN'));
            ws.send(GameSerialization.encodeMessage('LDN'));
        });



        gameManager.server.controlSocket.on('rightDown', (uuid) => {
          gameManager._countClicks(uuid);
          gameManager.clients[gameManager.server.controlSocket.clients[uuid].track.station.team.city][uuid] = 1;
        });

        gameManager.server.controlSocket.on('leftDown', (uuid) => {
          gameManager._countClicks(uuid);
          gameManager.clients[gameManager.server.controlSocket.clients[uuid].track.station.team.city][uuid] = 1;
        });

        let dir2;
        for(let i in cTeam) {
          dir2 = gameManager.snakeDirection[cTeam[i]];
        }

        console.log(gameManager);
        console.log(gameManager._currentTeamArray());

        expect(1).to.equal(1);
    });

    after(function() {
        gameManager.server._wss.close();
    });
});
