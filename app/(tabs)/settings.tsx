import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { resetAppData } from '@/domain/services';

export default function SettingsScreen() {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

  const onConfirmReset = () => {
    Alert.alert('Reset local data?', 'This will delete local wallets and currency preferences on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          if (isResetting) {
            return;
          }

          try {
            setIsResetting(true);
            await resetAppData();
            router.replace('/');
          } finally {
            setIsResetting(false);
          }
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Settings</ThemedText>
      <ThemedText style={styles.subtitle}>
        Currency and wallet management will be added in upcoming stories.
      </ThemedText>

      {__DEV__ ? (
        <Pressable
          accessibilityRole="button"
          disabled={isResetting}
          onPress={onConfirmReset}
          style={[styles.resetButton, isResetting ? styles.resetButtonDisabled : undefined]}>
          <ThemedText style={styles.resetButtonText}>
            {isResetting ? 'Resetting...' : 'Reset local data (dev)'}
          </ThemedText>
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 88,
    gap: 16,
  },
  subtitle: {
    opacity: 0.8,
  },
  resetButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#c0392b',
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
