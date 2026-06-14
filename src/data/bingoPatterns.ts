// Centralized bingo winning-pattern evaluator.
//
// A cartella board is a flat 25-element array in row-major order
// (board[row * 5 + col]). Index 12 is the FREE cell (value 0) and is
// always considered marked. Numbers 1..75 are valid cell values.

export type BingoPattern =
  | "row"
  | "column"
  | "diagonal"
  | "center_column"
  | "four_corners";

export const ALL_BINGO_PATTERNS: readonly BingoPattern[] = [
  "row",
  "column",
  "diagonal",
  "center_column",
  "four_corners",
];

const FREE_SPACE_VALUE = 0;

const ROW_INDICES: readonly (readonly number[])[] = Array.from(
  { length: 5 },
  (_, r) => [r * 5, r * 5 + 1, r * 5 + 2, r * 5 + 3, r * 5 + 4],
);

const COLUMN_INDICES: readonly (readonly number[])[] = Array.from(
  { length: 5 },
  (_, c) => [c, c + 5, c + 10, c + 15, c + 20],
);

const DIAGONAL_INDICES: readonly (readonly number[])[] = [
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

const CENTER_COLUMN_INDICES: readonly (readonly number[])[] = [
  [2, 7, 12, 17, 22],
];

const FOUR_CORNERS_INDICES: readonly (readonly number[])[] = [[0, 4, 20, 24]];

const PATTERN_INDICES: Record<BingoPattern, readonly (readonly number[])[]> = {
  row: ROW_INDICES,
  column: COLUMN_INDICES,
  diagonal: DIAGONAL_INDICES,
  center_column: CENTER_COLUMN_INDICES,
  four_corners: FOUR_CORNERS_INDICES,
};

const isValidBoard = (
  board: readonly number[] | null | undefined,
): board is readonly number[] => Array.isArray(board) && board.length === 25;

const toCalledSet = (calledNumbers: Iterable<number>): Set<number> =>
  calledNumbers instanceof Set ? calledNumbers : new Set(calledNumbers);

const buildMarkedFlags = (
  board: readonly number[],
  calledNumbers: Iterable<number>,
): boolean[] => {
  const calledSet = toCalledSet(calledNumbers);
  return board.map(
    (value) => value === FREE_SPACE_VALUE || calledSet.has(value),
  );
};

const anyPatternMatches = (
  marked: readonly boolean[],
  patternGroup: readonly (readonly number[])[],
): boolean =>
  patternGroup.some((indices) => indices.every((idx) => marked[idx]));

export interface BingoPatternMatches {
  row: boolean;
  column: boolean;
  diagonal: boolean;
  center_column: boolean;
  four_corners: boolean;
  any: boolean;
  firstMatch: BingoPattern | null;
}

const EMPTY_MATCHES: BingoPatternMatches = Object.freeze({
  row: false,
  column: false,
  diagonal: false,
  center_column: false,
  four_corners: false,
  any: false,
  firstMatch: null,
});

export const evaluateBingoPatterns = (
  board: readonly number[] | null | undefined,
  calledNumbers: Iterable<number>,
): BingoPatternMatches => {
  if (!isValidBoard(board)) {
    return EMPTY_MATCHES;
  }

  const marked = buildMarkedFlags(board, calledNumbers);

  const matches = {
    row: anyPatternMatches(marked, ROW_INDICES),
    column: anyPatternMatches(marked, COLUMN_INDICES),
    diagonal: anyPatternMatches(marked, DIAGONAL_INDICES),
    center_column: anyPatternMatches(marked, CENTER_COLUMN_INDICES),
    four_corners: anyPatternMatches(marked, FOUR_CORNERS_INDICES),
  };

  let firstMatch: BingoPattern | null = null;
  for (const pattern of ALL_BINGO_PATTERNS) {
    if (matches[pattern]) {
      firstMatch = pattern;
      break;
    }
  }

  return { ...matches, any: firstMatch !== null, firstMatch };
};

export const checkBingoPattern = (
  board: readonly number[] | null | undefined,
  calledNumbers: Iterable<number>,
  pattern: BingoPattern,
): boolean => {
  if (!isValidBoard(board)) {
    return false;
  }
  const marked = buildMarkedFlags(board, calledNumbers);
  return anyPatternMatches(marked, PATTERN_INDICES[pattern]);
};

export const hasAnyBingoPattern = (
  board: readonly number[] | null | undefined,
  calledNumbers: Iterable<number>,
): boolean => evaluateBingoPatterns(board, calledNumbers).any;

// Returns the flat indices of the first matching line for the given pattern,
// or [] if no line matches. Used to highlight the winning cells in the UI.
export const getWinningLineIndices = (
  board: readonly number[] | null | undefined,
  calledNumbers: Iterable<number>,
  pattern: BingoPattern,
): number[] => {
  if (!isValidBoard(board)) {
    return [];
  }
  const marked = buildMarkedFlags(board, calledNumbers);
  for (const indices of PATTERN_INDICES[pattern]) {
    if (indices.every((idx) => marked[idx])) {
      return [...indices];
    }
  }
  return [];
};

export const PATTERN_LABELS: Record<BingoPattern, string> = {
  row: "Row",
  column: "Column",
  diagonal: "Diagonal",
  center_column: "Center Column",
  four_corners: "Four Corners",
};

// Maps an arbitrary string (could be a BingoPattern enum or backend label)
// to a user-facing label. Falls back to a Title-Cased version of the input.
export const formatPatternLabel = (
  pattern: string | null | undefined,
): string => {
  if (!pattern) {
    return "";
  }
  if (pattern in PATTERN_LABELS) {
    return PATTERN_LABELS[pattern as BingoPattern];
  }
  return pattern
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};
