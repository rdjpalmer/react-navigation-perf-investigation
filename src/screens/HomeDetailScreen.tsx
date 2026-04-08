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
import { usePhotosQuery } from "../queries/usePhotosQuery";

type Row = { id: string; title: string; subtitle?: string };

export function HomeDetailScreen() {
  useRenderTimer(reportTransition);
  const { data, isFetching, isPending, isError, error, refetch } =
    usePhotosQuery();

  const rows: Row[] = useMemo(() => {
    if (!data?.length) {
      return [];
    }
    return data.slice(0, 80).map((item, index) => {
      const row = item as Record<string, unknown>;
      const id = String(row.id ?? index);
      const title = `Detail · ${String(row.title ?? id)}`;
      const subtitle =
        typeof row.url === "string" ? row.url.slice(0, 48) : undefined;
      return { id, title, subtitle };
    });
  }, [data]);

  const showSpinner = isPending || isFetching;

  return (
    <View style={styles.wrap}>
      <View style={styles.toolbar}>
        <Pressable style={styles.button} onPress={() => void refetch()}>
          <Text style={styles.buttonText}>Refetch</Text>
        </Pressable>
        {showSpinner ? (
          <ActivityIndicator style={styles.spinner} />
        ) : (
          <Text style={styles.status}>
            {isError
              ? (error as Error).message
              : `${rows.length} rows`}
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
