import {MessageBus} from "./MessageBus";

describe("MessageBus", () => {
  it("should correctly register and trigger the message", () => {
    const bus = new MessageBus("X");
    const fn = jest.fn();
    bus.on(fn);
    bus.trigger();
    expect(fn).toBeCalledTimes(1);
  });

  it("bus should handle two triggers", () => {
    const bus = new MessageBus("Y");
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    bus.on(fn1);
    bus.on(fn2);
    bus.trigger();
    expect(fn1).toBeCalledTimes(1);
    expect(fn2).toBeCalledTimes(1);
  });

  it("should correctly register and then unregister the message", () => {
    const bus = new MessageBus("X");
    const fn = jest.fn();
    bus.on(fn);
    bus.off(fn);
    bus.trigger();
    expect(fn).toBeCalledTimes(0);
  });

  it("should correctly trigger the bus without any registered functions", () => {
    const bus = new MessageBus("X");
    const fn = jest.fn();
    expect(() => bus.trigger()).not.toThrow();
  });

  it("should correctly trigger off function on an invalid function", () => {
    const bus = new MessageBus("X");
    const fn = jest.fn();
    expect(() => bus.off(fn)).not.toThrow();
  });
});
