const sum = (a: number, b: number): number => a + b;

export const computeIntervalsInMs = (ticks: number[]): number[] => {
    const results = [];
    for(let i = 1;i<ticks.length;i++) {
        results.push(ticks[i] - ticks[i - 1]);
    }
    return results;
}

export const averageIntervals = (differences: number[]): number => {
    if (!differences || !differences.length) {
        return 0;
    }
    return differences.reduce(sum) / differences.length;
}

export const quarternoteToBPM = (interval: number): number => {
    return 60000 / (interval * 24);
}

export const ticksToBPM = (ticks: number[]): number => {
    if (!ticks || ticks.length < 2) {
        return 0;
    }
    return quarternoteToBPM(averageIntervals(computeIntervalsInMs(ticks)));
}