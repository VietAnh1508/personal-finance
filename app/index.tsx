import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { getSelectedCurrency, hasAnyActiveWallet } from '@/domain/services';

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCurrencyPreference, setHasCurrencyPreference] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPreference = async () => {
      try {
        const selectedCurrency = await getSelectedCurrency();
        const walletExists = await hasAnyActiveWallet();
        if (isMounted) {
          setHasCurrencyPreference(Boolean(selectedCurrency));
          setHasWallet(walletExists);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPreference();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (hasCurrencyPreference) {
    if (hasWallet) {
      return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/first-wallet" />;
  }

  return <Redirect href="/currency-setup" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
