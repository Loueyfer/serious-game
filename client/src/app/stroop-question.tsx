import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { socket } from "../services/socket";

type PlayerScore = {
  userId: string;
  username: string;
  score: number;
};

type StroopColor =
  | "red"
  | "blue"
  | "green"
  | "yellow";

type StroopQuestion = {
  id: string;

  word: string;

  inkColor: StroopColor;

  startedAt: number;
  deadlineAt: number;
  serverNow: number;

  questionNumber: number;
  totalQuestions: number;

  scores: PlayerScore[];
};

type StroopQuestionResponse =
  | {
      success: true;
      question: StroopQuestion;
    }
  | {
      success: false;
      message: string;
    };
type SubmitStroopAnswerResponse =
  | {
      success: true;
      responseTimeMs: number;
    }
  | {
      success: false;
      message: string;
    };

type StroopPlayerResult = {
  userId: string;
  username: string;

  answer: boolean | null;

  correct: boolean;

  responseTimeMs: number | null;

  points: number;

  timedOut: boolean;
};

type StroopQuestionResult = {
  questionId: string;

  correctAnswer: boolean;

  results: StroopPlayerResult[];

  scores: PlayerScore[];
};
type GameFinishedPayload = {
  roomCode: string;

  scores: {
    userId: string;
    username: string;
    score: number;
  }[];

  winnerUserId: string | null;

  isDraw: boolean;
};
const STROOP_COLORS: Record<
  StroopColor,
  string
> = {
  red: "#E53935",
  blue: "#1E88E5",
  green: "#43A047",
  yellow: "#F9A825",
};

