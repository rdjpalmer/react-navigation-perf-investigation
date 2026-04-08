import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ApplicationTabs } from "./ApplicationTabs";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={ApplicationTabs} />
    </Stack.Navigator>
  );
}
