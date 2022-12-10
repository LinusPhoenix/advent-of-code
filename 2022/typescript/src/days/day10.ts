import { promises as fs } from "fs";
import { splitArrayIntoChunks } from "../util/chunkArray.js";
import { sum } from "../util/sum.js";

type RegisterHistory = {
    completedCycles: number;
    registerX: number;
};

const input = await fs.readFile("../input/day10.txt", "utf8");
// Throw away the last line as it is empty.
const lines = input.split("\n").slice(0, -1);

const registerHistory = lines.reduce(
    (history, line) => {
        const lastCycle = history.at(-1)!;
        if (line.startsWith("noop")) {
            history.push({
                completedCycles: lastCycle.completedCycles + 1,
                registerX: lastCycle.registerX,
            });
        } else if (line.startsWith("addx")) {
            const addend = parseInt(line.substring(5));
            history.push({
                completedCycles: lastCycle.completedCycles + 1,
                registerX: lastCycle.registerX,
            });
            history.push({
                completedCycles: lastCycle.completedCycles + 2,
                registerX: lastCycle.registerX + addend,
            });
        }
        return history;
    },
    [{ completedCycles: 0, registerX: 1 }] as RegisterHistory[],
);

const signalStrengthSum = [20, 60, 100, 140, 180, 220]
    .map((cycle) => {
        const registerDuringCycle = registerHistory.at(cycle - 1)!;
        return cycle * registerDuringCycle.registerX;
    })
    .reduce(sum);

console.log(`The sum of the interesting signal strengths is ${signalStrengthSum}.`);

// The last history entry is for after cycle 240, which no longer draws a pixel.
const pixels = registerHistory.slice(0, -1).map((state) => {
    const pixel = state.completedCycles % 40;
    if (pixel >= state.registerX - 1 && pixel <= state.registerX + 1) {
        return "#";
    } else {
        return ".";
    }
});

const screenLines = splitArrayIntoChunks(pixels, 40);
screenLines.forEach((line) => console.log(line.join("")));
// ##...#...####..##...##....##..###..####.
// ##...#...####..##...##....##..###..#####
