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
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      bundleIdentifier: "com.echowaves.placechatter",
      buildNumber: "2",
      supportsTablet: true,
      associatedDomains: [
        "applinks:link.placechatter.com" 
      ],
      config: {
        usesNonExemptEncryption: false,
        branch: {
          apiKey: "key_live_mb05m7GAfQH9Y3FGUao95ijaqDastcQX"
        },
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
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
        "com.google.android.gms.permission.AD_ID"
      ],
      config: {
        branch: {
          apiKey: "key_live_mb05m7GAfQH9Y3FGUao95ijaqDastcQX"
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
              pathPrefix: "/places"
            },
            {
              scheme: "https",
              host: "*.placechatter.com",
              pathPrefix: "/friends"
            },
          ],
          category: [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    }
  }
}
