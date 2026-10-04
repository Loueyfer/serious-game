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
    function cleanupCurrentRoom() {
    const roomCode =
      socket.data.roomCode as string | undefined;

    if (!roomCode) {
      return;
    }

    const room = rooms.get(roomCode);

    if (!room) {
      socket.data.roomCode = undefined;
      return;
    }

    const user = socket.data.user as {
      userId: string;
      username: string;
    };

    const wasCountingDown =
      room.status === "countdown";

    // If Player A / room owner leaves,
    // close the entire room.
    if (room.ownerId === user.userId) {
      rooms.delete(roomCode);

      socket.data.roomCode = undefined;

      socket.leave(roomCode);

      socket.nsp
        .to(roomCode)
        .emit("room_closed", {
          message:
            "The room was closed because the host left.",
        });

      console.log(
        `Room ${roomCode} closed because ${user.username} left`
      );

      return;
    }

    // Otherwise remove Player B.
    room.players = room.players.filter(
      (player) =>
        player.userId !== user.userId
    );

    // Reset remaining player to Not Ready.
    room.players.forEach((player) => {
      player.ready = false;
    });

    room.status = "lobby";
    room.countdownId = null;

    socket.data.roomCode = undefined;

    socket.leave(roomCode);

    if (wasCountingDown) {
      socket.nsp
        .to(roomCode)
        .emit("countdown_cancelled");
    }

    if (room.players.length === 0) {
      rooms.delete(roomCode);
      return;
    }

    socket.nsp
      .to(roomCode)
      .emit("room_updated", room);

    console.log(
      `${user.username} left room ${roomCode}`
    );
  }
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
            ready: false,
          },
        ],

        createdAt: new Date().toISOString(),
        status: "lobby",
        countdownId: null,
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
      ready: false,
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


  socket
  .to(cleanRoomCode)
  .emit("room_updated", room);
  
    callback({
      success: true,
      room,
    });
  }
);

socket.on(
  "get_room_state",
  (
    roomCode: string,
    callback: (response: any) => void
  ) => {
    const cleanRoomCode =
      roomCode.trim().toUpperCase();

    const room = rooms.get(cleanRoomCode);

    if (!room) {
      callback({
        success: false,
        message: "Room not found",
      });

      return;
    }

    callback({
      success: true,
      room,
    });
  }
);

socket.on(
  "set_ready",
  (
    roomCode: string,
    ready: boolean,
    callback: (response: any) => void
  ) => {
    const user = socket.data.user as {
      userId: string;
      username: string;
    };

    const cleanRoomCode =
      roomCode.trim().toUpperCase();

    const room = rooms.get(cleanRoomCode);

    if (!room) {
      callback({
        success: false,
        message: "Room not found",
      });

      return;
    }

    const player = room.players.find(
      (player) =>
        player.userId === user.userId
    );

    if (!player) {
      callback({
        success: false,
        message: "You are not in this room",
      });

      return;
    }

    player.ready = ready;

    console.log(
      `${user.username} is ${
        ready ? "ready" : "not ready"
      } in room ${cleanRoomCode}`
    );

    // Send updated room to BOTH players
    socket
  .to(cleanRoomCode)
  .emit("room_updated", room);

socket.emit("room_updated", room);

callback({
  success: true,
  room,
});

// If somebody becomes Not Ready during
// a countdown, cancel the countdown.
if (!ready && room.status === "countdown") {
  room.status = "lobby";
  room.countdownId = null;

  socket.nsp
    .to(cleanRoomCode)
    .emit("countdown_cancelled");

  console.log(
    `Countdown cancelled in room ${cleanRoomCode}`
  );

  return;
}

// Check whether exactly two players are ready.
const bothPlayersReady =
  room.players.length === 2 &&
  room.players.every(
    (player) => player.ready
  );

// Start countdown only once.
if (
  bothPlayersReady &&
  room.status === "lobby"
) {
  room.status = "countdown";

  const countdownId =
    `${cleanRoomCode}-${Date.now()}`;

  room.countdownId = countdownId;

  console.log(
    `Countdown started in room ${cleanRoomCode}`
  );

  // 3
  socket.nsp
    .to(cleanRoomCode)
    .emit("countdown_tick", {
      value: 3,
    });

  // 2
  setTimeout(() => {
    const currentRoom =
      rooms.get(cleanRoomCode);

    if (
      !currentRoom ||
      currentRoom.status !== "countdown" ||
      currentRoom.countdownId !== countdownId
    ) {
      return;
    }

    socket.nsp
      .to(cleanRoomCode)
      .emit("countdown_tick", {
        value: 2,
      });
  }, 1000);

  // 1
  setTimeout(() => {
    const currentRoom =
      rooms.get(cleanRoomCode);

    if (
      !currentRoom ||
      currentRoom.status !== "countdown" ||
      currentRoom.countdownId !== countdownId
    ) {
      return;
    }

    socket.nsp
      .to(cleanRoomCode)
      .emit("countdown_tick", {
        value: 1,
      });
  }, 2000);

  // GO
  setTimeout(() => {
    const currentRoom =
      rooms.get(cleanRoomCode);

    if (
      !currentRoom ||
      currentRoom.status !== "countdown" ||
      currentRoom.countdownId !== countdownId
    ) {
      return;
    }

    const stillReady =
      currentRoom.players.length === 2 &&
      currentRoom.players.every(
        (player) => player.ready
      );

    if (!stillReady) {
      currentRoom.status = "lobby";
      currentRoom.countdownId = null;

      socket.nsp
        .to(cleanRoomCode)
        .emit("countdown_cancelled");

      return;
    }

    currentRoom.status = "live";
    currentRoom.countdownId = null;

    console.log(
      `Game started in room ${cleanRoomCode}`
    );

    socket.nsp
      .to(cleanRoomCode)
      .emit("game_start");
  }, 3000);
}
  }
);
  socket.on(
    "leave_room",
    (
      roomCode: string,
      callback: (
        response:
          | { success: true }
          | {
              success: false;
              message: string;
            }
      ) => void
    ) => {
      const cleanRoomCode =
        roomCode.trim().toUpperCase();

      if (
        socket.data.roomCode !==
        cleanRoomCode
      ) {
        callback({
          success: false,
          message:
            "You are not in this room",
        });

        return;
      }

      cleanupCurrentRoom();

      callback({
        success: true,
      });
    }
  );
    socket.on("disconnect", () => {
    cleanupCurrentRoom();
  });
}