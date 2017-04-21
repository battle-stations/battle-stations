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