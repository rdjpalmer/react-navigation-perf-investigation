import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeStack } from "./HomeStack";
import { SettingsStack } from "./SettingsStack";

const Tabs = createBottomTabNavigator();

export function ApplicationTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{ headerShown: false }}
      screenListeners={{
        tabPress: () => {
          global.__PERF_TAB_PRESS_START = performance.now();
        },
      }}
    >
      <Tabs.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: "Home" }}
      />
      <Tabs.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{ title: "Settings" }}
      />
    </Tabs.Navigator>
  );
}
