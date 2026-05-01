import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAppSelector } from "../../src/store/hooks";
import { colors } from "../../src/theme/colors";

export default function TabLayout() {
  const session = useAppSelector(state => state.auth.session);
  const restoring = useAppSelector(state => state.auth.restoring);

  if (restoring) {
    return null;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,

        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === "jobs") {
            iconName = "briefcase-outline";
          } else if (route.name === "applied") {
            iconName = "checkmark-done-outline";
          } else if (route.name === "profile") {
            iconName = "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="jobs"
        options={{ title: "Job Listings" }}
      />

      <Tabs.Screen
        name="applied"
        options={{ title: "Applied Jobs" }}
      />

      <Tabs.Screen
        name="profile"
        options={{ title: "Profile" }}
      />
    </Tabs>
  );
}
