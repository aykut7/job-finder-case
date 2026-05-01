import { useEffect } from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { store } from "../src/store/store";
import { useAppDispatch, useAppSelector } from "../src/store/hooks";
import { restoreSession } from "../src/store/slices/authSlice";
import { restoreAppliedJobs } from "../src/store/slices/jobsSlice";

function AppBootstrap() {
  const dispatch = useAppDispatch();
  const session = useAppSelector(state => state.auth.session);
  const restoring = useAppSelector(state => state.auth.restoring);
  const userKey = session?.user?.id ?? session?.user?.email;

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (!restoring && userKey) {
      dispatch(restoreAppliedJobs());
    }
  }, [dispatch, restoring, userKey]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppBootstrap />
      </SafeAreaProvider>
    </Provider>
  );
}
