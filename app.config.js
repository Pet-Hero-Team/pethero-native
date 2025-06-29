import "dotenv/config";

export default {
  expo: {
    name: "pethero-native",
    slug: "pethero-native",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "petheronative",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.devscarycat.pethero-native",
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: "비디오 콜을 위해 카메라 접근이 필요합니다.",
        NSMicrophoneUsageDescription: "비디오 콜을 위해 마이크 접근이 필요합니다.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.devscarycat.petheronative",
      edgeToEdgeEnabled: true,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.RECORD_AUDIO",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.BLUETOOTH_CONNECT",
      ],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "expo-location",
        {
          locationWhenInUsePermission: "앱 사용 중 위치 접근을 허용하시겠습니까?",
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "사진을 선택하려면 접근 권한이 필요합니다.",
          cameraPermission: "사진 촬영을 위해 카메라 접근 권한이 필요합니다.",
          cameraRollPermission: "사진을 저장하려면 접근 권한이 필요합니다.",
        },
      ],
      [
        "expo-media-library",
        {
          photosPermission: "사진첩 접근을 허용하시겠습니까?",
          savePhotosPermission: "사진을 저장하려면 접근 권한이 필요합니다.",
        },
      ],
      [
        "@stream-io/video-react-native-sdk",
        {
          enableNonRingingPushNotifications: true,
        },
      ],
      [
        "@config-plugins/react-native-webrtc",
        {
          cameraPermission: "카메라 접근을 허용하시겠습니까?",
          microphonePermission: "마이크 접근을 허용하시겠습니까?",
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            minSdkVersion: 24,
            extraMavenRepos: ["$rootDir/../../../node_modules/@notifee/react-native/android/libs"],
          },
          ios: {
            deploymentTarget: "15.1",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "f8bb11da-f9b5-4738-8cd9-52162c22a64c",
      },
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      streamApiKey: process.env.STREAM_API_KEY,
    },
  },
};
