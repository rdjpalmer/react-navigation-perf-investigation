import React from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import { useRenderTimer, reportTransition } from "../utils/perf";

const DATA = Array.from({ length: 100 }, (_, i) => ({
  id: String(i),
  title: `Settings Item ${i + 1}`,
}));

export function SettingsScreen() {
  useRenderTimer(reportTransition);

  return (
    <FlatList
      data={DATA}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.text}>{item.title}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  text: {
    fontSize: 16,
  },
});
