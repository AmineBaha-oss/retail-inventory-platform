import { Navigate } from "react-router-dom";

export function isAuthed(): boolean {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return false;
    const { state } = JSON.parse(raw);
    return Boolean(state?.token ?? state?.accessToken);
  } catch { 
    return false; 
  }
}

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}
