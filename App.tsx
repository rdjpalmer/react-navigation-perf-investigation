import React from "react";
import { StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ApplicationTabs } from "./src/navigators/ApplicationTabs";
import { PerfOverlay } from "./src/utils/perf";

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <NavigationContainer>
          <ApplicationTabs />
        </NavigationContainer>
        <PerfOverlay />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
