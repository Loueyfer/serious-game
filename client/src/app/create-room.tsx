import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { socket } from "../services/socket";

type CreateRoomResponse =
  | {
      success: true;
      room: {
        code: string;
      };
    }
  | {
      success: false;
      message: string;
    };

type PlayerJoinedData = {
  player: {
    userId: string;
    username: string;
    socketId: string;
  };
};

export default function CreateRoomScreen() {
  const [roomCode, setRoomCode] = useState<string | null>(
    null
  );

  const [opponent, setOpponent] = useState<string | null>(
    null
  );

  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");

  // Listen for Player B joining the room
  useEffect(() => {
    const handlePlayerJoined = (
      data: PlayerJoinedData
    ) => {
      console.log(
        "Player joined:",
        data.player.username
      );

      setOpponent(data.player.username);
    };

    socket.on(
      "player_joined",
      handlePlayerJoined
    );

    return () => {
      socket.off(
        "player_joined",
        handlePlayerJoined
      );
    };
  }, []);

  function handleCreateRoom() {
    setError("");

    // Reset opponent if a new room is created
    setOpponent(null);

    if (!socket.connected) {
      setError(
        "Not connected to the game server."
      );
      return;
    }

    setCreating(true);

    socket.emit(
      "create_room",
      (response: CreateRoomResponse) => {
        setCreating(false);

        if (!response.success) {
          setError(response.message);
          return;
        }

        setRoomCode(response.room.code);
      }
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Create Room
      </Text>

      <Text style={styles.description}>
        Create a private room and share the room
        code with your opponent.
      </Text>

      <View style={styles.card}>
        {!roomCode ? (
          <>
            <Text style={styles.cardTitle}>
              Your room code
            </Text>

            <Text style={styles.cardText}>
              Create a room to generate your
              private game code.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.cardTitle}>
              Your room code
            </Text>

            <Text style={styles.roomCode}>
              {roomCode}
            </Text>

            {opponent ? (
              <>
                <Text style={styles.connectedText}>
                  Player connected!
                </Text>

                <Text style={styles.opponentText}>
                  {opponent}
                </Text>
              </>
            ) : (
              <Text style={styles.cardText}>
                Waiting for Player B...
              </Text>
            )}
          </>
        )}
      </View>

      {error ? (
        <Text style={styles.error}>
          {error}
        </Text>
      ) : null}

      <TouchableOpacity
        style={[
          styles.button,
          creating && styles.buttonDisabled,
        ]}
        onPress={handleCreateRoom}
        disabled={creating}
      >
        {creating ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>
            {roomCode
              ? "Create New Room"
              : "Create Room"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>
          Back
        </Text>
      </TouchableOpacity>
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

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
    marginBottom: 12,
  },

  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
    lineHeight: 23,
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 24,
    marginBottom: 22,
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6D4AFF",
    marginBottom: 12,
  },

  roomCode: {
    fontSize: 36,
    fontWeight: "bold",
    letterSpacing: 6,
    color: "#111827",
    marginBottom: 12,
  },

  cardText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    textAlign: "center",
  },

  connectedText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#16A34A",
    marginTop: 8,
  },

  opponentText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 6,
  },

  error: {
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 16,
  },

  button: {
    backgroundColor: "#6D4AFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },

  backText: {
    color: "#6D4AFF",
    textAlign: "center",
    fontSize: 16,
  },
});