import { useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCurrentWallet } from '@/domain/services';
import { WalletIconKey, getWalletMaterialIconName } from '@/domain/wallet-icon';

export default function TransactionsScreen() {
  const [walletName, setWalletName] = useState<string | null>(null);
  const [walletIconKey, setWalletIconKey] = useState<WalletIconKey>('wallet');
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadWallet = async () => {
        try {
          const wallet = await getCurrentWallet();
          if (isMounted) {
            setWalletName(wallet?.name ?? null);
            setWalletIconKey(wallet?.iconKey ?? 'wallet');
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      setIsLoading(true);
      loadWallet();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Transactions</ThemedText>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <ThemedView style={styles.walletContextRow}>
          <MaterialIcons
            color="#5c5c5c"
            name={getWalletMaterialIconName(walletIconKey)}
            size={20}
          />
          <ThemedText type="defaultSemiBold">Wallet: {walletName ?? 'None'}</ThemedText>
        </ThemedView>
      )}
      <ThemedText style={styles.subtitle}>
        Transactions list and top bar context will be added in upcoming stories.
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
  walletContextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
