# HomeGenie — Beta Launch Guide

## Prerequisites

```bash
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Log into your Expo account
eas login

# 3. Link this project (creates EAS project, sets projectId)
eas init

# 4. Prepare asset placeholders (replace with real assets before production)
mkdir -p assets/sounds
# Required assets:
#   assets/icon.png              — 1024×1024 app icon
#   assets/adaptive-icon.png     — 1024×1024 foreground (Android adaptive)
#   assets/splash.png            — 1284×2778 splash screen
#   assets/favicon.png           — 48×48 web favicon
#   assets/notification-icon.png — 96×96 white-on-transparent (Android)
#   assets/sounds/reminder.wav   — notification sound
```

---

## Android — Google Play Internal Testing

### One-time setup

1. **Create a Google Play Console account** at https://play.google.com/console  
   (one-time $25 fee)

2. **Create the app**  
   - Play Console → "Create app"  
   - App name: `HomeGenie`  
   - Default language: English (India)  
   - App type: App, Free  

3. **Set up a Google Service Account** for automated uploads:  
   - Google Cloud Console → IAM → Service Accounts → Create  
   - Grant role: "Service Account User"  
   - Go to Play Console → Settings → API access → Link the project  
   - Grant the service account "Release manager" permission  
   - Download the JSON key → save as `google-service-account.json` in project root  
   - **Add `google-service-account.json` to `.gitignore`!**

4. **Complete the Play Console store listing**  
   - App content: privacy policy URL, app access instructions  
   - Main store listing: title, short description, full description, screenshots  
   - Content rating: complete questionnaire  
   - Target audience: 18+ (face recognition, household management)

### Build and submit

```bash
# Build the production AAB (Android App Bundle)
eas build --platform android --profile production

# Submit to Play Console internal testing track
eas submit --platform android --profile production

# OR do both in one command:
eas build --platform android --profile production --auto-submit
```

### Internal testing

1. Play Console → Testing → Internal testing  
2. Create an email list of testers (up to 100)  
3. Share the opt-in link with testers  
4. Testers install via Play Store (may take a few hours to propagate)

---

## iOS — TestFlight

### One-time setup

1. **Apple Developer account** at https://developer.apple.com ($99/year)

2. **Create App ID**  
   - Certificates, Identifiers & Profiles → Identifiers → Register: `com.homegenie.app`  
   - Enable capabilities: Push Notifications, Face ID  

3. **Create the app in App Store Connect**  
   - https://appstoreconnect.apple.com → My Apps → New App  
   - Platform: iOS  
   - Name: `HomeGenie`  
   - Bundle ID: `com.homegenie.app`  
   - SKU: `homegenie-ios`  

4. **Update eas.json** with your Apple credentials:  
   - `appleId`: your Apple ID email  
   - `ascAppId`: the numeric App ID from App Store Connect  
   - `appleTeamId`: your 10-character Team ID  

### Build and submit

```bash
# Build the production IPA
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios --profile production

# OR both at once:
eas build --platform ios --profile production --auto-submit
```

### TestFlight testing

1. App Store Connect → TestFlight → new build appears after processing (~15 min)  
2. Answer export compliance (select "No" for non-exempt encryption — set in app.config.ts)  
3. Add internal testers (up to 25, instant access)  
4. Add external testers (up to 10,000, requires Apple review — ~24-48h first time)  
5. Testers install via TestFlight app  

---

## Build Commands Cheat Sheet

```bash
# Development build (with dev tools, on physical device)
eas build --platform android --profile development
eas build --platform ios --profile development

# Preview build (staging, internal distribution)
eas build --platform android --profile preview
eas build --platform ios --profile preview

# Production build
eas build --platform android --profile production
eas build --platform ios --profile production

# OTA update (skip full rebuild for JS-only changes)
eas update --channel production --message "Bug fix: grocery list sync"

# Check build status
eas build:list --limit 5
```

---

## Pre-submission Checklist

- [ ] Replace all placeholder assets (icon, splash, adaptive-icon, notification-icon)
- [ ] Replace `YOUR_*` values in `eas.json` with real credentials
- [ ] Set real `EAS_PROJECT_ID` in `.env` or `app.config.ts`
- [ ] Run the app on a physical Android device and iOS device
- [ ] Test camera permissions flow (deny → re-prompt)
- [ ] Test notification permissions flow
- [ ] Test offline mode (airplane mode → queue → reconnect → drain)
- [ ] Verify face data never leaves the device (check network tab)
- [ ] Privacy policy URL is live and linked in Play Console / App Store Connect
- [ ] Terms of Service URL is live
- [ ] App screenshots captured on required device sizes
- [ ] `.gitignore` includes: `.env`, `google-service-account.json`, `*.jks`, `*.p12`
