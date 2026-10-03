import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Serious Game</Text>

      <Text style={styles.welcome}>
        Welcome!
      </Text>

      <TouchableOpacity
        style={styles.mainButton}
        onPress={() => router.push("/create-room")}
      >
        <Text style={styles.buttonText}>
          Create Room
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.mainButton}
        onPress={() => router.push("/join-room")}
      >
        <Text style={styles.buttonText}>
          Join Room
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/dashboard")}
      >
        <Text style={styles.secondaryText}>
          Dashboard
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/instructions")}
      >
        <Text style={styles.secondaryText}>
          Instructions
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
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#111827",
  },

  welcome: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 35,
    color: "#6B7280",
  },

  mainButton: {
    backgroundColor: "#6D4AFF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 14,
  },

  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },

  secondaryButton: {
    borderWidth: 2,
    borderColor: "#6D4AFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },

  secondaryText: {
    color: "#6D4AFF",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "bold",
  },
});