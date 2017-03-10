var shortid = require('shortid');

var registeredLocations = [];
var waitingLocations = [];

function isLocationRegistered(id) {
  for (var i = 0; i < registeredLocations.length; i++) {
    if (id == registeredLocations[i]) {
      return true;
    }
  }
  return false;
}

exports.registerLocation = function() {
  var locationId = shortid.generate();
  registeredLocations.push(locationId);
  return locationId;
};

exports.registerScreen = function(locationId) {
  if (isLocationRegistered(locationId)) {
    var screenId = shortid.generate();
    return screenId;
  } else {
    return -1;
  }
}

exports.registerClient = function(locationId) {
  if (isLocationRegistered(locationId)) {
    var clientId = shortid.generate();
    // open connection to client to get steering
    return clientId;
  } else {
    return -1;
  }
}

exports.startGame = function(locationId) {
  if (waitingLocations.length > 0) {
    opponentId = waitingLocations[0];
    // notify opponent
    waitingLocations.shift();
    return opponentId;
  } else {
    return -1;
  }
};

exports.waitForGame = function(locationId) {
  waitingLocations.push(locationId);
};
