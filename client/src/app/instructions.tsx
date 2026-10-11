import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function InstructionsScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>
        Game Instructions
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Game Goal
        </Text>

        <Text style={styles.text}>
          This is a competitive 1v1 learning game.
          Both players receive the same tasks at the
          same time.
        </Text>

        <Text style={styles.text}>
          Try to answer faster and more accurately
          than your opponent.
        </Text>

        <Text style={styles.text}>
          The game contains 30 tasks across
          three different phases.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Game Flow
        </Text>

        <Text style={styles.text}>
          • Create or join a private room
        </Text>

        <Text style={styles.text}>
          • Both players press Ready
        </Text>

        <Text style={styles.text}>
          • The game starts after the
          synchronized 3-2-1 countdown
        </Text>

        <Text style={styles.text}>
          • Math → Geography → Stroop
        </Text>

        <Text style={styles.text}>
          • Final scores and winner are shown
          after all 30 tasks
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          1. Math Quiz
        </Text>

        <Text style={styles.text}>
          • 10 questions
        </Text>

        <Text style={styles.text}>
          • Addition, subtraction and multiplication
        </Text>

        <Text style={styles.text}>
          • 3 answer choices
        </Text>

        <Text style={styles.text}>
          • Only one answer is correct
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          2. Geography Quiz
        </Text>

        <Text style={styles.text}>
          • 10 questions
        </Text>

        <Text style={styles.text}>
          • Each question shows a capital city
        </Text>

        <Text style={styles.text}>
          • Choose the country that matches
          the capital
        </Text>

        <Text style={styles.text}>
          • 3 answer choices
        </Text>

        <Text style={styles.text}>
          • Only one answer is correct
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          3. Stroop Challenge
        </Text>

        <Text style={styles.text}>
          • 10 color-word tasks
        </Text>

        <Text style={styles.text}>
          • A color word is displayed in a color
        </Text>

        <Text style={styles.text}>
          • Tap Correct if the word matches
          its displayed color
        </Text>

        <Text style={styles.text}>
          • Tap Incorrect if the word and
          displayed color do not match
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Time Limit
        </Text>

        <Text style={styles.text}>
          Each task has a maximum response time
          of 5 seconds.
        </Text>

        <Text style={styles.text}>
          No answer within 5 seconds counts as
          a timeout.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Scoring
        </Text>

        <Text style={styles.text}>
          🏆 Fastest correct answer: +10 points
        </Text>

        <Text style={styles.text}>
          ✅ Other correct answer: +5 points
        </Text>

        <Text style={styles.text}>
          ❌ Wrong answer: -2 points
        </Text>

        <Text style={styles.text}>
          ⏱ No answer / timeout: 0 points
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>
          Back
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 50,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
    marginBottom: 30,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#6D4AFF",
    marginBottom: 10,
  },

  text: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 6,
  },

  button: {
    backgroundColor: "#6D4AFF",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },

  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});