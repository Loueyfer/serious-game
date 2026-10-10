import { router, useLocalSearchParams } from "expo-router";
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
type Question = {
  id: string;
  prompt: string;
  choices: number[];
  startedAt: number;
  deadlineAt: number;
  serverNow: number;

  questionNumber: number;
  totalQuestions: number;

  scores: PlayerScore[];
};

type QuestionResponse =
  | {
      success: true;
      question: Question;
    }
  | {
      success: false;
      message: string;
    };
type SubmitAnswerResponse =
  | {
      success: true;
      responseTimeMs: number;
    }
  | {
      success: false;
      message: string;
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
  scores: PlayerScore[];
};
export default function MathQuestionScreen() {
  const { roomCode } =
    useLocalSearchParams<{
      roomCode: string;
    }>();

  const [question, setQuestion] =
    useState<Question | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [timeLeft, setTimeLeft] =
    useState(5);
  const [selectedAnswer, setSelectedAnswer] =
  useState<number | null>(null);

const [submitting, setSubmitting] =
  useState(false);

const [submitted, setSubmitted] =
  useState(false);

const [submissionMessage, setSubmissionMessage] =
  useState("");
  const [result, setResult] =
  useState<MathQuestionResult | null>(
    null
  );
  const [scores, setScores] =
  useState<PlayerScore[]>([]);
  const [
  mathPhaseComplete,
  setMathPhaseComplete,
] = useState(false);

function loadQuestion(
  newQuestion: Question
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
      "get_current_question",
      roomCode,
      (response: QuestionResponse) => {
        setLoading(false);

        if (!response.success) {
          setError(response.message);
          return;
        }

        loadQuestion(
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
        question.deadlineAt - Date.now();

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
  useEffect(() => {
  const handleQuestionResult = (
    data: MathQuestionResult
  ) => {
    console.log(
      "Math result received:",
      data
    );

    setResult(data);
    setScores(data.scores);
    setTimeLeft(0);
  };

  socket.on(
    "math_question_result",
    handleQuestionResult
  );

  return () => {
    socket.off(
      "math_question_result",
      handleQuestionResult
    );
  };
}, []);
useEffect(() => {
  const handleNewMathQuestion = (
    newQuestion: Question
  ) => {
    console.log(
      "New Math question:",
      newQuestion.questionNumber
    );

    loadQuestion(newQuestion);
  };

  const handleMathPhaseComplete = () => {
    console.log(
      "Math phase complete"
    );
  
    setMathPhaseComplete(true);
    setTimeLeft(0);
  };
  const handleGeographyPhaseStart = () => {
  console.log(
    "Geography phase starting"
  );

  router.replace({
    pathname: "/geography-question",
    params: {
      roomCode,
    },
  });
};
  socket.on(
    "math_question_started",
    handleNewMathQuestion
  );

  socket.on(
    "math_phase_complete",
    handleMathPhaseComplete
  );
socket.on(
  "geography_phase_start",
  handleGeographyPhaseStart
);
  return () => {
    socket.off(
      "math_question_started",
      handleNewMathQuestion
    );

    socket.off(
      "math_phase_complete",
      handleMathPhaseComplete
    );
    socket.off(
  "geography_phase_start",
  handleGeographyPhaseStart
);
  };
}, []);
  function handleAnswer(
  choice: number
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
    "submit_math_answer",
    roomCode,
    question.id,
    choice,
    (
      response: SubmitAnswerResponse
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

      setSelectedAnswer(choice);
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
          {error || "Question not available"}
        </Text>

        <TouchableOpacity
          onPress={() =>
            router.replace("/home")
          }
        >
          <Text style={styles.backText}>
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
  <ScrollView
    style={styles.container}
    contentContainerStyle={styles.contentContainer}
    showsVerticalScrollIndicator={false}
  >
      <Text style={styles.phaseTitle}>
        Math Challenge
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
      <View style={styles.questionCard}>
        <Text style={styles.question}>
          {question.prompt}
        </Text>
      </View>

      <View style={styles.answersContainer}>
        {question.choices.map((choice) => (
  <TouchableOpacity
    key={choice}
    style={[
      styles.answerButton,

      selectedAnswer === choice &&
        styles.selectedAnswer,

      (submitted ||
  submitting ||
  timeLeft <= 0 ||
  result !== null) &&
  styles.disabledAnswer,
    ]}
    onPress={() =>
      handleAnswer(choice)
    }
    disabled={
  submitted ||
  submitting ||
  timeLeft <= 0 ||
  result !== null
}
  >
    <Text style={styles.answerText}>
      {choice}
    </Text>
  </TouchableOpacity>
))}
      </View>

      {submissionMessage ? (
  <Text style={styles.submissionMessage}>
    {submissionMessage}
  </Text>
) : (
  <Text style={styles.info}>
    Choose the correct answer before time runs out.
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
      Correct: {result.correctAnswer}
    </Text>

    {result.results.map((playerResult) => (
      <View
        key={playerResult.userId}
        style={styles.resultRow}
      >
        <Text style={styles.resultUsername}>
          {playerResult.username}
        </Text>

        <Text style={styles.resultStatus}>
          {playerResult.timedOut
            ? "Timeout"
            : playerResult.correct
            ? "Correct"
            : "Wrong"}

          {playerResult.responseTimeMs !== null
            ? ` · ${(playerResult.responseTimeMs / 1000).toFixed(2)}s`
            : ""}
        </Text>

        <Text style={styles.points}>
          {playerResult.points > 0 ? "+" : ""}
          {playerResult.points}
        </Text>
      </View>
    ))}
  </View>
)}
{mathPhaseComplete && (
  <View style={styles.phaseCompleteCard}>
    <Text style={styles.phaseCompleteTitle}>
      Math Phase Complete!
    </Text>

    <Text style={styles.phaseCompleteText}>
      All 10 Math questions are finished.
    </Text>
  </View>
)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
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
    backgroundColor: "#ffffff",
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
    marginBottom: 12,
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

  questionCard: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  question: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
  },

  answersContainer: {
    gap: 8,
  },

  answerButton: {
    backgroundColor: "#6D4AFF",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  answerText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

  info: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 12,
  },

  error: {
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 10,
  },

  backText: {
    color: "#6D4AFF",
    fontSize: 16,
  },

  selectedAnswer: {
    borderWidth: 3,
    borderColor: "#111827",
  },

  disabledAnswer: {
    opacity: 0.6,
  },

  submissionMessage: {
    fontSize: 16,
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