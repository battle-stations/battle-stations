$(document).ready(function() {

  var leftControl = document.getElementById("left-control");
  var rightControl = document.getElementById("right-control");

  //to avoid multitouch events
  var leftActive = false;
  var rightActive = false;

  var sendLeftStart = function() {
    if (!rightActive) {
      $('#counter').text("Left Touch Start");
      rightControl.disabled = true;
      leftActive = true;
    }
  }
  var sendLeftEnd = function() {
    if (!rightActive) {
      $('#counter').text("Left Touch End");
      rightControl.disabled = false
      leftActive = false;
    }
  }
  var sendRightStart = function() {
    if (!leftActive) {
      $('#counter').text("Right Touch Start");
      leftControl.disabled = true;
      rightActive = true;
    }
  }
  var sendRightEnd = function() {
    if(!leftActive) {
      $('#counter').text("Right Touch End");
      leftControl.disabled = false;
      rightActive = false;
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
