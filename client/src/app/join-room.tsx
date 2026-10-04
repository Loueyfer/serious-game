import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { socket } from "../services/socket";

type JoinRoomResponse =
  | {
      success: true;
      room: {
        code: string;
        players: {
          userId: string;
          username: string;
          socketId: string;
        }[];
      };
    }
  | {
      success: false;
      message: string;
    };

export default function JoinRoomScreen() {
  const [roomCode, setRoomCode] = useState("");
  const [joinedRoomCode, setJoinedRoomCode] =
    useState<string | null>(null);

  const [players, setPlayers] = useState<
    string[]
  >([]);

  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  function handleJoinRoom() {
    setError("");

    const cleanCode =
      roomCode.trim().toUpperCase();

    if (!cleanCode) {
      setError("Please enter a room code.");
      return;
    }

    if (!socket.connected) {
      setError(
        "Not connected to the game server."
      );
      return;
    }

    setJoining(true);

    socket.emit(
      "join_room",
      cleanCode,
      (response: JoinRoomResponse) => {
        setJoining(false);

        if (!response.success) {
          setError(response.message);
          return;
        }

        setJoinedRoomCode(
          response.room.code
        );

        setPlayers(
          response.room.players.map(
            (player) => player.username
          )
        );
      }
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Join Room
      </Text>

      {!joinedRoomCode ? (
        <>
          <Text style={styles.description}>
            Enter the room code shared by your
            opponent.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Room Code"
            placeholderTextColor="#9CA3AF"
            value={roomCode}
            onChangeText={setRoomCode}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
          />

          {error ? (
            <Text style={styles.error}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.button,
              joining &&
                styles.buttonDisabled,
            ]}
            onPress={handleJoinRoom}
            disabled={joining}
          >
            {joining ? (
              <ActivityIndicator
                color="#ffffff"
              />
            ) : (
              <Text style={styles.buttonText}>
                Join Room
              </Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.successTitle}>
            Room Joined!
          </Text>

          <Text style={styles.roomCode}>
            {joinedRoomCode}
          </Text>

          <Text style={styles.playersTitle}>
            Players
          </Text>

          {players.map((player) => (
            <Text
              key={player}
              style={styles.player}
            >
              {player}
            </Text>
          ))}
        </View>
      )}

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
    marginBottom: 30,
  },

  input: {
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 22,
    textAlign: "center",
    letterSpacing: 5,
    color: "#111827",
    marginBottom: 16,
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

  card: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },

  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#16A34A",
    marginBottom: 12,
  },

  roomCode: {
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 5,
    color: "#111827",
    marginBottom: 24,
  },

  playersTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#6D4AFF",
    marginBottom: 10,
  },

  player: {
    fontSize: 17,
    color: "#374151",
    marginBottom: 6,
  },

  backText: {
    color: "#6D4AFF",
    textAlign: "center",
    fontSize: 16,
  },
});