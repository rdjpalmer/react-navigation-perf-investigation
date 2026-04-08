import { useQuery } from "@tanstack/react-query";

const PHOTOS_URL = "https://jsonplaceholder.typicode.com/photos";

async function fetchPhotos(): Promise<unknown[]> {
  const res = await fetch(PHOTOS_URL);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const json: unknown = await res.json();
  return Array.isArray(json) ? json : [];
}

export function usePhotosQuery() {
  return useQuery({
    queryKey: ["photos"],
    queryFn: fetchPhotos,
    staleTime: 0,
    refetchInterval: 5000,
  });
}
