const assert = require('assert');
const chai = require('chai');
const Chain = require('../backend/chain');
const should = chai.should();

class MockSocket {
    constructor() {
    }

    addClient(ws) {
    }
}

describe('Chain of responsibility', () => {
    it('should handle display and control client joins', done => {
        let displayMockSocket = new MockSocket();
        displayMockSocket.addClient = function(ws) {
            ws.should.equal('displayWS');
        };

        let controlMockSocket = new MockSocket();
        controlMockSocket.addClient = function(ws) {
            ws.should.equal('controlWS');
        };

        let chain = new Chain.DisplayHandler(displayMockSocket);
        chain.add(new Chain.ControlHandler(controlMockSocket)); 

        
        chain.handle('control', 'controlWS');
        chain.handle('display', 'displayWS');
        done();
    });
});