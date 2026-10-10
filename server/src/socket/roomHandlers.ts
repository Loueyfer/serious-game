import type { Socket } from "socket.io";

import type { GameRoom } from "./roomStore";
import { mathTasks } from "../tasks/mathTasks";
import { geographyTasks } from "../tasks/geographyTasks";
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
type SubmitMathAnswerResponse =
  | {
      success: true;
      responseTimeMs: number;
    }
  | {
      success: false;
      message: string;
    };
type SubmitGeographyAnswerResponse =
  | {
      success: true;
      responseTimeMs: number;
    }
  | {
      success: false;
      message: string;
    };

type GeographyPlayerResult = {
  userId: string;
  username: string;
  answer: string | null;
  correct: boolean;
  responseTimeMs: number | null;
  points: number;
  timedOut: boolean;
};

type GeographyQuestionResult = {
  questionId: string;
  correctAnswer: string;

  results: GeographyPlayerResult[];

  scores: {
    userId: string;
    username: string;
    score: number;
  }[];
};
type MathPlayerResult = {
  userId: string;
  username: string;
  answer: number | null;
  correct: boolean;
  responseTimeMs: number | null;
  points: number;
  timedOut: boolean;
};

type MathQuestionResult = {
  questionId: string;
  correctAnswer: number;
  results: MathPlayerResult[];

  scores: {
    userId: string;
    username: string;
    score: number;
  }[];
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
  function resolveMathQuestion(
  roomCode: string
) {
  const room = rooms.get(roomCode);

  if (
    !room ||
    !room.currentQuestion ||
    room.currentQuestion.resolved
  ) {
    return;
  }

  const question = room.currentQuestion;

  question.resolved = true;

  const correctAttempts =
    question.attempts
      .filter((attempt) => attempt.correct)
      .sort(
        (a, b) =>
          (a.responseTimeMs ?? Infinity) -
          (b.responseTimeMs ?? Infinity)
      );

  const fastestCorrectUserId =
  correctAttempts[0]?.userId ?? null;

  const results: MathPlayerResult[] =
    room.players.map((player) => {
      const attempt =
        question.attempts.find(
          (attempt) =>
            attempt.userId ===
            player.userId
        );

      // Player did not answer
      if (!attempt) {
        return {
          userId: player.userId,
          username: player.username,
          answer: null,
          correct: false,
          responseTimeMs: null,
          points: 0,
          timedOut: true,
        };
      }

      let points = -2;

      if (attempt.correct) {
        points =
          attempt.userId ===
          fastestCorrectUserId
            ? 10
            : 5;
      }

      return {
        userId: player.userId,
        username: player.username,
        answer: attempt.answer,
        correct: attempt.correct,
        responseTimeMs:
          attempt.responseTimeMs,
        points,
        timedOut: false,
      };
    });
  results.forEach((playerResult) => {
  const player = room.players.find(
    (roomPlayer) =>
      roomPlayer.userId ===
      playerResult.userId
  );

  if (player) {
    player.score +=
      playerResult.points;
  }
});
const scores = room.players.map(
  (player) => ({
    userId: player.userId,
    username: player.username,
    score: player.score,
  })
);
  const result: MathQuestionResult = {
    questionId: question.id,
    correctAnswer:
      question.correctAnswer,
    results,
    scores,
  };

  console.log(
    `Math question resolved in room ${roomCode}`
  );

  console.log(result);

  socket.nsp
    .to(roomCode)
    .emit(
      "math_question_result",
      result
    );
    const resolvedQuestionId =
  question.id;

// Question 10 was the last Math question.
const isLastQuestion =
  room.mathQuestionIndex >=
  mathTasks.length - 1;

if (isLastQuestion) {
  setTimeout(() => {
    const latestRoom =
      rooms.get(roomCode);

    if (
      !latestRoom ||
      !latestRoom.currentQuestion ||
      latestRoom.currentQuestion.id !==
        resolvedQuestionId
    ) {
      return;
    }

    console.log(
      `Math phase completed in room ${roomCode}`
    );

    // Switch the game to Geography
    latestRoom.phase = "geography";

    latestRoom.geographyQuestionIndex = 0;

    latestRoom.currentGeographyQuestion =
      null;

    socket.nsp
      .to(roomCode)
      .emit("math_phase_complete");

    console.log(
      `Geography phase started in room ${roomCode}`
    );

    socket.nsp
      .to(roomCode)
      .emit("geography_phase_start");

    startGeographyQuestion(
      roomCode
    );
  }, 2500);

  return;
}

// Otherwise start the next question
setTimeout(() => {
  const latestRoom =
    rooms.get(roomCode);

  if (
    !latestRoom ||
    !latestRoom.currentQuestion ||
    latestRoom.currentQuestion.id !==
      resolvedQuestionId ||
    !latestRoom.currentQuestion.resolved
  ) {
    return;
  }

  latestRoom.mathQuestionIndex += 1;

  startMathQuestion(roomCode);
}, 2500);
}
function startMathQuestion(
  roomCode: string
) {
  const room = rooms.get(roomCode);

  if (!room) {
    return;
  }

  const task =
    mathTasks[room.mathQuestionIndex];

  if (!task) {
    console.log(
      `No Math question found at index ${room.mathQuestionIndex}`
    );
    return;
  }

  const startedAt = Date.now();

  room.currentQuestion = {
    id: task.id,
    prompt: task.prompt,
    choices: [...task.choices],
    correctAnswer: task.correctAnswer,

    startedAt,
    deadlineAt: startedAt + 5000,

    attempts: [],
    resolved: false,
  };

  const questionId =
    room.currentQuestion.id;

  console.log(
    `Math question ${
      room.mathQuestionIndex + 1
    }/${mathTasks.length} started in room ${roomCode}: ${task.prompt}`
  );
  
  socket.nsp
  .to(roomCode)
  .emit("math_question_started", {
    id: room.currentQuestion.id,
    prompt: room.currentQuestion.prompt,
    choices: room.currentQuestion.choices,
    startedAt:
      room.currentQuestion.startedAt,
    deadlineAt:
      room.currentQuestion.deadlineAt,
    serverNow: Date.now(),

    questionNumber:
      room.mathQuestionIndex + 1,

    totalQuestions:
      mathTasks.length,
      scores: room.players.map(
  (player) => ({
    userId: player.userId,
    username: player.username,
    score: player.score,
  })
),
  });
  // Resolve automatically when the
  // 5-second deadline is reached.
  setTimeout(() => {
    const latestRoom =
      rooms.get(roomCode);

    if (
      !latestRoom ||
      !latestRoom.currentQuestion ||
      latestRoom.currentQuestion.id !==
        questionId
    ) {
      return;
    }

    resolveMathQuestion(roomCode);
  }, 5000);
}
function startGeographyQuestion(
  roomCode: string
) {
  const room = rooms.get(roomCode);

  if (!room) {
    return;
  }

  const task =
    geographyTasks[
      room.geographyQuestionIndex
    ];

  if (!task) {
    console.log(
      `No Geography question found at index ${room.geographyQuestionIndex}`
    );
    return;
  }

  const startedAt = Date.now();

  room.currentGeographyQuestion = {
    id: task.id,

    capital: task.capital,

    prompt: `${task.capital} is the capital of which country?`,

    choices: [...task.choices],

    correctAnswer:
      task.correctAnswer,

    startedAt,

    deadlineAt:
      startedAt + 5000,

    attempts: [],

    resolved: false,
  };

  console.log(
    `Geography question ${
      room.geographyQuestionIndex + 1
    }/${geographyTasks.length} started in room ${roomCode}: ${task.capital}`
  );

  socket.nsp
    .to(roomCode)
    .emit(
      "geography_question_started",
      {
        id:
          room.currentGeographyQuestion.id,

        capital:
          room.currentGeographyQuestion
            .capital,

        prompt:
          room.currentGeographyQuestion
            .prompt,

        choices:
          room.currentGeographyQuestion
            .choices,

        startedAt:
          room.currentGeographyQuestion
            .startedAt,

        deadlineAt:
          room.currentGeographyQuestion
            .deadlineAt,

        serverNow: Date.now(),

        questionNumber:
          room.geographyQuestionIndex + 1,

        totalQuestions:
          geographyTasks.length,

        scores: room.players.map(
          (player) => ({
            userId: player.userId,
            username: player.username,
            score: player.score,
          })
        ),
      }
    );
    const questionId =
  room.currentGeographyQuestion.id;

setTimeout(() => {
  const latestRoom =
    rooms.get(roomCode);

  if (
    !latestRoom ||
    !latestRoom.currentGeographyQuestion ||
    latestRoom.currentGeographyQuestion.id !==
      questionId
  ) {
    return;
  }

  resolveGeographyQuestion(
    roomCode
  );
}, 5000);
}
function resolveGeographyQuestion(
  roomCode: string
) {
  const room = rooms.get(roomCode);

  if (
    !room ||
    !room.currentGeographyQuestion ||
    room.currentGeographyQuestion.resolved
  ) {
    return;
  }

  const question =
    room.currentGeographyQuestion;

  question.resolved = true;

  const correctAttempts =
    question.attempts
      .filter((attempt) => attempt.correct)
      .sort(
        (a, b) =>
          (a.responseTimeMs ?? Infinity) -
          (b.responseTimeMs ?? Infinity)
      );

  const fastestCorrectUserId =
    correctAttempts[0]?.userId ?? null;

  const results: GeographyPlayerResult[] =
    room.players.map((player) => {
      const attempt =
        question.attempts.find(
          (attempt) =>
            attempt.userId ===
            player.userId
        );

      // No answer = timeout
      if (!attempt) {
        return {
          userId: player.userId,
          username: player.username,
          answer: null,
          correct: false,
          responseTimeMs: null,
          points: 0,
          timedOut: true,
        };
      }

      let points = -2;

      if (attempt.correct) {
        points =
          attempt.userId ===
          fastestCorrectUserId
            ? 10
            : 5;
      }

      return {
        userId: player.userId,
        username: player.username,
        answer: attempt.answer,
        correct: attempt.correct,
        responseTimeMs:
          attempt.responseTimeMs,
        points,
        timedOut: false,
      };
    });

  // Add Geography points to running game score
  results.forEach((playerResult) => {
    const player = room.players.find(
      (roomPlayer) =>
        roomPlayer.userId ===
        playerResult.userId
    );

    if (player) {
      player.score +=
        playerResult.points;
    }
  });

  const scores = room.players.map(
    (player) => ({
      userId: player.userId,
      username: player.username,
      score: player.score,
    })
  );

  const result: GeographyQuestionResult = {
    questionId: question.id,
    correctAnswer:
      question.correctAnswer,
    results,
    scores,
  };

  console.log(
    `Geography question resolved in room ${roomCode}`
  );

  socket.nsp
    .to(roomCode)
    .emit(
      "geography_question_result",
      result
    );
  const resolvedQuestionId =
  question.id;

const isLastQuestion =
  room.geographyQuestionIndex >=
  geographyTasks.length - 1;

if (isLastQuestion) {
  setTimeout(() => {
    const latestRoom =
      rooms.get(roomCode);

    if (
      !latestRoom ||
      !latestRoom.currentGeographyQuestion ||
      latestRoom.currentGeographyQuestion.id !==
        resolvedQuestionId
    ) {
      return;
    }

    console.log(
      `Geography phase completed in room ${roomCode}`
    );

    socket.nsp
      .to(roomCode)
      .emit(
        "geography_phase_complete"
      );
  }, 2500);

  return;
}

// Start next Geography question
setTimeout(() => {
  const latestRoom =
    rooms.get(roomCode);

  if (
    !latestRoom ||
    !latestRoom.currentGeographyQuestion ||
    latestRoom.currentGeographyQuestion.id !==
      resolvedQuestionId ||
    !latestRoom.currentGeographyQuestion.resolved
  ) {
    return;
  }

  latestRoom.geographyQuestionIndex += 1;

  startGeographyQuestion(
    roomCode
  );
}, 2500);
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
  score: 0,
},
        ],

        createdAt: new Date().toISOString(),
        status: "lobby",
        countdownId: null,
        currentQuestion: null,
        mathQuestionIndex: 0,
        currentGeographyQuestion: null,
