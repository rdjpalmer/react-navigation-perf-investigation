# React Navigation v7 Performance Investigation

## Context

ZenMaid Mobile has performance issues when switching tabs and navigating screens. The app uses React Navigation v7 with a `NativeStack > BottomTabs > NativeStack` nesting pattern, React Query v5 with persistence, and ~19 context providers. This matches the exact pattern reported in [react-navigation#12651](https://github.com/react-navigation/react-navigation/issues/12651), where v7 transitions take 1-2 seconds vs instant in v6.

**Goal:** Create a minimal reproduction that isolates which factor(s) cause the slowdown, adding complexity incrementally across 4 phases.

### Production versions (pinned to match)

| Package | Version |
|---|---|
| expo | ^55.0.0 |
| react | 19.2.0 |
| react-native | 0.83.2 |
| @react-navigation/native | 7.1.33 |
| @react-navigation/native-stack | 7.14.5 |
| @react-navigation/bottom-tabs | 7.15.5 |
| react-native-screens | 4.23.0 |
| react-native-safe-area-context | 5.6.2 |
| @tanstack/react-query | 5.90.21 (Phase 4) |

---

## Progress

- [x] **Phase 1** — Bare bottom tabs (tag: `phase-1`)
- [x] **Phase 2** — Add large network requests
- [x] **Phase 3** — Nested NativeStack > BottomTabs > NativeStack
- [x] **Phase 4** — React Query with persistence

---

## Phase 1: Bare Bottom Tabs + Two Screens ✅

Establishes the performance baseline.

### What was built
- `src/navigators/ApplicationTabs.tsx` — `createBottomTabNavigator()`, two tabs (Home, Settings)
- `src/screens/HomeScreen.tsx` / `SettingsScreen.tsx` — each renders a `FlatList` of 100 static items
- `src/utils/perf.ts` — `useRenderTimer` hook + `PerfOverlay` component (measures tab-switch time, displays as overlay with green/yellow/red color coding)
- `App.tsx` — `NavigationContainer` > `ApplicationTabs` + `PerfOverlay`

### Key details
- `freezeOnBlur` is NOT set (testing default behavior)
- `tabPress` listener on the navigator captures start time; `useRenderTimer` in each screen captures end time

### Test
- Switch tabs 20+ times, record transition times
- Expected: <50ms consistently (this is the baseline)

---

## Phase 2: Add Large Network Requests

Tests whether active HTTP requests during tab switch cause stuttering.

### Changes
- Add `src/hooks/useLargeDataFetch.ts` — custom hook using `fetch()`, re-fetches every 5 seconds, does NOT cancel on unmount
- Modify both screens to use the hook and render fetched data in FlatList

### API endpoints
- Home: `https://jsonplaceholder.typicode.com/photos` (5000 items)
- Settings: `https://jsonplaceholder.typicode.com/comments` (500 items)

### Test protocol
1. Switch tabs normally (idle) — measure
2. Tap "Refetch", immediately switch tabs before response arrives — measure
3. Let polling run, switch tabs repeatedly — measure
4. Compare with/without `freezeOnBlur: true`

### Success = transitions measurably slower during active requests

---

## Phase 3: Nested NativeStack > BottomTabs > NativeStack

Reproduces the exact navigator nesting from the production app.

### Changes
- Add `src/navigators/RootStack.tsx` — `createNativeStackNavigator()` wrapping ApplicationTabs
- Add `src/navigators/HomeStack.tsx` / `SettingsStack.tsx` — each a `createNativeStackNavigator()` containing root + detail screen
- Add `src/screens/HomeDetailScreen.tsx` / `SettingsDetailScreen.tsx` — pushable detail screens that also fetch data

### Target architecture
```
RootStack (NativeStack)
  └─ ApplicationTabs (BottomTabs)
       ├─ HomeStack (NativeStack) → HomeScreen, HomeDetailScreen
       └─ SettingsStack (NativeStack) → SettingsScreen, SettingsDetailScreen
```

### Test protocol
1. Navigate Home > HomeDetail, then switch tabs — measure
2. Push 2-3 screens deep, trigger fetch, switch tabs — measure
3. A/B `freezeOnBlur`: off everywhere / on tabs only / on everything

### Success = nested stacks measurably worse than flat tabs (Phase 2)

---

## Phase 4: React Query with Persistence

Tests whether React Query's re-rendering patterns worsen the issue.

### Additional dependencies
```bash
npx expo install @tanstack/react-query@5.90.21 @tanstack/react-query-persist-client@5.90.21
npx expo install @react-native-async-storage/async-storage
```

### Changes
- Add `src/queries/queryClient.ts` — mirrors production config (`networkMode: 'always'`, `retry: 3`, `refetchOnWindowFocus: true`, `refetchOnMount: false`)
- Add `src/queries/usePhotosQuery.ts` / `useCommentsQuery.ts` — `useQuery()` with `refetchInterval: 5000`, `staleTime: 0`
- Add `src/components/QueryClientProvider.tsx` — `PersistQueryClientProvider` with AsyncStorage persister
- Remove `src/hooks/useLargeDataFetch.ts`, update screens to use query hooks

### Test protocol
1. Same tests as Phase 3, but with React Query
2. With/without `PersistQueryClientProvider`
3. Kill + relaunch app, measure transitions during cache hydration
4. Add 3-4 extra `useQuery` calls per screen
5. Call `queryClient.invalidateQueries()` right before switching tabs

### Success = React Query re-rendering worsens transitions vs raw fetch

---

## How to Determine if the Issue is Reproduced

The issue is reproduced when:
1. Tab transitions > 300ms (vs ~50ms baseline)
2. Visible stuttering/frame drops during animation
3. Worse with nested stacks (Phase 3) than flat tabs (Phase 2)
4. Active network requests exacerbate the problem
5. `freezeOnBlur: true` meaningfully improves times

If 1-3 are met, we have a solid minimal reproduction for the GitHub issue.

## Git Strategy

Each phase is a separate commit + git tag. Use `git checkout phase-N` to compare any two phases directly.
