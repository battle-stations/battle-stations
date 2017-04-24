describe('Get feedback about player input', function() {  
    it('server should return ACK', function(done) {    	
    	let control = new ControlSocket(testToken);
		let button = new ControlButton(document.createElement("button"), "Left");
		button.addObserver(control);
		button.sendStop();
   		control.onAck = done;
    });
});