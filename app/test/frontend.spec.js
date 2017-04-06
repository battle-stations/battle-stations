let assert =  chai.assert;
let socket = null;
let socket2 = null;

describe('Join game', function() {  
    it('should return token', function(done) {
    	socket = new DisplaySocket("Stuttgart", "Stadtmitte", 1);
    	socket.onToken = function(token) {
    		assert.equal(token.token, "Stuttgart_Stadtmitte_1");
    		done();
    	}
    });
});

describe('Get feedback about player input', function() {  
    it('server should return ACK', function(done) {
    	socket2 = new DisplaySocket("Ulm", "Stadtmitte", 1);
    	socket2.onToken = function(token) {
    		let control = new ControlSocket(token.token);

    		control.sendLeftDown();
    		control.onAck = done;
    	}
    });
});

describe('Pause game', function() {  
    it('should pause after xx seconds', function(done) {
    	this.timeout(6000);
    	let paused = false;
    	socket.onIncomingTrain = function(msg) {
    		if(!paused) {
    			paused = true;
    			done();
    		}
    	}
    	socket2.onIncomingTrain = function(msg) {
    		if(!paused) {
    			paused = true;
    			done();
    		}
    	}
    });
}); 	 