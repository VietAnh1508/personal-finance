import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useToast } from "@/components/ui/toast-provider";
import {
  createTransferTransaction,
  getAllActiveWallets,
  getLastUsedWalletContext,
} from "@/domain/services";
import { WalletIconKey, getWalletMaterialIconName } from "@/domain/wallet-icon";
import {
  formatDateToIso,
  formatIsoDateForDisplay,
  isIsoDate,
  parseIsoDate,
  todayIsoDate,
} from "@/utils/date-format";
import { formatAmountInput, parseAmountToMinorUnits } from "@/utils/money-format";

type WalletOption = {
  id: string;
  name: string;
  iconKey: WalletIconKey;
};

type WalletPickerTarget = "from" | "to" | null;

export function AddTransferScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [dateInput, setDateInput] = useState(todayIsoDate());
  const [pickerDate, setPickerDate] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [walletPickerTarget, setWalletPickerTarget] =
    useState<WalletPickerTarget>(null);
  const [isSaving, setIsSaving] = useState(false);

  const parsedAmount = parseAmountToMinorUnits(amountInput);
  const isAmountValid = parsedAmount !== null && parsedAmount > 0;
  const isDateValid = isIsoDate(dateInput);
  const areWalletsDifferent = fromWalletId.length > 0 && toWalletId.length > 0 && fromWalletId !== toWalletId;
  const isFormValid =
    fromWalletId.length > 0 &&
    toWalletId.length > 0 &&
    areWalletsDifferent &&
    isAmountValid &&
    isDateValid;

  const fromWallet = wallets.find((wallet) => wallet.id === fromWalletId) ?? null;
  const toWallet = wallets.find((wallet) => wallet.id === toWalletId) ?? null;

  useEffect(() => {
    let isMounted = true;

    const loadWallets = async () => {
      const [activeWallets, walletContext] = await Promise.all([
        getAllActiveWallets(),
        getLastUsedWalletContext(),
      ]);
      if (!isMounted) {
        return;
      }

      setWallets(activeWallets);
      const preselectedFromWalletId =
        walletContext &&
        walletContext !== "all" &&
        activeWallets.some((wallet) => wallet.id === walletContext)
          ? walletContext
          : "";
      setFromWalletId(preselectedFromWalletId);
      setToWalletId("");
    };

    void loadWallets();

    return () => {
      isMounted = false;
    };
  }, []);

  const onChangeAmount = (text: string) => {
    const normalized = text.replace(/,/g, "");
    if (!normalized) {
      setAmountInput("");
      return;
    }

    if (!/^\d*(\.\d{0,2})?$/.test(normalized)) {
      return;
    }

    setAmountInput(formatAmountInput(normalized));
  };

  const onSave = async () => {
    if (!isFormValid || isSaving || parsedAmount === null || parsedAmount <= 0) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      await createTransferTransaction({
        fromWalletId,
        toWalletId,
        amount: parsedAmount,
        date: dateInput,
        note: noteInput,
      });
      showToast({ message: "Transfer saved.", type: "success" });
      router.back();
    } catch {
      setErrorMessage("Unable to save transfer. Please try again.");
      showToast({
        message: "Unable to save transfer. Please try again.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openDatePicker = () => {
    setPickerDate(parseIsoDate(dateInput) ?? new Date());
    setIsDatePickerOpen(true);
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      if (event.type === "dismissed") {
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title">Transfer</ThemedText>

          <ThemedView style={styles.formSection}>
            <ThemedText type="defaultSemiBold">From wallet</ThemedText>
            <Pressable
              onPress={() => setWalletPickerTarget("from")}
              style={styles.walletPickerButton}
            >
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
            <Pressable
              onPress={() => setWalletPickerTarget("to")}
              style={styles.walletPickerButton}
            >
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
            {fromWalletId.length > 0 && toWalletId.length > 0 && !areWalletsDifferent ? (
              <ThemedText style={styles.errorText}>
                From wallet and to wallet must be different.
              </ThemedText>
            ) : null}
          </ThemedView>

          <ThemedView style={styles.formSection}>
            <ThemedText type="defaultSemiBold">Amount</ThemedText>
            <TextInput
              accessibilityLabel="Amount"
              keyboardType="decimal-pad"
              onChangeText={onChangeAmount}
              placeholder="0.00"
              style={styles.input}
              value={amountInput}
            />
            {!isAmountValid ? (
              <ThemedText style={styles.errorText}>Enter a positive amount.</ThemedText>
            ) : null}
          </ThemedView>

          <ThemedView style={styles.formSection}>
            <ThemedText type="defaultSemiBold">Date</ThemedText>
            <Pressable accessibilityRole="button" onPress={openDatePicker} style={styles.input}>
              <ThemedView style={styles.dateInputRow}>
                <ThemedText>{formatIsoDateForDisplay(dateInput)}</ThemedText>
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
            disabled={!isFormValid || isSaving}
            onPress={onSave}
            style={[styles.saveButton, !isFormValid || isSaving ? styles.saveButtonDisabled : undefined]}
          >
            <ThemedText style={styles.saveButtonText}>
              {isSaving ? "Saving..." : "Save transfer"}
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
                  if (walletPickerTarget === "from") {
                    setFromWalletId(wallet.id);
                  } else if (walletPickerTarget === "to") {
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
                {(walletPickerTarget === "from" && wallet.id === fromWalletId) ||
                (walletPickerTarget === "to" && wallet.id === toWalletId) ? (
                  <MaterialIcons color="#0a7ea4" name="check" size={18} />
                ) : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsDatePickerOpen(false)}
        transparent
        visible={isDatePickerOpen && Platform.OS === "ios"}
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

      {isDatePickerOpen && Platform.OS === "android" ? (
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
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 14,
  },
  formSection: {
    gap: 8,
  },
  walletPickerButton: {
    borderWidth: 1,
    borderColor: "#bdbdbd",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletPickerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    borderWidth: 1,
    borderColor: "#bdbdbd",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noteInput: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: "auto",
    borderRadius: 12,
    backgroundColor: "#0a7ea4",
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  errorText: {
    color: "#c0392b",
  },
  walletModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.16)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  walletModalCard: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d8d8d8",
  },
  walletModalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  dateModalCard: {
    borderRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  dateModalActions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  dateModalAction: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  dateDoneText: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
});
