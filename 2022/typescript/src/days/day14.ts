import { promises as fs } from "fs";

type Point = {
    x: number;
    y: number;
};

const pointToString = (p: Point) => {
    return `${p.x},${p.y}`;
};

const findAllSandSpots = (walls: Map<string, Point>, start: Point, yMax: number): Set<String> => {
    const visited = new Set<string>();
    const stack = [[pointToString(start), start]] as [string, Point][];

    while (stack.length != 0) {
        const top = stack.pop()!;
        const pointKey = top[0];
        const point = top[1];
        if (!visited.has(pointKey)) {
            visited.add(pointKey);
            const neighbors = [
                { x: point.x, y: point.y + 1 },
                { x: point.x - 1, y: point.y + 1 },
                { x: point.x + 1, y: point.y + 1 },
            ].filter((point) => !walls.has(pointToString(point)) && point.y != yMax);
            for (const neighbor of neighbors) {
                stack.push([pointToString(neighbor), neighbor]);
            }
        }
    }

    return visited;
};
const getFirstEmptySpot = (nodes: Map<string, Point>, start: Point, yMax: number): Point => {
    const visited = new Map<string, Point>();
    return dfsRec(nodes, visited, start, yMax);
};

const dfsRec = (
    nodes: Map<string, Point>,
    visited: Map<string, Point>,
    current: Point,
    yMax: number,
): Point => {
    if (current.y >= yMax) {
        return current;
    }

    visited.set(pointToString(current), current);
    // Explore all possible neighbors
    const neighbors = [
        { x: current.x, y: current.y + 1 },
        { x: current.x - 1, y: current.y + 1 },
        { x: current.x + 1, y: current.y + 1 },
    ].filter((point) => ![...nodes.keys()].includes(pointToString(point)));
    for (const neighbor of neighbors) {
        return dfsRec(nodes, visited, neighbor, yMax);
    }

    return current;
};

const input = await fs.readFile("../input/day14.txt", "utf8");
const lines = input.split("\n").slice(0, -1);

const walls = lines.reduce((coords, line) => {
    const segments = line.split(" -> ");
    const coordinates = segments.map((segment) => {
        const coordinates = segment.split(",").map((coord) => parseInt(coord));
        return {
            x: coordinates[0],
            y: coordinates[1],
        };
    });
    coordinates.forEach((curr, index, coordinates) => {
        const next = coordinates.at(index + 1);
        if (next) {
            const xMin = Math.min(curr.x, next.x);
            const xMax = Math.max(curr.x, next.x);
            const yMin = Math.min(curr.y, next.y);
            const yMax = Math.max(curr.y, next.y);
            for (let i = xMin; i <= xMax; i++) {
                for (let j = yMin; j <= yMax; j++) {
                    const p = { x: i, y: j };
                    coords.set(pointToString(p), p);
                }
            }
        }
    });
    return coords;
}, new Map<string, Point>());

// If sand ever gets above this, it can never land on a wall.
const yMax = [...walls.values()].map((wall) => wall.y).sort((a, b) => b - a)[0];

let isSimulating = true;
let occupied = new Map([...walls]);
while (isSimulating) {
    const sandDest = getFirstEmptySpot(occupied, { x: 500, y: 0 }, yMax);
    if (sandDest.y >= yMax) {
        isSimulating = false;
    } else {
        occupied.set(pointToString(sandDest), sandDest);
    }
}

console.log(
    `The number of units of sand to come to rest before sand starts flowing into the abyss below is: ${
        occupied.size - walls.size
    }`,
);

const floor = yMax + 2;
isSimulating = true;
const sandPoints = findAllSandSpots(walls, { x: 500, y: 0 }, floor);

console.log(
    `The number of units of sand to come to rest before before the source is blocked is: ${sandPoints.size}`,
);
