# NovaSpeak Analytics

A next-generation ThingSpeak dashboard with AI insights.

## How to generate an APK (Android App)

Since this is a Progressive Web App (PWA), you can install it directly from the browser, or wrap it into an APK.

### Method 1: Install directly (Recommended)
1. Open the hosted website in Chrome on Android.
2. Tap the "Install App" button in the top navigation bar.
3. The app will be installed to your home screen and work like a native app.

### Method 2: Use an Online Converter (Easy)
1. Host this project (e.g., drag and drop the folder to [Netlify Drop](https://app.netlify.com/drop)).
2. Copy your new website URL.
3. Visit a service like **WebIntoApp.com**.
4. Paste your URL and click "Build".
5. Download the generated APK file.

### Method 3: Build locally with Capacitor (Advanced)
If you have Node.js and Android Studio installed:

1. Create a build wrapper:
   ```bash
   npm init vite@latest novaspeak-build -- --template react-ts
   cd novaspeak-build
   npm install
   ```

2. Copy the `components`, `services`, `types.ts`, `App.tsx`, etc., into the `src` folder.

3. Install Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init
   npx cap add android
   ```

4. Build and sync:
   ```bash
   npm run build
   npx cap sync
   npx cap open android
   ```

5. In Android Studio, select **Build > Build APK**.
