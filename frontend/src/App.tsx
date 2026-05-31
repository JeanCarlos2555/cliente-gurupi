import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Faturas } from "./pages/Faturas";
import { Consumo } from "./pages/Consumo";
import { Perfil } from "./pages/Perfil";
import { Spinner } from "./components/Spinner";

function Protected({ children }: { children: React.ReactNode }) {
  const { customer, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center text-gurupi-500">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  return customer ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { customer, loading } = useAuth();
  if (loading) return null;
  return customer ? <Navigate to="/" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnly>
                  <Login />
                </PublicOnly>
              }
            />
            <Route
              path="/"
              element={
                <Protected>
                  <Dashboard />
                </Protected>
              }
            />
            <Route
              path="/faturas"
              element={
                <Protected>
                  <Faturas />
                </Protected>
              }
            />
            <Route
              path="/consumo"
              element={
                <Protected>
                  <Consumo />
                </Protected>
              }
            />
            <Route
              path="/perfil"
              element={
                <Protected>
                  <Perfil />
                </Protected>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
