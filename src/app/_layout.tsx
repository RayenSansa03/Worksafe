import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { bindBleToSettings } from '@/ble/manager';
import { ThemeProvider, useTheme } from '@/theme';

function ThemedStack() {
  const { colors, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="guide" options={{ presentation: 'modal' }} />
        <Stack.Screen name="summary" options={{ presentation: 'modal' }} />
        <Stack.Screen name="connect" options={{ presentation: 'modal' }} />
        <Stack.Screen name="calibration" options={{ presentation: 'modal' }} />
        <Stack.Screen name="badges" options={{ presentation: 'card' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  // Keep the BLE service (demo or real) in sync with the settings switch.
  useEffect(() => bindBleToSettings(), []);

  return (
    <ThemeProvider>
      <ThemedStack />
    </ThemeProvider>
  );
}