export default function StroopQuestionScreen() {
  const { roomCode } =
    useLocalSearchParams<{
      roomCode: string;
    }>();
  const router = useRouter();
  const [question, setQuestion] =
    useState<StroopQuestion | null>(null);

  const [scores, setScores] =
    useState<PlayerScore[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [timeLeft, setTimeLeft] =
    useState(5);
  const [
  selectedAnswer,
  setSelectedAnswer,
] = useState<boolean | null>(
  null
);

const [submitting, setSubmitting] =
  useState(false);

const [submitted, setSubmitted] =
  useState(false);

const [
  submissionMessage,
  setSubmissionMessage,
] = useState("");

const [result, setResult] =
  useState<StroopQuestionResult | null>(
    null
  );
  const [
  stroopPhaseComplete,
  setStroopPhaseComplete,
] = useState(false);
function loadStroopQuestion(
  newQuestion: StroopQuestion
) {
  setQuestion(newQuestion);
  setScores(newQuestion.scores);

  setSelectedAnswer(null);
  setSubmitting(false);
  setSubmitted(false);
  setSubmissionMessage("");
  setError("");
  setResult(null);

  const remainingMs =
    newQuestion.deadlineAt -
    newQuestion.serverNow;

  setTimeLeft(
    Math.max(
      0,
      Math.ceil(remainingMs / 1000)
    )
  );
}
  useEffect(() => {
    if (!roomCode) {
      setError("Room code missing.");
      setLoading(false);
      return;
    }

    socket.emit(
      "get_current_stroop_question",
      roomCode,
      (
        response: StroopQuestionResponse
      ) => {
        setLoading(false);

        if (!response.success) {
          setError(response.message);
          return;
        }

        loadStroopQuestion(
  response.question
);
      }
    );
  }, [roomCode]);

  useEffect(() => {
    if (!question) {
      return;
    }

    const interval = setInterval(() => {
      const remainingMs =
        question.deadlineAt -
        Date.now();

      const remainingSeconds =
        Math.max(
          0,
          Math.ceil(remainingMs / 1000)
        );

      setTimeLeft(remainingSeconds);

      if (remainingSeconds <= 0) {
        clearInterval(interval);
      }
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [question]);
function handleAnswer(
  answer: boolean
) {
  if (
    !question ||
    !roomCode ||
    submitted ||
    submitting
  ) {
    return;
  }

  if (timeLeft <= 0) {
    setError("Time is up.");
    return;
  }

  setError("");
  setSubmitting(true);

  socket.emit(
    "submit_stroop_answer",
    roomCode,
    question.id,
    answer,
    (
      response:
        SubmitStroopAnswerResponse
    ) => {
      setSubmitting(false);

      if (!response.success) {
        setError(response.message);

        if (
          response.message ===
          "Time is up"
        ) {
          setTimeLeft(0);
        }

        return;
      }

      setSelectedAnswer(answer);

      setSubmitted(true);

      setSubmissionMessage(
        `Answer submitted in ${(
          response.responseTimeMs /
          1000
        ).toFixed(2)}s`
      );
    }
  );
}
useEffect(() => {
  const handleQuestionResult = (
    data: StroopQuestionResult
  ) => {
    console.log(
      "Stroop result received:",
      data
    );

    setResult(data);

    setScores(data.scores);

    setTimeLeft(0);
  };

  socket.on(
    "stroop_question_result",
    handleQuestionResult
  );

  return () => {
    socket.off(
      "stroop_question_result",
      handleQuestionResult
    );
  };
}, []);
useEffect(() => {
  const handleNewStroopQuestion = (
    newQuestion: StroopQuestion
  ) => {
    console.log(
      "New Stroop question:",
      newQuestion.questionNumber
    );

    loadStroopQuestion(
      newQuestion
    );
  };

  const handleStroopPhaseComplete =
    () => {
      console.log(
        "Stroop phase complete"
      );

      setStroopPhaseComplete(true);
      setTimeLeft(0);
    };

  socket.on(
    "stroop_question_started",
    handleNewStroopQuestion
  );

  socket.on(
    "stroop_phase_complete",
    handleStroopPhaseComplete
  );

  return () => {
    socket.off(
      "stroop_question_started",
      handleNewStroopQuestion
    );

    socket.off(
      "stroop_phase_complete",
      handleStroopPhaseComplete
    );
  };
}, []);
useEffect(() => {
  const handleGameFinished = (
    data: GameFinishedPayload
  ) => {
    console.log(
      "Game finished:",
      data
    );

    router.replace({
      pathname: "/game-complete",

      params: {
        roomCode:
          data.roomCode,

        isDraw:
          String(data.isDraw),

        winnerUserId:
          data.winnerUserId ?? "",

        scores:
          JSON.stringify(
            data.scores
          ),
      },
    });
  };

  socket.on(
    "game_finished",
    handleGameFinished
  );

  return () => {
    socket.off(
      "game_finished",
      handleGameFinished
    );
  };
}, [router]);
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!question) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error ||
            "Stroop question not available"}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.phaseTitle}>
        Stroop Challenge
      </Text>

      <Text style={styles.progress}>
        Question {question.questionNumber} /{" "}
        {question.totalQuestions}
      </Text>

      <Text style={styles.timer}>
        Time: {timeLeft}s
      </Text>

      <View style={styles.scoreCard}>
        {scores.map((player) => (
          <View
            key={player.userId}
            style={styles.scoreRow}
          >
            <Text style={styles.scoreName}>
              {player.username}
            </Text>

            <Text style={styles.scoreValue}>
              {player.score} pts
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.instruction}>
        Does the word match its color?
      </Text>

      <View style={styles.stimulusCard}>
        <Text
          style={[
            styles.stimulusWord,
            {
              color:
                STROOP_COLORS[
                  question.inkColor
                ],
            },
          ]}
        >
          {question.word}
        </Text>
      </View>

      <View style={styles.answersContainer}>
        <TouchableOpacity
  style={[
    styles.answerButton,

    selectedAnswer === true &&
      styles.selectedAnswer,

    (submitted ||
      submitting ||
      timeLeft <= 0 ||
      result !== null) &&
      styles.disabledAnswer,
  ]}
  disabled={
    submitted ||
    submitting ||
    timeLeft <= 0 ||
    result !== null
  }
  onPress={() =>
    handleAnswer(true)
  }
>
  <Text style={styles.answerText}>
    Correct
  </Text>
</TouchableOpacity>

        <TouchableOpacity
  style={[
    styles.answerButton,

    selectedAnswer === false &&
      styles.selectedAnswer,

    (submitted ||
      submitting ||
      timeLeft <= 0 ||
      result !== null) &&
      styles.disabledAnswer,
  ]}
  disabled={
    submitted ||
    submitting ||
    timeLeft <= 0 ||
    result !== null
  }
  onPress={() =>
    handleAnswer(false)
  }
>
  <Text style={styles.answerText}>
    Incorrect
  </Text>
</TouchableOpacity>
      </View>

      {submissionMessage ? (
  <Text
    style={
      styles.submissionMessage
    }
  >
    {submissionMessage}
  </Text>
) : (
  <Text style={styles.info}>
    Tap Correct if the word and color
    match. Otherwise tap Incorrect.
  </Text>
)}

{error ? (
  <Text style={styles.error}>
    {error}
  </Text>
) : null}
{result && (
  <View style={styles.resultCard}>
    <Text style={styles.correctAnswer}>
      Expected:{" "}
      {result.correctAnswer
        ? "Correct"
        : "Incorrect"}
    </Text>

    {result.results.map(
      (playerResult) => (
        <View
          key={playerResult.userId}
          style={styles.resultRow}
        >
          <Text
            style={
              styles.resultUsername
            }
          >
            {playerResult.username}
          </Text>

          <Text
            style={
              styles.resultStatus
            }
          >
            {playerResult.timedOut
              ? "Timeout"
              : playerResult.correct
              ? "Correct"
              : "Wrong"}

            {playerResult.responseTimeMs !==
            null
              ? ` · ${(
                  playerResult.responseTimeMs /
                  1000
                ).toFixed(2)}s`
              : ""}
          </Text>

          <Text style={styles.points}>
            {playerResult.points > 0
              ? "+"
              : ""}
            {playerResult.points}
          </Text>
        </View>
      )
    )}
  </View>
)}
{stroopPhaseComplete && (
  <View
    style={
      styles.phaseCompleteCard
    }
  >
    <Text
      style={
        styles.phaseCompleteTitle
      }
    >
      Stroop Phase Complete!
    </Text>

    <Text
      style={
        styles.phaseCompleteText
      }
    >
      All 10 Stroop tasks are finished.
    </Text>
  </View>
)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 30,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },

  phaseTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#6D4AFF",
    marginBottom: 4,
  },

  progress: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },

  timer: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#DC2626",
    marginBottom: 10,
  },

  scoreCard: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },

  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },

  scoreName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },

  scoreValue: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#6D4AFF",
  },

  instruction: {
    fontSize: 17,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 12,
  },

  stimulusCard: {
    minHeight: 145,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    marginBottom: 16,
  },

  stimulusWord: {
    fontSize: 48,
    fontWeight: "bold",
    letterSpacing: 2,
  },

  answersContainer: {
    gap: 10,
  },

  answerButton: {
    backgroundColor: "#6D4AFF",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  answerText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

  info: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 12,
  },

  error: {
    color: "#DC2626",
    textAlign: "center",
  },
  selectedAnswer: {
  borderWidth: 3,
  borderColor: "#111827",
},

