import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SegmentedToggle } from '@/components/ui/segmented-toggle';
import { IncomeExpenseTransactionType } from '@/domain/transaction-type';
import { getWalletMaterialIconName } from '@/domain/wallet-icon';

import { WalletOption } from './types';

type IncomeExpenseSectionProps = {
  transactionType: IncomeExpenseTransactionType;
  onChangeTransactionType: (value: IncomeExpenseTransactionType) => void;
  wallets: WalletOption[];
  selectedWalletId: string;
  onOpenWalletPicker: () => void;
  categoryInput: string;
  onChangeCategory: (value: string) => void;
};

export function IncomeExpenseSection({
  transactionType,
  onChangeTransactionType,
  wallets,
  selectedWalletId,
  onOpenWalletPicker,
  categoryInput,
  onChangeCategory,
}: IncomeExpenseSectionProps) {
  const selectedWallet =
    wallets.find((wallet) => wallet.id === selectedWalletId) ?? null;

  return (
    <>
      <ThemedView style={styles.formSection}>
        <ThemedText type="defaultSemiBold">Type</ThemedText>
        <SegmentedToggle
          options={[
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
          ]}
          value={transactionType}
          onChange={onChangeTransactionType}
        />
      </ThemedView>

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
        <ThemedText type="defaultSemiBold">Category</ThemedText>
        <TextInput
          accessibilityLabel="Category"
          autoCapitalize="sentences"
          onChangeText={onChangeCategory}
          placeholder="e.g. Salary, Food"
          style={styles.input}
          value={categoryInput}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  formSection: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    backgroundColor: '#fff',
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
