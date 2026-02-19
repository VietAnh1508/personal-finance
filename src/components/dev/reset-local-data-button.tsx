import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { resetAppData } from '@/domain/services';

export function ResetLocalDataButton() {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

  if (!__DEV__) {
    return null;
  }

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
    <Pressable
      accessibilityRole="button"
      disabled={isResetting}
      onPress={onConfirmReset}
      style={[styles.resetButton, isResetting ? styles.resetButtonDisabled : undefined]}
    >
      <ThemedText style={styles.resetButtonText}>
        {isResetting ? 'Resetting...' : 'Reset local data (dev)'}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
