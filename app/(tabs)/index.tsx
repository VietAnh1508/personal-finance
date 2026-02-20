import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TransactionEntry } from "@/data/repositories";
import {
  CurrencyCode,
  getCurrencyFractionDigits,
  getCurrencySymbol,
} from "@/domain/currency";
import {
  getAllActiveWallets,
  getLastUsedWalletContext,
  getSelectedCurrency,
  getSignedTransactionAmount,
  getTransactionsForWalletContext,
  setLastUsedWalletContext,
} from "@/domain/services";
import { WalletIconKey, getWalletMaterialIconName } from "@/domain/wallet-icon";
import {
  formatIsoDateDayNumber,
  formatIsoDateMonthYear,
  formatIsoDateWeekday,
} from "@/utils/date-format";
import { formatMinorUnits } from "@/utils/money-format";

type WalletContextValue = "all" | string;
type DateSection = {
  date: string;
  dayNumber: string;
  weekdayLabel: string;
  monthYearLabel: string;
  dailyNet: number;
  transactions: TransactionEntry[];
};

function formatSignedMinorUnits(
  amount: number,
  currencySymbol: string,
  fractionDigits: number,
): string {
  if (amount === 0) {
    return formatMinorUnits(0, currencySymbol, fractionDigits);
  }

  const sign = amount > 0 ? "+" : "-";
  return `${sign}${formatMinorUnits(Math.abs(amount), currencySymbol, fractionDigits)}`;
}

