const TIME_PER_GAME = 10000;
const TIME_PER_GAME_PAUSE = 10000;
// max number is handled exclusively
const MAX_SECRET_NUMBER = 11;

class GameManager {

    constructor() {
        this.secretNumber = -1;
        this.teams = new Map();
        this.lastError = 'none';
        this.gameStarted = false;
        this.firstGuess = false;
        this.gameResult = [];
    }

    addTeam(team) {
        this.teams.set(team.id, team);
    }

    guessNumber(number, teamId) {
        let team = this.teams.get(teamId);

        // check if team is valid and game is running
        if (team) {
            if (this.gameStarted) {
                if (!this.firstGuess) {
                    this.onfirstGuess();
                    this.firstGuess = true;
                }
                team.guessNumber(number);
                return true;
            } else {
                this.lastError = 'no game running';
                return false;
            }
        } else {
            this.lastError = 'team not found';
            return false;
        }
    }

    getLastError() {
        let tmpError = lastError;
        lastError = 'none';
        return tmpError;
    }

    // prepare everything for starting a game
    startGame() {
        console.log("starting new game, waiting for guesses ...");
        this.secretNumber = Math.trunc(Math.random() * 11);
        this.gameStarted = true;
        this.firstGuess = false;
        this.lastError = 'none';
        this.gameResult = [];
        this.teams = new Map();

    }



    // start game when first guess has arrived
    onfirstGuess() {
        console.log("First guess arrived, starting game timer...");
        setTimeout(this.onfinishGame.bind(this), TIME_PER_GAME);
    }

    // evaluate team guesses 
    onfinishGame() {
        console.log("game finished");
        this.gameStarted = false;
        
        this.evaluateTeams();

        // wait some time to start new game
        setTimeout(() => {
            console.log("starting new game");
            this.startGame();
        },  TIME_PER_GAME_PAUSE);
    }

    evaluateTeams() {
        for (let team of this.teams.values()) {
            team.calculateDistance(this.secretNumber);
            this.gameResult.push(team);   
        }
        // sort teams based on distance to secret number
        this.gameResult.sort((a, b) => {
            return a.getDistance() - b.getDistance();
        });
        console.log(this.gameResult);
    }
}

module.exports = GameManager;