import { promises as fs } from "fs";

const findMarker = (datastream: string, distinctChars: number) => {
    // For each character in the string, create an array of distinctChars many characters.
    // Throw away the ones at the end of the string that are not exactly that many characters long.
    const markerCandidates = datastream
        // Split the string into individual characters.
        .split("")
        .map((_, i, stream) => stream.slice(i, i + distinctChars))
        .filter((arr) => arr.length === distinctChars);

    // The marker is the candidate where all characters are distinct.
    // If the array (which may contain duplicates) of characters is the same length as the set (which may not),
    // all characters in the candidate are pairwise distinct and it must be the marker.
    const marker = markerCandidates
        .filter((candidate) => candidate.length === [...new Set(candidate)].length)[0]
        .join("");
    // Need to offset by distinctChars here to get from the index where the marker starts to the index right after it.
    return datastream.indexOf(marker) + distinctChars;
};

const input = await fs.readFile("../input/day6.txt", "utf8");
// Only take the first line
const datastream = input.split("\n")[0];

console.log(
    `The first start-of-packet marker starts at position ${findMarker(
        datastream,
        4,
    )} in the datastream.`,
);

console.log(
    `The first start-of-message marker starts at position ${findMarker(
        datastream,
        14,
    )} in the datastream.`,
);
