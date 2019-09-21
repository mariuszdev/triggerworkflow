import asyncProcess, { CANCELLED } from ".";

it("resolves with process' returned value", async () => {
  function* process() {
    yield "A";
    yield "B";
    yield "C";

    yield new Promise(resolve => setTimeout(() => resolve("D"), 500));

    return 3;
  }

  const [result] = asyncProcess(process);

  return expect(result).resolves.toEqual(3);
});

it("stops process when cancel called", async () => {
  const processStep = jest.fn();

  function* process() {
    yield "A";
    yield "B";
    yield "C";

    yield new Promise(resolve => setTimeout(() => resolve("D"), 1000));

    processStep();

    return 3;
  }

  const [result, cancel] = asyncProcess(process);

  setTimeout(cancel, 500);

  await expect(result).rejects.toEqual(CANCELLED);
  await expect(processStep).not.toHaveBeenCalled();
});
