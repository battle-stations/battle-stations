let express = require('express');
let router = express.Router();
let GameManager = require('../game/number-guessing');
let TeamManager = require('../game/teams');


let gameManager = new GameManager();
gameManager.startGame();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Hello');
});

router.get('/guess/:team/:number', function(req, res) {
  let result = gameManager.guessNumber(req.params.number, req.params.team);

  if (result) {
    res.json({status: 'success'});
  } else {
    res.json({status: 'failure', message: gameManager.lastError});
  }
});

router.get('/addTeam/:teamId/', function(req, res) {
  let tmpTeam = new TeamManager(req.params.teamId);
  gameManager.addTeam(tmpTeam);
  res.json({status: 'success', teamAdded: tmpTeam.getTeamId()});
});

module.exports = router;
