import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedToggleProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: SegmentedToggleProps<T>) {
  return (
    <ThemedView style={styles.segmentedControl}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segmentButton, isActive ? styles.segmentButtonActive : undefined]}
          >
            <ThemedText style={isActive ? styles.segmentButtonActiveText : undefined}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  segmentedControl: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 12,
    overflow: "hidden",
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#f4f4f4",
  },
  segmentButtonActive: {
    backgroundColor: "#0a7ea4",
  },
  segmentButtonActiveText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
