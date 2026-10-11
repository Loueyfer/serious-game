export type StroopColor =
  | "red"
  | "blue"
  | "green"
  | "yellow";

export type StroopTask = {
  id: string;
  word: string;
  inkColor: StroopColor;
  isMatch: boolean;
};

export const stroopTasks: StroopTask[] = [
  {
    id: "stroop-1",
    word: "RED",
    inkColor: "red",
    isMatch: true,
  },

  {
    id: "stroop-2",
    word: "BLUE",
    inkColor: "yellow",
    isMatch: false,
  },

  {
    id: "stroop-3",
    word: "GREEN",
    inkColor: "green",
    isMatch: true,
  },

  {
    id: "stroop-4",
    word: "YELLOW",
    inkColor: "blue",
    isMatch: false,
  },

  {
    id: "stroop-5",
    word: "BLUE",
    inkColor: "blue",
    isMatch: true,
  },

  {
    id: "stroop-6",
    word: "RED",
    inkColor: "green",
    isMatch: false,
  },

  {
    id: "stroop-7",
    word: "GREEN",
    inkColor: "green",
    isMatch: true,
  },

  {
    id: "stroop-8",
    word: "YELLOW",
    inkColor: "red",
    isMatch: false,
  },

  {
    id: "stroop-9",
    word: "YELLOW",
    inkColor: "yellow",
    isMatch: true,
  },

  {
    id: "stroop-10",
    word: "BLUE",
    inkColor: "red",
    isMatch: false,
  },
];