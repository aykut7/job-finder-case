import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getCurrentUserRequest, updateCurrentUserRequest } from "../../src/api/authApi";
import { AppButton } from "../../src/components/AppButton";
import { AppInput } from "../../src/components/AppInput";
import { logoutUser } from "../../src/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import { colors } from "../../src/theme/colors";
import { ms, s, vs } from "../../src/theme/spacing";
import type { User } from "../../src/types";

const defaultProfileImage = "https://images.unsplash.com/photo-1777214734455-c1b53eafb059?q=80&w=2336&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const getProfileImage = (image?: string) => {
  const trimmedImage = image?.trim();

  return trimmedImage?.startsWith("http://") || trimmedImage?.startsWith("https://")
    ? trimmedImage
    : defaultProfileImage;
};

const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 8),
    digits.slice(8, 10),
  ].filter(Boolean);

  return parts.join(" ");
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDateFromValue = (value?: string) => {
  if (!value) {
    return new Date();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const getCalendarDays = (monthDate: Date) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];

  for (let index = 0; index < firstDay; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(day);
  }

  return days;
};

type ProfileFormValues = {
  name: string;
  surname: string;
  phone: string;
  profileImage: string;
  dateOfBirth: string;
  country: string;
  city: string;
  address: string;
};

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const session = useAppSelector(state => state.auth.session);
  const [currentUser, setCurrentUser] = useState<User | null>(session?.user ?? null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(new Date());

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: "",
      surname: "",
      phone: "",
      profileImage: defaultProfileImage,
      dateOfBirth: "",
      country: "",
      city: "",
      address: "",
    },
  });

  const token = session?.accessToken ?? session?.token;
  const tokenType = session?.tokenType ?? "Bearer";

  const showToast = (message: string, tone: "success" | "error") => {
    setToast({ message, tone });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        setErrorMessage("");

        const user = await getCurrentUserRequest(token, tokenType);

        setCurrentUser(user);
        reset({
          name: user.name ?? "",
          surname: user.surname ?? "",
          phone: formatPhoneNumber(user.phone ?? ""),
          profileImage: getProfileImage(user.profileImage),
          dateOfBirth: user.dateOfBirth ?? "",
          country: user.address?.country ?? "",
          city: user.address?.city ?? "",
          address: user.address?.details ?? "",
        });
      } catch {
        showToast("Unable to load profile information", "error");
      } finally {
        setLoadingProfile(false);
      }
    };

    if (token) {
      loadProfile();
    }
  }, [reset, token, tokenType]);

  const profilePreview = getProfileImage(watch("profileImage"));
  const selectedBirthDate = watch("dateOfBirth");
  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const calendarTitle = visibleMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const onSubmit = handleSubmit(async values => {
    try {
      setLoading(true);
      setErrorMessage("");

      const updatedUser = await updateCurrentUserRequest(
        {
          name: values.name,
          surname: values.surname,
          phone: values.phone,
          profileImage: values.profileImage,
          dateOfBirth: values.dateOfBirth,
          address: {
            country: values.country,
            city: values.city,
            details: values.address,
          },
        },
        token,
        tokenType
      );

      setCurrentUser(updatedUser);
      showToast("Profile updated successfully.", "success");
    } catch {
      showToast("Unable to update profile", "error");
    } finally {
      setLoading(false);
    }
  });

  if (loadingProfile) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={["top"]}>
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {toast ? (
          <View
            style={[
              styles.toast,
              toast.tone === "success" ? styles.toastSuccess : styles.toastError,
            ]}
          >
            <Ionicons
              name={toast.tone === "success" ? "checkmark-circle" : "alert-circle"}
              size={ms(20)}
              color="#FFFFFF"
            />
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        ) : null}

        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerText}>
                <Text style={styles.title}>Profile</Text>
                <Text style={styles.subtitle}>
                  View and update your personal information.
                </Text>
              </View>

              <Pressable
                onPress={() => setLogoutModalVisible(true)}
                style={({ pressed }) => [
                  styles.logoutIconButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="log-out-outline" size={ms(24)} color={colors.danger} />
              </Pressable>
            </View>
          </View>

          <View style={styles.profileCard}>
            <Image
              source={{ uri: profilePreview }}
              style={styles.profileImage}
              contentFit="cover"
              onError={() => setValue("profileImage", defaultProfileImage)}
            />
            <Text style={styles.emailLabel}>{currentUser?.email}</Text>
            <Text style={styles.hint}>
              Fill in the fields to keep your profile information up to date.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <Controller
              control={control}
              name="name"
              rules={{ required: "This field is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Name"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="surname"
              rules={{ required: "This field is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Surname"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.surname?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="profileImage"
              rules={{ required: "This field is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Profile Image"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.profileImage?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              rules={{ required: "This field is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Phone"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(formatPhoneNumber(text))}
                  keyboardType="phone-pad"
                  placeholder="507 585 40 33"
                  maxLength={13}
                  error={errors.phone?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="dateOfBirth"
              rules={{ required: "This field is required" }}
              render={({ field: { onBlur, value } }) => (
                <Pressable
                  onPress={() => {
                    setVisibleMonth(getDateFromValue(value));
                    setCalendarVisible(true);
                  }}
                >
                  <View pointerEvents="none">
                    <AppInput
                      label="Date of Birth"
                      value={value}
                      onBlur={onBlur}
                      placeholder="Select from calendar"
                      editable={false}
                      error={errors.dateOfBirth?.message}
                    />
                  </View>
                </Pressable>
              )}
            />

            <Controller
              control={control}
              name="country"
              rules={{ required: "This field is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Country"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.country?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="city"
              rules={{ required: "This field is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="City"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.city?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="address"
              rules={{ required: "This field is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Address"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  multiline
                  style={styles.addressInput}
                  error={errors.address?.message}
                />
              )}
            />

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            <View style={styles.updateButton}>
              <AppButton title="Update" loading={loading} onPress={onSubmit} />
            </View>
          </View>
        </ScrollView>

        <Modal
          transparent
          animationType="fade"
          visible={logoutModalVisible}
          onRequestClose={() => setLogoutModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalIcon}>
                <Ionicons name="log-out-outline" size={ms(28)} color={colors.danger} />
              </View>

              <Text style={styles.modalTitle}>Sign Out</Text>
              <Text style={styles.modalText}>
                Are you sure you want to sign out?
              </Text>

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setLogoutModalVisible(false)}
                  style={({ pressed }) => [
                    styles.modalButton,
                    styles.cancelButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={() => dispatch(logoutUser())}
                  style={({ pressed }) => [
                    styles.modalButton,
                    styles.confirmButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.confirmButtonText}>Sign Out</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          transparent
          animationType="fade"
          visible={calendarVisible}
          onRequestClose={() => setCalendarVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <Pressable
                  onPress={() =>
                    setVisibleMonth(
                      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1)
                    )
                  }
                  style={({ pressed }) => [
                    styles.calendarIconButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="chevron-back" size={ms(22)} color={colors.text} />
                </Pressable>

                <Text style={styles.calendarTitle}>{calendarTitle}</Text>

                <Pressable
                  onPress={() =>
                    setVisibleMonth(
                      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1)
                    )
                  }
                  style={({ pressed }) => [
                    styles.calendarIconButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="chevron-forward" size={ms(22)} color={colors.text} />
                </Pressable>
              </View>

              <View style={styles.weekRow}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <Text key={day} style={styles.weekDay}>
                    {day}
                  </Text>
                ))}
              </View>

              <View style={styles.daysGrid}>
                {calendarDays.map((day, index) => {
                  const dateValue = day
                    ? formatDate(
                        new Date(
                          visibleMonth.getFullYear(),
                          visibleMonth.getMonth(),
                          day
                        )
                      )
                    : "";
                  const isSelected = Boolean(day && dateValue === selectedBirthDate);

                  return (
                    <Pressable
                      key={`${day ?? "empty"}-${index}`}
                      disabled={!day}
                      onPress={() => {
                        setValue("dateOfBirth", dateValue, { shouldValidate: true });
                        setCalendarVisible(false);
                      }}
                      style={({ pressed }) => [
                        styles.dayButton,
                        isSelected && styles.dayButtonSelected,
                        pressed && Boolean(day) && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelected && styles.dayTextSelected,
                        ]}
                      >
                        {day ?? ""}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                onPress={() => setCalendarVisible(false)}
                style={({ pressed }) => [
                  styles.calendarCancelButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: s(18),
    gap: vs(18),
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.muted,
    fontSize: ms(14),
    fontWeight: "600",
    marginTop: vs(12),
  },
  header: {
    gap: vs(16),
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: s(12),
  },
  headerText: {
    flex: 1,
    gap: vs(6),
  },
  title: {
    color: colors.text,
    fontSize: ms(30),
    fontWeight: "800",
  },
  subtitle: {
    color: colors.muted,
    fontSize: ms(15),
    lineHeight: vs(22),
  },
  logoutIconButton: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.75,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: ms(18),
    borderWidth: 1,
    borderColor: colors.border,
    padding: s(18),
    gap: vs(10),
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  profileImage: {
    width: s(132),
    height: s(132),
    borderRadius: s(66),
    backgroundColor: colors.background,

  },
  emailLabel: {
    color: colors.primary,
    fontSize: ms(16),
    fontWeight: "700",
  },
  hint: {
    color: colors.muted,
    fontSize: ms(14),
    lineHeight: vs(20),
    textAlign: "center",
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: ms(18),
    borderWidth: 1,
    borderColor: colors.border,
    padding: s(18),
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: ms(18),
    fontWeight: "700",
    marginBottom: vs(14),
  },
  addressInput: {
    minHeight: vs(92),
    paddingTop: vs(10),
    textAlignVertical: "top",
  },
  error: {
    color: colors.danger,
    fontSize: ms(14),
    fontWeight: "600",
    marginBottom: vs(12),
  },
  success: {
    color: colors.success,
    fontSize: ms(14),
    fontWeight: "700",
    marginBottom: vs(12),
  },
  toast: {
    position: "absolute",
    top: vs(44),
    left: s(18),
    right: s(18),
    zIndex: 10,
    elevation: 10,
    minHeight: vs(52),
    borderRadius: ms(14),
    paddingHorizontal: s(14),
    flexDirection: "row",
    alignItems: "center",
    gap: s(10),
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  toastSuccess: {
    backgroundColor: colors.success,
  },
  toastError: {
    backgroundColor: colors.danger,
  },
  toastText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: ms(14),
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: s(24),
  },
  modalCard: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: ms(18),
    padding: s(20),
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalIcon: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: vs(14),
  },
  modalTitle: {
    color: colors.text,
    fontSize: ms(20),
    fontWeight: "800",
    marginBottom: vs(8),
  },
  modalText: {
    color: colors.muted,
    fontSize: ms(14),
    lineHeight: ms(20),
    textAlign: "center",
    marginBottom: vs(18),
  },
  modalActions: {
    width: "100%",
    flexDirection: "row",
    gap: s(10),
  },
  modalButton: {
    flex: 1,
    height: vs(46),
    borderRadius: ms(10),
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.danger,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: ms(14),
    fontWeight: "700",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: ms(14),
    fontWeight: "700",
  },
  calendarCard: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: ms(18),
    padding: s(18),
    borderWidth: 1,
    borderColor: colors.border,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: vs(16),
  },
  calendarIconButton: {
    width: ms(38),
    height: ms(38),
    borderRadius: ms(19),
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarTitle: {
    color: colors.text,
    fontSize: ms(17),
    fontWeight: "800",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: vs(8),
  },
  weekDay: {
    width: `${100 / 7}%`,
    color: colors.muted,
    fontSize: ms(11),
    fontWeight: "700",
    textAlign: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayButton: {
    width: `${100 / 7}%`,
    height: vs(42),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: ms(12),
    marginBottom: vs(4),
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    color: colors.text,
    fontSize: ms(14),
    fontWeight: "700",
  },
  dayTextSelected: {
    color: "#FFFFFF",
  },
  calendarCancelButton: {
    height: vs(44),
    borderRadius: ms(10),
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: vs(12),
  },
  updateButton: {
    paddingTop: vs(50),
  },
});
