import { Link, Redirect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppButton } from "../../src/components/AppButton";
import { AppInput } from "../../src/components/AppInput";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import { register } from "../../src/store/slices/authSlice";
import { colors } from "../../src/theme/colors";
import { ms, s, vs } from "../../src/theme/spacing";

type RegisterForm = {
  email: string;
  password: string;
};

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const { session, loading, restoring, error } = useAppSelector((state) => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (restoring) {
    return null;
  }

  if (session) {
    return <Redirect href="/(tabs)/jobs" />;
  }

  const onSubmit = (data: RegisterForm) => {
    dispatch(register(data));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={ms(24)} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>
          Create an account quickly to apply for jobs.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Controller
          control={control}
          name="email"
          rules={{
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Enter a valid email",
            },
          }}
          render={({ field: { value, onChange, onBlur } }) => (
            <AppInput
              label="Email"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          }}
          render={({ field: { value, onChange, onBlur } }) => (
            <AppInput
              label="Password"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              secureTextEntry
              error={errors.password?.message}
            />
          )}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppButton
          title="Sign Up"
          loading={loading}
          onPress={handleSubmit(onSubmit)}
        />

        <View style={styles.linkRow}>
          <Text style={styles.linkLabel}>Already have an account?</Text>
          <Link href="/(auth)/login" style={styles.linkText}>
            Sign in
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: s(20),
  },
  header: {
    width: "100%",
    marginBottom: vs(10),
  },
  backButton: {
    padding: ms(8),
    alignSelf: "flex-start",
  },
  hero: {
    marginBottom: vs(24),
  },
  title: {
    color: colors.text,
    fontSize: ms(34),
    fontWeight: "800",
  },
  subtitle: {
    color: colors.muted,
    fontSize: ms(16),
    lineHeight: vs(24),
    marginTop: vs(8),
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: ms(14),
    padding: s(18),
    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 4,
  },
  error: {
    color: colors.danger,
    marginBottom: vs(12),
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: ms(6),
    marginTop: vs(18),
  },
  linkLabel: {
    color: colors.muted,
    fontSize: ms(14),
  },
  linkText: {
    color: colors.primary,
    fontSize: ms(14),
    fontWeight: "700",
  },
});
