describe('#29', () => {  
    it('should send join command', done => {
    	let socket = new ControlSocket('Stuttgart_Stadtmitte_1');
    	socket.onAck = () => {
    		done();
    	}
    });
});

describe('#28', () => {
    it('should send left and right up and down commands', done => {
        let socket = new ControlSocket('Stuttgart_Stadtmitte_1');
        socket.onAck = () => {
            assert.equal(socket.status, 1);
            socket.sendRightDown();
            socket.onAck = () => {
                assert.equal(socket.status, 2);
                socket.sendRightUp();
                socket.onAck = () => {
                    assert.equal(socket.status, 1);
                    socket.sendLeftDown();
                    socket.onAck = () => {
                        assert.equal(socket.status, 3);
                        socket.sendLeftUp();
                        socket.onAck = () => {
                            assert.equal(socket.status, 1);
                            done();
                        };
                    };
                };
            };
        };
    });
});