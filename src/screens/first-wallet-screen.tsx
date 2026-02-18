import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export function FirstWalletScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Create Your First Wallet</ThemedText>
      <ThemedText style={styles.subtitle}>
        Wallet setup will be implemented in the next user story.
      </ThemedText>
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
});
