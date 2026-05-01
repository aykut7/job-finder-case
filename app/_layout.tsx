import { useEffect } from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { store } from "../src/store/store";
import { useAppDispatch } from "../src/store/hooks";
import { restoreSession } from "../src/store/slices/authSlice";
import { restoreAppliedJobs } from "../src/store/slices/jobsSlice";

function AppBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreSession());
    dispatch(restoreAppliedJobs());
  }, [dispatch]);

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
