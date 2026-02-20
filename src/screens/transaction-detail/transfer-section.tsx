import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getWalletMaterialIconName } from '@/domain/wallet-icon';

import { WalletOption } from './types';

type TransferSectionProps = {
  wallets: WalletOption[];
  fromWalletId: string;
  toWalletId: string;
  onOpenFromWalletPicker: () => void;
  onOpenToWalletPicker: () => void;
};

export function TransferSection({
  wallets,
  fromWalletId,
  toWalletId,
  onOpenFromWalletPicker,
  onOpenToWalletPicker,
}: TransferSectionProps) {
  const fromWallet = wallets.find((wallet) => wallet.id === fromWalletId) ?? null;
  const toWallet = wallets.find((wallet) => wallet.id === toWalletId) ?? null;
  const showWalletsDifferentError =
    fromWalletId.length > 0 && toWalletId.length > 0 && fromWalletId === toWalletId;

  return (
    <>
      <ThemedView style={styles.formSection}>
        <ThemedText type="defaultSemiBold">From wallet</ThemedText>
        <Pressable onPress={onOpenFromWalletPicker} style={styles.walletPickerButton}>
          {fromWallet ? (
            <ThemedView style={styles.walletPickerContent}>
              <MaterialIcons
                color="#5c5c5c"
                name={getWalletMaterialIconName(fromWallet.iconKey)}
                size={20}
              />
              <ThemedText>{fromWallet.name}</ThemedText>
            </ThemedView>
          ) : (
            <ThemedText>Select source wallet</ThemedText>
          )}
          <MaterialIcons color="#5c5c5c" name="keyboard-arrow-down" size={20} />
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.formSection}>
        <ThemedText type="defaultSemiBold">To wallet</ThemedText>
        <Pressable onPress={onOpenToWalletPicker} style={styles.walletPickerButton}>
          {toWallet ? (
            <ThemedView style={styles.walletPickerContent}>
              <MaterialIcons
                color="#5c5c5c"
                name={getWalletMaterialIconName(toWallet.iconKey)}
                size={20}
              />
              <ThemedText>{toWallet.name}</ThemedText>
            </ThemedView>
          ) : (
            <ThemedText>Select destination wallet</ThemedText>
          )}
          <MaterialIcons color="#5c5c5c" name="keyboard-arrow-down" size={20} />
        </Pressable>
        {showWalletsDifferentError ? (
          <ThemedText style={styles.errorText}>From wallet and to wallet must be different.</ThemedText>
        ) : null}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  formSection: {
    gap: 8,
  },
  errorText: {
    color: '#c0392b',
  },
  walletPickerButton: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletPickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
