describe('Player indication after join', function() {  
    it('Player control should known team city', function() {    	
    	let control = new ControlSocket(testToken);
    	assert.equal("Stuttgart", testToken.split("_")[0]);
    });
});