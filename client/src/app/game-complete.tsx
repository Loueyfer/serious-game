import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import {
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

export default function GameCompleteScreen() {
  const router = useRouter();

  const {
    roomCode,
    isDraw,
    winnerUserId,
    scores,
  } = useLocalSearchParams<{
    roomCode: string;
    isDraw: string;
    winnerUserId: string;
    scores: string;
  }>();

  let finalScores: PlayerScore[] = [];

  try {
    finalScores = scores
      ? JSON.parse(scores)
      : [];
  } catch (error) {
    console.log(
      "Could not parse final scores:",
      error
    );
  }

  const sortedScores = [
    ...finalScores,
  ].sort(
    (a, b) =>
      b.score - a.score
  );

  const winner =
    finalScores.find(
      (player) =>
        player.userId ===
        winnerUserId
    );

  const matchIsDraw =
    isDraw === "true";

  function handleBackHome() {
    if (roomCode) {
      socket.emit(
        "leave_room",
        roomCode
      );
    }

    router.replace("/home");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Game Complete!
      </Text>

      <Text style={styles.subtitle}>
        All 30 tasks are finished.
      </Text>

      <View style={styles.resultCard}>
        {matchIsDraw ? (
          <>
            <Text style={styles.resultLabel}>
              FINAL RESULT
            </Text>

            <Text style={styles.drawText}>
              It's a Draw!
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.resultLabel}>
              WINNER
            </Text>

            <Text style={styles.winnerName}>
              {winner?.username ??
                "Winner"}
            </Text>
          </>
        )}

        <View style={styles.divider} />

        {sortedScores.map(
          (player, index) => (
            <View
              key={player.userId}
              style={styles.scoreRow}
            >
              <View
                style={
                  styles.playerInfo
                }
              >
                <Text
                  style={
                    styles.position
                  }
                >
                  {matchIsDraw
                    ? "•"
                    : index === 0
                    ? "1."
                    : "2."}
                </Text>

                <Text
                  style={[
                    styles.username,

                    player.userId ===
                      winnerUserId &&
                      !matchIsDraw &&
                      styles.winnerUsername,
                  ]}
                >
                  {player.username}
                </Text>
              </View>

              <Text
                style={[
                  styles.score,

                  player.userId ===
                    winnerUserId &&
                    !matchIsDraw &&
                    styles.winnerScore,
                ]}
              >
                {player.score} pts
              </Text>
            </View>
          )
        )}
      </View>

      <View style={styles.completedCard}>
        <Text style={styles.completedNumber}>
          30 / 30
        </Text>

        <Text style={styles.completedText}>
          Tasks completed
        </Text>
      </View>

      <Text style={styles.roomCode}>
        Room {roomCode}
      </Text>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={handleBackHome}
      >
        <Text style={styles.homeButtonText}>
          Back to Home
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#6D4AFF",
    textAlign: "center",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 28,
  },

  resultCard: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },

  resultLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textAlign: "center",
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  winnerName: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#6D4AFF",
    textAlign: "center",
  },

  drawText: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#6D4AFF",
    textAlign: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 18,
  },

  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },

  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  position: {
    width: 28,
    fontSize: 16,
    fontWeight: "bold",
    color: "#9CA3AF",
  },

  username: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },

  winnerUsername: {
    color: "#6D4AFF",
    fontWeight: "bold",
  },

  score: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#374151",
  },

  winnerScore: {
    color: "#6D4AFF",
  },

  completedCard: {
    alignItems: "center",
    backgroundColor: "#F3EFFF",
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },

  completedNumber: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#6D4AFF",
  },

  completedText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },

  roomCode: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 20,
  },

  homeButton: {
    backgroundColor: "#6D4AFF",
    borderRadius: 12,
    paddingVertical: 16,
  },

  homeButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
  },
});