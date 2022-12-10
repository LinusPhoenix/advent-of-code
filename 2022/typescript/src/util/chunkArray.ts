export function splitArrayIntoChunks<T>(array: T[], chunkSize: number) {
    return array.reduce((array, elem, index) => {
        const chunkIndex = Math.floor(index / chunkSize);

        if (!array[chunkIndex]) {
            array[chunkIndex] = [];
        }

        array[chunkIndex].push(elem);
        return array;
    }, [] as T[][]);
}
