import { fractionToPitchBend, fractionToPitchBendAsUints, splitNumberIntoUInt8s, splitValueIntoFraction, uIntsIntoNumber } from "./pitchBend";

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
        expect(uIntsIntoNumber([120, 95])).toEqual(12280);
    });

    it("should properly transform array to value from range -1 - 1.0", () => {
        expect(splitValueIntoFraction([120, 95])).toBeCloseTo(0.5);
        expect(splitValueIntoFraction([0, 0])).toBeCloseTo(-1);
        expect(splitValueIntoFraction(fractionToPitchBendAsUints(0))).toBeCloseTo(0);
        expect(splitValueIntoFraction(fractionToPitchBendAsUints(1))).toBeCloseTo(1);
    });
});