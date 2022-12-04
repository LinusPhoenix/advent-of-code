import { promises as fs } from "fs";
import { sum } from "../util/sum.js";

const charToPriority = (c: string) => {
    const code = c.charCodeAt(0);

    if (65 <= code && code <= 90) {
        // Uppercase A-Z.
        // Returns priority 27 through 52.
        return code - 38;
    } else if (97 <= code && code <= 122) {
        // Lowercase a-z.
        // Returns priority 1 through 26.
        return code - 96;
    }
    throw new Error(`Illegal character ${c} with code ${code}`);
};

const input = await fs.readFile("../input/day3.txt", "utf8");

// Throw away the last line as it is empty.
const lines = input.split("\n").slice(0, -1);

const compartments = lines.map((line) => {
    const half = line.length / 2;
    return {
        first: line.slice(0, half),
        second: line.slice(half),
    };
});
const duplicates = compartments
    // Split each compartment into arrays of individual character.
    .map((compartment) => {
        return {
            first: compartment.first.split(""),
            second: compartment.second.split(""),
        };
    })
    // Intersect the two arrays to find common characters, return the first one (there should be exactly one).
    .map((compartment) => compartment.first.filter((char) => compartment.second.includes(char))[0]);
const totalPriority = duplicates.map(charToPriority).reduce(sum);

console.log(
    `The sum of priorities of each item appearing in both compartments in its respective backpack is ${totalPriority}.`,
);

const groups = lines.reduce((array, line, index) => {
    // Divide into 3 groups.
    const groupIndex = Math.floor(index / 3);

    if (!array[groupIndex]) {
        array[groupIndex] = [];
    }

    array[groupIndex].push(line);
    return array;
}, [] as string[][]);
const badges = groups
    // Split each backpack in the group into arrays of individual character.
    .map((group) => {
        return {
            first: group[0].split(""),
            second: group[1].split(""),
            third: group[2].split(""),
        };
    })
    // Intersect the three arrays to find common characters, return the first one (there should be exactly one).
    .map(
        (group) =>
            group.first
                .filter((char) => group.second.includes(char))
                .filter((char) => group.third.includes(char))[0],
    );
const badgeTotalPriority = badges.map(charToPriority).reduce(sum);

console.log(`The sum of priorities of each group's badge is ${badgeTotalPriority}.`);
