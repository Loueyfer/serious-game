import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Performance Dashboard
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Knowledge Performance
        </Text>

        <Text style={styles.text}>
          Correct and incorrect answers across
          your games will be displayed here.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Speed Performance
        </Text>

        <Text style={styles.text}>
          Your average response time, fastest
          answers and timeouts will be displayed here.
        </Text>
      </View>

      <Text style={styles.notice}>
        Play multiple games to build your
        performance history.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>
          Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 70,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
    marginBottom: 30,
  },

  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    backgroundColor: "#F9FAFB",
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6D4AFF",
    marginBottom: 10,
  },

  text: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 23,
  },

  notice: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 15,
    marginBottom: 25,
  },

  button: {
    backgroundColor: "#6D4AFF",
    padding: 16,
    borderRadius: 12,
  },

  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});