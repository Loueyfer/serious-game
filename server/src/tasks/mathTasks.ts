export type MathTask = {
  id: string;
  prompt: string;
  choices: number[];
  correctAnswer: number;
};

type MathOperation =
  | "addition"
  | "subtraction"
  | "multiplication";

function randomNumber(): number {
  return Math.floor(
    Math.random() * 10
  ) + 1;
}

function shuffleChoices(
  choices: number[]
): number[] {
  const shuffled = [...choices];

  for (
    let i = shuffled.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    const current =
      shuffled[i];

    const random =
      shuffled[j];

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

function createMathTask(
  id: string,
  operation: MathOperation
): MathTask {
  const x = randomNumber();
  const y = randomNumber();

  let prompt = "";
  let correctAnswer = 0;

  if (operation === "addition") {
    prompt = `${x} + ${y} = ?`;
    correctAnswer = x + y;
  }

  if (operation === "subtraction") {
    prompt = `${x} - ${y} = ?`;
    correctAnswer = x - y;
  }

  if (
    operation === "multiplication"
  ) {
    prompt = `${x} × ${y} = ?`;
    correctAnswer = x * y;
  }

  const choices = shuffleChoices([
    correctAnswer,
    correctAnswer - 1,
    correctAnswer + 1,
  ]);

  return {
    id,
    prompt,
    choices,
    correctAnswer,
  };
}

export function generateMathTasks(): MathTask[] {
  const tasks: MathTask[] = [
    // 3 addition questions
    createMathTask(
      "math-1",
      "addition"
    ),

    createMathTask(
      "math-2",
      "addition"
    ),

    createMathTask(
      "math-3",
      "addition"
    ),

    // 3 subtraction questions
    createMathTask(
      "math-4",
      "subtraction"
    ),

    createMathTask(
      "math-5",
      "subtraction"
    ),

    createMathTask(
      "math-6",
      "subtraction"
    ),

    // 4 multiplication questions
    createMathTask(
      "math-7",
      "multiplication"
    ),

    createMathTask(
      "math-8",
      "multiplication"
    ),

    createMathTask(
      "math-9",
      "multiplication"
    ),

    createMathTask(
      "math-10",
      "multiplication"
    ),
  ];

  // Randomize question order
  for (
    let i = tasks.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    const current =
      tasks[i];

    const random =
      tasks[j];

    if (
      current === undefined ||
      random === undefined
    ) {
      continue;
    }

    tasks[i] = random;
    tasks[j] = current;
  }

  return tasks;
}