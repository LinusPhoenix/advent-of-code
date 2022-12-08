import { promises as fs } from "fs";

type TreeVisibility = {
    height: number;
    above: boolean;
    below: boolean;
    left: boolean;
    right: boolean;
};

const isTreeVisible = (tree: TreeVisibility) => tree.above || tree.below || tree.left || tree.right;

const isTreeVisibleFromNeighbors = (tree: TreeVisibility, neighbors: TreeVisibility[]) =>
    !neighbors.some((neighbor) => neighbor.height >= tree.height);

const getViewingDistance = (tree: TreeVisibility, neighbors: TreeVisibility[]) => {
    const tallerNeighborIndex = neighbors.findIndex((neighbor) => neighbor.height >= tree.height);
    if (tallerNeighborIndex === -1) {
        return neighbors.length;
    }
    return tallerNeighborIndex + 1;
};

const input = await fs.readFile("../input/day8.txt", "utf8");
// Throw away the last line as it is empty.
const lines = input.split("\n").slice(0, -1);

const treeGrid = lines.map((line) =>
    line.split("").map((char) => {
        return {
            height: parseInt(char),
            above: false,
            below: false,
            left: false,
            right: false,
        } as TreeVisibility;
    }),
);

const treeGridVisibility = treeGrid.map((row, rowIndex, rows) =>
    row.map((tree, colIndex) => {
        const isVisibleAbove = isTreeVisibleFromNeighbors(
            tree,
            rows.slice(0, rowIndex).map((row) => row[colIndex]),
        );
        const isVisibleBelow = isTreeVisibleFromNeighbors(
            tree,
            rows.slice(rowIndex + 1).map((row) => row[colIndex]),
        );
        const isVisibleLeft = isTreeVisibleFromNeighbors(tree, row.slice(0, colIndex));
        const isVisibleRight = isTreeVisibleFromNeighbors(tree, row.slice(colIndex + 1));
        return {
            ...tree,
            above: isVisibleAbove,
            below: isVisibleBelow,
            left: isVisibleLeft,
            right: isVisibleRight,
        };
    }),
);

const visibleTrees = treeGridVisibility
    .flatMap((row) => row.flatMap((tree) => tree))
    .filter(isTreeVisible);

console.log(`The total number of visible trees is: ${visibleTrees.length}.`);

const treeGridDistance = treeGrid.map((row, rowIndex, rows) =>
    row.map((tree, colIndex) => {
        // Reversing here because from the tree an observer looks opposite to the slice direction.
        const above = getViewingDistance(
            tree,
            rows
                .slice(0, rowIndex)
                .map((row) => row[colIndex])
                .reverse(),
        );
        const below = getViewingDistance(
            tree,
            rows.slice(rowIndex + 1).map((row) => row[colIndex]),
        );
        // Reversing here because from the tree an observer looks opposite to the slice direction.
        const left = getViewingDistance(tree, row.slice(0, colIndex).reverse());
        const right = getViewingDistance(tree, row.slice(colIndex + 1));
        return {
            ...tree,
            above,
            below,
            left,
            right,
        };
    }),
);

const treeGridScenicScores = treeGridDistance.flatMap((row) =>
    row.flatMap((tree) => tree.above * tree.below * tree.left * tree.right),
);

const maxScenicScore = treeGridScenicScores.sort((a, b) => b - a)[0];

console.log(`The highest scenic score in the forest is: ${maxScenicScore}.`);
