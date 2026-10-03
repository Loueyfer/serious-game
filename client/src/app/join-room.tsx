import { router } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function JoinRoomScreen() {
  const [roomCode, setRoomCode] = useState("");

  const handleJoinRoom = () => {
    const cleanCode = roomCode.trim().toUpperCase();

    if (!cleanCode) {
      return;
    }

    // Socket.IO room joining will be implemented in Phase 5
    console.log("Room code:", cleanCode);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Room</Text>

      <Text style={styles.description}>
        Enter the room code shared by your opponent.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Room Code"
        placeholderTextColor="#9CA3AF"
        value={roomCode}
        onChangeText={setRoomCode}
        autoCapitalize="characters"
        maxLength={10}
      />

      <TouchableOpacity
        style={styles.joinButton}
        onPress={handleJoinRoom}
      >
        <Text style={styles.joinButtonText}>
          Join Room
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
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
    marginBottom: 10,
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
    fontSize: 20,
    textAlign: "center",
    letterSpacing: 3,
    color: "#111827",
    marginBottom: 20,
  },

  joinButton: {
    backgroundColor: "#6D4AFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },

  joinButtonText: {
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