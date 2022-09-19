export default {
  expo: {
    name: "placechatter",
    slug: "placechatter",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    packagerOpts: {
      sourceExts: ["js", "json", "ts", "tsx", "jsx", "vue"],
    },
    extra: {
      API_URI: process.env.API_URI,
      REALTIME_API_URI: process.env.REALTIME_API_URI,
      API_KEY: process.env.API_KEY,
      PRIVATE_IMG_HOST: process.env.PRIVATE_IMG_HOST,
    },
    scheme: "placechatter",
    updates: {
      fallbackToCacheTimeout: 0,
      // url: "https://u.expo.dev/c8788597-86cf-4b92-a3a1-3d27b1bd5da9",
    },
    // runtimeVersion: {
    //   policy: "sdkVersion",
    // },
    assetBundlePatterns: ["**/*"],
    ios: {
      bundleIdentifier: "com.echowaves.placechatter",
      buildNumber: "2",
      supportsTablet: true,
      associatedDomains: ["applinks:link.placechatter.com"],
      config: {
        usesNonExemptEncryption: false,
        branch: {
          apiKey: "key_live_mb05m7GAfQH9Y3FGUao95ijaqDastcQX",
        },
      },
      infoPlist: {
        UIBackgroundModes: ["fetch"],
        NSLocationAlwaysUsageDescription:
          "We need to know your location so that we can show you places in your area.",
        NSLocationWhenInUseUsageDescription:
          "You need to enable your location, in order to see places that are closest to you.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "You need to enable your location, in order to see places that are closest to you.",
        NSMotionUsageDescription:
          "This will help us to improve the relevance of places that you can see related to you location.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
      package: "com.echowaves.placechatter",
      versionCode: 2,
      permissions: [
        "INTERNET",
        "SYSTEM_ALERT_WINDOW",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "WRITE_EXTERNAL_STORAGE",
        "READ_EXTERNAL_STORAGE",
        "com.google.android.gms.permission.AD_ID",
      ],
      config: {
        branch: {
          apiKey: "key_live_mb05m7GAfQH9Y3FGUao95ijaqDastcQX",
        },
      },
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "*.placechatter.com",
              pathPrefix: "/places",
            },
            {
              scheme: "https",
              host: "*.placechatter.com",
              pathPrefix: "/friends",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
  },
}
