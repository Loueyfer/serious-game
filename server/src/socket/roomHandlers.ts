import type { Socket } from "socket.io";

import type { GameRoom } from "./roomStore";

import {
  generateRoomCode,
  rooms,
} from "./roomStore";

type CreateRoomResponse =
  | {
      success: true;
      room: GameRoom;
    }
  | {
      success: false;
      message: string;
    };

type JoinRoomResponse =
  | {
      success: true;
      room: GameRoom;
    }
  | {
      success: false;
      message: string;
    };
    
    
export function registerRoomHandlers(
  socket: Socket
) {
  socket.on(
    "create_room",
    (
      callback: (
        response: CreateRoomResponse
      ) => void
    ) => {
      const user = socket.data.user as {
        userId: string;
        username: string;
      };

      if (!user) {
        callback({
          success: false,
          message: "Authentication required",
        });

        return;
      }

      // Remove an old room created by this
      // socket, if there is one.
      const previousRoomCode =
        socket.data.roomCode as string | undefined;

      if (previousRoomCode) {
        rooms.delete(previousRoomCode);
        socket.leave(previousRoomCode);
      }

      const roomCode = generateRoomCode();

      const room: GameRoom = {
        code: roomCode,
        ownerId: user.userId,

        players: [
          {
            userId: user.userId,
            username: user.username,
            socketId: socket.id,
          },
        ],

        createdAt: new Date().toISOString(),
      };

      rooms.set(roomCode, room);

      socket.join(roomCode);

      socket.data.roomCode = roomCode;

      console.log(
        `Room ${roomCode} created by ${user.username}`
      );

      callback({
        success: true,
        room,
      });
    }
  );

  socket.on(
  "join_room",
  (
    roomCode: string,
    callback: (
      response: JoinRoomResponse
    ) => void
  ) => {
    const user = socket.data.user as {
      userId: string;
      username: string;
    };

    if (!user) {
      callback({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const cleanRoomCode =
      roomCode.trim().toUpperCase();

    if (!cleanRoomCode) {
      callback({
        success: false,
        message: "Room code is required",
      });

      return;
    }

    const room = rooms.get(cleanRoomCode);

    if (!room) {
      callback({
        success: false,
        message: "Room not found",
      });

      return;
    }

    const alreadyInRoom = room.players.some(
      (player) => player.userId === user.userId
    );

    if (alreadyInRoom) {
      callback({
        success: false,
        message: "You are already in this room",
      });

      return;
    }

    if (room.players.length >= 2) {
      callback({
        success: false,
        message: "Room is full",
      });

      return;
    }

    const player = {
      userId: user.userId,
      username: user.username,
      socketId: socket.id,
    };

    room.players.push(player);

    socket.join(cleanRoomCode);

    socket.data.roomCode = cleanRoomCode;

    console.log(
      `${user.username} joined room ${cleanRoomCode}`
    );

    socket.to(cleanRoomCode).emit(
      "player_joined",
      {
        player,
        players: room.players,
      }
    );

    callback({
      success: true,
      room,
    });
  }
);
}