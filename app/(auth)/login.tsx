import { Link, Redirect } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppButton } from "../../src/components/AppButton";
import { AppInput } from "../../src/components/AppInput";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import { login } from "../../src/store/slices/authSlice";
import { colors } from "../../src/theme/colors";
import { ms, s, vs } from "../../src/theme/spacing";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { session, loading, restoring, error } = useAppSelector((state) => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
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

  const onSubmit = (data: LoginForm) => {
    dispatch(login(data));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <View style={styles.hero}>
        <View style={styles.brandCircle}>
          <Text style={styles.brandText}>ACME</Text>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Sign in to view job listings and apply.
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
          title="Sign In"
          loading={loading}
          onPress={handleSubmit(onSubmit)}
        />
      </View>

      <View style={styles.ctaBlock}>
        <Text style={styles.footerText}>Don&apos;t have an account?</Text>

        <Link href="/(auth)/register" style={styles.registerButton}>
          Sign Up
        </Link>
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
  hero: {
    marginBottom: vs(24),
  },
  brandCircle: {
    width: s(96),
    height: s(96),
    borderRadius: s(48),
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: vs(18),
  },
  brandText: {
    color: colors.primary,
    fontSize: ms(26),
    fontWeight: "800",
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
  ctaBlock: {
    marginTop: vs(20),
    gap: vs(10),
  },
  footerText: {
    textAlign: "center",
    color: colors.muted,
    fontSize: ms(14),
  },
  registerButton: {
    backgroundColor: colors.primary,
    color: "#FFFFFF",
    textAlign: "center",
    paddingVertical: vs(14),
    borderRadius: ms(8),
    fontSize: ms(15),
    fontWeight: "700",
    overflow: "hidden",
  },
});
