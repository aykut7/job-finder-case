import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "../../src/components/AppButton";
import {
  applyJobAndSave,
  withdrawJobAndSave,
} from "../../src/store/slices/jobsSlice";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import { colors } from "../../src/theme/colors";
import { ms, s, vs } from "../../src/theme/spacing";

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const job = useAppSelector(state =>
    state.jobs.jobs.find(item => item.id === id) ??
    state.jobs.appliedJobs.find(item => item.id === id)
  );
  const isApplied = useAppSelector(state =>
    state.jobs.appliedJobs.some(item => item.id === id)
  );

  if (!job) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={["top"]}>
          <View style={styles.center}>
            <Text>Job not found</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const company = job.companyName ?? job.company;
  const salary =
    typeof job.salary === "number" ? `${job.salary.toLocaleString("tr-TR")}$` : null;
  const createdAt = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString("tr-TR")
    : null;

  const handleApply = () => {
    if (isApplied) {
      dispatch(withdrawJobAndSave(job.id));
      return;
    }

    dispatch(applyJobAndSave(job));
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={ms(26)} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>{job.name ?? job.title}</Text>

            {company ? <Text style={styles.company}>{company}</Text> : null}

            <View style={styles.metaBox}>
              {job.location ? (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Location</Text>
                  <Text style={styles.metaValue}>{job.location}</Text>
                </View>
              ) : null}

              {salary ? (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Salary</Text>
                  <Text style={styles.metaValue}>{salary}</Text>
                </View>
              ) : null}

              {createdAt ? (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Published Date</Text>
                  <Text style={styles.metaValue}>{createdAt}</Text>
                </View>
              ) : null}
            </View>

            {job.keywords?.length ? (
              <View style={styles.keywords}>
                {job.keywords.map((keyword) => (
                  <View key={keyword} style={styles.keyword}>
                    <Text style={styles.keywordText}>{keyword}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <Text style={styles.description}>
              {job.description || "No description is available for this job."}
            </Text>

            <AppButton
              title={isApplied ? "Withdraw" : "Apply"}
              variant={isApplied ? "danger" : "primary"}
              onPress={handleApply}
            />
          </View>
        </ScrollView>
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
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: s(16),
    paddingTop: vs(8),
    paddingBottom: vs(4),
  },
  backButton: {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(21),
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.75,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: s(16),
  },
  card: {
    backgroundColor: colors.card,
    padding: s(18),
    borderRadius: ms(18),
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: ms(24),
    fontWeight: "800",
    color: colors.text,
    marginBottom: vs(8),
  },
  company: {
    color: colors.muted,
    fontSize: ms(15),
    fontWeight: "600",
    marginBottom: vs(18),
  },
  metaBox: {
    gap: vs(10),
    marginBottom: vs(16),
  },
  metaItem: {
    backgroundColor: colors.background,
    borderRadius: ms(12),
    padding: s(12),
  },
  metaLabel: {
    color: colors.muted,
    fontSize: ms(12),
    fontWeight: "700",
    marginBottom: vs(4),
  },
  metaValue: {
    color: colors.primary,
    fontSize: ms(14),
    fontWeight: "700",
  },
  keywords: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s(8),
    marginBottom: vs(16),
  },
  keyword: {
    backgroundColor: "#DBEAFE",
    borderRadius: ms(999),
    paddingHorizontal: s(10),
    paddingVertical: vs(7),
  },
  keywordText: {
    color: colors.primaryDark,
    fontSize: ms(12),
    fontWeight: "700",
  },
  description: {
    color: colors.text,
    marginBottom: vs(20),
    lineHeight: ms(22),
  },
});
