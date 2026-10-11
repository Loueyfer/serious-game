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

type GeographyQuestion = {
  id: string;
  capital: string;
  prompt: string;
  choices: string[];

  startedAt: number;
  deadlineAt: number;
  serverNow: number;

  questionNumber: number;
  totalQuestions: number;

  scores: PlayerScore[];
};

type GeographyQuestionResponse =
  | {
      success: true;
      question: GeographyQuestion;
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
  scores: PlayerScore[];
};

export default function GeographyQuestionScreen() {
  const { roomCode } =
    useLocalSearchParams<{
      roomCode: string;
    }>();
  const router = useRouter();
  const [question, setQuestion] =
    useState<GeographyQuestion | null>(null);

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
] = useState<string | null>(null);

const [submitting, setSubmitting] =
  useState(false);

const [submitted, setSubmitted] =
  useState(false);

const [
  submissionMessage,
  setSubmissionMessage,
] = useState("");

const [result, setResult] =
  useState<GeographyQuestionResult | null>(
    null
  );
 const [
  geographyPhaseComplete,
  setGeographyPhaseComplete,
] = useState(false);
 function loadGeographyQuestion(
  newQuestion: GeographyQuestion
) {
  setQuestion(newQuestion);
  setScores(newQuestion.scores);

  // Reset state from previous question
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
      "get_current_geography_question",
      roomCode,
      (
        response: GeographyQuestionResponse
      ) => {
        setLoading(false);

        if (!response.success) {
          setError(response.message);
          return;
        }

        loadGeographyQuestion(
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
  function handleAnswer(
  choice: string
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
    "submit_geography_answer",
    roomCode,
    question.id,
    choice,
    (
      response:
        SubmitGeographyAnswerResponse
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
useEffect(() => {
  const handleQuestionResult = (
    data: GeographyQuestionResult
  ) => {
    console.log(
      "Geography result received:",
      data
    );

    setResult(data);
    setScores(data.scores);
    setTimeLeft(0);
  };

  socket.on(
    "geography_question_result",
    handleQuestionResult
  );

  return () => {
    socket.off(
      "geography_question_result",
      handleQuestionResult
    );
  };
}, []);
useEffect(() => {
  const handleNewGeographyQuestion = (
    newQuestion: GeographyQuestion
  ) => {
    console.log(
      "New Geography question:",
      newQuestion.questionNumber
    );

    loadGeographyQuestion(
      newQuestion
    );
  };

  const handleGeographyPhaseComplete =
    () => {
      console.log(
        "Geography phase complete"
      );

      setGeographyPhaseComplete(true);
      setTimeLeft(0);
    };
  const handleStroopPhaseStart = () => {
  console.log(
    "Stroop phase starting"
  );

  router.replace({
    pathname: "/stroop-question",
    params: {
      roomCode,
    },
  });
};
  socket.on(
    "geography_question_started",
    handleNewGeographyQuestion
  );

  socket.on(
    "geography_phase_complete",
    handleGeographyPhaseComplete
  );
  socket.on(
  "stroop_phase_start",
  handleStroopPhaseStart
);
  return () => {
    socket.off(
      "geography_question_started",
      handleNewGeographyQuestion
    );

    socket.off(
      "geography_phase_complete",
      handleGeographyPhaseComplete
    );
    socket.off(
  "stroop_phase_start",
  handleStroopPhaseStart
);
  };
}, []);
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
            "Geography question not available"}
        </Text>
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
        Geography Challenge
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
        <Text style={styles.capital}>
          {question.capital}
        </Text>

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
    disabled={
      submitted ||
      submitting ||
      timeLeft <= 0 ||
      result !== null
    }
    onPress={() =>
      handleAnswer(choice)
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
    Choose the correct country before time runs out.
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
{geographyPhaseComplete && (
  <View style={styles.phaseCompleteCard}>
    <Text style={styles.phaseCompleteTitle}>
      Geography Phase Complete!
    </Text>

    <Text style={styles.phaseCompleteText}>
      All 10 Geography questions are finished.
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
    textAlign: "center",
    color: "#6B7280",
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

  capital: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#6D4AFF",
    marginBottom: 10,
  },

  question: {
    fontSize: 19,
    fontWeight: "600",
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
    marginTop: 24,
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
  marginTop: 24,
  padding: 20,
  borderRadius: 16,
  backgroundColor: "#F3EFFF",
  alignItems: "center",
},

phaseCompleteTitle: {
  fontSize: 22,
  fontWeight: "bold",
  color: "#6D4AFF",
  marginBottom: 8,
},

phaseCompleteText: {
  fontSize: 15,
  color: "#4B5563",
  textAlign: "center",
},
});