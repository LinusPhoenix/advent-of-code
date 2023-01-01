import { promises as fs } from "fs";
import { mod } from "../util/mod.js";
import { sum } from "../util/reducers.js";

const addSnafu = (a: string, b: string) => {
    const result = [] as string[];
    const length = a.length > b.length ? a.length : b.length;
    let carry = 0;
    for (let i = 0; i < length || carry != 0; i++) {
        const digitA = snafuDigitToDecimal(a.at(-(i + 1)) || "0");
        const digitB = snafuDigitToDecimal(b.at(-(i + 1)) || "0");
        let sum = carry + digitA + digitB;
        if (sum > 2) {
            carry = 1;
        } else if (sum < -2) {
            carry = -1;
        } else {
            carry = 0;
        }
        sum = mod(sum + 2, 5) - 2;
        result.push(decimalDigitToSnafu(sum));
    }
    return result.reverse().join("");
};

const snafuToDecimal = (snafu: string) => {
    const digits = snafu.split("").reverse();
    return digits.map((digit, i) => snafuDigitToDecimal(digit) * Math.pow(5, i)).reduce(sum);
};

const snafuDigitToDecimal = (snafuDigit: string) => {
    switch (snafuDigit) {
        case "2":
            return 2;
        case "1":
            return 1;
        case "0":
            return 0;
        case "-":
            return -1;
        case "=":
            return -2;
        default:
            throw new Error(`Unknown snafu digit: ${snafuDigit}`);
    }
};

const decimalDigitToSnafu = (digit: number) => {
    switch (digit) {
        case 2:
            return "2";
        case 1:
            return "1";
        case 0:
            return "0";
        case -1:
            return "-";
        case -2:
            return "=";
        default:
            throw new Error(`Invalid decimal for snafu: ${digit}`);
    }
};

const input = await fs.readFile("../input/day25.txt", "utf8");
// Throw away the last line as it is empty.
const lines = input.split("\n").slice(0, -1);

const snafuSum = lines.reduce((sum, snafu) => addSnafu(sum, snafu));

console.log(`The SNAFU number to supply to Bob's console is: ${snafuSum}`);

// TODO: Part 2 pending
