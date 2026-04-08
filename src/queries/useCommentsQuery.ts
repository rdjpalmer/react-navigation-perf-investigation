import { useQuery } from "@tanstack/react-query";

const COMMENTS_URL = "https://jsonplaceholder.typicode.com/comments";

async function fetchComments(): Promise<unknown[]> {
  const res = await fetch(COMMENTS_URL);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const json: unknown = await res.json();
  return Array.isArray(json) ? json : [];
}

export function useCommentsQuery() {
  return useQuery({
    queryKey: ["comments"],
    queryFn: fetchComments,
    staleTime: 0,
    refetchInterval: 5000,
  });
}
