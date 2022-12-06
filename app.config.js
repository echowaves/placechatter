export default {
  expo: {
    runtimeVersion: {
      policy: 'sdkVersion',
    },
    updates: {
      url: 'https://u.expo.dev/c8788597-86cf-4b92-a3a1-3d27b1bd5da9',
    },
    name: 'placechatter',
    slug: 'placechatter',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    packagerOpts: {
      sourceExts: ['js', 'json', 'ts', 'tsx', 'jsx', 'vue'],
    },
    plugins: [
      [
        'expo-image-picker',
        {
          cameraPermission:
            'Allow $(PRODUCT_NAME) to access your camera, so that you can describe your place in pictures.',
        },
      ],
    ],
    extra: {
      eas: {
        projectId: 'c8788597-86cf-4b92-a3a1-3d27b1bd5da9',
      },
      API_URI: process.env.API_URI,
      REALTIME_API_URI: process.env.REALTIME_API_URI,
      API_KEY: process.env.API_KEY,
    },
    scheme: 'placechatter',
    assetBundlePatterns: ['**/*'],
    ios: {
      bundleIdentifier: 'com.echowaves.placechatter',
      buildNumber: '22',
      supportsTablet: true,
      associatedDomains: ['applinks:link.placechatter.com'],
      config: {
        usesNonExemptEncryption: false,
        // branch: {
        //   apiKey: 'key_live_mb05m7GAfQH9Y3FGUao95ijaqDastcQX',
        // },
      },
      infoPlist: {
        UIBackgroundModes: ['fetch'],
        NSLocationAlwaysUsageDescription:
          'We need to know your location so that we can show you places in your area.',
        NSLocationWhenInUseUsageDescription:
          'You need to enable your location, in order to see places that are closest to you.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'You need to enable your location, in order to see places that are closest to you.',
        NSMotionUsageDescription:
          'This will help us to improve the relevance of places that you can see related to you location.',
        NSPhotoLibraryAddUsageDescription:
          'In order to store Photos on your device, you need to allow access to Photos in settings.',
        NSPhotoLibraryUsageDescription:
          'This will allow to store photos in photo album on your device.',
        // NSMicrophoneUsageDescription:
        //   'WiSaw allows your to record video with sound. In order for the sound to be captured, you need to allow access to the microphone.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
      package: 'com.echowaves.placechatter',
      versionCode: 22,
      permissions: [
        'INTERNET',
        'SYSTEM_ALERT_WINDOW',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'CAMERA',
        'WRITE_EXTERNAL_STORAGE',
        'READ_EXTERNAL_STORAGE',
        'com.google.android.gms.permission.AD_ID',
      ],
      config: {
        // branch: {
        //   apiKey: 'key_live_mb05m7GAfQH9Y3FGUao95ijaqDastcQX',
        // },
      },
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: '*.placechatter.com',
              pathPrefix: '/places',
            },
            {
              scheme: 'https',
              host: '*.placechatter.com',
              pathPrefix: '/friends',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      favicon: './assets/favicon.png',
    },
  },
}
