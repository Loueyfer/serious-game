export type RoomPlayer = {
  userId: string;
  username: string;
  socketId: string;
};

export type GameRoom = {
  code: string;
  ownerId: string;
  players: RoomPlayer[];
  createdAt: string;
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