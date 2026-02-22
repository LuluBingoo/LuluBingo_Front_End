import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast, Toaster } from "sonner";
import { useTheme } from "./ThemeContext";
import type { ExternalToast } from "sonner";

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

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { theme } = useTheme();
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
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

  const value = useMemo<PopupContextValue>(() => {
    const pushToast = (
      mode: "success" | "error" | "info" | "warning",
      message: string,
      title?: string,
    ) => {
      const options: ExternalToast = {
        description: title,
        style: {
          maxHeight: "40dvh",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        },
      };

      if (mode === "success") {
        toast.success(message, options);
        return;
      }
      if (mode === "error") {
        toast.error(message, options);
        return;
      }
      if (mode === "warning") {
        toast.warning(message, options);
        return;
      }
      toast.info(message, options);
    };

    return {
      success: (message, title) => {
        pushToast("success", message, title);
      },
      error: (message, title) => {
        pushToast("error", message, title);
      },
      info: (message, title) => {
        pushToast("info", message, title);
      },
      warning: (message, title) => {
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
    };
  }, []);

  return (
    <PopupContext.Provider value={value}>
      {children}
      <Toaster
        theme={theme}
        richColors
        position="top-right"
        visibleToasts={4}
        closeButton
        expand
        className="z-1400!"
        toastOptions={{
          style: {
            zIndex: 1300,
            opacity: "1",
            maxHeight: "40dvh",
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          },
        }}
      />

      {confirmState ? (
        <div className="fixed inset-0 z-2200 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85dvh] w-[min(94vw,460px)] overflow-y-auto rounded-xl border border-slate-300 bg-white p-4.5 opacity-100 shadow-[0_16px_44px_rgba(2,6,23,0.28)] dark:border-slate-700 dark:bg-slate-900">
            <div className="text-[18px] font-bold text-slate-900 dark:text-slate-100">
              {confirmState.title}
            </div>
            {confirmState.description ? (
              <div className="mt-2 text-sm leading-[1.45] text-slate-700 dark:text-slate-300">
                {confirmState.description}
              </div>
            ) : null}
            <div className="mt-4 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => resolveConfirm(false)}
                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
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
