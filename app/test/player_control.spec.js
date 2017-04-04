describe('Get feedback about player input', function() {  
    it('server should return ACK', function(done) {
    	let socket = new DisplaySocket("Ulm", "Stadtmitte", 1);
    	socket.onToken = function(token) {
    		let control = new ControlSocket(token.token);

    		control.sendLeftDown();
    		control.onAck = done;
    	}
    });
});