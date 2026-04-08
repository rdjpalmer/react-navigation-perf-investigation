import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRenderTimer, reportTransition } from "../utils/perf";
import { usePhotosQuery } from "../queries/usePhotosQuery";
import type { HomeStackParamList } from "../navigators/types";

type Row = { id: string; title: string; subtitle?: string };

type HomeNav = NativeStackNavigationProp<HomeStackParamList, "Home">;

export function HomeScreen() {
  useRenderTimer(reportTransition);
  const navigation = useNavigation<HomeNav>();
  const { data, isFetching, isPending, isError, error, refetch } =
    usePhotosQuery();

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

  const showSpinner = isPending || isFetching;

  return (
    <View style={styles.wrap}>
      <View style={styles.toolbar}>
        <Pressable
          style={styles.secondary}
          onPress={() => navigation.navigate("HomeDetail")}
        >
          <Text style={styles.secondaryText}>Detail</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => void refetch()}>
          <Text style={styles.buttonText}>Refetch</Text>
        </Pressable>
        {showSpinner ? (
          <ActivityIndicator style={styles.spinner} />
        ) : (
          <Text style={styles.status}>
            {isError
              ? (error as Error).message
              : `${rows.length} rows (first 100)`}
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
  secondary: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  secondaryText: { color: "#2196F3", fontWeight: "600" },
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
