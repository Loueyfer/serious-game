import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <LinearGradient
    colors={["#D3C4FF", "#ECE6FF", "#FFFFFF"]}
    style={styles.background}
  >
    <View style={styles.container}>
      <Text style={styles.title}>Let's Compete!</Text>

      <Text style={styles.welcome}>
        Welcome, {user?.username}!
      </Text>

      <Text style={styles.subtitle}>
        Choose what you want to do
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

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "transparent",
  },
  background: {
  flex: 1,
},
  title: {
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
    marginBottom: 8,
  },

  welcome: {
    fontSize: 19,
    fontWeight: "600",
    textAlign: "center",
    color: "#6D4AFF",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 35,
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

  logoutButton: {
    marginTop: 18,
    padding: 12,
  },

  logoutText: {
    color: "#DC2626",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});