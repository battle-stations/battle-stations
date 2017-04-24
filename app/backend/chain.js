class Handler {

    constructor() {
        this.successor = null;
    }

    add(handler) {
        if (this.successor) {
            this.successor.add(handler);
        } else {
            this.successor = handler;
        }
    }

    handle(request, ws) {
        // to be overriden in subclass
    }
}

class DisplayHandler extends Handler {

    constructor(displaySocket) {
        super();
        this.displaySocket = displaySocket;
    }

    handle(request, ws) {
        if (request == 'display') {
            this.displaySocket.addClient(ws);
        } else {
            this.successor.handle(request, ws);
        }
    }
}

class ControlHandler extends Handler {

    constructor(controlSocket, sourceSocket) {
        super(sourceSocket);
        this.controlSocket = controlSocket;
    }

    handle(request, ws) {
        if (request == 'control') {
            this.controlSocket.addClient(ws);
        } else {
            this.successor.handle(request, ws);
        }
    }
}

module.exports = {
  ControlHandler : ControlHandler,
  DisplayHandler : DisplayHandler
}

