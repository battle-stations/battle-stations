$(document).ready(function() {

  var leftControl = document.getElementById("left-control");
  var rightControl = document.getElementById("right-control");

  //to avoid multitouch events
  var leftActive = false;
  var rightActive = false;

  var sendLeftStart = function() {
    if (!rightActive) {
      rightControl.disabled = true;
      leftActive = true;

      //send Left Touch Start to Backend

    }
  }
  var sendLeftEnd = function() {
    if (!rightActive) {
      rightControl.disabled = false
      leftActive = false;

      //send Left Touch End to Backend

    }
  }
  var sendRightStart = function() {
    if (!leftActive) {
      leftControl.disabled = true;
      rightActive = true;

      //send Right Touch Start to Backend

    }
  }
  var sendRightEnd = function() {
    if(!leftActive) {
      leftControl.disabled = false;
      rightActive = false;

      //send Right Touch End to Backend

    }
  }

  leftControl.addEventListener("touchstart", sendLeftStart);
  leftControl.addEventListener("touchend", sendLeftEnd);
  rightControl.addEventListener("touchstart", sendRightStart);
  rightControl.addEventListener("touchend", sendRightEnd);

  //for click events on non-touch devices
  leftControl.addEventListener("mousedown", sendLeftStart);
  leftControl.addEventListener("mouseup", sendLeftEnd);
  rightControl.addEventListener("mousedown", sendRightStart);
  rightControl.addEventListener("mouseup", sendRightEnd);
});

function setTeamName(teamName) {
  $("#teamName").text(teamName);
}
