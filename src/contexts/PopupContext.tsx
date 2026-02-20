import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast, Toaster } from "sonner";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

type PopupContextValue = {
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const PopupContext = createContext<PopupContextValue | null>(null);

type ConfirmState = ConfirmOptions | null;

type ToastKind = "success" | "error" | "info" | "warning";

type LocalToast = {
  id: number;
  type: ToastKind;
  message: string;
  title?: string;
};

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [toasts, setToasts] = useState<LocalToast[]>([]);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const toastIdRef = useRef(1);

  const pushToast = (type: ToastKind, message: string, title?: string) => {
    const id = toastIdRef.current++;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toastItem) => toastItem.id !== id));
    }, 4200);
  };

  useEffect(() => {
    return () => {
      if (resolverRef.current) {
        resolverRef.current(false);
        resolverRef.current = null;
      }
    };
  }, []);

  const resolveConfirm = (value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setConfirmState(null);
  };

  const value = useMemo<PopupContextValue>(
    () => ({
      success: (message, title) => {
        toast.success(message, { description: title });
        pushToast("success", message, title);
      },
      error: (message, title) => {
        toast.error(message, { description: title });
        pushToast("error", message, title);
      },
      info: (message, title) => {
        toast.info(message, { description: title });
        pushToast("info", message, title);
      },
      warning: (message, title) => {
        toast.warning(message, { description: title });
        pushToast("warning", message, title);
      },
      confirm: (options) =>
        new Promise<boolean>((resolve) => {
          if (resolverRef.current) {
            resolverRef.current(false);
          }
          resolverRef.current = resolve;
          setConfirmState(options);
        }),
    }),
    [],
  );

  return (
    <PopupContext.Provider value={value}>
      {children}
      <Toaster
        richColors
        position="top-right"
        closeButton
        toastOptions={{
          style: {
            zIndex: 1300,
          },
        }}
      />

      <div className="popup-fallback-stack">
        {toasts.map((toastItem) => (
          <div
            key={toastItem.id}
            className={`popup-fallback-toast popup-fallback-toast--${toastItem.type}`}
          >
            {toastItem.title ? (
              <div className="popup-fallback-toast-title">
                {toastItem.title}
              </div>
            ) : null}
            <div className="popup-fallback-toast-message">
              {toastItem.message}
            </div>
          </div>
        ))}
      </div>

      {confirmState ? (
        <div className="popup-fallback-confirm-overlay">
          <div className="popup-fallback-confirm-card">
            <div className="popup-fallback-confirm-title">
              {confirmState.title}
            </div>
            {confirmState.description ? (
              <div className="popup-fallback-confirm-description">
                {confirmState.description}
              </div>
            ) : null}
            <div className="popup-fallback-confirm-actions">
              <button
                type="button"
                onClick={() => resolveConfirm(false)}
                className="popup-fallback-confirm-btn popup-fallback-confirm-btn--cancel"
              >
                {confirmState.cancelText || "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => resolveConfirm(true)}
                className="popup-fallback-confirm-btn popup-fallback-confirm-btn--confirm"
              >
                {confirmState.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error("usePopup must be used within PopupProvider");
  }
  return context;
};
