import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet } from "react-native";

type Props = {
  children: ReactNode;
};

export default function ScreenBackground({
  children,
}: Props) {
  return (
    <LinearGradient
      colors={[
        "#F1EDFF",
        "#F8F6FF",
        "#FFFFFF",
      ]}
      style={styles.container}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});