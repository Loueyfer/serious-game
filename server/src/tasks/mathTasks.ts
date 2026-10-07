export type MathTask = {
  id: string;
  prompt: string;
  choices: number[];
  correctAnswer: number;
};

export const mathTasks: MathTask[] = [
  {
    id: "math-1",
    prompt: "7 × 8 = ?",
    choices: [54, 56, 64],
    correctAnswer: 56,
  },

  {
    id: "math-2",
    prompt: "15 + 27 = ?",
    choices: [40, 42, 44],
    correctAnswer: 42,
  },

  {
    id: "math-3",
    prompt: "63 - 28 = ?",
    choices: [35, 36, 37],
    correctAnswer: 35,
  },

  {
    id: "math-4",
    prompt: "9 × 6 = ?",
    choices: [48, 54, 56],
    correctAnswer: 54,
  },

  {
    id: "math-5",
    prompt: "34 + 19 = ?",
    choices: [51, 52, 53],
    correctAnswer: 53,
  },

  {
    id: "math-6",
    prompt: "81 - 37 = ?",
    choices: [42, 44, 46],
    correctAnswer: 44,
  },

  {
    id: "math-7",
    prompt: "12 × 4 = ?",
    choices: [46, 48, 52],
    correctAnswer: 48,
  },

  {
    id: "math-8",
    prompt: "46 + 38 = ?",
    choices: [82, 84, 86],
    correctAnswer: 84,
  },

  {
    id: "math-9",
    prompt: "70 - 26 = ?",
    choices: [42, 44, 46],
    correctAnswer: 44,
  },

  {
    id: "math-10",
    prompt: "11 × 7 = ?",
    choices: [72, 77, 81],
    correctAnswer: 77,
  },
];