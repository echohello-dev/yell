# Mobile: Publishing with EAS

The mobile app is an Expo (managed) project. The recommended way to publish binaries and submit to stores is **EAS Build**.

## One-time setup

1. Install and configure EAS:
   - `cd apps/mobile`
   - `bunx eas-cli@latest --version`
   - If you already have an EAS project id, initialize with:
     - `npm install --global eas-cli && eas init --id 6aed575b-f2b2-4a2f-bf91-bc54490bdeaf`

   This repo also includes `apps/mobile/eas.json` with `preview` and `production` profiles.

2. Set identifiers in `apps/mobile/app.json`:
   - `expo.slug`
   - `ios.bundleIdentifier`
   - `android.package`

3. Create an Expo access token and add it to GitHub repo secrets:
   - Secret: `EXPO_TOKEN`

## GitHub Actions workflow

Workflow: `.github/workflows/mobile-eas.yml`

It is **manual** (`workflow_dispatch`) and supports:

- `build`: create store binaries in EAS
- `submit`: submit the latest build to stores
- `build_and_submit`: do both
- `update`: publish an EAS Update (OTA-style)

## Store credentials

Submissions require store credentials configured in EAS.

- Android: Play Console service account / credentials configured via EAS
- iOS: App Store Connect API key / credentials configured via EAS

(Exactly how you provide these depends on your chosen EAS credentials strategy. Once you choose it, we can tailor the workflow further.)
