# Follow-up: Other Ways to Stress or Replicate the Issue

This document is speculative. It lists additional experiments that might make React Navigation v7 tab or stack transitions easier to reproduce or to compare against the current four-phase app.

## Navigator shape and options

- **Drawer wrapping tabs** — Some reports involve a drawer above tabs; adding `createDrawerNavigator` outside the current `RootStack` could increase inactive-screen work.
- **Material top tabs** — Nesting `@react-navigation/material-top-tabs` inside a stack tab sometimes causes extra mount churn during focus changes.
- **`freezeOnBlur` matrix** — The plan already calls for A/B testing; a dedicated build flag or dev menu to toggle `freezeOnBlur` on root stack, tab navigator, and each child stack without reinstalling would speed comparison.
- **`unmountOnBlur: true`** on tab screens — Forces teardown of tab subtrees; useful to see whether the slowdown is dominated by “staying mounted” vs “mount cost.”

## Data and re-renders

- **Many parallel `useQuery` hooks** — PLAN.md suggests 3–4 extra queries per screen; doing so with overlapping observers could amplify global store updates during transitions.
- **`invalidateQueries` on `tabPress`** — Scheduling invalidation right when the user switches tabs stresses refetch + re-render during the same frame window as the animation.
- **Large in-memory query results** — Keeping full JSONPlaceholder arrays in cache (or synthetic 10k-row payloads) increases serialization cost for the AsyncStorage persister and GC pressure on resume.
- **`notifyOnChangeProps` / selectors** — Conversely, narrowing subscriptions might reduce noise; comparing “default observer” vs optimized selectors isolates TanStack Query’s broadcast behavior.

## React and RN specifics

- **New Architecture on/off** — Issue reports often mention Fabric; building the same commit with the New Architecture disabled (when supported by the toolchain) is a strong A/B axis.
- **Hermes vs JSC** — If still applicable to the Expo/RN version in use, different JS engines change GC and async scheduling.
- **Low-end device or throttled CPU** — Android Go devices or developer “CPU throttling” can turn sub-100ms JS work into visible jank without changing code.

## Lists and layout

- **`FlashList` or `RecyclerListView`** — Replacing `FlatList` tests whether recycling and measure passes interact badly with navigation transitions.
- **Heavy `useMemo` / `useCallback` churn** — Artificially unstable dependencies on list rows force full list rerenders when query data updates mid-transition.

## Navigation API usage

- **`navigation.reset` vs `navigate` for tabs** — Workarounds in the upstream thread claim reset feels instant; wiring a debug control to switch strategies on the same screens would validate that in this repro.
- **Deep linking / state restoration** — Hydrating navigation state from a URL or persisted snapshot on cold start sometimes races with first paint and queries.

## Network behavior

- **Slow or flaky API** — Proxy tools (Charles, mitmproxy) or a local server that delays responses make “switch during in-flight request” deterministic.
- **WebSocket or SSE** — A steady stream of messages updating context or query cache mimics real-time apps that re-render tabs in the background.

## Tooling

- **React Native Performance monitor + Systrace** — Correlating JS FPS with transition start helps confirm whether the bottleneck is JS thread vs native animation.
- **Why Did You Render** — Wrapping screen components to log renders during tab switches can show unexpected renders on inactive routes when `freezeOnBlur` is off.

None of these are required for the minimal repro in Phases 1–4; they are candidates if the baseline still feels “too fast” on your hardware or if you need to match another app’s architecture more closely.
