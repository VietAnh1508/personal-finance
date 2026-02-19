import { useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet } from 'react-native';

import { TransactionEntry } from '@/data/repositories';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CurrencyCode, getCurrencyFractionDigits, getCurrencySymbol } from '@/domain/currency';
import {
  getAllActiveWallets,
  getSignedTransactionAmount,
  getTransactionsForWalletContext,
  getLastUsedWalletContext,
  getSelectedCurrency,
  setLastUsedWalletContext,
} from '@/domain/services';
import { WalletIconKey, getWalletMaterialIconName } from '@/domain/wallet-icon';
import { formatIsoDateForDisplay } from '@/utils/date-format';
import { formatMinorUnits } from '@/utils/money-format';

type WalletContextValue = 'all' | string;

export default function TransactionsScreen() {
  const [wallets, setWallets] = useState<
    { id: string; name: string; initialBalance: number; iconKey: WalletIconKey }[]
  >([]);
  const [transactions, setTransactions] = useState<TransactionEntry[]>([]);
  const [selectedContext, setSelectedContext] = useState<WalletContextValue>('all');
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const selectedWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === selectedContext) ?? null,
    [selectedContext, wallets]
  );
  const netByWalletId = useMemo(() => {
    const netMap: Record<string, number> = {};
    for (const transaction of transactions) {
      const signedAmount = getSignedTransactionAmount(transaction);
      netMap[transaction.walletId] = (netMap[transaction.walletId] ?? 0) + signedAmount;
    }

    return netMap;
  }, [transactions]);
  const visibleTransactions = useMemo(() => {
    if (selectedContext === 'all') {
      return transactions;
    }

    return transactions.filter((transaction) => transaction.walletId === selectedContext);
  }, [selectedContext, transactions]);
  const displayedTotalMinorUnits = useMemo(() => {
    if (selectedContext === 'all') {
      return wallets.reduce(
        (total, wallet) => total + wallet.initialBalance + (netByWalletId[wallet.id] ?? 0),
        0
      );
    }

    return (selectedWallet?.initialBalance ?? 0) + (selectedWallet ? netByWalletId[selectedWallet.id] ?? 0 : 0);
  }, [netByWalletId, selectedContext, selectedWallet, wallets]);
  const selectorIconName =
    selectedContext === 'all'
      ? 'account-balance'
      : getWalletMaterialIconName(selectedWallet?.iconKey ?? 'wallet');
  const currencyFractionDigits = useMemo(
    () => getCurrencyFractionDigits(currencyCode),
    [currencyCode]
  );

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadContextData = async () => {
        try {
          const [activeWallets, selectedCurrency, lastUsedWalletContext] = await Promise.all([
            getAllActiveWallets(),
            getSelectedCurrency(),
            getLastUsedWalletContext(),
          ]);
          const allTransactions = await getTransactionsForWalletContext('all');

          const normalizedContext =
            lastUsedWalletContext && activeWallets.some((wallet) => wallet.id === lastUsedWalletContext)
              ? lastUsedWalletContext
              : 'all';

          if (normalizedContext !== lastUsedWalletContext) {
            setLastUsedWalletContext(normalizedContext).catch(() => {
              // Ignore persistence errors and keep UI responsive.
            });
          }

          if (isMounted) {
            setWallets(activeWallets);
            setTransactions(allTransactions);
            setCurrencyCode(selectedCurrency ?? 'USD');
            setCurrencySymbol(selectedCurrency ? getCurrencySymbol(selectedCurrency) : '$');
            setSelectedContext(normalizedContext);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      setIsLoading(true);
      loadContextData();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const onSelectWalletContext = (context: WalletContextValue) => {
    setSelectedContext(context);
    setIsWalletSelectorOpen(false);
    setLastUsedWalletContext(context).catch(() => {
      // Ignore persistence errors and keep UI responsive.
    });
  };

  const onOpenAction = (actionLabel: 'Transfer' | 'Adjust balance') => {
    setIsActionsMenuOpen(false);
    if (actionLabel === 'Transfer' && wallets.length < 2) {
      Alert.alert('Transfer unavailable', 'At least two active wallets are required.');
      return;
    }

    Alert.alert(actionLabel, `${actionLabel} will be added in upcoming stories.`);
  };

  return (
    <ThemedView style={styles.container}>
      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator />
        </ThemedView>
      ) : (
        <ThemedView style={styles.contentContainer}>
          <ThemedView style={styles.topBar}>
            <Pressable
              accessibilityLabel="Select wallet context"
              accessibilityRole="button"
              onPress={() => setIsWalletSelectorOpen(true)}
              style={[styles.iconButton, styles.walletSelectorButton]}
            >
              <MaterialIcons color="#5c5c5c" name={selectorIconName} size={20} />
              <MaterialIcons color="#5c5c5c" name="keyboard-arrow-down" size={16} />
            </Pressable>

            <ThemedText style={styles.totalText} type="defaultSemiBold">
              {formatMinorUnits(displayedTotalMinorUnits, currencySymbol, currencyFractionDigits)}
            </ThemedText>

            <Pressable
              accessibilityLabel="Open actions menu"
              accessibilityRole="button"
              onPress={() => setIsActionsMenuOpen(true)}
              style={styles.iconButton}
            >
              <MaterialIcons color="#5c5c5c" name="more-vert" size={20} />
            </Pressable>
          </ThemedView>

          <ThemedText style={styles.subtitle}>
            {visibleTransactions.length === 0 ? 'No transactions yet.' : 'Recent transactions'}
          </ThemedText>
          {visibleTransactions.map((transaction) => {
            const signedAmount = getSignedTransactionAmount(transaction);
            const amountColor = signedAmount < 0 ? '#c0392b' : '#1f8b4c';

            return (
              <ThemedView key={transaction.id} style={styles.transactionCard}>
                <ThemedView style={styles.transactionPrimaryRow}>
                  <ThemedText type="defaultSemiBold">{transaction.category}</ThemedText>
                  <ThemedText style={[styles.transactionAmount, { color: amountColor }]}>
                    {formatMinorUnits(signedAmount, currencySymbol, currencyFractionDigits)}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.transactionMetaRow}>
                  <ThemedText style={styles.transactionMetaText}>
                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                  </ThemedText>
                  <ThemedText style={styles.transactionMetaText}>
                    {formatIsoDateForDisplay(transaction.date)}
                  </ThemedText>
                </ThemedView>
                {transaction.note ? (
                  <ThemedText style={styles.transactionNoteText}>{transaction.note}</ThemedText>
                ) : null}
              </ThemedView>
            );
          })}
        </ThemedView>
      )}

      <Modal
        animationType="fade"
        onRequestClose={() => setIsWalletSelectorOpen(false)}
        transparent
        visible={isWalletSelectorOpen}
      >
        <Pressable
          onPress={() => setIsWalletSelectorOpen(false)}
          style={styles.walletMenuOverlay}
        >
          <Pressable style={styles.menuCard}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onSelectWalletContext('all')}
              style={styles.menuItem}
            >
              <ThemedView style={styles.menuItemContent}>
                <MaterialIcons color="#5c5c5c" name="account-balance" size={18} />
                <ThemedText>All Wallets</ThemedText>
              </ThemedView>
              {selectedContext === 'all' ? (
                <MaterialIcons color="#0a7ea4" name="check" size={18} />
              ) : null}
            </Pressable>

            {wallets.map((wallet) => (
              <Pressable
                key={wallet.id}
                accessibilityRole="button"
                onPress={() => onSelectWalletContext(wallet.id)}
                style={styles.menuItem}
              >
                <ThemedView style={styles.menuItemContent}>
                  <MaterialIcons
                    color="#5c5c5c"
                    name={getWalletMaterialIconName(wallet.iconKey)}
                    size={18}
                  />
                  <ThemedText>{wallet.name}</ThemedText>
                </ThemedView>
                {selectedContext === wallet.id ? (
                  <MaterialIcons color="#0a7ea4" name="check" size={18} />
                ) : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsActionsMenuOpen(false)}
        transparent
        visible={isActionsMenuOpen}
      >
        <Pressable
          onPress={() => setIsActionsMenuOpen(false)}
          style={styles.actionsMenuOverlay}
        >
          <Pressable style={styles.menuCard}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onOpenAction('Transfer')}
              style={styles.menuItem}
            >
              <ThemedText>Transfer</ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onOpenAction('Adjust balance')}
              style={styles.menuItem}
            >
              <ThemedText>Adjust balance</ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 88,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtitle: {
    opacity: 0.8,
  },
  transactionCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d8d8d8',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  transactionPrimaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transactionAmount: {
    fontWeight: '600',
  },
  transactionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transactionMetaText: {
    opacity: 0.75,
  },
  transactionNoteText: {
    opacity: 0.85,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  walletSelectorButton: {
    width: 'auto',
    paddingHorizontal: 8,
    flexDirection: 'row',
    gap: 2,
  },
  totalText: {
    fontSize: 22,
  },
  walletMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 128,
    paddingHorizontal: 16,
  },
  actionsMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 128,
    paddingHorizontal: 16,
  },
  menuCard: {
    minWidth: 210,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d8d8d8',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
