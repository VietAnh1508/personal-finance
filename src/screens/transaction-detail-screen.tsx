import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { useToast } from '@/components/ui/toast-provider';
import {
  deleteTransactionById,
  getAllActiveWallets,
  getTransactionDetails,
  updateAdjustmentTransaction,
  updateIncomeExpenseTransaction,
  updateTransferTransaction,
} from '@/domain/services';
import { IncomeExpenseTransactionType } from '@/domain/transaction-type';
import { getWalletMaterialIconName } from '@/domain/wallet-icon';
import {
  formatDateToIso,
  formatIsoDateForDisplay,
  isIsoDate,
  parseIsoDate,
} from '@/utils/date-format';
import {
  formatAmountInput,
  isValidAmountInput,
  parseAmountToMinorUnits,
} from '@/utils/money-format';
import { AdjustmentSection } from '@/screens/transaction-detail/adjustment-section';
import { IncomeExpenseSection } from '@/screens/transaction-detail/income-expense-section';
import { TransactionTitle } from '@/screens/transaction-detail/transaction-title';
import { TransferSection } from '@/screens/transaction-detail/transfer-section';
import { AdjustmentDirection, WalletOption } from '@/screens/transaction-detail/types';

type WalletPickerTarget = 'single' | 'from' | 'to' | null;

function formatMinorToInput(amount: number): string {
  const absolute = Math.abs(amount);
  const majorValue = (absolute / 100).toString();
  return formatAmountInput(majorValue);
}

