import { quarternoteToBPM, ticksToBPM } from "./clock";

describe("quarternoteToBPM", () => {
  it("should properly compute BPM = 60", () => {
    expect(quarternoteToBPM(1000 / 24)).toEqual(60);
  });

  it("should properly compute BPM = 100", () => {
    expect(quarternoteToBPM(600 / 24)).toEqual(100);
  });
});

describe("ticksToBPM", () => {
  it("should properly compute BPM = 60 (every second)", () => {
    expect(
      ticksToBPM([1000, 1041.6666666667, 1000 + 2 * 41.6666666667])
    ).toBeCloseTo(60);
  });

  it("should properly compute BPM = 100 (every 600ms)", () => {
    expect(ticksToBPM([600, 625, 650, 675, 700])).toBeCloseTo(100);
  });

  it("should properly return 0 when array is empty", () => {
    expect(ticksToBPM([])).toBeCloseTo(0);
  });
});
