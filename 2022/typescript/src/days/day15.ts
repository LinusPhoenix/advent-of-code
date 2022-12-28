import { promises as fs } from "fs";

type Sensor = {
    x: number;
    y: number;
    closestBeacon: {
        x: number;
        y: number;
    };
};

const manhattan = (p: { x: number; y: number }, q: { x: number; y: number }) =>
    Math.abs(p.x - q.x) + Math.abs(p.y - q.y);

const targetY = 2_000_000;
const searchMax = 4_000_000;
const input = await fs.readFile("../input/day15.txt", "utf8");
// Throw away the last line as it is empty.
const lines = input.split("\n").slice(0, -1);

const coordinateRegex = /-?\d+/g;

const sensors: Sensor[] = lines.map((line) => {
    const matches = line.match(coordinateRegex)!.map((match) => parseInt(match));
    return {
        x: matches[0],
        y: matches[1],
        closestBeacon: {
            x: matches[2],
            y: matches[3],
        },
    };
});

const sensorsOnTargetY = new Set<number>(
    sensors.filter((sensor) => sensor.y === targetY).map((sensor) => sensor.x),
);
const beaconsOnTargetY = new Set<number>(
    sensors
        .filter((sensor) => sensor.closestBeacon.y === targetY)
        .map((sensor) => sensor.closestBeacon.x),
);

const blockedPoints = sensors.reduce((points, sensor) => {
    const distanceToTargetY = Math.abs(targetY - sensor.y);
    // Manhattan distance.
    const distanceToBeacon = manhattan(sensor, sensor.closestBeacon);

    if (distanceToBeacon < distanceToTargetY) {
        // If the beacon is closer than the target line, this sensor does not block any positions
        return points;
    }

    // If the target line is closer than the beacon, some positions are blocked by the sensor.
    // If the distance is equal, it will block one position.
    // Then, for every further unit of distance, it will block one more position to the left,
    // and one more position to the right.
    const distanceDiff = distanceToBeacon - distanceToTargetY;

    for (let i = sensor.x - distanceDiff; i <= sensor.x + distanceDiff; i++) {
        points.add(i);
    }
    return points;
}, new Set<number>());

const blockedPointsNoSensorsOrBeacons = new Set(
    [...blockedPoints].filter(
        (point) => !sensorsOnTargetY.has(point) && !beaconsOnTargetY.has(point),
    ),
);
console.log(
    `At y=${targetY}, the number of positions that cannot contain another beacon are: ` +
        `${blockedPointsNoSensorsOrBeacons.size}`,
);

const upwardLineOffsets = new Set<number>();
const downwardLineOffsets = new Set<number>();
for (const sensor of sensors) {
    // Take the sensor radius to its closest beacon + 1.
    // Thanks to Manhattan distance, it forms a diamond-like shape on the grid.
    // The diamond consists of four lines: Two of them ascending, two of them descending.
    // Calculate the y offsets of each of those four lines.
    const dist = manhattan(sensor, sensor.closestBeacon) + 1;
    upwardLineOffsets.add(sensor.y - sensor.x + dist);
    upwardLineOffsets.add(sensor.y - sensor.x - dist);
    downwardLineOffsets.add(sensor.x + sensor.y + dist);
    downwardLineOffsets.add(sensor.x + sensor.y - dist);
}

for (const upwardLine of upwardLineOffsets) {
    for (const downwardLine of downwardLineOffsets) {
        // Calculate the intersection point for every pair of upward and downward line.
        const intersectionX = (downwardLine - upwardLine) / 2;
        const intersectionY = (upwardLine + downwardLine) / 2;

        if (
            0 <= intersectionX &&
            intersectionX <= searchMax &&
            0 <= intersectionY &&
            intersectionY <= searchMax
        ) {
            // Intersection point is in bounds for the distress beacon.
            const isDistressBeacon = sensors.every((sensor) => {
                const beaconDist = manhattan(sensor, sensor.closestBeacon);
                const intersectionDist = manhattan(sensor, { x: intersectionX, y: intersectionY });
                return intersectionDist > beaconDist;
            });
            if (isDistressBeacon) {
                console.log(
                    `The tuning frequency is: ${searchMax * intersectionX + intersectionY}`,
                );
            }
        }
    }
}
