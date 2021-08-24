export const fractionToPitchBend = (n: number): number => {
    if (n < -1.0 || n > 1.0) {
        throw new Error("Pitch bend value outside the range");
    }

    return Math.ceil((n+1) * 16383 / 2);
}

export const fractionToPitchBendAsUints = (n: number): Uint8Array => {
    return splitNumberIntoUInt8s(fractionToPitchBend(n));
}

export const splitNumberIntoUInt8s = (n: number): Uint8Array => {
    let arr = new Uint8Array(2);
    // it's MIDI message so we are using only last 7 bits (first one is always 0).
    arr[0] = ((1 << 7) - 1) & n;
    arr[1] = n >> 7;
    return arr;
}

export const uIntsIntoNumber = (arr: Uint8Array): number => {
    return arr[0] + (arr[1] << 7);
}