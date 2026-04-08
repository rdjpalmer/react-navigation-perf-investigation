import React from "react";
import { StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootStack } from "./src/navigators/RootStack";
import { AppQueryProvider } from "./src/components/QueryClientProvider";
import { PerfOverlay } from "./src/utils/perf";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppQueryProvider>
        <View style={styles.container}>
          <NavigationContainer>
            <RootStack />
          </NavigationContainer>
          <PerfOverlay />
        </View>
      </AppQueryProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
