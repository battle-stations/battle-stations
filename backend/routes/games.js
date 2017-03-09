var express = require('express');
var router = express.Router();
var gameManager = require('../games/game-manager.js')


router.get('/registerLocation', function(req, res, next) {
  var locId = gameManager.registerLocation();
  var opponentId = gameManager.startGame(locId);

  // check if other locations exist, if so start a new game
  var started = true;
  if (opponentId === -1) {
      // wait for other locations to join
      started = false;
      gameManager.waitForGame(locId);
  }

  res.json({ locationId: locId, gameStarted:  started});
});

router.get('/registerScreen/:locationId', function(req, res, next) {
  var sId = gameManager.registerScreen(req.params['locationId']);

  // check if the given location exists
  var screenRegistered = true;
  if (sId === -1) {
      screenRegistered = false;
  }

  res.json({ screenId: sId, screenRegistered:  screenRegistered});
});

router.get('/registerClient/:locationId', function(req, res, next) {
  var cId = gameManager.registerScreen(req.params['locationId']);

  // check if the given location exists
  var clientRegisterd = true;
  if (cId === -1) {
      clientRegisterd = false;
  }

  res.json({ clientId: cId, clientRegistered:  clientRegisterd});
});




module.exports = router;
