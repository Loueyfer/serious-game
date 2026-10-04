import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { socket } from "../services/socket";
import { useAuth } from "../context/AuthContext";

type Player = {
  userId: string;
  username: string;
  socketId: string;
  ready: boolean;
};

type Room = {
  code: string;
  ownerId: string;
  players: Player[];
  createdAt: string;
};

type RoomResponse =
  | {
      success: true;
      room: Room;
    }
  | {
      success: false;
      message: string;
    };

export default function LobbyScreen() {
  const { roomCode } =
    useLocalSearchParams<{
      roomCode: string;
    }>();

  const { user } = useAuth();

  const [room, setRoom] =
    useState<Room | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");
  
  const [countdown, setCountdown] =
  useState<number | "GO!" | null>(null);  

  useEffect(() => {
    if (!roomCode) {
      setError("Room code missing.");
      setLoading(false);
      return;
    }

    const handleRoomUpdated = (
      updatedRoom: Room
    ) => {
      setRoom(updatedRoom);
    };

    const handleCountdownTick = (data: {
  value: number;
}) => {
  setCountdown(data.value);
};

const handleCountdownCancelled = () => {
  setCountdown(null);
};

const handleGameStart = () => {
  setCountdown("GO!");

  console.log("Game start received");
};
    const handleRoomClosed = (data: {
      message: string;
    }) => {
      Alert.alert(
        "Room Closed",
        data.message
      );

      router.replace("/home");
    };
    socket.on(
      "room_updated",
      handleRoomUpdated
    );

    socket.on(
  "countdown_tick",
  handleCountdownTick
);

socket.on(
  "countdown_cancelled",
  handleCountdownCancelled
);

socket.on(
  "game_start",
  handleGameStart
);
    socket.on(
      "room_closed",
      handleRoomClosed
    );
    socket.emit(
      "get_room_state",
      roomCode,
      (response: RoomResponse) => {
        setLoading(false);

        if (!response.success) {
          setError(response.message);
          return;
        }

        setRoom(response.room);
      }
    );

    return () => {
  socket.off(
    "room_updated",
    handleRoomUpdated
  );

  socket.off(
    "countdown_tick",
    handleCountdownTick
  );

  socket.off(
    "countdown_cancelled",
    handleCountdownCancelled
  );

  socket.off(
    "game_start",
    handleGameStart
  );
};
    socket.off(
      "room_closed",
      handleRoomClosed
    );
  }, [roomCode]);

  function handleReady() {
    if (!room || !user) {
      return;
    }

    const currentPlayer =
      room.players.find(
        (player) =>
          player.userId === user.id
      );

    if (!currentPlayer) {
      return;
    }

    socket.emit(
      "set_ready",
      room.code,
      !currentPlayer.ready,
      (response: RoomResponse) => {
        if (!response.success) {
          setError(response.message);
        }
      }
    );
  }
  function handleLeaveLobby() {
    if (!room) {
      router.replace("/home");
      return;
    }

    if (!socket.connected) {
      router.replace("/home");
      return;
    }

    socket.emit(
      "leave_room",
      room.code,
      (
        response:
          | { success: true }
          | {
              success: false;
              message: string;
            }
      ) => {
        if (!response.success) {
          setError(response.message);
          return;
        }

        router.replace("/home");
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

  if (!room) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error || "Room not found"}
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

  const currentPlayer =
    room.players.find(
      (player) =>
        player.userId === user?.id
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Game Lobby
      </Text>

      <Text style={styles.roomLabel}>
        Room Code
      </Text>

      <Text style={styles.roomCode}>
        {room.code}
      </Text>

      <View style={styles.playersCard}>
        <Text style={styles.playersTitle}>
          Players
        </Text>

        {room.players.map((player) => (
          <View
            key={player.userId}
            style={styles.playerRow}
          >
            <Text style={styles.playerName}>
              {player.username}
            </Text>

            <Text
              style={
                player.ready
                  ? styles.ready
                  : styles.notReady
              }
            >
              {player.ready
                ? "Ready"
                : "Not Ready"}
            </Text>
          </View>
        ))}

        {room.players.length < 2 && (
          <Text style={styles.waiting}>
            Waiting for Player B...
          </Text>
        )}
      </View>

      {error ? (
        <Text style={styles.error}>
          {error}
        </Text>
      ) : null}
      {countdown !== null && (
  <View style={styles.countdownContainer}>
    <Text style={styles.countdownText}>
      {countdown}
    </Text>
  </View>
)}
      <TouchableOpacity
        style={[
          styles.readyButton,
          currentPlayer?.ready &&
            styles.notReadyButton,
        ]}
        onPress={handleReady}
      >
        <Text style={styles.readyButtonText}>
          {currentPlayer?.ready
            ? "Not Ready"
            : "I'm Ready"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
  onPress={handleLeaveLobby}
>
  <Text style={styles.backText}>
    Leave Lobby
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
    marginBottom: 25,
  },

  roomLabel: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },

  roomCode: {
    fontSize: 34,
    fontWeight: "bold",
    letterSpacing: 6,
    textAlign: "center",
    color: "#6D4AFF",
    marginBottom: 30,
  },

  playersCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
  },

  playersTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#111827",
  },

  playerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  playerName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#374151",
  },

  ready: {
    color: "#16A34A",
    fontWeight: "bold",
  },

  notReady: {
    color: "#DC2626",
    fontWeight: "bold",
  },

  waiting: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 10,
  },

  readyButton: {
    backgroundColor: "#6D4AFF",
    padding: 17,
    borderRadius: 12,
    marginBottom: 18,
  },

  notReadyButton: {
    backgroundColor: "#6B7280",
  },

  readyButtonText: {
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

  error: {
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 16,
  },
  countdownContainer: {
  alignItems: "center",
  marginBottom: 20,
},

countdownText: {
  fontSize: 54,
  fontWeight: "bold",
  color: "#6D4AFF",
},
});