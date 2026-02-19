import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  archiveWallet,
  createWallet,
  getAllActiveWallets,
  getSelectedCurrency,
  updateWalletDetails,
} from '@/domain/services';
import { CurrencyCode, getCurrencyFractionDigits, getCurrencySymbol } from '@/domain/currency';
import {
  getWalletMaterialIconName,
  WALLET_ICON_OPTIONS,
  WalletIconKey,
} from '@/domain/wallet-icon';
import { formatAmountInput, formatMinorUnits, parseAmountToMinorUnits } from '@/utils/money-format';

type WalletItem = {
  id: string;
  name: string;
  initialBalance: number;
  iconKey: WalletIconKey;
};

type WalletFormMode = 'create' | 'edit';

async function fetchWalletSettingsData() {
  return Promise.all([getAllActiveWallets(), getSelectedCurrency()]);
}

export function WalletManagementScreen() {
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [isLoading, setIsLoading] = useState(true);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletFormMode, setWalletFormMode] = useState<WalletFormMode>('create');
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [walletNameInput, setWalletNameInput] = useState('');
  const [walletBalanceInput, setWalletBalanceInput] = useState('');
  const [selectedIconKey, setSelectedIconKey] = useState<WalletIconKey>('wallet');
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const [walletErrorMessage, setWalletErrorMessage] = useState<string | null>(null);

  const parsedWalletBalance = parseAmountToMinorUnits(walletBalanceInput);
  const currencyFractionDigits = getCurrencyFractionDigits(currencyCode);
  const isWalletNameValid = walletNameInput.trim().length > 0;
  const isWalletFormValid =
    walletFormMode === 'create'
      ? isWalletNameValid && parsedWalletBalance !== null
      : isWalletNameValid;

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [activeWallets, selectedCurrency] = await fetchWalletSettingsData();

      setWallets(activeWallets);
      setCurrencyCode(selectedCurrency ?? 'USD');
      setCurrencySymbol(selectedCurrency ? getCurrencySymbol(selectedCurrency) : '$');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadOnFocus = async () => {
        setIsLoading(true);
        try {
          const [activeWallets, selectedCurrency] = await fetchWalletSettingsData();
          if (!isMounted) {
            return;
          }

          setWallets(activeWallets);
          setCurrencyCode(selectedCurrency ?? 'USD');
          setCurrencySymbol(selectedCurrency ? getCurrencySymbol(selectedCurrency) : '$');
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      void loadOnFocus();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const openCreateWalletModal = () => {
    setWalletFormMode('create');
    setEditingWalletId(null);
    setWalletNameInput('');
    setWalletBalanceInput('');
    setSelectedIconKey('wallet');
    setWalletErrorMessage(null);
    setIsWalletModalOpen(true);
  };

  const openEditWalletModal = (wallet: WalletItem) => {
    setWalletFormMode('edit');
    setEditingWalletId(wallet.id);
    setWalletNameInput(wallet.name);
    setWalletBalanceInput('');
    setSelectedIconKey(wallet.iconKey);
    setWalletErrorMessage(null);
    setIsWalletModalOpen(true);
  };

  const closeWalletModal = () => {
    if (isSavingWallet) {
      return;
    }

    setIsWalletModalOpen(false);
  };

  const onChangeInitialBalance = (text: string) => {
    const normalized = text.replace(/,/g, '');
    if (!normalized) {
      setWalletBalanceInput('');
      return;
    }

    if (!/^-?\d*(\.\d{0,2})?$/.test(normalized)) {
      return;
    }

    setWalletBalanceInput(formatAmountInput(normalized));
  };

  const onSaveWallet = async () => {
    if (!isWalletFormValid || isSavingWallet) {
      return;
    }

    try {
      setIsSavingWallet(true);
      setWalletErrorMessage(null);

      if (walletFormMode === 'create') {
        if (parsedWalletBalance === null) {
          setWalletErrorMessage('Enter a valid amount.');
          return;
        }

        await createWallet(walletNameInput, parsedWalletBalance, selectedIconKey);
      } else {
        if (!editingWalletId) {
          setWalletErrorMessage('Wallet not found. Please retry.');
          return;
        }

        await updateWalletDetails(editingWalletId, walletNameInput, selectedIconKey);
      }

      await refreshData();
      setIsWalletModalOpen(false);
    } catch {
      setWalletErrorMessage('Unable to save wallet. Please try again.');
    } finally {
      setIsSavingWallet(false);
    }
  };

  const onArchiveWallet = (wallet: WalletItem) => {
    Alert.alert(
      'Archive wallet?',
      `${wallet.name} will be hidden from active wallet lists and transfer options.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await archiveWallet(wallet.id);
              await refreshData();
            } catch {
              Alert.alert('Unable to archive wallet', 'Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerRow}>
        <ThemedText type="subtitle">Wallets</ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={openCreateWalletModal}
          style={styles.createWalletButton}
        >
          <ThemedText style={styles.createWalletButtonText}>Add wallet</ThemedText>
        </Pressable>
      </ThemedView>

      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator />
        </ThemedView>
      ) : (
        <ScrollView contentContainerStyle={styles.walletListContainer}>
          {wallets.length === 0 ? (
            <ThemedText style={styles.emptyStateText}>No active wallets found.</ThemedText>
          ) : (
            wallets.map((wallet) => (
              <ThemedView key={wallet.id} style={styles.walletCard}>
                <ThemedView style={styles.walletInfoRow}>
                  <ThemedView style={styles.walletIconCircle}>
                    <MaterialIcons
                      color="#0a7ea4"
                      name={getWalletMaterialIconName(wallet.iconKey)}
                      size={20}
                    />
                  </ThemedView>
                  <ThemedView>
                    <ThemedText type="defaultSemiBold">{wallet.name}</ThemedText>
                    <ThemedText style={styles.balanceText}>
                      {formatMinorUnits(wallet.initialBalance, currencySymbol, currencyFractionDigits)}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>

                <ThemedView style={styles.walletActionsRow}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openEditWalletModal(wallet)}
                    style={styles.secondaryActionButton}
                  >
                    <ThemedText style={styles.secondaryActionText}>Edit</ThemedText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => onArchiveWallet(wallet)}
                    style={styles.archiveActionButton}
                  >
                    <ThemedText style={styles.archiveActionText}>Archive</ThemedText>
                  </Pressable>
                </ThemedView>
              </ThemedView>
            ))
          )}
        </ScrollView>
      )}

      <Modal
        animationType="slide"
        onRequestClose={closeWalletModal}
        transparent
        visible={isWalletModalOpen}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <Pressable onPress={closeWalletModal} style={styles.modalBackdrop}>
            <Pressable style={styles.modalCard}>
              <ThemedText type="subtitle">
                {walletFormMode === 'create' ? 'Create wallet' : 'Edit wallet'}
              </ThemedText>

              <ThemedView style={styles.formSection}>
                <ThemedText type="defaultSemiBold">Wallet name</ThemedText>
                <TextInput
                  accessibilityLabel="Wallet name"
                  autoCapitalize="words"
                  autoCorrect={false}
                  onChangeText={setWalletNameInput}
                  placeholder="e.g. Savings"
                  style={styles.input}
                  value={walletNameInput}
                />
              </ThemedView>

              {walletFormMode === 'create' ? (
                <ThemedView style={styles.formSection}>
                  <ThemedText type="defaultSemiBold">Initial balance</ThemedText>
                  <TextInput
                    accessibilityLabel="Initial balance"
                    keyboardType="decimal-pad"
                    onChangeText={onChangeInitialBalance}
                    placeholder="0.00"
                    style={styles.input}
                    value={walletBalanceInput}
                  />
                  <ThemedText style={styles.helpText}>Use a number with up to 2 decimals</ThemedText>
                </ThemedView>
              ) : null}

              <ThemedView style={styles.formSection}>
                <ThemedText type="defaultSemiBold">Icon</ThemedText>
                <ThemedView style={styles.iconGrid}>
                  {WALLET_ICON_OPTIONS.map((option) => {
                    const isSelected = selectedIconKey === option.key;

                    return (
                      <Pressable
                        key={option.key}
                        accessibilityRole="button"
                        onPress={() => setSelectedIconKey(option.key)}
                        style={[styles.iconGridItem, isSelected ? styles.iconGridItemSelected : undefined]}
                      >
                        <MaterialIcons
                          color={isSelected ? '#0a7ea4' : '#5c5c5c'}
                          name={getWalletMaterialIconName(option.key)}
                          size={22}
                        />
                      </Pressable>
                    );
                  })}
                </ThemedView>
              </ThemedView>

              {walletFormMode === 'create' && parsedWalletBalance === null ? (
                <ThemedText style={styles.errorText}>Enter a valid amount.</ThemedText>
              ) : null}
              {walletErrorMessage ? <ThemedText style={styles.errorText}>{walletErrorMessage}</ThemedText> : null}

              <ThemedView style={styles.modalActionsRow}>
                <Pressable accessibilityRole="button" onPress={closeWalletModal} style={styles.cancelButton}>
                  <ThemedText>Cancel</ThemedText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={!isWalletFormValid || isSavingWallet}
                  onPress={onSaveWallet}
                  style={[
                    styles.saveButton,
                    !isWalletFormValid || isSavingWallet ? styles.saveButtonDisabled : undefined,
                  ]}
                >
                  <ThemedText style={styles.saveButtonText}>
                    {isSavingWallet ? 'Saving...' : 'Save'}
                  </ThemedText>
                </Pressable>
              </ThemedView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createWalletButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0a7ea4',
  },
  createWalletButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletListContainer: {
    paddingTop: 8,
    paddingBottom: 48,
    gap: 12,
  },
  walletCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cfcfcf',
    padding: 14,
    gap: 12,
  },
  walletInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0a7ea414',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceText: {
    opacity: 0.72,
  },
  walletActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfbfbf',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryActionText: {
    fontWeight: '600',
  },
  archiveActionButton: {
    borderRadius: 10,
    backgroundColor: '#c0392b',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  archiveActionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyStateText: {
    opacity: 0.72,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  formSection: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  helpText: {
    fontSize: 13,
    opacity: 0.7,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconGridItem: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bdbdbd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGridItemSelected: {
    borderColor: '#0a7ea4',
    backgroundColor: '#0a7ea410',
  },
  errorText: {
    color: '#c0392b',
  },
  modalActionsRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bdbdbd',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  saveButton: {
    borderRadius: 10,
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
