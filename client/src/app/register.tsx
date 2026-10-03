import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <Text style={styles.text}>
        Registration form will be implemented here.
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/login")}
      >
        <Text style={styles.link}>
          Already have an account? Login
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
    marginBottom: 20,
    color: "#111827",
  },

  text: {
    fontSize: 16,
    marginBottom: 24,
    color: "#6B7280",
  },

  link: {
    textAlign: "center",
    color: "#6D4AFF",
  },
});