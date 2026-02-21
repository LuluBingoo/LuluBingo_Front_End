export const BACKEND_HEALTH_EVENT = "lulu-backend-health";

const BACKEND_STATUS_KEY = "backend_status";
const BACKEND_REASON_KEY = "backend_status_reason";

export type BackendStatus = "online" | "offline";

const emitHealthEvent = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BACKEND_HEALTH_EVENT));
};

export const getBackendStatus = (): BackendStatus => {
  if (typeof window === "undefined") return "online";
  return localStorage.getItem(BACKEND_STATUS_KEY) === "offline"
    ? "offline"
    : "online";
};

export const getBackendReason = (): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(BACKEND_REASON_KEY) || "";
};

export const markBackendOffline = (reason = "Backend unavailable") => {
  if (typeof window === "undefined") return;
  localStorage.setItem(BACKEND_STATUS_KEY, "offline");
  localStorage.setItem(BACKEND_REASON_KEY, reason);
  emitHealthEvent();
};

export const markBackendOnline = () => {
  if (typeof window === "undefined") return;
  const wasOffline = localStorage.getItem(BACKEND_STATUS_KEY) === "offline";
  localStorage.setItem(BACKEND_STATUS_KEY, "online");
  localStorage.removeItem(BACKEND_REASON_KEY);
  if (wasOffline) {
    emitHealthEvent();
  }
};
