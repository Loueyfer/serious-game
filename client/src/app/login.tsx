import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <Text style={styles.text}>
        Login form will be implemented here.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/home")}
      >
        <Text style={styles.buttonText}>
          Temporary Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/register")}
      >
        <Text style={styles.link}>
          Create an account
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

  button: {
    backgroundColor: "#6D4AFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },

  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "bold",
  },

  link: {
    textAlign: "center",
    color: "#6D4AFF",
  },
});