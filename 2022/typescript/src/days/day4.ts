import { promises as fs } from "fs";

const lineToAssignmentPairs = (line: string) => {
    const pairs = line.split(",");
    return pairs.map((range) => {
        const bounds = range.split("-");
        return {
            low: parseInt(bounds[0]),
            high: parseInt(bounds[1]),
        };
    });
};

const input = await fs.readFile("../input/day4.txt", "utf8");

// Throw away the last line as it is empty.
const lines = input.split("\n").slice(0, -1);

const assignmentPairs = lines.map(lineToAssignmentPairs);
const duplicateAssignments = assignmentPairs.filter((pair) => {
    const first = pair[0];
    const second = pair[1];

    const firstContainsSecond = first.low <= second.low && second.high <= first.high;
    const secondContainsFirst = second.low <= first.low && first.high <= second.high;

    return firstContainsSecond || secondContainsFirst;
});

console.log(
    `The list of assignment pairs contains ${duplicateAssignments.length} pairs in which one of the assignments contains the other completely.`,
);

const overlappingAssignments = assignmentPairs.filter((pair) => {
    const first = pair[0];
    const second = pair[1];

    // An interval overlaps if either
    // - first.low <= second.low <= first.high <= second.high or
    // - second.low <= first.low <= second.high <= first.high
    // This is equivalent to first.low <= second.high and second.low <= first.high.
    return first.low <= second.high && second.low <= first.high;
});

console.log(
    `The list of assignment pairs contains ${overlappingAssignments.length} pairs in which the two assignments overlap.`,
);
