import illustration1 from "./illustration1.svg";
import illustration2 from "./illustration2.svg";
import illustration3 from "./illustration3.svg";

export const bingoIllustrations = [
  illustration1,
  illustration2,
  illustration3,
] as const;

export const pickRandomBingoIllustration = () =>
  bingoIllustrations[Math.floor(Math.random() * bingoIllustrations.length)];
