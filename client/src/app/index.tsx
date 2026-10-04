import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Battle of Minds</Text>

      <Text style={styles.subtitle}>
        Competitive 1v1 Learning Game
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.primaryButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/register")}
      >
        <Text style={styles.secondaryButtonText}>
          Create Account
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
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#111827",
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: "#6B7280",
  },

  primaryButton: {
    backgroundColor: "#6D4AFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
  },

  primaryButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },

  secondaryButton: {
    borderWidth: 2,
    borderColor: "#6D4AFF",
    padding: 14,
    borderRadius: 12,
  },

  secondaryButtonText: {
    color: "#6D4AFF",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});