export default function TransactionsScreen() {
  const router = useRouter();
  const [wallets, setWallets] = useState<
    {
      id: string;
      name: string;
      initialBalance: number;
      iconKey: WalletIconKey;
    }[]
  >([]);
  const [transactions, setTransactions] = useState<TransactionEntry[]>([]);
  const [selectedContext, setSelectedContext] =
    useState<WalletContextValue>("all");
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>("USD");
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const selectedWallet =
    wallets.find((wallet) => wallet.id === selectedContext) ?? null;
  const netByWalletId: Record<string, number> = {};
  for (const transaction of transactions) {
    const signedAmount = getSignedTransactionAmount(transaction);
    netByWalletId[transaction.walletId] =
      (netByWalletId[transaction.walletId] ?? 0) + signedAmount;
  }
  const visibleTransactions = useMemo(() => {
    if (selectedContext === "all") {
      return transactions;
    }

    return transactions.filter(
      (transaction) => transaction.walletId === selectedContext,
    );
  }, [selectedContext, transactions]);
  const dateSections = useMemo<DateSection[]>(() => {
    const sectionsByDate = new Map<string, DateSection>();

    for (const transaction of visibleTransactions) {
      const signedAmount = getSignedTransactionAmount(transaction);
      const existingSection = sectionsByDate.get(transaction.date);

      if (existingSection) {
        existingSection.transactions.push(transaction);
        existingSection.dailyNet += signedAmount;
        continue;
      }

      sectionsByDate.set(transaction.date, {
        date: transaction.date,
        dayNumber: formatIsoDateDayNumber(transaction.date),
        weekdayLabel: formatIsoDateWeekday(transaction.date),
        monthYearLabel: formatIsoDateMonthYear(transaction.date),
        dailyNet: signedAmount,
        transactions: [transaction],
      });
    }

    return Array.from(sectionsByDate.values());
  }, [visibleTransactions]);
  const displayedTotalMinorUnits =
    selectedContext === "all"
      ? wallets.reduce(
          (total, wallet) =>
            total + wallet.initialBalance + (netByWalletId[wallet.id] ?? 0),
          0,
        )
      : (selectedWallet?.initialBalance ?? 0) +
        (selectedWallet ? (netByWalletId[selectedWallet.id] ?? 0) : 0);
  const selectorIconName =
    selectedContext === "all"
      ? "account-balance"
      : getWalletMaterialIconName(selectedWallet?.iconKey ?? "wallet");
  const selectedContextLabel =
    selectedContext === "all" ? "All Wallets" : (selectedWallet?.name ?? "Wallet");
  const currencyFractionDigits = getCurrencyFractionDigits(currencyCode);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadContextData = async () => {
        try {
          const [activeWallets, selectedCurrency, lastUsedWalletContext] =
            await Promise.all([
              getAllActiveWallets(),
              getSelectedCurrency(),
              getLastUsedWalletContext(),
            ]);
          const allTransactions = await getTransactionsForWalletContext("all");

          const normalizedContext =
            lastUsedWalletContext &&
            activeWallets.some((wallet) => wallet.id === lastUsedWalletContext)
              ? lastUsedWalletContext
              : "all";

          if (normalizedContext !== lastUsedWalletContext) {
            setLastUsedWalletContext(normalizedContext).catch(() => {
              // Ignore persistence errors and keep UI responsive.
            });
          }

          if (isMounted) {
            setWallets(activeWallets);
            setTransactions(allTransactions);
            setCurrencyCode(selectedCurrency ?? "USD");
            setCurrencySymbol(
              selectedCurrency ? getCurrencySymbol(selectedCurrency) : "$",
            );
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
    }, []),
  );

  const onSelectWalletContext = (context: WalletContextValue) => {
    setSelectedContext(context);
    setIsWalletSelectorOpen(false);
    setLastUsedWalletContext(context).catch(() => {
      // Ignore persistence errors and keep UI responsive.
    });
  };

  const onOpenAction = (actionLabel: "Transfer" | "Adjust balance") => {
    setIsActionsMenuOpen(false);
    if (actionLabel === "Transfer" && wallets.length < 2) {
      Alert.alert(
        "Transfer unavailable",
        "At least two active wallets are required.",
      );
      return;
    }

    if (actionLabel === "Transfer") {
      router.push("/transactions/transfer");
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
              <MaterialIcons
                color="#5c5c5c"
                name={selectorIconName}
                size={20}
              />
              <MaterialIcons
                color="#5c5c5c"
                name="keyboard-arrow-down"
                size={16}
              />
            </Pressable>

            <ThemedView style={styles.totalContainer}>
              <ThemedText style={styles.selectedContextText}>
                {selectedContextLabel}
              </ThemedText>
              <ThemedText style={styles.totalText} type="defaultSemiBold">
                {formatMinorUnits(
                  displayedTotalMinorUnits,
                  currencySymbol,
                  currencyFractionDigits,
                )}
              </ThemedText>
            </ThemedView>

            <Pressable
              accessibilityLabel="Open actions menu"
              accessibilityRole="button"
              onPress={() => setIsActionsMenuOpen(true)}
              style={styles.iconButton}
            >
              <MaterialIcons color="#5c5c5c" name="more-vert" size={20} />
            </Pressable>
          </ThemedView>
          <ThemedView style={styles.topListDivider} />

          <ScrollView
            contentContainerStyle={styles.listContentContainer}
            showsVerticalScrollIndicator={false}
            style={styles.listScrollView}
          >
            {visibleTransactions.length === 0 ? (
              <ThemedText style={styles.subtitle}>
                No transactions yet.
              </ThemedText>
            ) : null}
            {dateSections.map((section) => (
              <ThemedView key={section.date} style={styles.sectionContainer}>
                <ThemedView style={styles.sectionHeader}>
                  <ThemedView style={styles.sectionTitleContainer}>
                    <ThemedText
                      style={styles.sectionDayNumber}
                      type="defaultSemiBold"
                    >
                      {section.dayNumber}
                    </ThemedText>
                    <ThemedView style={styles.sectionDateTextContainer}>
                      <ThemedText style={styles.sectionWeekdayText}>
                        {section.weekdayLabel}
                      </ThemedText>
                      <ThemedText style={styles.sectionMonthYearText}>
                        {section.monthYearLabel}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <ThemedText
                    style={styles.sectionNetAmount}
                    type="defaultSemiBold"
                  >
                    {formatSignedMinorUnits(
                      section.dailyNet,
                      currencySymbol,
                      currencyFractionDigits,
                    )}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.sectionDivider} />

                <ThemedView style={styles.sectionBody}>
                  {section.transactions.map((transaction, transactionIndex) => {
                    const signedAmount =
                      getSignedTransactionAmount(transaction);
                    const amountColor =
                      signedAmount < 0 ? "#c0392b" : "#1f8b4c";

                    return (
                      <ThemedView
                        key={transaction.id}
                        style={[
                          styles.transactionCard,
                          transactionIndex > 0
                            ? styles.transactionCardWithDivider
                            : null,
                        ]}
                      >
                        <ThemedView style={styles.transactionPrimaryRow}>
                          <ThemedText type="defaultSemiBold">
                            {transaction.category}
                          </ThemedText>
                          <ThemedText
                            style={[
                              styles.transactionAmount,
                              { color: amountColor },
                            ]}
                          >
                            {formatMinorUnits(
                              Math.abs(signedAmount),
                              currencySymbol,
                              currencyFractionDigits,
                            )}
                          </ThemedText>
                        </ThemedView>
                        {transaction.note ? (
                          <ThemedText style={styles.transactionNoteText}>
                            {transaction.note}
                          </ThemedText>
                        ) : null}
                      </ThemedView>
                    );
                  })}
                </ThemedView>
              </ThemedView>
            ))}
          </ScrollView>
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
              onPress={() => onSelectWalletContext("all")}
              style={styles.menuItem}
            >
              <ThemedView style={styles.menuItemContent}>
                <MaterialIcons
                  color="#5c5c5c"
                  name="account-balance"
                  size={18}
                />
                <ThemedText>All Wallets</ThemedText>
              </ThemedView>
              {selectedContext === "all" ? (
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
              onPress={() => onOpenAction("Transfer")}
              style={styles.menuItem}
            >
              <ThemedText>Transfer</ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onOpenAction("Adjust balance")}
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
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 12,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subtitle: {
    opacity: 0.8,
  },
  sectionContainer: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d6d6d6",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionDateTextContainer: {
    justifyContent: "center",
    gap: 1,
  },
  sectionDayNumber: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "600",
    opacity: 0.9,
  },
  sectionWeekdayText: {
    fontSize: 15,
    lineHeight: 20,
    opacity: 0.9,
  },
  sectionMonthYearText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.68,
  },
  sectionNetAmount: {
    fontSize: 16,
    lineHeight: 22,
    color: "#111111",
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e1e1e1",
  },
  sectionBody: {
    padding: 10,
    gap: 0,
  },
  transactionCard: {
    paddingHorizontal: 6,
    paddingVertical: 12,
    gap: 4,
  },
  transactionCardWithDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e8e8e8",
  },
  topListDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#cfcfcf",
    marginTop: -4,
    marginBottom: 2,
  },
  listScrollView: {
    flex: 1,
  },
  listContentContainer: {
    paddingTop: 10,
    paddingBottom: 40,
    gap: 12,
  },
  transactionPrimaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  transactionAmount: {
    fontWeight: "600",
  },
  transactionNoteText: {
    fontSize: 14,
    opacity: 0.62,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  walletSelectorButton: {
    width: "auto",
    paddingHorizontal: 8,
    flexDirection: "row",
    gap: 2,
  },
  totalText: {
    fontSize: 22,
  },
  totalContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  selectedContextText: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.7,
  },
  walletMenuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.16)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 128,
    paddingHorizontal: 16,
  },
  actionsMenuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.16)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 128,
    paddingHorizontal: 16,
  },
  menuCard: {
    minWidth: 210,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d8d8d8",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
