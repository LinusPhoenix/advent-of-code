import { promises as fs } from "fs";
import { sum } from "../util/reducers.js";

const input = await fs.readFile("../input/day1.txt", "utf8");

// Split on blank lines to get each elf's inventory
const elfInventories = input.split("\n\n");
const elfInventoryLines = elfInventories.map((inventory) => inventory.split("\n"));
const elfInventoryCalories = elfInventoryLines.map((inventory) => inventory.map(parseInt));
const calorySums = elfInventoryCalories.map((inventory) => inventory.reduce(sum));

// Make a shallow copy calorySums here to prevent modifying it in-place,
// to preserve immutability.
const sortedCalorySums = [...calorySums].sort((a, b) => (a > b ? -1 : 1));

console.log(`The elf carrying the most calories carries ${sortedCalorySums[0]} calories.`);

const top3Calories = sortedCalorySums.slice(0, 3).reduce(sum);
console.log(`The three elves carrying the most calories carry ${top3Calories} calories.`);
