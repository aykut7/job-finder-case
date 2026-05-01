import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { colors } from "../theme/colors";
import { s, vs, ms } from "../theme/spacing";

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function AppInput({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, error && styles.inputError, style]}
        {...props}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: vs(14),
  },
  label: {
    color: colors.text,
    marginBottom: vs(6),
    fontSize: ms(14),
    fontWeight: "500",
  },
  input: {
    height: vs(38),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: s(14),
    borderRadius: ms(8),
    fontSize: ms(15),
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    marginTop: vs(5),
    fontSize: ms(12),
  },
});
