import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { queryClient } from "../queries/queryClient";

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "react-navigation-perf-investigation-rq",
});

type Props = { children: React.ReactNode };

export function AppQueryProvider({ children }: Props) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