geographyQuestionIndex: 0,

phase: "math",
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
  score: 0,
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
  "get_current_question",
  (
    roomCode: string,
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

    const playerInRoom =
      room.players.some(
        (player) =>
          player.userId === user.userId
      );

    if (!playerInRoom) {
      callback({
        success: false,
        message:
          "You are not in this room",
      });

      return;
    }

    if (!room.currentQuestion) {
      callback({
        success: false,
        message:
          "No active question",
      });

      return;
    }

    const question =
      room.currentQuestion;

    callback({
      success: true,

      question: {
        id: question.id,
        prompt: question.prompt,
        choices: question.choices,
        startedAt: question.startedAt,
        deadlineAt: question.deadlineAt,

        // Lets the phone calculate the
        // remaining time without controlling
        // the authoritative timer.
        serverNow: Date.now(),
        questionNumber:
  room.mathQuestionIndex + 1,

totalQuestions:
  mathTasks.length,
  scores: room.players.map(
      (player) => ({
        userId: player.userId,
        username: player.username,
        score: player.score,
      })
    ),
      },
    });
  }
);
socket.on(
  "get_current_geography_question",
  (
    roomCode: string,
    callback: (response: any) => void
  ) => {
    const user = socket.data.user as {
      userId: string;
      username: string;
    };

    const cleanRoomCode =
      roomCode.trim().toUpperCase();

    const room =
      rooms.get(cleanRoomCode);

    if (!room) {
      callback({
        success: false,
        message: "Room not found",
      });

      return;
    }

    const playerInRoom =
      room.players.some(
        (player) =>
          player.userId ===
          user.userId
      );

    if (!playerInRoom) {
      callback({
        success: false,
        message:
          "You are not in this room",
      });

      return;
    }

    if (
      !room.currentGeographyQuestion
    ) {
      callback({
        success: false,
        message:
          "No active Geography question",
      });

      return;
    }

    const question =
      room.currentGeographyQuestion;

    callback({
      success: true,

      question: {
        id: question.id,
        capital: question.capital,
        prompt: question.prompt,
        choices: question.choices,
        startedAt:
          question.startedAt,
        deadlineAt:
          question.deadlineAt,

        serverNow: Date.now(),

        questionNumber:
          room.geographyQuestionIndex + 1,

        totalQuestions:
          geographyTasks.length,

        scores: room.players.map(
          (player) => ({
            userId: player.userId,
            username: player.username,
            score: player.score,
          })
        ),
      },
    });
  }
);
socket.on(
  "submit_geography_answer",
  (
    roomCode: string,
    questionId: string,
    answer: string,
    callback: (
      response: SubmitGeographyAnswerResponse
    ) => void
  ) => {
    const user = socket.data.user as {
      userId: string;
      username: string;
    };

    const cleanRoomCode =
      roomCode.trim().toUpperCase();

    const room =
      rooms.get(cleanRoomCode);

    if (!room) {
      callback({
        success: false,
        message: "Room not found",
      });

      return;
    }

    const playerInRoom =
      room.players.some(
        (player) =>
          player.userId === user.userId
      );

    if (!playerInRoom) {
      callback({
        success: false,
        message:
          "You are not in this room",
      });

      return;
    }

    if (
      room.phase !== "geography" ||
      !room.currentGeographyQuestion
    ) {
      callback({
        success: false,
        message:
          "No active Geography question",
      });

      return;
    }

    const question =
      room.currentGeographyQuestion;

    if (
      question.id !== questionId
    ) {
      callback({
        success: false,
        message:
          "Question is no longer active",
      });

      return;
    }

    if (question.resolved) {
      callback({
        success: false,
        message:
          "Question is already finished",
      });

      return;
    }

    const existingAttempt =
      question.attempts.find(
        (attempt) =>
          attempt.userId === user.userId
      );

    if (existingAttempt) {
      callback({
        success: false,
        message:
          "You already answered this question",
      });

      return;
    }

    if (
      typeof answer !== "string" ||
      !question.choices.includes(answer)
    ) {
      callback({
        success: false,
        message: "Invalid answer",
      });

      return;
    }

    const submittedAt = Date.now();

    if (
      submittedAt >
      question.deadlineAt
    ) {
      callback({
        success: false,
        message: "Time is up",
      });

      return;
    }

    const correct =
      answer ===
      question.correctAnswer;

    const responseTimeMs =
      submittedAt -
      question.startedAt;

    question.attempts.push({
      userId: user.userId,
      username: user.username,
      answer,
      correct,
      submittedAt,
      responseTimeMs,
    });

    console.log(
      `${user.username} answered Geography ${answer} - ${
        correct ? "correct" : "wrong"
      } - ${responseTimeMs}ms`
    );

    callback({
      success: true,
      responseTimeMs,
    });

    const everyoneAnswered =
      question.attempts.length ===
      room.players.length;

    if (everyoneAnswered) {
      resolveGeographyQuestion(
        cleanRoomCode
      );
    }
  }
);
socket.on(
  "submit_math_answer",
  (
    roomCode: string,
    questionId: string,
    answer: number,
    callback: (
      response: SubmitMathAnswerResponse
    ) => void
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

    const playerInRoom =
      room.players.some(
        (player) =>
          player.userId === user.userId
      );

    if (!playerInRoom) {
      callback({
        success: false,
        message:
          "You are not in this room",
      });

      return;
    }

    if (
      room.status !== "live" ||
      !room.currentQuestion
    ) {
      callback({
        success: false,
        message:
          "No active question",
      });

      return;
    }

    const question =
      room.currentQuestion;

    if (question.id !== questionId) {
      callback({
        success: false,
        message:
          "Question is no longer active",
      });

      return;
    }

    if (question.resolved) {
      callback({
        success: false,
        message:
          "Question is already finished",
      });

      return;
    }

    const existingAttempt =
      question.attempts.find(
        (attempt) =>
          attempt.userId === user.userId
      );

    if (existingAttempt) {
      callback({
        success: false,
        message:
          "You already answered this question",
      });

      return;
    }

    if (
      typeof answer !== "number" ||
      !question.choices.includes(answer)
    ) {
      callback({
        success: false,
        message: "Invalid answer",
      });

      return;
    }

    const submittedAt = Date.now();

    // Server controls the 5-second deadline.
    if (
      submittedAt >
      question.deadlineAt
    ) {
      callback({
        success: false,
        message: "Time is up",
      });

      return;
    }

    const correct =
      answer ===
      question.correctAnswer;

    const responseTimeMs =
      submittedAt -
      question.startedAt;

    question.attempts.push({
      userId: user.userId,
      username: user.username,
      answer,
      correct,
      submittedAt,
      responseTimeMs,
    });

    console.log(
      `${user.username} answered ${answer} - ${
        correct ? "correct" : "wrong"
      } - ${responseTimeMs}ms`
    );

    callback({
      success: true,
      responseTimeMs,
    });
    const everyoneAnswered =
  question.attempts.length ===
  room.players.length;

if (everyoneAnswered) {
  resolveMathQuestion(
    cleanRoomCode
  );
}  }
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

// Start Math Question 1
currentRoom.mathQuestionIndex = 0;

startMathQuestion(
  cleanRoomCode
);

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