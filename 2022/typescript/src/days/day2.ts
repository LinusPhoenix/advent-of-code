import { promises as fs } from "fs";
import { sum } from "../util/sum.js";

enum Move {
    Rock = 1,
    Paper = 2,
    Scissors = 3,
}

enum Outcome {
    Loss = 0,
    Draw = 3,
    Win = 6,
}

const getOutcome = (oppMove: Move, playerMove: Move) => {
    if (oppMove === playerMove) {
        return Outcome.Draw;
    }
    switch (oppMove) {
        case Move.Rock:
            return playerMove === Move.Paper ? Outcome.Win : Outcome.Loss;
        case Move.Paper:
            return playerMove === Move.Scissors ? Outcome.Win : Outcome.Loss;
        case Move.Scissors:
            return playerMove === Move.Rock ? Outcome.Win : Outcome.Loss;
    }
};

const getMove = (oppMove: Move, outcome: Outcome) => {
    if (outcome === Outcome.Draw) {
        return oppMove;
    }
    switch (oppMove) {
        case Move.Rock:
            return outcome === Outcome.Win ? Move.Paper : Move.Scissors;
        case Move.Paper:
            return outcome === Outcome.Win ? Move.Scissors : Move.Rock;
        case Move.Scissors:
            return outcome === Outcome.Win ? Move.Rock : Move.Paper;
    }
};

const stringToMove = (s: string) => {
    switch (s) {
        case "A":
        case "X":
            return Move.Rock;
        case "B":
        case "Y":
            return Move.Paper;
        case "C":
        case "Z":
            return Move.Scissors;
    }
    throw new Error(`Unexpected move: ${s}`);
};

const stringToOutcome = (s: string) => {
    switch (s) {
        case "X":
            return Outcome.Loss;
        case "Y":
            return Outcome.Draw;
        case "Z":
            return Outcome.Win;
    }
    throw new Error(`Unexpected outcome: ${s}`);
};

const input = await fs.readFile("../input/day2.txt", "utf8");

// Throw away the last line as it is empty.
const lines = input.split("\n").slice(0, -1);

// Part 1
const p1Rounds = lines.map((line) => {
    const oppMove = stringToMove(line.charAt(0));
    const playerMove = stringToMove(line.charAt(2));
    return {
        oppMove,
        playerMove,
    };
});
const p1Score = p1Rounds
    .map((round) => {
        const outcome = getOutcome(round.oppMove, round.playerMove);
        return round.playerMove + outcome;
    })
    .reduce(sum);

console.log(`The total score in the rock-paper-scissors tournament (part 1) would be: ${p1Score}`);

// Part 2
const p2Rounds = lines.map((line) => {
    const oppMove = stringToMove(line.charAt(0));
    const outcome = stringToOutcome(line.charAt(2));
    return {
        oppMove,
        outcome,
    };
});
const p2Score = p2Rounds
    .map((round) => {
        const playerMove = getMove(round.oppMove, round.outcome);
        return playerMove + round.outcome;
    })
    .reduce(sum);
console.log(`The total score in the rock-paper-scissors tournament (part 2) would be: ${p2Score}`);
