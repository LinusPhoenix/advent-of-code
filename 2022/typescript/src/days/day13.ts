import { promises as fs } from "fs";
import { sum } from "../util/reducers.js";

type PacketElement = number | PacketElement[];
type Packet = PacketElement[];
type PacketPair = {
    left: Packet;
    right: Packet;
};

const isNumeric = (char: string) => {
    return /^\d$/.test(char);
};

const findClosingBracket = (line: string) => {
    let depth = 0;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === "[") {
            depth++;
        }
        if (char === "]") {
            if (depth === 0) {
                return i;
            } else {
                depth--;
            }
        }
    }
    throw new Error("No matching closing bracket found!");
};

const readArray = (line: string): PacketElement[] => {
    const array = [] as PacketElement[];
    let intBuffer = "";
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (isNumeric(char)) {
            intBuffer = intBuffer.concat(char);
        } else if (char === ",") {
            if (intBuffer !== "") {
                array.push(parseInt(intBuffer));
            }
            intBuffer = "";
        } else if (char === "[") {
            const restOfLine = line.slice(i + 1);
            const closingIndex = findClosingBracket(restOfLine);
            const subarray = readArray(restOfLine.slice(0, closingIndex));
            array.push(subarray);
            i += closingIndex;
        }
    }
    if (intBuffer !== "") {
        array.push(parseInt(intBuffer));
    }
    intBuffer = "";
    return array;
};

const comparePacketElement = (left: PacketElement, right: PacketElement): number => {
    if (typeof left === "number" && typeof right === "number") {
        return left - right;
    }
    if (Array.isArray(left) && Array.isArray(right)) {
        const length = left.length > right.length ? left.length : right.length;
        for (let i = 0; i < length; i++) {
            const leftElem = left.at(i);
            const rightElem = right.at(i);
            if (leftElem == null && rightElem != null) {
                return -1;
            } else if (leftElem != null && rightElem == null) {
                return 1;
            } else if (leftElem != null && rightElem != null) {
                const compare = comparePacketElement(leftElem, rightElem);
                if (compare !== 0) {
                    return compare;
                }
            }
        }
        return 0;
    }
    if (typeof left === "number" && Array.isArray(right)) {
        return comparePacketElement([left], right);
    }
    if (Array.isArray(left) && typeof right === "number") {
        return comparePacketElement(left, [right]);
    }
    return 0;
};

const input = await fs.readFile("../input/day13.txt", "utf8");

const packetPairs: PacketPair[] = input.split("\n\n").map((pair) => {
    const pairLines = pair.split("\n");
    const packets = pairLines.map((line) => readArray(line.slice(1, -1)));

    return {
        left: packets[0],
        right: packets[1],
    };
});

const arePairsInRightOrder = packetPairs.map(
    (pair) => comparePacketElement(pair.left, pair.right) < 0,
);

const rightOrderSum = arePairsInRightOrder
    .map((isRightOrder, index) => (isRightOrder ? index + 1 : 0))
    .reduce(sum);

console.log(`The sum of the indices of the pairs in the right order is: ${rightOrderSum}`);

const dividers = [[[2]], [[6]]];
const allPackets = packetPairs.reduce((pairs, pair) => {
    pairs.push(pair.left, pair.right);
    return pairs;
}, [] as Packet[]);
allPackets.push(...dividers);
allPackets.sort(comparePacketElement);

const firstDivider = allPackets.findIndex((packet) => packet === dividers[0]) + 1;
const secondDivider = allPackets.findIndex((packet) => packet === dividers[1]) + 1;

console.log(`The decoder key for the distress signal is: ${firstDivider * secondDivider}`);
