let assert =  chai.assert;
let socket = null;
let socket2 = null;
let testToken = "";

describe('Join game', function() {  
    it('should return token', function(done) {
    	socket = new DisplaySocket("Stuttgart", "Stadtmitte", 1);
    	socket.onToken = function(token) {
    		testToken = token.token;
    		assert.equal(token.token, "Stuttgart_Stadtmitte_1");
    		done();
    	}
    });
});

describe('Graphic representation', function() {  
    it('Server should send latest game after join', function(done) {    	
    	socket2 = new DisplaySocket("Ulm", "Stadtmitte", 1);
    	let run = false;
    	socket2.onCurrentGame = function(game) {
    		//console.log('Game: ', game);
    		if(!run) {
    			run = true;
    			done();
    		}
    	};
    });
});

describe('Get feedback about player input', function() {  
    it('server should return ACK', function(done) {    	
    	let control = new ControlSocket(testToken);
   		control.sendLeftDown();
   		control.onAck = done;
    });
});

describe('Player indication after join', function() {  
    it('Player control should known team city', function() {    	
    	let control = new ControlSocket(testToken);
    	assert.equal("Stuttgart", testToken.split("_")[0]);
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

/*describe('Finish game', function() {  
    it('should finish game after collision', function(done) {
    	this.timeout(60000);
    	let finished = false;
    	socket.onOver = function() {
    		//console.log('onOver');
    		if(!finished) {
    			finished = true;
    			done();
    		}
    	}
    });
});*/	 