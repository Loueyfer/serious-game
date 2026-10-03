import { StyleSheet, Text, View } from "react-native";

export default function CreateRoomScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Create Room
      </Text>

      <Text>
        This feature will be implemented in a later phase.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 16,
  },
});