# Investigation Conversation Log

## Initial Request

> We have an application in zenmaid-mobile/. It has performance issues when changing tabs and navigating to other screens. Likely this issue: https://github.com/react-navigation/react-navigation/issues/12651
>
> I want to create the minimal reproducible case. We're going to approach this in phases:
>
> - Phase 1: Create a new bare react native application, with react navigation. It'll use only the bottom tabs navigator and two tabs.
> - Phase 2: Add a large network request to each, so we can see if that causes the application to slow down when switching tabs.
> - Phase 3 (if needed): Move the tab navigator into a stack navigator and test again.
> - Phase 4 (if needed): Move the network requests to react-query.
> - If Phase 4 doesn't demonstrate the issue, go back to the drawing board.

---

## Research: GitHub Issue #12651

**Reported Problem:** React Navigation v7 introduces severe performance degradation compared to v6. Screen transitions that were previously instant now take 1-2 seconds, with stuttering animations and JS thread FPS drops (sometimes below 10). Users describe a blank placeholder sliding in partway, stalling, then the screen suddenly appearing without animation.

**What Triggers It:**
- Upgrading from React Navigation v6 to v7, especially with bottom tab navigators and nested navigators (e.g., Drawer wrapping Tabs wrapping Stacks)
- Visiting multiple bottom tabs causes inactive screens to remain "active" and re-render on global state changes, blocking navigation
- Active HTTP requests (e.g., fetches inside `useFocusEffect`) further stall transitions
- More pronounced on New Architecture (Fabric) and lower-tier devices, particularly Android, though iOS is also affected

**Affected Versions:** All v7.x releases tested, including `@react-navigation/native-stack` 7.11.0, `@react-navigation/bottom-tabs` 7.4.6, `@react-navigation/native` 7.1.28. Occurs across React Native 0.77 through 0.83, and Expo SDK 53 / Expo Router v5. The issue does not exist in React Navigation v6.

**Known Workarounds:**
1. `freezeOnBlur: true` on bottom tab `screenOptions` — prevents inactive tabs from re-rendering; helps but does not fully resolve it for everyone
2. `animation: 'none'` on stack screens — removes transition animation lag but sacrifices UX
3. Use `navigation.reset()` instead of `navigate()` for tab switching — reportedly instant
4. Use `navigateDeprecated` or patch `pop: true` as default — slight improvement
5. Wrap data fetches in `setTimeout` to delay them during navigation
6. Downgrade to React Navigation v6 — fully resolves the issue but loses v7 features
7. Remove bottom tab navigator entirely and use a custom sticky bottom menu

No official fix from the core team has been announced. The issue remains open with 61 comments and growing.

---

## Research: ZenMaid Mobile Navigation Architecture

### Versions
- `expo`: ^55.0.0
- `react`: 19.2.0
- `react-native`: 0.83.2
- `@react-navigation/native`: ^7.1.33
- `@react-navigation/native-stack`: ^7.14.5
- `@react-navigation/bottom-tabs`: ^7.15.5
- `@tanstack/react-query`: 5.90.21

### Navigation Structure

```
RootStack (NativeStackNavigator)
├─ SignInScreen
├─ RegisterAccountScreen
├─ RegisterAccountSuccessScreen
├─ Onboarding Screens (conditional)
├─ ApplicationTabs (BottomTabNavigator) ← MAIN APPLICATION
│  ├─ TodayStack (NativeStackNavigator)
│  ├─ CalendarStack (NativeStackNavigator)
│  ├─ NotificationStack (NativeStackNavigator)
│  └─ MoreStack (NativeStackNavigator)
├─ InactiveAccountScreen (modal)
├─ SelectPhoneCountryScreen (modal)
├─ SosScreen (formSheet)
└─ DesignSystemStack (dev-only)
```

Key: **Tabs containing Stacks** (not stacks containing tabs). Each tab is a separate stack navigator with its own navigation history. `freezeOnBlur: true` is already set on both bottom tabs AND each child stack's `screenOptions`.

### Context Provider Nesting (~19 layers)

```
GestureHandlerRootView > KeyboardProvider > SafeAreaProvider > Sentry.ErrorBoundary >
ResetController > ToastProvider > ActionSheetProvider > NavigationContainer >
CurrentRouteNameContext > AuthenticationStateProvider > QueryClientProvider >
CurrentUserProvider > ImpersonationProvider > OnboardingProvider > DevicePreferencesProvider >
LocationProvider > SheetProvider > PushTokenRetryProvider > BirthdayCelebrationProvider >
PhoneCountrySelectionProvider > RootStack
```

### React Query Setup
- `PersistQueryClientProvider` with encrypted async storage persister
- `networkMode: "always"`, `retry: 3`, `refetchOnWindowFocus: true`, `refetchOnReconnect: true`, `refetchOnMount: false`
- Global error handling via `QueryCache` for auth/authorization/server errors

### Key Files
- `src/navigators/root-stack/root-stack.tsx` — Root stack definition
- `src/navigators/application-tabs/application-tabs.tsx` — Bottom tab navigator
- `src/navigators/today-stack/today-stack.tsx` — Representative child stack
- `src/App.tsx` — Provider nesting
- `src/components/query-client-provider/index.tsx` — React Query config

---

## Implementation: Phase 0 + Phase 1

### Project scaffolding

```bash
cd /Users/richardpalmer/src
npx create-expo-app react-navigation-perf-investigation --template blank-typescript
cd react-navigation-perf-investigation
```

Template installed Expo 54, so upgraded to match production:

```bash
npx expo install expo@^55.0.0
npx expo install react-native@0.83.2 react@19.2.0
npx expo install @react-navigation/native@7.1.33 @react-navigation/native-stack@7.14.5 @react-navigation/bottom-tabs@7.15.5
npx expo install react-native-screens@4.23.0 react-native-safe-area-context@5.6.2
```

### Files created

**`src/utils/perf.ts`** — Performance measurement:
- `useRenderTimer(onMeasure)` hook — called in each screen, measures delta from `global.__PERF_TAB_PRESS_START` to screen render
- `PerfOverlay` component — displays last transition time and running average with color coding (green <100ms, yellow <300ms, red >300ms)
- `reportTransition()` / `setPerfReporter()` — global callback wiring so screens can report to the overlay

**`src/navigators/ApplicationTabs.tsx`** — Bottom tab navigator:
- `createBottomTabNavigator()` with Home and Settings tabs
- `screenListeners.tabPress` captures `performance.now()` into `global.__PERF_TAB_PRESS_START`
- `freezeOnBlur` intentionally NOT set (testing default behavior)

**`src/screens/HomeScreen.tsx`** / **`src/screens/SettingsScreen.tsx`**:
- Each renders a `FlatList` of 100 static items
- Each calls `useRenderTimer(reportTransition)` to measure tab-switch time

**`App.tsx`**:
- `SafeAreaProvider` > `NavigationContainer` > `ApplicationTabs` + `PerfOverlay`

### Commits

```
74bec09 Phase 1: Bare bottom tabs with perf measurement  (tag: phase-1)
8eba6ec Add investigation plan with current progress
```

TypeScript compiled cleanly with `npx tsc --noEmit`.

---

## Next Steps

Run Phase 1 with `npx expo start` and establish baseline transition times. Then proceed to Phase 2 (large network requests) per the plan in `PLAN.md`.
