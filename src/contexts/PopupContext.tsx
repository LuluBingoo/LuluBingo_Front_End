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

  const toastColorClassMap: Record<ToastKind, string> = {
    success: "border-green-600",
    error: "border-red-600",
    warning: "border-amber-600",
    info: "border-blue-600",
  };

  return (
    <PopupContext.Provider value={value}>
      {children}
      <Toaster
        richColors
        position="top-right"
        closeButton
        className="z-1400!"
        toastOptions={{
          style: {
            zIndex: 1300,
            background: "#ffffff",
            color: "#0f172a",
            border: "1px solid #e2e8f0",
            opacity: "1",
          },
        }}
      />

      <div className="fixed top-4 right-4 z-2100 grid w-[min(92vw,360px)] gap-2 pointer-events-none">
        {toasts.map((toastItem) => (
          <div
            key={toastItem.id}
            className={`pointer-events-auto rounded-[10px] border bg-white px-3 py-2.5 text-slate-900 opacity-100 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:bg-slate-900 dark:text-slate-100 ${toastColorClassMap[toastItem.type]}`}
          >
            {toastItem.title ? (
              <div className="mb-1 font-bold">{toastItem.title}</div>
            ) : null}
            <div className="text-sm leading-[1.35]">{toastItem.message}</div>
          </div>
        ))}
      </div>

      {confirmState ? (
        <div className="fixed inset-0 z-2200 flex items-center justify-center bg-black/50 p-4">
          <div className="w-[min(94vw,460px)] rounded-xl border border-slate-300 bg-white p-4.5 opacity-100 shadow-[0_16px_44px_rgba(2,6,23,0.28)] dark:border-slate-700 dark:bg-slate-900">
            <div className="text-[18px] font-bold text-slate-900">
              {confirmState.title}
            </div>
            {confirmState.description ? (
              <div className="mt-2 text-sm leading-[1.45] text-slate-700">
                {confirmState.description}
              </div>
            ) : null}
            <div className="mt-4 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => resolveConfirm(false)}
                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900"
              >
                {confirmState.cancelText || "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => resolveConfirm(true)}
                className="cursor-pointer rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 font-bold text-white"
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
