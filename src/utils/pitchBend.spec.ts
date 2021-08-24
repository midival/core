import { fractionToPitchBend, splitNumberIntoUInt8s, uIntsIntoNumber } from "./pitchBen";

describe("Pitch bend utils", () => {
    it("should properly transform fraction to pitch bend value", () => {
        expect(fractionToPitchBend(0)).toEqual(8192);
        expect(fractionToPitchBend(1.0)).toEqual(16383);
        expect(fractionToPitchBend(-1)).toEqual(0);
    });

    it("should throw exception for values outside the range", () => {
        expect(() => fractionToPitchBend(-2.0)).toThrow();
        expect(() => fractionToPitchBend(2.0)).toThrow();
    });

    it("should properly split numbers that are expected as bend values", () => {
        let nums = splitNumberIntoUInt8s(12280);
        expect(nums[0]).toEqual(120);
        expect(nums[1]).toEqual(95);
    });

    it("should properly transform array back to number", () => {
        expect(uIntsIntoNumber(new Uint8Array([120, 95]))).toEqual(12280);
    });
});