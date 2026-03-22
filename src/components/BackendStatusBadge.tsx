import React, { useEffect, useState } from "react";
import { ServerCrash } from "lucide-react";
import {
  BACKEND_HEALTH_EVENT,
  getBackendReason,
  getBackendStatus,
} from "../services/backendHealth";

export const BackendStatusBadge: React.FC = () => {
  const [offline, setOffline] = useState(getBackendStatus() === "offline");
  const [reason, setReason] = useState(getBackendReason());

  useEffect(() => {
    const sync = () => {
      setOffline(getBackendStatus() === "offline");
      setReason(getBackendReason());
    };

    window.addEventListener(BACKEND_HEALTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(BACKEND_HEALTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!offline) {
    return null;
  }

  return (
    <div
      title={reason || "Backend unavailable"}
      className="fixed top-3 right-3 z-1500 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-md dark:border-red-800/60 dark:bg-red-900/30 dark:text-red-300"
    >
      <ServerCrash className="h-3.5 w-3.5" />
      Backend Offline
    </div>
  );
};
