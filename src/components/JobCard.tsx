import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Job } from "../types";
import { colors } from "../theme/colors";
import { ms, s, vs } from "../theme/spacing";

type Props = {
  job: Job;
  isApplied?: boolean;
  onPress?: () => void;
};

export function JobCard({ job, isApplied, onPress }: Props) {
  const company = job.companyName ?? job.company;
  const salary =
    typeof job.salary === "number" ? `${job.salary.toLocaleString("tr-TR")}$` : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{job.name ?? job.title}</Text>
          {company ? (
            <Text style={styles.subtitle}>Company: {company}</Text>
          ) : null}
        </View>

        {isApplied ? (
          <View style={styles.badge}>
            <MaterialIcons name="verified" size={ms(16)} color={colors.success} />
            <Text style={styles.badgeText}>Applied</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        {job.location ? (
          <Text style={styles.metaText}>Location: {job.location}</Text>
        ) : null}
        {salary ? <Text style={styles.metaText}>Salary: {salary}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: ms(18),
    padding: s(18),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: vs(14),
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: s(12),
  },
  headerText: {
    flex: 1,
    gap: vs(6),
  },
  title: {
    color: colors.text,
    fontSize: ms(18),
    fontWeight: "700",
  },
  subtitle: {
    color: colors.muted,
    fontSize: ms(14),
    fontWeight: "500",
  },
  metaRow: {
    gap: vs(6),
    marginTop: vs(14),
  },
  metaText: {
    color: colors.primary,
    fontSize: ms(14),
    fontWeight: "600",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(6),
    backgroundColor: "#DCFCE7",
    paddingHorizontal: s(10),
    paddingVertical: vs(8),
    borderRadius: ms(999),
    alignSelf: "flex-start",
  },
  badgeText: {
    color: colors.success,
    fontSize: ms(12),
    fontWeight: "700",
  },
});
