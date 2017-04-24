
let controlSocket = null;

$(document).ready(function() {

  let token = window.location.search.split('=')[1];
  // console.log(token); 
  if(token == undefined)
    throw 'Enter token in url!';

  controlSocket = new ControlSocket(token);
  setTeamName(token);  


  let leftButton = new ControlButton(document.getElementById("left-control"), "Left");
  let rightButton = new ControlButton(document.getElementById("right-control"), "Right");

  leftButton.addObserver(rightButton);
  leftButton.addObserver(controlSocket);

  rightButton.addObserver(leftButton);
  rightButton.addObserver(controlSocket);


})

function setTeamName(token) {
  let splitToken = token.split("_");
  if (splitToken.length > 0) 
    $("#teamName").text(splitToken[0]);
}

class ControlButton extends Subject {
  constructor(htmlButton, direction) {
    super();
    this.htmlButton = htmlButton;
    htmlButton.addEventListener("touchstart", this.sendStart.bind(this));
    htmlButton.addEventListener("touchend", this.sendStop.bind(this));

    //for testing on non-mobile devices
    htmlButton.addEventListener("mousedown", this.sendStart.bind(this));
    htmlButton.addEventListener("mouseup", this.sendStop.bind(this));
    
    this.otherStarted = false;
    this.direction = direction;
  };

  update(value){
    if (value.includes("start")) {
      this.otherStarted = true;
      this.htmlButton.disabled = true;
    } else if (value.includes("end")) {
      this.otherStarted = false;
      this.htmlButton.disabled = false;
    }
  };

  sendStart() {
    if (!this.otherStarted) {
      this.notify("start"+this.direction);
    }
  };
  
  sendStop() {
    if (!this.otherStarted) {
      this.notify("end" + this.direction);
    }
  }
}