import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
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
import { createWallet, setLastUsedWalletContext } from "@/domain/services";
import {
  getWalletMaterialIconName,
  WALLET_ICON_OPTIONS,
  WalletIconKey,
} from "@/domain/wallet-icon";
import { formatAmountInput, parseAmountToMinorUnits } from "@/utils/money-format";

export function FirstWalletScreen() {
  const router = useRouter();
  const [walletName, setWalletName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [selectedIconKey, setSelectedIconKey] =
    useState<WalletIconKey>("wallet");
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parsedInitialBalance = useMemo(
    () => parseAmountToMinorUnits(initialBalance),
    [initialBalance],
  );
  const isWalletNameValid = walletName.trim().length > 0;
  const isFormValid = isWalletNameValid && parsedInitialBalance !== null;

  const onSaveWallet = async () => {
    if (!isFormValid || isSaving || parsedInitialBalance === null) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      const wallet = await createWallet(
        walletName,
        parsedInitialBalance,
        selectedIconKey,
      );
      await setLastUsedWalletContext(wallet.id);
      router.replace("/(tabs)");
    } catch {
      setErrorMessage("Unable to create wallet. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const onChangeInitialBalance = (text: string) => {
    const normalized = text.replace(/,/g, "");
    if (!normalized) {
      setInitialBalance("");
      return;
    }

    if (!/^-?\d*(\.\d{0,2})?$/.test(normalized)) {
      return;
    }

    setInitialBalance(formatAmountInput(normalized));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title">Create Your First Wallet</ThemedText>
          <ThemedText style={styles.subtitle}>
            Add a wallet name and starting balance to begin tracking
            transactions.
          </ThemedText>

          <ThemedView style={styles.formSection}>
            <ThemedText type="defaultSemiBold">Wallet name</ThemedText>
            <ThemedView style={styles.walletRow}>
              <Pressable
                accessibilityLabel="Choose wallet icon"
                accessibilityRole="button"
                onPress={() => setIsIconPickerOpen(true)}
                style={styles.iconDropdownTrigger}
              >
                <MaterialIcons
                  color="#0a7ea4"
                  name={getWalletMaterialIconName(selectedIconKey)}
                  size={20}
                />
                <MaterialIcons
                  color="#5c5c5c"
                  name="arrow-drop-down"
                  size={20}
                />
              </Pressable>
              <TextInput
                accessibilityLabel="Wallet name"
                autoCapitalize="words"
                autoCorrect={false}
                onChangeText={setWalletName}
                onFocus={() => setIsIconPickerOpen(false)}
                placeholder="e.g. Cash"
                style={[styles.input, styles.walletNameInput]}
                value={walletName}
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.formSection}>
            <ThemedText type="defaultSemiBold">Initial balance</ThemedText>
            <TextInput
              accessibilityLabel="Initial balance"
              keyboardType="decimal-pad"
              onChangeText={onChangeInitialBalance}
              placeholder="0.00"
              style={styles.input}
              value={initialBalance}
            />
            <ThemedText style={styles.helpText}>
              Use a number with up to 2 decimals
            </ThemedText>
          </ThemedView>

          {parsedInitialBalance === null ? (
            <ThemedText style={styles.errorText}>
              Enter a valid amount.
            </ThemedText>
          ) : null}
          {errorMessage ? (
            <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={!isFormValid || isSaving}
            onPress={onSaveWallet}
            style={[
              styles.saveButton,
              !isFormValid || isSaving ? styles.saveButtonDisabled : undefined,
            ]}
          >
            <ThemedText style={styles.saveButtonText}>
              {isSaving ? "Saving..." : "Create wallet"}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsIconPickerOpen(false)}
        transparent
        visible={isIconPickerOpen}
      >
        <Pressable
          onPress={() => setIsIconPickerOpen(false)}
          style={styles.iconModalOverlay}
        >
          <Pressable style={styles.iconModalCard}>
            <ThemedText type="defaultSemiBold">Choose an icon</ThemedText>
            <ThemedView style={styles.iconGrid}>
              {WALLET_ICON_OPTIONS.map((option) => {
                const isSelected = selectedIconKey === option.key;

                return (
                  <Pressable
                    key={option.key}
                    accessibilityRole="button"
                    onPress={() => {
                      setSelectedIconKey(option.key);
                      setIsIconPickerOpen(false);
                    }}
                    style={[
                      styles.iconGridItem,
                      isSelected ? styles.iconGridItemSelected : undefined,
                    ]}
                  >
                    <MaterialIcons
                      color={isSelected ? "#0a7ea4" : "#5c5c5c"}
                      name={getWalletMaterialIconName(option.key)}
                      size={22}
                    />
                  </Pressable>
                );
              })}
            </ThemedView>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 88,
    paddingBottom: 32,
    gap: 16,
  },
  subtitle: {
    opacity: 0.8,
  },
  formSection: {
    gap: 8,
  },
  walletRow: {
    flexDirection: "row",
    gap: 8,
  },
  iconDropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#bdbdbd",
    borderRadius: 12,
    width: 64,
  },
  walletNameInput: {
    flex: 1,
  },
  iconModalOverlay: {
    flex: 1,
    backgroundColor: "#00000050",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconModalCard: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 12,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  iconGridItem: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    alignItems: "center",
    justifyContent: "center",
  },
  iconGridItemSelected: {
    borderColor: "#0a7ea4",
    backgroundColor: "#0a7ea410",
  },
  input: {
    borderWidth: 1,
    borderColor: "#bdbdbd",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  helpText: {
    opacity: 0.7,
  },
  errorText: {
    color: "#c0392b",
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
});
