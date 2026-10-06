import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { socket } from "../services/socket";

type Question = {
  id: string;
  prompt: string;
  choices: number[];
  startedAt: number;
  deadlineAt: number;
  serverNow: number;
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

        setQuestion(response.question);

        const remainingMs =
          response.question.deadlineAt -
          response.question.serverNow;

        setTimeLeft(
          Math.max(
            0,
            Math.ceil(remainingMs / 1000)
          )
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
    <View style={styles.container}>
      <Text style={styles.phaseTitle}>
        Math Challenge
      </Text>

      <Text style={styles.timer}>
        Time: {timeLeft}s
      </Text>

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
    <Text style={styles.resultTitle}>
      Question Result
    </Text>

    <Text style={styles.correctAnswer}>
      Correct answer:{" "}
      {result.correctAnswer}
    </Text>

    {result.results.map(
      (playerResult) => (
        <View
          key={playerResult.userId}
          style={styles.resultRow}
        >
          <View>
            <Text
              style={styles.resultUsername}
            >
              {playerResult.username}
            </Text>

            <Text style={styles.resultDetail}>
              {playerResult.timedOut
                ? "Timeout"
                : playerResult.correct
                ? "Correct"
                : "Wrong"}
            </Text>

            {playerResult.responseTimeMs !==
              null && (
              <Text
                style={styles.resultDetail}
              >
                {(
                  playerResult.responseTimeMs /
                  1000
                ).toFixed(2)}
                s
              </Text>
            )}
          </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#ffffff",
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
    marginBottom: 14,
  },

  timer: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#DC2626",
    marginBottom: 25,
  },

  questionCard: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 28,
    marginBottom: 30,
  },

  question: {
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
  },

  answersContainer: {
    gap: 14,
  },

  answerButton: {
    backgroundColor: "#6D4AFF",
    padding: 18,
    borderRadius: 12,
  },

  answerText: {
    color: "#ffffff",
    fontSize: 20,
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
    marginBottom: 20,
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
  marginTop: 24,
},
resultCard: {
  marginTop: 24,
  padding: 20,
  borderWidth: 1,
  borderColor: "#E5E7EB",
  borderRadius: 16,
  backgroundColor: "#F9FAFB",
},

resultTitle: {
  fontSize: 21,
  fontWeight: "bold",
  color: "#111827",
  textAlign: "center",
  marginBottom: 10,
},

correctAnswer: {
  fontSize: 17,
  fontWeight: "bold",
  color: "#16A34A",
  textAlign: "center",
  marginBottom: 18,
},

resultRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 12,
  borderTopWidth: 1,
  borderTopColor: "#E5E7EB",
},

resultUsername: {
  fontSize: 17,
  fontWeight: "bold",
  color: "#111827",
},

resultDetail: {
  fontSize: 14,
  color: "#6B7280",
  marginTop: 3,
},

points: {
  fontSize: 22,
  fontWeight: "bold",
  color: "#6D4AFF",
},
});