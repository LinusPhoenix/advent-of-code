import { promises as fs } from "fs";

type Node = {
    x: number;
    y: number;
    height: number;
    visited: boolean;
    distance: number;
};

const startingHeight = "S".charCodeAt(0);
const goalHeight = "E".charCodeAt(0);
const aHeight = "a".charCodeAt(0);

const copyNode = (node: Node): Node => {
    return {
        x: node.x,
        y: node.y,
        height: node.height,
        visited: node.visited,
        distance: node.distance,
    };
};

const isClimbable = (start: Node, end: Node) => {
    const startHeight = start.height === startingHeight ? aHeight : start.height;
    const endHeight = end.height === goalHeight ? "z".charCodeAt(0) : end.height;
    return endHeight <= startHeight + 1;
};

const manyDijkstras = (grid: Node[][], starts: Node[]) => {
    console.log(`Finding the shortest path for ${starts.length} nodes.`);
    return starts.map((start) => {
        console.log(`Finding the shortest path from node (${start.x}, ${start.y}).`);
        return dijkstra(grid, start, true);
    });
};

const dijkstra = (grid: Node[][], start: Node, partTwo: boolean) => {
    const copiedGrid = grid.map((row) => row.map(copyNode));
    const copiedStart = grid.flat().find((node) => node.x === start.x && node.y === start.y)!;
    copiedStart.distance = 0;
    const unvisited = new Set(copiedGrid.flat());

    let current = copiedStart;
    while (true) {
        if (current.height === goalHeight) {
            return current.distance;
        }
        const neighbors = [] as Node[];
        if (current.x < copiedGrid[0].length - 1) {
            neighbors.push(copiedGrid[current.y][current.x + 1]);
        }
        if (current.y < copiedGrid.length - 1) {
            neighbors.push(copiedGrid[current.y + 1][current.x]);
        }
        if (current.x > 0) {
            neighbors.push(copiedGrid[current.y][current.x - 1]);
        }
        if (current.y > 0) {
            neighbors.push(copiedGrid[current.y - 1][current.x]);
        }

        // The neighbor must exist, be unvisited, and its height can at most be one more than the current node.
        const climbableNeighbors = neighbors.filter(
            (node) => !node.visited && isClimbable(current, node),
        );

        for (const neighbor of climbableNeighbors) {
            const newDistance = current.distance + 1;
            // We update the distance if the current distance is NaN (positive infinity) or greater than the distance from the current node.
            neighbor.distance =
                isNaN(neighbor.distance) || neighbor.distance > newDistance
                    ? newDistance
                    : neighbor.distance;
        }
        current.visited = true;
        unvisited.delete(current);
        let nextCandidates = [...unvisited.values()].filter((node) => !isNaN(node.distance));
        if (partTwo) {
            // In part two of the problem, we are looking for the shortest path from any starting position with height "a".
            // It's unnecessary to explore any paths where we traverse a position with height "a":
            // Let p be a path from a position s to the goal that traverses a position t != s with height "a".
            // p must by definition be longer than the path p' from t to the goal.
            nextCandidates = nextCandidates.filter(
                (node) => !(node.height === aHeight) && !(node.height === startingHeight),
            );
        }
        const next = nextCandidates.sort((a, b) => a.distance - b.distance).at(0);
        if (next == null) {
            return NaN;
        }
        current = next;
    }
};

const input = await fs.readFile("../input/day12.txt", "utf8");
// Throw away the last line as it is empty.
const lines = input.split("\n").slice(0, -1);

const grid = lines.map((line, row) => {
    return line.split("").map((char, col) => {
        return {
            x: col,
            y: row,
            height: char.charCodeAt(0),
            visited: false,
            distance: NaN,
        } as Node;
    });
});

const start = grid.flat().find((node) => node.height === startingHeight);
if (start == null) {
    throw new Error("Could not find a starting position!");
}

const distance = dijkstra(grid, start, false);

console.log(
    `The fewest steps required to move from the current position to the location with the best signal is: ${distance}`,
);

const distances = manyDijkstras(
    grid,
    grid.flat().filter((node) => node.height === startingHeight || node.height === aHeight),
);
const shortest = distances
    .filter((distance) => !isNaN(distance))
    .sort((a, b) => a - b)
    .at(0);

console.log(
    `The fewest steps required to move from any square with elevation a to the location with the best signal is: ${shortest}`,
);
