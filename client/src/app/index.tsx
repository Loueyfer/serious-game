import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

const API_URL = "http://192.168.0.26:3000";

export default function HomeScreen() {
  const [message, setMessage] = useState("Connecting...");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`);

        if (!response.ok) {
          throw new Error("Backend returned an error");
        }

        const data = await response.json();

        setMessage(data.message);
        setConnected(true);
      } catch (error) {
        console.error(error);
        setMessage("Could not connect to backend");
        setConnected(false);
      }
    };

    checkBackend();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Serious Game</Text>

      <ActivityIndicator
        size="large"
        animating={message === "Connecting..."}
      />

      <Text style={styles.status}>
        {connected ? "✅ Connected" : "❌ Not connected"}
      </Text>

      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#111827",
  },

  status: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    color: "#111827",
  },

  message: {
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
    color: "#111827",
  },
});