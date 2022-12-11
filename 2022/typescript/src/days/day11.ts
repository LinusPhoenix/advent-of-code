import { promises as fs } from "fs";

type MonkeyProps = {
    id: number;
    items: number[];
    updateWorry: (old: number) => number;
    testDivisor: number;
    targets: {
        testTrue: number;
        testFalse: number;
    };
};

class Monkey {
    public readonly id;
    private readonly items;
    private readonly updateWorry;
    public readonly testDivisor;
    private readonly targets;

    private itemsInspectedCount;

    constructor(props: MonkeyProps) {
        this.id = props.id;
        this.items = props.items;
        this.updateWorry = props.updateWorry;
        this.testDivisor = props.testDivisor;
        this.targets = props.targets;
        this.itemsInspectedCount = 0n;
    }

    clone() {
        return new Monkey({
            id: this.id,
            items: this.items.slice(),
            updateWorry: this.updateWorry,
            testDivisor: this.testDivisor,
            targets: this.targets,
        });
    }

    takeTurn(monkeys: Map<number, Monkey>, lcm: number, relief: boolean) {
        this.items.forEach((item) => {
            this.itemsInspectedCount++;
            let updatedWorry = this.updateWorry(item);
            if (relief) {
                updatedWorry = Math.floor(updatedWorry / 3);
            }
            const test = updatedWorry % this.testDivisor == 0;

            const target = monkeys.get(test ? this.targets.testTrue : this.targets.testFalse);
            target?.receiveItem(updatedWorry % lcm);
        });
        while (this.items.length > 0) {
            this.items.pop();
        }
    }

    receiveItem(item: number) {
        this.items.push(item);
    }

    getItemsInspectedCount() {
        return this.itemsInspectedCount;
    }
}

const input = await fs.readFile("../input/day11.txt", "utf8");
const monkeysInput = input.split("\n\n");

const monkeys = monkeysInput.map((monkeyInput) => {
    const lines = monkeyInput.split("\n");
    const id = parseInt(lines[0].slice(7, -1));
    const items = lines[1]
        .slice(18)
        .split(", ")
        .map((s) => parseInt(s));
    const expression = lines[2].split("= ").at(-1)!;
    const updateWorry = eval(`(old) => ${expression}`);
    const testDivisor = parseInt(lines[3].slice(21));
    const targets = {
        testTrue: parseInt(lines[4].slice(29)),
        testFalse: parseInt(lines[5].slice(30)),
    };

    return new Monkey({
        id,
        items,
        updateWorry,
        testDivisor,
        targets,
    });
});

const leastCommonMultiple = monkeys.reduce((lcm, monkey) => lcm * monkey.testDivisor, 1);

const mapOfMonkeysPartOne = monkeys
    .map((monkey) => monkey.clone())
    .reduce((map, monkey) => {
        map.set(monkey.id, monkey);
        return map;
    }, new Map<number, Monkey>());

const mapOfMonkeysPartTwo = monkeys
    .map((monkey) => monkey.clone())
    .reduce((map, monkey) => {
        map.set(monkey.id, monkey);
        return map;
    }, new Map<number, Monkey>());

// Simulate the rounds for part one.
for (let i = 1; i <= 20; i++) {
    console.log(`Starting round ${i}...`);
    for (const monkey of mapOfMonkeysPartOne.values()) {
        monkey.takeTurn(mapOfMonkeysPartOne, leastCommonMultiple, true);
    }
}

const monkeyBusinessPartOne = [...mapOfMonkeysPartOne.values()]
    .map((monkey) => monkey.getItemsInspectedCount())
    .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
    .slice(0, 2)
    .reduce((product, factor) => product * factor);

console.log(
    `The level of monkey business after 20 rounds of stuff-slinging simian shenanigans is: ${monkeyBusinessPartOne}`,
);

// Simulate the rounds for part two.
for (let i = 1; i <= 10_000; i++) {
    console.log(`Starting round ${i}...`);
    for (const monkey of mapOfMonkeysPartTwo.values()) {
        monkey.takeTurn(mapOfMonkeysPartTwo, leastCommonMultiple, false);
    }
}

const monkeyBusinessPartTwo = [...mapOfMonkeysPartTwo.values()]
    .map((monkey) => monkey.getItemsInspectedCount())
    .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
    .slice(0, 2)
    .reduce((product, factor) => product * factor);

console.log(
    `The level of monkey business after another 10,000 rounds of stuff-slinging simian shenanigans is: ${monkeyBusinessPartTwo}`,
);
