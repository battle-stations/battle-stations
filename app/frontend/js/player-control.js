
let controlSocket = null;

$(document).ready(function() {
  
  let leftButton = new ControlButton(document.getElementById("left-control"), "Left");
  let rightButton = new ControlButton(document.getElementById("right-control"), "Right");

  leftButton.setNeighborButton(rightButton);
  rightButton.setNeighborButton(leftButton);

  let token = window.location.search.split('=')[1];
  console.log(token); 
  if(token == undefined)
    throw 'Enter token in url!';

  controlSocket = new ControlSocket();
  setTeamName(token);  
  
})

function setTeamName(token) {
  let splitToken = token.split("_");
  if (splitToken.length > 0) 
    $("#teamName").text(splitToken[0]);
}

class ControlButton {
  constructor(htmlButton, direction) {
    this.scope = this;
    this.htmlButton = htmlButton;
    htmlButton.addEventListener("touchstart", this.sendStart.bind(this.scope));
    htmlButton.addEventListener("touchend", this.sendStop.bind(this.scope));
    
    //for testing on non-mobile devices
    htmlButton.addEventListener("mousedown", this.sendStart.bind(this.scope));
    htmlButton.addEventListener("mouseup", this.sendStop.bind(this.scope));

    this.neighbor = null;
    this.direction = direction;
    this.ongoingTouch = false;
  };

  sendStart() {
    if(!this.neighbor.ongoingTouch) {
      this.ongoingTouch = true;
      this.neighbor.htmlButton.disabled = true; 


      if(this.direction == 'Right')
        controlSocket.sendRightDown();
      else if(this.direction == 'Left')
        controlSocket.sendLeftDown();
    }
  };
  
  sendStop() {
    if (this.ongoingTouch) {
      this.ongoingTouch = false;
      this.neighbor.htmlButton.disabled = false;

      if(this.direction == 'Right')
        controlSocket.sendRightUp();
      else if(this.direction == 'Left')
        controlSocket.sendLeftUp();
      // $.controlSocket["send" + this.direction + "Down"]();
    }
  }

  setNeighborButton(neighbor) {
    this.neighbor = neighbor;
  }
}