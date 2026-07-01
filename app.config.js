const googleServicesFile =
  process.env.GOOGLE_SERVICE_INFO_PLIST ?? './ios/GoogleService-Info.plist';

module.exports = {
  expo: {
    name: 'WEARTRACK',
    slug: 'weartrack',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    scheme: 'weartrack',
    splash: {
      image: './assets/native-splash-logo.png',
      resizeMode: 'contain',
      backgroundColor: '#070117',
    },
    ios: {
      supportsTablet: true,
      googleServicesFile,
      bundleIdentifier: 'com.anonymous.weartrack',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: ['android.permission.RECORD_AUDIO'],
      package: 'com.anonymous.weartrack',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-font',
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      [
        'expo-dev-client',
        {
          launchMode: 'launcher',
        },
      ],
      [
        'expo-image-picker',
        {
          cameraPermission: '옷 사진을 촬영하려면 카메라 권한이 필요합니다.',
          photosPermission: '촬영한 옷 사진을 불러오려면 사진 접근 권한이 필요합니다.',
        },
      ],
      '@react-native-community/datetimepicker',
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '1f83e63f-5218-484a-8ee4-81a37c7720d6',
      },
    },
  },
};
