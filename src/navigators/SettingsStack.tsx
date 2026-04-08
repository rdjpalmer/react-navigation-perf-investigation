import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SettingsScreen } from "../screens/SettingsScreen";
import { SettingsDetailScreen } from "../screens/SettingsDetailScreen";
import type { SettingsStackParamList } from "./types";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="SettingsDetail" component={SettingsDetailScreen} />
    </Stack.Navigator>
  );
}
