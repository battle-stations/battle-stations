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