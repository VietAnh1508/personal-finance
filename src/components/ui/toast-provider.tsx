import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

export type ToastType = "success" | "error" | "info";

type ToastOptions = {
  message: string;
  type?: ToastType;
  durationMs?: number;
};

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
  durationMs: number;
};

type ToastContextValue = {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
};

const DEFAULT_DURATION_MS = 2200;

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function getBackgroundColor(type: ToastType): string {
  switch (type) {
    case "success":
      return "#1f8b4c";
    case "error":
      return "#c0392b";
    case "info":
    default:
      return "#0a7ea4";
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const nextIdRef = useRef(1);
  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;

  const clearDismissTimeout = useCallback(() => {
    if (!dismissTimeoutRef.current) {
      return;
    }

    clearTimeout(dismissTimeoutRef.current);
    dismissTimeoutRef.current = null;
  }, []);

  const hideToast = useCallback(() => {
    clearDismissTimeout();
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 140,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -12,
        duration: 140,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setToast(null);
      }
    });
  }, [clearDismissTimeout, opacity, translateY]);

  const showToast = useCallback(
    ({
      message,
      type = "info",
      durationMs = DEFAULT_DURATION_MS,
    }: ToastOptions) => {
      clearDismissTimeout();
      opacity.stopAnimation();
      translateY.stopAnimation();
      opacity.setValue(0);
      translateY.setValue(-12);

      setToast({
        id: nextIdRef.current++,
        message,
        type,
        durationMs,
      });
    },
    [clearDismissTimeout, opacity, translateY],
  );

  useEffect(() => {
    if (!toast) {
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    dismissTimeoutRef.current = setTimeout(() => {
      hideToast();
    }, toast.durationMs);

    return () => {
      clearDismissTimeout();
    };
  }, [toast, clearDismissTimeout, hideToast, opacity, translateY]);

  const value = useMemo(
    () => ({
      showToast,
      hideToast,
    }),
    [showToast, hideToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View pointerEvents="box-none" style={styles.portal}>
        {toast ? (
          <Animated.View
            accessibilityLiveRegion="polite"
            style={[
              styles.toast,
              { backgroundColor: getBackgroundColor(toast.type) },
              { opacity, transform: [{ translateY }] },
            ]}
          >
            <Text style={styles.toastText}>{toast.message}</Text>
          </Animated.View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}

const styles = StyleSheet.create({
  portal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  toast: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 5,
  },
  toastText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
