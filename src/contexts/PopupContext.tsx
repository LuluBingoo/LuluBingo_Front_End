import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast, Toaster } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

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
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const resolveConfirm = (value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setConfirmState(null);
  };

  const value = useMemo<PopupContextValue>(
    () => ({
      success: (message, title) =>
        toast.success(message, { description: title }),
      error: (message, title) => toast.error(message, { description: title }),
      info: (message, title) => toast.info(message, { description: title }),
      warning: (message, title) =>
        toast.warning(message, { description: title }),
      confirm: (options) =>
        new Promise<boolean>((resolve) => {
          resolverRef.current = resolve;
          setConfirmState(options);
        }),
    }),
    [],
  );

  return (
    <PopupContext.Provider value={value}>
      {children}
      <Toaster richColors position="top-right" />
      <AlertDialog
        open={!!confirmState}
        onOpenChange={(open) => {
          if (!open && confirmState) {
            resolveConfirm(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmState?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmState?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => resolveConfirm(false)}>
              {confirmState?.cancelText || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => resolveConfirm(true)}>
              {confirmState?.confirmText || "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
