import { router } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { JobCard } from "../../src/components/JobCard";
import { useAppSelector } from "../../src/store/hooks";
import { colors } from "../../src/theme/colors";
import { ms, s } from "../../src/theme/spacing";

export default function AppliedScreen() {
  const appliedJobs = useAppSelector(state => state.jobs.appliedJobs);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.screen}>
          {appliedJobs.length === 0 ? (
            <Text style={styles.empty}>You have not applied to any jobs yet.</Text>
          ) : (
            <FlatList
              data={appliedJobs}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <JobCard
                  job={item}
                  isApplied
                  onPress={() => router.push(`/job/${item.id}`)}
                />
              )}
            />
          )}
        </View>
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
    padding: s(16),
  },
  empty: {
    color: colors.muted,
    fontSize: ms(15),
  },
});
