import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/HomeScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

const Tabs = createBottomTabNavigator();

export function ApplicationTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{ headerShown: true }}
      screenListeners={{
        tabPress: () => {
          global.__PERF_TAB_PRESS_START = performance.now();
        },
      }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Settings" component={SettingsScreen} />
    </Tabs.Navigator>
  );
}
