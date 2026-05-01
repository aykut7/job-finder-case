import { Redirect } from "expo-router";

import { useAppSelector } from "../src/store/hooks";

export default function IndexScreen() {
  const session = useAppSelector(state => state.auth.session);
  const restoring = useAppSelector(state => state.auth.restoring);

  if (restoring) {
    return null;
  }

  if (session) {
    return <Redirect href="/(tabs)/jobs" />;
  }

  return <Redirect href="/(auth)/login" />;
}
