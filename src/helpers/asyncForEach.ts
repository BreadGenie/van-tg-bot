import { ScrapedIdol } from '../types';

export const waitFor = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const asyncForEach = async (array: string[] | ScrapedIdol[], callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

