class TeamManager {

    constructor(teamId) {
        this.guessedNumbers = [];
        this.id = teamId;
        this.distance = -1;
    }

    getTeamId() {
        return this.teamId;
    }

    guessNumber(number) {
        this.guessedNumbers.push(parseInt(number));
    }

    getAvgGuessedNumber() {
        let sum = 0;

        for (let num of this.guessedNumbers) {
            sum += num;
        }
        return (sum / this.guessedNumbers.length);
    }

    calculateDistance(from) {
        let signedDistance = from - this.getAvgGuessedNumber(); 
        this.distance = Math.abs(signedDistance);
    }

    getDistance() {
        return this.distance;
    }
}

module.exports = TeamManager;