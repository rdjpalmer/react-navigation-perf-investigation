import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { useRenderTimer, reportTransition } from "../utils/perf";
import { useLargeDataFetch } from "../hooks/useLargeDataFetch";

const PHOTOS_URL = "https://jsonplaceholder.typicode.com/photos";

type Row = { id: string; title: string; subtitle?: string };

export function HomeScreen() {
  useRenderTimer(reportTransition);
  const { data, loading, error, refetch } = useLargeDataFetch({
    url: PHOTOS_URL,
    intervalMs: 5000,
  });

  const rows: Row[] = useMemo(() => {
    if (!data?.length) {
      return [];
    }
    return data.slice(0, 100).map((item, index) => {
      const row = item as Record<string, unknown>;
      const id = String(row.id ?? index);
      const title = String(row.title ?? `Photo ${id}`);
      const subtitle =
        typeof row.url === "string" ? row.url.slice(0, 48) : undefined;
      return { id, title, subtitle };
    });
  }, [data]);

  return (
    <View style={styles.wrap}>
      <View style={styles.toolbar}>
        <Pressable style={styles.button} onPress={() => void refetch()}>
          <Text style={styles.buttonText}>Refetch</Text>
        </Pressable>
        {loading ? (
          <ActivityIndicator style={styles.spinner} />
        ) : (
          <Text style={styles.status}>
            {error ? error.message : `${rows.length} rows (first 100)`}
          </Text>
        )}
      </View>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.text}>{item.title}</Text>
            {item.subtitle ? (
              <Text style={styles.sub} numberOfLines={1}>
                {item.subtitle}
              </Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  button: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  spinner: { marginLeft: 4 },
  status: { flex: 1, fontSize: 12, color: "#666" },
  row: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  text: { fontSize: 16 },
  sub: { fontSize: 12, color: "#888", marginTop: 4 },
});
