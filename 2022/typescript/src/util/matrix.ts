export function transpose(matrix: any[][]) {
    return matrix.reduce((prev, next) => next.map((_, i) => (prev[i] || []).concat(next[i])), []);
}
