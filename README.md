# Ampeco React Native Interview Task

Monorepo with a local Express pins API and a bare React Native (Community CLI) mobile app. No Expo.

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
- Google Maps API key (for map tiles)

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

1. Open `mobile/ios/AmpecoPins.xcworkspace` in Xcode
2. Select your Team under Signing
3. Plug in the phone and Run
4. In `src/utils/apiHost.ts`, set `DEV_API_HOST_OVERRIDE` to your Mac LAN IP, e.g. `http://192.168.1.10:3000`

### Google Maps API key

Replace `YOUR_GOOGLE_MAPS_API_KEY` in:

- iOS: [`mobile/ios/AmpecoPins/Info.plist`](mobile/ios/AmpecoPins/Info.plist) (`GMSApiKey`)
- Android: [`mobile/android/app/src/main/AndroidManifest.xml`](mobile/android/app/src/main/AndroidManifest.xml)

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
├── features/map/  # selectVisiblePins (viewport + filters)
├── hooks/         # network sync
└── utils/         # API host, map bounds
```

## Scripts

```bash
cd server && npm start
cd mobile && npm start
cd mobile && npm run ios
cd mobile && npm test
cd mobile && npm run typecheck
```
