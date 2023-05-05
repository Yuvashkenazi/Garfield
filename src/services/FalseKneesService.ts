import { getRandomInteger } from "../utils/Common.js";

export function randomFalseKnees(): string {
  const randomInt = getRandomInteger({ min: 1, max: 423 });
  const img = `https://falseknees.com/imgs/${randomInt}.png`;

  return img;
}
