import { promises as fs } from "fs";

type Coordinates = {
    x: number;
    y: number;
};
type RopePosition = {
    head: Coordinates;
    tail: Coordinates;
    tailPositions: Coordinates[];
};

const doHeadAndTailTouch = (head: Coordinates, tail: Coordinates) => {
    // Tail is above or below Head.
    if (head.x === tail.x) {
        return [head.y - 1, head.y, head.y + 1].includes(tail.y);
    }
    // Tail is left or right of Head.
    if (head.y === tail.y) {
        return [head.x - 1, head.x, head.x + 1].includes(tail.x);
    }
    // Diagonals
    return (
        (tail.x === head.x + 1 && tail.y === head.y + 1) ||
        (tail.x === head.x + 1 && tail.y === head.y - 1) ||
        (tail.x === head.x - 1 && tail.y === head.y + 1) ||
        (tail.x === head.x - 1 && tail.y === head.y - 1)
    );
};

const calculateTailPosition = (head: Coordinates, tail: Coordinates) => {
    if (doHeadAndTailTouch(head, tail)) {
        return tail;
    }

    // Figure out how to move the tail.
    let newTailX = tail.x;
    let newTailY = tail.y;
    if (head.x === tail.x) {
        // Tail is above or below Head.
        if (head.y >= tail.y) {
            // Tail is below Head.
            newTailY = tail.y + 1;
        } else {
            // Tail is above Head.
            newTailY = tail.y - 1;
        }
    } else if (head.y === tail.y) {
        // Tail is left or right of Head.
        if (head.x >= tail.x) {
            // Tail is left of Head.
            newTailX = tail.x + 1;
        } else {
            // Tail is right of Head.
            newTailX = tail.x - 1;
        }
    } else {
        // Diagonals
        if (head.x > tail.x) {
            if (head.y > tail.y) {
                // Tail is below and left of Head.
                newTailX = tail.x + 1;
                newTailY = tail.y + 1;
            } else {
                // Tail is above and left of Head.
                newTailX = tail.x + 1;
                newTailY = tail.y - 1;
            }
        } else {
            if (head.y > tail.y) {
                // Tail is below and right of Head.
                newTailX = tail.x - 1;
                newTailY = tail.y + 1;
            } else {
                // Tail is above and right of Head.
                newTailX = tail.x - 1;
                newTailY = tail.y - 1;
            }
        }
    }

    return {
        x: newTailX,
        y: newTailY,
    };
};

const moveRopeOneStep = (ropePos: RopePosition, direction: string) => {
    let newHeadX = ropePos.head.x;
    let newHeadY = ropePos.head.y;
    switch (direction) {
        case "U":
            newHeadY = ropePos.head.y + 1;
            break;
        case "D":
            newHeadY = ropePos.head.y - 1;
            break;
        case "L":
            newHeadX = ropePos.head.x - 1;
            break;
        case "R":
            newHeadX = ropePos.head.x + 1;
            break;
        default:
            throw new Error(`Unknown direction: ${direction}`);
    }

    const newHead = { x: newHeadX, y: newHeadY };
    const newTail = calculateTailPosition(newHead, ropePos.tail);
    return {
        head: newHead,
        tail: newTail,
        tailPositions: [...ropePos.tailPositions, newTail],
    };
};

