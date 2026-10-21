import { PermissionsAndroid, Platform } from 'react-native';

export type PermissionResult = 'granted' | 'denied' | 'blocked';

/**
 * Asks for the runtime permissions needed to scan and connect.
 *  - Android 12+ (API 31+): BLUETOOTH_SCAN + BLUETOOTH_CONNECT.
 *  - Android 11 and below: ACCESS_FINE_LOCATION (required to scan).
 *  - iOS: the system asks by itself on first use (NSBluetoothAlwaysUsageDescription).
 */
export async function ensureBlePermissions(): Promise<PermissionResult> {
  if (Platform.OS !== 'android') return 'granted';

  const wanted =
    Platform.Version >= 31
      ? [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]
      : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

  const result = await PermissionsAndroid.requestMultiple(wanted);
  const values = wanted.map((p) => result[p]);
  if (values.every((v) => v === PermissionsAndroid.RESULTS.GRANTED)) return 'granted';
  if (values.some((v) => v === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) return 'blocked';
  return 'denied';
}
