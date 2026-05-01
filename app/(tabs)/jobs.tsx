import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { JobCard } from "../../src/components/JobCard";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import { getJobs } from "../../src/store/slices/jobsSlice";
import { colors } from "../../src/theme/colors";
import { ms, s, vs } from "../../src/theme/spacing";

export default function JobsScreen() {
  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => state.auth.session);
  const { jobs, appliedJobs, loading, loadingMore, error, page, hasNextPage } = useAppSelector(
    (state) => state.jobs
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const sessionToken = session?.accessToken ?? session?.token;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!sessionToken) {
      return;
    }

    dispatch(
      getJobs({
        page: 1,
        searchQuery: debouncedSearch,
        orderField: "createdAt",
        orderDirection: "desc",
      })
    );
  }, [debouncedSearch, dispatch, sessionToken]);

  const handleRefresh = async () => {
    if (!sessionToken) {
      return;
    }

    setRefreshing(true);
    await dispatch(
      getJobs({
        page: 1,
        searchQuery: debouncedSearch,
        orderField: "createdAt",
        orderDirection: "desc",
      })
    );
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!sessionToken || !hasNextPage || loadingMore || loading) {
      return;
    }

    dispatch(
      getJobs({
        page: page + 1,
        searchQuery: debouncedSearch,
        orderField: "createdAt",
        orderDirection: "desc",
      })
    );
  };

  if (loading && jobs.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor={colors.primary}
              onRefresh={handleRefresh}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <View style={styles.titleRow}>
                <View style={styles.titleText}>
                  <Text style={styles.title}>Job Lists</Text>
                  <Text style={styles.subtitle}>
                    Search companies and load jobs page by page.
                  </Text>
                </View>

                <Pressable style={styles.iconButton} onPress={handleRefresh}>
                  <Ionicons name="refresh" size={ms(22)} color={colors.primary} />
                </Pressable>
              </View>

              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={ms(21)} color={colors.muted} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search company"
                  placeholderTextColor={colors.muted}
                  style={styles.search}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Results are loaded gradually as you scroll.
                </Text>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No jobs found</Text>
              <Text style={styles.emptyDescription}>
                Try searching another company.
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={colors.primary} style={styles.footerLoader} />
            ) : null
          }
          renderItem={({ item }) => (
            <JobCard
              job={item}
              isApplied={appliedJobs.some((job) => job.id === item.id)}
              onPress={() => router.push(`/job/${item.id}`)}
            />
          )}
        />
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: s(24),
  },
  loadingText: {
    color: colors.muted,
    fontSize: ms(14),
    fontWeight: "600",
    marginTop: vs(12),
  },
  listContent: {
    padding: s(18),
    paddingBottom: vs(28),
  },
  headerBlock: {
    gap: vs(16),
    marginBottom: vs(16),
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: s(12),
  },
  titleText: {
    flex: 1,
    gap: vs(6),
  },
  title: {
    color: colors.text,
    fontSize: ms(28),
    fontWeight: "800",
  },
  subtitle: {
    color: colors.muted,
    fontSize: ms(14),
    fontWeight: "500",
    lineHeight: ms(20),
  },
  iconButton: {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(21),
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    minHeight: vs(54),
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: ms(14),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: s(14),
  },
  search: {
    flex: 1,
    paddingHorizontal: s(10),
    fontSize: ms(15),
    fontWeight: "600",
    color: colors.text,
  },
  infoBox: {
    backgroundColor: "#DBEAFE",
    borderRadius: ms(14),
    padding: s(14),
  },
  infoText: {
    color: colors.primaryDark,
    fontSize: ms(13),
    fontWeight: "600",
    lineHeight: ms(18),
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: vs(36),
    gap: vs(8),
  },
  emptyTitle: {
    color: colors.text,
    fontSize: ms(17),
    fontWeight: "800",
  },
  emptyDescription: {
    color: colors.muted,
    fontSize: ms(14),
    textAlign: "center",
  },
  error: {
    color: colors.danger,
    fontSize: ms(15),
    textAlign: "center",
    fontWeight: "600",
  },
  footerLoader: {
    paddingVertical: vs(18),
  },
});