export function TransactionDetailScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const transactionId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [transactionType, setTransactionType] = useState<IncomeExpenseTransactionType>('expense');
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [direction, setDirection] = useState<AdjustmentDirection>('increase');
  const [amountInput, setAmountInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [pickerDate, setPickerDate] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [walletPickerTarget, setWalletPickerTarget] = useState<WalletPickerTarget>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'income_expense' | 'transfer' | 'adjustment' | null>(null);

  const parsedAmount = parseAmountToMinorUnits(amountInput);
  const isDateValid = dateInput.length > 0 && isIsoDate(dateInput);
  const isAmountValid =
    parsedAmount !== null &&
    (mode === 'adjustment' ? parsedAmount > 0 : parsedAmount !== null && parsedAmount > 0);

  const isFormValid =
    mode === 'income_expense'
      ? selectedWalletId.length > 0 &&
        isAmountValid &&
        categoryInput.trim().length > 0 &&
        isDateValid
      : mode === 'transfer'
        ? fromWalletId.length > 0 &&
          toWalletId.length > 0 &&
          fromWalletId !== toWalletId &&
          isAmountValid &&
          isDateValid
        : mode === 'adjustment'
          ? selectedWalletId.length > 0 && isAmountValid && isDateValid
          : false;

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!transactionId?.trim()) {
        setErrorMessage('Missing transaction id.');
        return;
      }

      const [activeWallets, details] = await Promise.all([
        getAllActiveWallets(),
        getTransactionDetails(transactionId),
      ]);

      if (!isMounted) {
        return;
      }

      setWallets(activeWallets);

      if (!details) {
        setErrorMessage('Transaction not found.');
        return;
      }

      const { transaction, linkedTransaction } = details;
      setAmountInput(formatMinorToInput(transaction.amount));
      setDateInput(transaction.date);
      setPickerDate(parseIsoDate(transaction.date) ?? new Date());
      setNoteInput(transaction.note ?? '');

      if (transaction.type === 'income' || transaction.type === 'expense') {
        setMode('income_expense');
        setSelectedWalletId(transaction.walletId);
        setTransactionType(transaction.type);
        setCategoryInput(transaction.category);
        return;
      }

      if (transaction.type === 'adjustment') {
        setMode('adjustment');
        setSelectedWalletId(transaction.walletId);
        setDirection(transaction.amount < 0 ? 'decrease' : 'increase');
        return;
      }

      if (!linkedTransaction) {
        setErrorMessage('Transfer pair is incomplete and cannot be edited.');
        return;
      }

      setMode('transfer');
      if (transaction.type === 'transfer_out') {
        setFromWalletId(transaction.walletId);
        setToWalletId(linkedTransaction.walletId);
      } else {
        setFromWalletId(linkedTransaction.walletId);
        setToWalletId(transaction.walletId);
      }
    };

    void loadData().catch(() => {
      if (isMounted) {
        setErrorMessage('Unable to load transaction details.');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [transactionId]);

  const onChangeAmount = (text: string) => {
    const normalized = text.replace(/,/g, '');
    if (!normalized) {
      setAmountInput('');
      return;
    }

    if (!isValidAmountInput(normalized)) {
      return;
    }

    setAmountInput(formatAmountInput(normalized));
  };

  const openDatePicker = () => {
    setPickerDate(parseIsoDate(dateInput) ?? new Date());
    setIsDatePickerOpen(true);
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        setIsDatePickerOpen(false);
        return;
      }

      if (selectedDate) {
        setDateInput(formatDateToIso(selectedDate));
      }
      setIsDatePickerOpen(false);
      return;
    }

    if (selectedDate) {
      setPickerDate(selectedDate);
    }
  };

  const onSave = async () => {
    if (!transactionId || !mode || !isFormValid || isSaving || parsedAmount === null || parsedAmount <= 0) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      if (mode === 'income_expense') {
        await updateIncomeExpenseTransaction({
          transactionId,
          walletId: selectedWalletId,
          type: transactionType,
          amount: parsedAmount,
          category: categoryInput,
          date: dateInput,
          note: noteInput,
        });
      }

      if (mode === 'transfer') {
        await updateTransferTransaction({
          transactionId,
          fromWalletId,
          toWalletId,
          amount: parsedAmount,
          date: dateInput,
          note: noteInput,
        });
      }

      if (mode === 'adjustment') {
        await updateAdjustmentTransaction({
          transactionId,
          walletId: selectedWalletId,
          amount: direction === 'decrease' ? -parsedAmount : parsedAmount,
          date: dateInput,
          note: noteInput,
        });
      }

      showToast({ message: 'Transaction updated.', type: 'success' });
      router.back();
    } catch {
      setErrorMessage('Unable to save changes. Please try again.');
      showToast({ message: 'Unable to save changes. Please try again.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = () => {
    if (!transactionId || isDeleting) {
      return;
    }

    Alert.alert(
      'Delete transaction?',
      'This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setIsDeleting(true);
            deleteTransactionById(transactionId)
              .then(() => {
                showToast({ message: 'Transaction deleted.', type: 'success' });
                router.back();
              })
              .catch(() => {
                setErrorMessage('Unable to delete transaction. Please try again.');
                showToast({ message: 'Unable to delete transaction. Please try again.', type: 'error' });
              })
              .finally(() => {
                setIsDeleting(false);
              });
          },
        },
      ]
    );
  };

  if (!mode && !errorMessage) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        style={styles.scrollView}
      >
        <ThemedView style={styles.container}>
          <TransactionTitle mode={mode} transactionType={transactionType} />

          {mode === 'income_expense' ? (
            <IncomeExpenseSection
              categoryInput={categoryInput}
              onChangeCategory={setCategoryInput}
              onChangeTransactionType={setTransactionType}
              onOpenWalletPicker={() => setWalletPickerTarget('single')}
              selectedWalletId={selectedWalletId}
              transactionType={transactionType}
              wallets={wallets}
            />
          ) : null}

          {mode === 'transfer' ? (
            <TransferSection
              fromWalletId={fromWalletId}
              onOpenFromWalletPicker={() => setWalletPickerTarget('from')}
              onOpenToWalletPicker={() => setWalletPickerTarget('to')}
              toWalletId={toWalletId}
              wallets={wallets}
            />
          ) : null}

          {mode === 'adjustment' ? (
            <AdjustmentSection
              direction={direction}
              onChangeDirection={setDirection}
              onOpenWalletPicker={() => setWalletPickerTarget('single')}
              selectedWalletId={selectedWalletId}
              wallets={wallets}
            />
          ) : null}

          <ThemedView style={styles.formSection}>
            <ThemedText type="defaultSemiBold">Amount</ThemedText>
            <TextInput
              accessibilityLabel="Amount"
              keyboardType="decimal-pad"
              onChangeText={onChangeAmount}
              placeholder="0"
              style={styles.input}
              value={amountInput}
            />
            {!isAmountValid ? (
              <ThemedText style={styles.errorText}>Enter a valid amount.</ThemedText>
            ) : null}
          </ThemedView>

          <ThemedView style={styles.formSection}>
            <ThemedText type="defaultSemiBold">Date</ThemedText>
            <Pressable accessibilityRole="button" onPress={openDatePicker} style={styles.input}>
              <ThemedView style={styles.dateInputRow}>
                <ThemedText>{isDateValid ? formatIsoDateForDisplay(dateInput) : 'Select date'}</ThemedText>
                <MaterialIcons color="#5c5c5c" name="calendar-today" size={18} />
              </ThemedView>
            </Pressable>
          </ThemedView>

          <ThemedView style={styles.formSection}>
            <ThemedText type="defaultSemiBold">Note (optional)</ThemedText>
            <TextInput
              accessibilityLabel="Note"
              multiline
              onChangeText={setNoteInput}
              placeholder="Add note"
              style={[styles.input, styles.noteInput]}
              value={noteInput}
            />
          </ThemedView>

          {errorMessage ? <ThemedText style={styles.errorText}>{errorMessage}</ThemedText> : null}

          <Pressable
            disabled={!isFormValid || isSaving || isDeleting}
            onPress={onSave}
            style={[styles.saveButton, !isFormValid || isSaving || isDeleting ? styles.saveButtonDisabled : undefined]}
          >
            <ThemedText style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save changes'}</ThemedText>
          </Pressable>

          <Pressable
            disabled={isSaving || isDeleting}
            onPress={onDelete}
            style={[styles.deleteButton, isSaving || isDeleting ? styles.saveButtonDisabled : undefined]}
          >
            <ThemedText style={styles.deleteButtonText}>
              {isDeleting ? 'Deleting...' : 'Delete transaction'}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setWalletPickerTarget(null)}
        transparent
        visible={walletPickerTarget !== null}
      >
        <Pressable onPress={() => setWalletPickerTarget(null)} style={styles.walletModalOverlay}>
          <Pressable style={styles.walletModalCard}>
            {wallets.map((wallet) => (
              <Pressable
                key={wallet.id}
                onPress={() => {
                  if (walletPickerTarget === 'single') {
                    setSelectedWalletId(wallet.id);
                  } else if (walletPickerTarget === 'from') {
                    setFromWalletId(wallet.id);
                  } else if (walletPickerTarget === 'to') {
                    setToWalletId(wallet.id);
                  }
                  setWalletPickerTarget(null);
                }}
                style={styles.walletModalItem}
              >
                <ThemedView style={styles.walletPickerContent}>
                  <MaterialIcons
                    color="#5c5c5c"
                    name={getWalletMaterialIconName(wallet.iconKey)}
                    size={20}
                  />
                  <ThemedText>{wallet.name}</ThemedText>
                </ThemedView>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsDatePickerOpen(false)}
        transparent
        visible={isDatePickerOpen && Platform.OS === 'ios'}
      >
        <Pressable onPress={() => setIsDatePickerOpen(false)} style={styles.walletModalOverlay}>
          <Pressable style={styles.dateModalCard}>
            <DateTimePicker display="spinner" mode="date" onChange={onChangeDate} value={pickerDate} />
            <ThemedView style={styles.dateModalActions}>
              <Pressable onPress={() => setIsDatePickerOpen(false)} style={styles.dateModalAction}>
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => {
                  setDateInput(formatDateToIso(pickerDate));
                  setIsDatePickerOpen(false);
                }}
                style={styles.dateModalAction}
              >
                <ThemedText style={styles.dateDoneText}>Done</ThemedText>
              </Pressable>
            </ThemedView>
          </Pressable>
        </Pressable>
      </Modal>

      {isDatePickerOpen && Platform.OS === 'android' ? (
        <DateTimePicker
          display="default"
          mode="date"
          onChange={onChangeDate}
          value={parseIsoDate(dateInput) ?? new Date()}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  scrollView: {
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  container: {
    gap: 16,
    backgroundColor: '#fff',
  },
  formSection: {
    gap: 8,
  },
  walletPickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  noteInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  dateInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#c0392b',
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
  },
  saveButtonDisabled: {
    opacity: 0.55,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c0392b',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  walletModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  walletModalCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d8d8d8',
  },
  walletModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateModalCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dateModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#d8d8d8',
  },
  dateModalAction: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateDoneText: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
});