disabledAnswer: {
  opacity: 0.6,
},

submissionMessage: {
  fontSize: 15,
  fontWeight: "600",
  color: "#16A34A",
  textAlign: "center",
  marginTop: 10,
},

resultCard: {
  marginTop: 6,
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderWidth: 1,
  borderColor: "#E5E7EB",
  borderRadius: 10,
  backgroundColor: "#F9FAFB",
},

correctAnswer: {
  fontSize: 14,
  fontWeight: "700",
  color: "#16A34A",
  textAlign: "center",
  marginBottom: 4,
},

resultRow: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 4,
  borderTopWidth: 1,
  borderTopColor: "#E5E7EB",
},

resultUsername: {
  flex: 1,
  fontSize: 14,
  fontWeight: "600",
  color: "#111827",
},

resultStatus: {
  flex: 1.4,
  fontSize: 12,
  color: "#6B7280",
  textAlign: "center",
},

points: {
  width: 42,
  fontSize: 16,
  fontWeight: "bold",
  color: "#6D4AFF",
  textAlign: "right",
},
phaseCompleteCard: {
  marginTop: 14,
  padding: 14,
  borderRadius: 14,
  backgroundColor: "#F3EFFF",
  alignItems: "center",
},

phaseCompleteTitle: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#6D4AFF",
  marginBottom: 5,
},

phaseCompleteText: {
  fontSize: 14,
  color: "#4B5563",
  textAlign: "center",
},
});