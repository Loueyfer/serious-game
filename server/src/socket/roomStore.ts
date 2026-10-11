import type { MathTask } from "../tasks/mathTasks";
import type { GeographyTask } from "../tasks/geographyTasks";
import type {
  StroopTask,
} from "../tasks/stroopTasks";
export type RoomPlayer = {
  userId: string;
  username: string;
  socketId: string;
  ready: boolean;
  score: number;
};
export type MathAttempt = {
  userId: string;
  username: string;
  answer: number | null;
  correct: boolean;
  submittedAt: number | null;
  responseTimeMs: number | null;
};

export type MathQuestionState = {
  id: string;
  prompt: string;
  choices: number[];

  correctAnswer: number;

  startedAt: number;
  deadlineAt: number;

  attempts: MathAttempt[];

  resolved: boolean;
};
export type GeographyAttempt = {
  userId: string;
  username: string;
  answer: string | null;
  correct: boolean;
  submittedAt: number | null;
  responseTimeMs: number | null;
};

export type GeographyQuestionState = {
  id: string;
  capital: string;
  prompt: string;
  choices: string[];

  correctAnswer: string;

  startedAt: number;
  deadlineAt: number;

  attempts: GeographyAttempt[];

  resolved: boolean;
};
export type StroopAttempt = {
  userId: string;
  username: string;

  answer: boolean | null;

  correct: boolean;

  submittedAt: number | null;

  responseTimeMs: number | null;
};

export type StroopQuestionState = {
  id: string;

  word: string;

  inkColor:
    | "red"
    | "blue"
    | "green"
    | "yellow";

  isMatch: boolean;

  startedAt: number;

  deadlineAt: number;

  attempts: StroopAttempt[];

  resolved: boolean;
};
export type GameRoom = {
  code: string;
  ownerId: string;
  players: RoomPlayer[];
  createdAt: string;

status:
  | "lobby"
  | "countdown"
  | "live"
  | "finished";  countdownId: string | null;

currentQuestion:
  MathQuestionState | null;

mathQuestionIndex: number;
mathTasks: MathTask[];
currentGeographyQuestion:
  GeographyQuestionState | null;

geographyQuestionIndex: number;
geographyTasks: GeographyTask[];
currentStroopQuestion:
  StroopQuestionState | null;

stroopQuestionIndex: number;
stroopTasks: StroopTask[];

phase:
  | "math"
  | "geography"
  | "stroop"
  | "finished";
};
export const rooms = new Map<string, GameRoom>();

const ROOM_CHARACTERS =
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode(
  length = 6
): string {
  let code: string;

  do {
    code = "";

    for (let i = 0; i < length; i++) {
      const index = Math.floor(
        Math.random() * ROOM_CHARACTERS.length
      );

      code += ROOM_CHARACTERS[index];
    }
  } while (rooms.has(code));

  return code;
}