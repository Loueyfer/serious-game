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

const stroopColors: StroopColor[] = [
  "red",
  "blue",
  "green",
  "yellow",
];

function randomColor(): StroopColor {
  const index = Math.floor(
    Math.random() *
      stroopColors.length
  );

  return (
    stroopColors[index] ??
    "red"
  );
}

function randomDifferentColor(
  excludedColor: StroopColor
): StroopColor {
  const availableColors =
    stroopColors.filter(
      (color) =>
        color !== excludedColor
    );

  const index = Math.floor(
    Math.random() *
      availableColors.length
  );

  return (
    availableColors[index] ??
    "blue"
  );
}

function shuffleTasks(
  tasks: StroopTask[]
): StroopTask[] {
  const shuffled = [...tasks];

  for (
    let i = shuffled.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    const current = shuffled[i];
    const random = shuffled[j];

    if (
      current === undefined ||
      random === undefined
    ) {
      continue;
    }

    shuffled[i] = random;
    shuffled[j] = current;
  }

  return shuffled;
}

function createMatchTask(
  id: string
): StroopTask {
  const color =
    randomColor();

  return {
    id,
    word: color.toUpperCase(),
    inkColor: color,
    isMatch: true,
  };
}

function createMismatchTask(
  id: string
): StroopTask {
  const wordColor =
    randomColor();

  const inkColor =
    randomDifferentColor(
      wordColor
    );

  return {
    id,
    word:
      wordColor.toUpperCase(),
    inkColor,
    isMatch: false,
  };
}

export function generateStroopTasks():
  StroopTask[] {
  const tasks: StroopTask[] = [
    // 5 matching tasks
    createMatchTask(
      "stroop-1"
    ),

    createMatchTask(
      "stroop-2"
    ),

    createMatchTask(
      "stroop-3"
    ),

    createMatchTask(
      "stroop-4"
    ),

    createMatchTask(
      "stroop-5"
    ),

    // 5 non-matching tasks
    createMismatchTask(
      "stroop-6"
    ),

    createMismatchTask(
      "stroop-7"
    ),

    createMismatchTask(
      "stroop-8"
    ),

    createMismatchTask(
      "stroop-9"
    ),

    createMismatchTask(
      "stroop-10"
    ),
  ];

  return shuffleTasks(tasks);
}