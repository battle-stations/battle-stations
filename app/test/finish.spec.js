describe('Finish game', function() {  
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
}); 	