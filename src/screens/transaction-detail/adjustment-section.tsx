import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SegmentedToggle } from '@/components/ui/segmented-toggle';
import { getWalletMaterialIconName } from '@/domain/wallet-icon';

import { AdjustmentDirection, WalletOption } from './types';

type AdjustmentSectionProps = {
  wallets: WalletOption[];
  selectedWalletId: string;
  onOpenWalletPicker: () => void;
  direction: AdjustmentDirection;
  onChangeDirection: (value: AdjustmentDirection) => void;
};

export function AdjustmentSection({
  wallets,
  selectedWalletId,
  onOpenWalletPicker,
  direction,
  onChangeDirection,
}: AdjustmentSectionProps) {
  const selectedWallet =
    wallets.find((wallet) => wallet.id === selectedWalletId) ?? null;

  return (
    <>
      <ThemedView style={styles.formSection}>
        <ThemedText type="defaultSemiBold">Wallet</ThemedText>
        <Pressable onPress={onOpenWalletPicker} style={styles.walletPickerButton}>
          {selectedWallet ? (
            <ThemedView style={styles.walletPickerContent}>
              <MaterialIcons
                color="#5c5c5c"
                name={getWalletMaterialIconName(selectedWallet.iconKey)}
                size={20}
              />
              <ThemedText>{selectedWallet.name}</ThemedText>
            </ThemedView>
          ) : (
            <ThemedText>Select wallet</ThemedText>
          )}
          <MaterialIcons color="#5c5c5c" name="keyboard-arrow-down" size={20} />
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.formSection}>
        <ThemedText type="defaultSemiBold">Direction</ThemedText>
        <SegmentedToggle
          options={[
            { value: 'increase', label: 'Increase' },
            { value: 'decrease', label: 'Decrease' },
          ]}
          value={direction}
          onChange={onChangeDirection}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  formSection: {
    gap: 8,
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
