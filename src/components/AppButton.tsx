import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../theme/colors";
import { ms, vs } from "../theme/spacing";

type Props = {
  title: string;
  loading?: boolean;
  variant?: "primary" | "danger" | "secondary";
  onPress: () => void;
};

export function AppButton({ title, loading, variant = "primary", onPress }: Props) {
  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "danger" && styles.danger,
        variant === "secondary" && styles.secondary,
        pressed && styles.pressed,
        loading && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: vs(48),
    backgroundColor: colors.primary,
    borderRadius: ms(8),
    alignItems: "center",
    justifyContent: "center",
  },
  danger: {
    backgroundColor: colors.danger,
  },
  secondary: {
    backgroundColor: colors.text,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: "#FFFFFF",
    fontSize: ms(15),
    fontWeight: "600",
  },
});
