import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { COLORS } from "../constants/colors";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const stylesByType: Record<
  ToastType,
  { background: string; border: string; icon: string }
> = {
  success: {
    background: COLORS.green.gr02,
    border: COLORS.green.gr05,
    icon: "✓",
  },
  error: {
    background: COLORS.red.re02,
    border: COLORS.red.re05,
    icon: "!",
  },
  info: {
    background: COLORS.blueGreen.bg02,
    border: COLORS.blueGreen.bg05,
    icon: "i",
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, type }]);

      window.setTimeout(() => dismissToast(id), 4500);
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "min(380px, calc(100vw - 48px))",
        }}
      >
        {toasts.map((toast) => {
          const palette = stylesByType[toast.type];

          return (
            <div
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "14px 16px",
                color: COLORS.text.primary,
                background: palette.background,
                border: `1px solid ${palette.border}`,
                borderRadius: "10px",
                boxShadow: "0 8px 24px rgba(70, 67, 67, 0.14)",
                fontSize: "14px",
                lineHeight: 1.4,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  width: "22px",
                  height: "22px",
                  color: "#fff",
                  background: palette.border,
                  borderRadius: "50%",
                  fontWeight: 700,
                }}
              >
                {palette.icon}
              </span>
              <span style={{ flex: 1 }}>{toast.message}</span>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismissToast(toast.id)}
                style={{
                  padding: 0,
                  color: COLORS.text.secondary,
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                  fontSize: "18px",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};