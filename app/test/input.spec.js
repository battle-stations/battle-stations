describe('Get feedback about player input', function() {  
    it('server should return ACK', function(done) {    	
    	let control = new ControlSocket(testToken);
   		control.sendLeftDown();
   		control.onAck = done;
    });
});