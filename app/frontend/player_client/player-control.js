
let token = getToken();
let controlSocket = null;

$(document).ready(function() {
  
  let leftButton = new ControlButton(document.getElementById("left-control"), "Left");
  let rightButton = new ControlButton(document.getElementById("right-control"), "Right");

  leftButton.setNeighborButton(rightButton);
  rightButton.setNeighborButton(leftButton);

  let controlSocket = new ControlSocket(token);
  setTeamName(token);
  
})

function setTeamName(token) {
  let splitToken = token.split("_");
  if (splitToken.length > 0) 
    $("#teamName").text(splitToken[0]);
}

function getToken() {
  // let pathname = window.location.pathname;
  // let res = pathname.split("/");
  // let token = res[res.length - 1];
  let token = "team_station_gleis";
  return token;
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
      
      controlSocket["send" + this.direction + "Up"]();
    }
  };
  
  sendStop() {
    if (this.ongoingTouch) {
      this.ongoingTouch = false;
      this.neighbor.htmlButton.disabled = false;
      // $.controlSocket["send" + this.direction + "Down"]();
      controlSocket["send" + this.direction + "Down"]();
    }
  }

  setNeighborButton(neighbor) {
    this.neighbor = neighbor;
  }
}