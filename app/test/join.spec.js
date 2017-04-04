let assert =  chai.assert;

describe('Join game', function() {  
    it('should return token', function(done) {
    	let socket = new DisplaySocket("Stuttgart", "Stadtmitte", 1);
    	socket.onToken = function(token) {
    		assert.equal(token.token, "Stuttgart_Stadtmitte_1");
    		done();
    	}
    });
});