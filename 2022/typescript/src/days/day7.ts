import { promises as fs } from "fs";
import { sum } from "../util/sum.js";

type Command = {
    input: string;
    output?: string[];
};

type File = {
    name: string;
    size: number;
};

type Directory = {
    parent?: Directory;
    path: string;
    files: Set<File>;
    subdirectories: Set<Directory>;
    size: number;
};

const parseCommand = (currentDir: Directory, command: Command): Directory => {
    if (command.input.startsWith("cd")) {
        const targetDir = command.input.substring(3);
        if (targetDir === "..") {
            if (!currentDir.parent) {
                throw new Error("Tried to cd out from the root directory.");
            }
            return currentDir.parent;
        } else {
            const newPath = `${currentDir.path}${currentDir.path === "/" ? "" : "/"}${targetDir}`;
            const dir = Array.from(currentDir.subdirectories).find(
                (dir) => dir.path === newPath,
            ) || {
                parent: currentDir,
                path: newPath,
                files: new Set<File>(),
                subdirectories: new Set<Directory>(),
                size: 0,
            };
            currentDir.subdirectories.add(dir);
            return dir;
        }
    } else if (command.input.startsWith("ls")) {
        const dirs = command.output!.filter((line) => line.startsWith("dir"));
        const files = command.output!.filter((line) => !line.startsWith("dir"));
        files
            .map((line) => {
                const components = line.split(" ");
                const size = parseInt(components[0]);
                const name = components[1];
                return {
                    name,
                    size,
                };
            })
            .forEach((file) => {
                currentDir.files.add(file);
            });
        return currentDir;
    } else {
        throw new Error(`Unknown command: ${command.input}`);
    }
};

const calculateDirSize = (node: Directory): number => {
    const filesSize = Array.from(node.files)
        .map((file) => file.size)
        .reduce(sum, 0);
    const dirsSize = Array.from(node.subdirectories)
        .map((dir) => calculateDirSize(dir))
        .reduce(sum, 0);
    node.size = filesSize + dirsSize;
    return node.size;
};

const findSmallDirectories = (node: Directory) => {
    const smallNodes = [] as Directory[];
    if (node.size != null && node.size <= 100000) {
        smallNodes.push(node);
    }

    const smallChildren = Array.from(node.subdirectories).flatMap(findSmallDirectories);
    smallNodes.push(...smallChildren);

    return smallNodes;
};

const findDirectories = (node: Directory) => {
    const nodes = [] as Directory[];
    nodes.push(node);

    const children = Array.from(node.subdirectories).flatMap(findDirectories);
    nodes.push(...children);

    return nodes;
};

const input = await fs.readFile("../input/day7.txt", "utf8");
// Throw away the last line as it is empty.
const lines = input.split("\n").slice(0, -1);

const commands = lines
    .map((line, index, arr) => {
        if (!line.startsWith("$")) {
            return undefined;
        }

        if (line === "$ ls") {
            const nextElems = arr.slice(index + 1);
            const nextInstruction = nextElems.findIndex((line) => line.startsWith("$"));
            const output = nextElems.slice(0, nextInstruction);
            return {
                input: "ls",
                output,
            };
        } else {
            return {
                // Get rid of the "$ " at the start of the line.
                input: line.substring(2),
            };
        }
    })
    .filter((instruction) => instruction != null);

const root = {
    path: "/",
    files: new Set<File>(),
    subdirectories: new Set<Directory>(),
    size: 0,
};
// Stateful reduce, not very clean FP.
// Discard the first command since that's just initializing the root directory.
commands.slice(1).reduce<Directory>((tree, command) => parseCommand(tree, command!), root);
calculateDirSize(root);
const smallDirectories = findSmallDirectories(root);
const sumOfSmallDirectories = smallDirectories
    .map((dir) => {
        if (dir.size == null) {
            throw new Error("Directory with uncalculated size!");
        }
        return dir.size;
    })
    .reduce(sum, 0);

console.log(
    `The total size of directories whose size is at most 100000 is ${sumOfSmallDirectories}.`,
);

const dirs = findDirectories(root);

const totalSpace = 70000000;
const requiredSpace = 30000000;
const unusedSpace = totalSpace - root.size;
const neededSpace = requiredSpace - unusedSpace;

const possibleDirsToDelete = dirs.filter((dir) => dir.size >= neededSpace);
const dirSizeToDelete = possibleDirsToDelete.map((dir) => dir.size).sort((a, b) => a - b)[0];

console.log(
    `The smallest directory that is large enough to give the needed space when deleted has a size of ${dirSizeToDelete}.`,
);