const moveLongRopeOneStep = (ropePositions: RopePosition[], direction: string) => {
    const newPositions = [] as Coordinates[];
    const newKnots = [] as RopePosition[];
    let newHeadX = ropePositions[0].head.x;
    let newHeadY = ropePositions[0].head.y;
    switch (direction) {
        case "U":
            newHeadY = ropePositions[0].head.y + 1;
            break;
        case "D":
            newHeadY = ropePositions[0].head.y - 1;
            break;
        case "L":
            newHeadX = ropePositions[0].head.x - 1;
            break;
        case "R":
            newHeadX = ropePositions[0].head.x + 1;
            break;
        default:
            throw new Error(`Unknown direction: ${direction}`);
    }

    const newHead = { x: newHeadX, y: newHeadY };
    newPositions.push(newHead);
    // This loop is tricky:
    // Start at the SECOND element of ropePosition to calculate the head-tail moves because the first head move is special.
    for (let i = 1; i <= ropePositions.length; i++) {
        // The head of this head-tail segment has already been moved since it was the tail of the last head-tail segment.
        const prevKnot = newPositions[i - 1];
        // During the last iteration, there's no next head-tail segment to use, so we have to use the tail of the previous segment.
        const thisKnot = ropePositions[i]?.head || ropePositions[i - 1].tail;
        const thisKnotMoved = calculateTailPosition(prevKnot, thisKnot);
        // We end up with 11 elements here, the last element being fake, but that is okay.
        newPositions.push(thisKnotMoved);
        // These are the actual knots we care about.
        newKnots.push({
            head: prevKnot,
            tail: thisKnotMoved,
            tailPositions: [...ropePositions[i - 1].tailPositions, thisKnotMoved],
        });
    }

    return newKnots;
};

const moveRopeMultipleSteps = (ropePos: RopePosition, move: string) => {
    const direction = move.charAt(0);
    const distance = parseInt(move.substring(2));

    const steps = Array(distance).fill(direction);
    return steps.reduce((rope, step) => moveRopeOneStep(rope, step), ropePos);
};

const moveLongRopeMultipleSteps = (ropePos: RopePosition[], move: string) => {
    const direction = move.charAt(0);
    const distance = parseInt(move.substring(2));

    const steps = Array(distance).fill(direction);
    return steps.reduce((rope: RopePosition[], step) => moveLongRopeOneStep(rope, step), ropePos);
};

const input = await fs.readFile("../input/day9.txt", "utf8");
// Throw away the last line as it is empty.
const lines = input.split("\n").slice(0, -1);

const initialRopePos = {
    head: {
        x: 0,
        y: 0,
    },
    tail: {
        x: 0,
        y: 0,
    },
    tailPositions: [
        {
            x: 0,
            y: 0,
        },
    ],
};

const finalRopePos = lines.reduce(
    (rope, move) => moveRopeMultipleSteps(rope, move),
    initialRopePos,
);

const uniqueTailPositions = finalRopePos.tailPositions.reduce((uniquePositions, pos) => {
    const isUnique = !uniquePositions.some(
        (uniquePos) => uniquePos.x === pos.x && uniquePos.y === pos.y,
    );
    if (isUnique) {
        return [...uniquePositions, pos];
    } else {
        return uniquePositions;
    }
}, [] as Coordinates[]);
console.log(
    `While moving the rope, the tail end visited ${uniqueTailPositions.length} positions at least once.`,
);

// While there are 10 knots in the rope, this only adds up to 9 head-tail segments.
const longRope: RopePosition[] = Array(9).fill({
    head: {
        x: 0,
        y: 0,
    },
    tail: {
        x: 0,
        y: 0,
    },
    tailPositions: [
        {
            x: 0,
            y: 0,
        },
    ],
});

const finalLongRopePos = lines.reduce(
    (rope, move) => moveLongRopeMultipleSteps(rope, move),
    longRope,
);

const uniqueTailPositionsLongRope = finalLongRopePos[
    finalLongRopePos.length - 1
].tailPositions.reduce((uniquePositions, pos) => {
    const isUnique = !uniquePositions.some(
        (uniquePos) => uniquePos.x === pos.x && uniquePos.y === pos.y,
    );
    if (isUnique) {
        return [...uniquePositions, pos];
    } else {
        return uniquePositions;
    }
}, [] as Coordinates[]);
console.log(
    `While moving the long rope, the tail end visited ${uniqueTailPositionsLongRope.length} positions at least once.`,
);
