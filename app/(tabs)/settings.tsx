import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { ResetLocalDataButton } from '@/components/dev/reset-local-data-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SettingsScreen() {
  const router = useRouter();

  const onPressCurrency = () => {
    Alert.alert('Currency', 'Currency management screen will be added in an upcoming story.');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Settings</ThemedText>
      <ThemedText style={styles.subtitle}>Manage app data and preferences.</ThemedText>

      <ThemedView style={styles.menuCard}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/settings/wallets')}
          style={styles.menuItem}
        >
          <ThemedText type="defaultSemiBold">Wallet</ThemedText>
          <MaterialIcons color="#5c5c5c" name="chevron-right" size={20} />
        </Pressable>

        <Pressable accessibilityRole="button" onPress={onPressCurrency} style={styles.menuItem}>
          <ThemedText type="defaultSemiBold">Currency</ThemedText>
          <MaterialIcons color="#5c5c5c" name="chevron-right" size={20} />
        </Pressable>
      </ThemedView>

      <ResetLocalDataButton />
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
  menuCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cfcfcf',
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
});
