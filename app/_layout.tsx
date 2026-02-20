import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ToastProvider } from '@/components/ui/toast-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ToastProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="currency-setup"
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen name="first-wallet" options={{ title: 'Wallet Setup', headerBackVisible: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="settings/wallets"
            options={{ title: 'Wallets', headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="transactions/add"
            options={{ title: 'Add Transaction', headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="transactions/transfer"
            options={{ title: 'Transfer', headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="transactions/adjustment"
            options={{ title: 'Adjust Balance', headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen
            name="transactions/[id]"
            options={{ title: 'Transaction Detail', headerBackButtonDisplayMode: 'minimal' }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ToastProvider>
    </ThemeProvider>
  );
}
