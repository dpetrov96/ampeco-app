# Ampeco React Native Interview Task

Monorepo with a local Express pins API and a bare React Native (Community CLI) mobile app. No Expo.

## 🎥 Demo
https://github.com/user-attachments/assets/d44c528c-0efa-4365-97ca-436f70c3d361

## Features

### Requirements

| Feature | Status | Notes |
| --- | --- | --- |
| Map + Settings screens | Done | Nested left/right drawers |
| Default screen is the map | Done | Google Maps when API key is set |
| Pins fetched from local server | Done | RTK Query → `GET /pins` |
| Tappable pins → details popup | Done | Bottom sheet with title, lat, lon, connectors |
| Connector types & status colors | Done | Available / unavailable use distinct text colors |
| Render only pins in visible map bounds | Done | Viewport bbox filtering |
| Settings: pin style preference | Done | Pin / dot styles |
| Persist pin style across restarts | Done | `redux-persist` + AsyncStorage |
| Left drawer → Settings | Done | Top-left button on the map |
| Right drawer filters + Apply | Done | Connector type & status checkboxes |
| Redux Toolkit + TypeScript | Done | Strongly typed store and API |
| Pins in global store | Done | RTK Query cache |
| Unit / integration tests | Done | Jest + Testing Library |
| Offline mode (nice-to-have) | Done | Banner, cached pins, refetch on reconnect |

### Bonus

| Feature | Notes |
| --- | --- |
| Pin clustering | Supercluster for ~20k pins; keeps the map smooth |
| My location button | Centers the map on the user |
| GitHub Actions CI | Typecheck → tests → lint on push/PR |
| Splash / branded loader | Shown while pins are loading |

## Structure

```
.
├── server/     # Express API serving pin data
└── mobile/     # Ampeco React Native 0.86 app (Redux Toolkit, maps, drawers)
```

## Prerequisites

- Node.js >= 22.11
- Xcode (iOS) / Android Studio (Android)
- CocoaPods (`pod` / `bundle exec pod`)
- Google Maps API key (optional on iOS — see below)

## 1. Start the server

```bash
cd server
npm install
npm start
```

API: `GET http://localhost:3000/pins` (~20 000 pins)

## 2. Mobile app (iOS)

```bash
cd mobile
npm install
cd ios && bundle install && bundle exec pod install && cd ..

# Terminal A: Metro
npm start

# Terminal B: Simulator
npm run ios
```

### Physical iPhone

1. Open `mobile/ios/Ampeco.xcworkspace` in Xcode
2. Select your Team under Signing
3. Plug in the phone and Run
4. In `src/utils/apiHost.ts`, set `DEV_API_HOST_OVERRIDE` to your Mac LAN IP, e.g. `http://192.168.1.10:3000`

### Google Maps API key

**Important — iOS provider fallback (requirement kept):**

| `GOOGLE_MAPS_API_KEY` in `mobile/.env` | iOS | Android |
| --- | --- | --- |
| Present | Google Maps | Google Maps |
| Missing / empty | **Apple Maps** | Google Maps (tiles need a key) |

This matches the task expectation: Google when a key is available; otherwise Apple Maps on iOS. The app does not require a Google key to run on the iOS Simulator.

1. Copy `mobile/.env.example` to `mobile/.env`
2. Set `GOOGLE_MAPS_API_KEY=...` (file is gitignored), or leave it empty to use Apple Maps on iOS

- `npm run ios` / `npm start` / `npm run android` run `sync-maps-key`, which generates:
  - `src/config/maps.generated.ts` — JS chooses Google vs Apple
  - `ios/Ampeco/GoogleMapsKey.generated.swift` — native `GMSServices` init (gitignored)
- `Info.plist` keeps a placeholder only — do not commit a real key there
- Android: Gradle reads `.env` at build time via `manifestPlaceholders`

## 3. Android

```bash
cd mobile
npm start
# other terminal
npm run android
```

Emulator API host defaults to `http://10.0.2.2:3000`.

## Mobile source layout

```
mobile/src/
├── api/           # RTK Query API
├── types/         # Pin, filters, map region, pin styles
├── store/         # RTK slices (filters, settings, network) + persist
├── navigation/    # Nested drawers (left Settings, right Filters)
├── screens/       # MapScreen, SettingsScreen
├── components/    # Markers, filter drawer, offline banner, pin details
├── features/map/  # filterPins, clustering, viewport bounds
├── hooks/         # network sync
└── utils/         # API host, map bounds
```

## Tests

Unit + integration tests live in `mobile/__tests__/`:

- viewport / clustering / badge helpers
- settings persist (redux-persist round-trip)
- left drawer → Settings, filter Apply → store
- map header drawers, Settings pin style, pin bottom sheet
- offline mode (banner, cached pins, refetch on reconnect)

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR: `npm ci` → typecheck → `npm test` → lint.

## Scripts

```bash
cd server && npm start
cd mobile && npm start
cd mobile && npm run ios
cd mobile && npm test
cd mobile && npm run typecheck
```
