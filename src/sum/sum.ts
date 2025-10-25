import type { SumArgs } from "./types";

/**
 * Function to calculate the sum of an array of numbers.
 *
 * @param args - An array of numbers to be summed.
 * @returns The sum of the numbers in the array.
 */
function sum(...args: SumArgs) {
  return args.reduce((acc, val) => acc + val, 0);
}

export { sum };
