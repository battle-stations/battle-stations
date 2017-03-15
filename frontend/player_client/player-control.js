$(document).ready(function() {
  // for getting screen size
  // var w = window.innerWidth;
  // var h = window.innerHeight;
  //
  // alert(h);
  // alert(w);

  var leftControl = document.getElementById("left-control");
  var rightControl = document.getElementById("right-control");

  var leftActive = false;
  var rightActive = false;

  var sendLeftStart = function() {
    if (!rightActive) {
      $('#counter').text("Left Touch Start");
      leftActive = true;
    }
  }
  var sendLeftEnd = function() {
    if (!rightActive) {
      $('#counter').text("Left Touch End");
      leftActive = false;
    }
  }
  var sendRightStart = function() {
    if (!leftActive) {
      $('#counter').text("Right Touch Start");
      rightActive = true;
    }
  }
  var sendRightEnd = function() {
    if(!leftActive) {
      $('#counter').text("Right Touch End");
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
