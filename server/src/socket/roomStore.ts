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
export type GameRoom = {
  code: string;
  ownerId: string;
  players: RoomPlayer[];
  createdAt: string;

  status: "lobby" | "countdown" | "live";
  countdownId: string | null;

  currentQuestion: MathQuestionState | null;

  mathQuestionIndex: number;
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