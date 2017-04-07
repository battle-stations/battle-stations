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