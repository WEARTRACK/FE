import {
  AuthorizationStatus,
  getMessaging,
  hasPermission,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages,
  requestPermission,
} from "@react-native-firebase/messaging";

function isNotificationPermissionGranted(status: number) {
  return status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
}

export async function hasNotificationPermission() {
  const status = await hasPermission(getMessaging());
  return isNotificationPermissionGranted(status);
}

export async function requestNotificationPermission() {
  const messaging = getMessaging();

  if (!isDeviceRegisteredForRemoteMessages(messaging)) {
    await registerDeviceForRemoteMessages(messaging);
  }

  const status = await requestPermission(messaging);
  return isNotificationPermissionGranted(status);
}
