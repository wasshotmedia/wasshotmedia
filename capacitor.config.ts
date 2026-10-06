import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.wasshotmedia.app",
  appName: "WasShot Media",
  webDir: "public",
  server: {
    // Connects native shell directly to live production web app
    url: "https://wasshot.in",
    cleartext: true,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    backgroundColor: "#111110",
  },
};

export default config;
