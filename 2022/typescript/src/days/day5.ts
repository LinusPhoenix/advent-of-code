import { promises as fs } from "fs";
import { transpose } from "../util/matrix.js";

type Instruction = {
    itemCount: number;
    fromStack: number;
    toStack: number;
};

const stackLineToItems = (stackLine: string, stackCount: number) => {
    const items: string[] = [];

    // This isn't functional programming, sue me.
    for (let i = 0; i < stackCount; i++) {
        // First element is at index 1, then 5, then 9, then 13...
        const item = stackLine.charAt(i * 4 + 1);
        items.push(item);
    }

    return items;
};

const parseInstruction = (line: string) => {
    const regex = /move (\d+) from (\d+) to (\d+)/g;

    var match = regex.exec(line);
    if (match == null) {
        throw new Error(`Invalid instruction line: ${line}`);
    }

    return {
        // Be careful, match[0] is the whole match, capturing groups start at 1.
        itemCount: parseInt(match[1]),
        fromStack: parseInt(match[2]),
        toStack: parseInt(match[3]),
    };
};

const moveCratesOneByOne = (stacks: string[][], instruction: Instruction) => {
    const newStacks = [...stacks];
    const from = [...stacks[instruction.fromStack - 1]];
    const to = [...stacks[instruction.toStack - 1]];

    // Reverse the elements so we have the "one by one" moving behavior.
    const itemsToMove = from
        .splice(from.length - instruction.itemCount, instruction.itemCount)
        .reverse();
    to.push(...itemsToMove);

    newStacks[instruction.fromStack - 1] = from;
    newStacks[instruction.toStack - 1] = to;

    return newStacks;
};

const moveCratesTogether = (stacks: string[][], instruction: Instruction) => {
    const newStacks = [...stacks];
    const from = [...stacks[instruction.fromStack - 1]];
    const to = [...stacks[instruction.toStack - 1]];

    const itemsToMove = from.splice(from.length - instruction.itemCount, instruction.itemCount);
    to.push(...itemsToMove);

    newStacks[instruction.fromStack - 1] = from;
    newStacks[instruction.toStack - 1] = to;

    return newStacks;
};

const input = await fs.readFile("../input/day5.txt", "utf8");

const lines = input.split("\n");

const stackCountLine = lines.filter((line) => line.startsWith(" 1"))[0];
// There's always 3 spaces in between each stack number.
// Before the first element and after the last element there's an additional space,
// so by adding another space we can simply divide the line length by 4 to get the number of stacks.
const stackCount = (stackCountLine.length + 1) / 4;
// Each element is a horizontal row of the stack element grid.
const stackLines = lines.filter((line) => line.includes("["));
// Each outer element is a horizontal row of the stack element grid, each inner element is one of the stack's items.
const stackLineItems = stackLines.map((line) => stackLineToItems(line, stackCount));
// Reversing the array so the bottom-most stack item is first when iterating, then transposing the 2-dimensional array.
// Each outer element is an array of stack items, starting at the bottom-most. All stacks have full length, padded with " " items.
const stackItems = transpose(stackLineItems.reverse()) as string[][];
// Each outer element is an array of stack items, starting at the bottom-most. No padding, different lengths.
// Finally, input parsed! Woo!
const stacks = stackItems.map((stack) =>
    stack.reduce((array, item) => {
        // Don't push " " items.
        if (item === " ") {
            return array;
        } else {
            return [...array, item];
        }
    }, [] as string[]),
);

const instructions = lines.filter((line) => line.startsWith("m")).map(parseInstruction);
const finalStacks = instructions.reduce(
    (stacks, instruction) => moveCratesOneByOne(stacks, instruction),
    stacks,
);
const topCrates = finalStacks.map((stack) => [...stack].pop()).join("");

console.log(
    `After the crane has moved around the crates one by one, the top crates are: ${topCrates}`,
);

const finalStacksPartTwo = instructions.reduce(
    (stacks, instruction) => moveCratesTogether(stacks, instruction),
    stacks,
);
const topCratesPartTwo = finalStacksPartTwo.map((stack) => [...stack].pop()).join("");

console.log(
    `After the crane has moved around the crates together, the top crates are: ${topCratesPartTwo}`,
);
