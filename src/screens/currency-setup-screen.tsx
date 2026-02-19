import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { CURRENCY_OPTIONS, CurrencyCode } from '@/domain/currency';
import { selectCurrency } from '@/domain/services';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/ui/toast-provider';

export function CurrencySetupScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onContinue = async () => {
    if (!selectedCurrency || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      await selectCurrency(selectedCurrency);
      showToast({ message: 'Currency saved.', type: 'success' });
      router.replace('/first-wallet');
    } catch {
      setErrorMessage('Unable to save your currency. Please try again.');
      showToast({ message: 'Unable to save your currency. Please try again.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Choose Your Currency</ThemedText>
      <ThemedText style={styles.subtitle}>
        Pick one option to format all amounts in the app.
      </ThemedText>

      <ThemedView style={styles.optionsContainer}>
        {CURRENCY_OPTIONS.map((currency) => {
          const isSelected = selectedCurrency === currency.code;

          return (
            <Pressable
              key={currency.code}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelectedCurrency(currency.code)}
              style={[styles.optionButton, isSelected ? styles.optionButtonSelected : undefined]}>
              <ThemedText type="defaultSemiBold">{currency.label}</ThemedText>
              <ThemedText>{`${currency.code} (${currency.symbol})`}</ThemedText>
            </Pressable>
          );
        })}
      </ThemedView>

      {errorMessage ? <ThemedText style={styles.errorText}>{errorMessage}</ThemedText> : null}

      <Pressable
        accessibilityRole="button"
        disabled={!selectedCurrency || isSaving}
        onPress={onContinue}
        style={[
          styles.continueButton,
          !selectedCurrency || isSaving ? styles.continueButtonDisabled : undefined,
        ]}>
        <ThemedText style={styles.continueButtonText}>
          {isSaving ? 'Saving...' : 'Continue'}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  optionsContainer: {
    marginTop: 12,
    gap: 12,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  optionButtonSelected: {
    borderColor: '#0a7ea4',
    backgroundColor: '#0a7ea410',
  },
  continueButton: {
    marginTop: 'auto',
    borderRadius: 12,
    backgroundColor: '#0a7ea4',
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  errorText: {
    color: '#c0392b',
  },
});
