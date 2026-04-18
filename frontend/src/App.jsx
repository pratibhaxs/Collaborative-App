import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage    from "./pages/LoginPage";
import SignupPage   from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import EditorPage   from "./pages/EditorPage";

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/signup"     element={<SignupPage />} />
      <Route path="/dashboard"  element={<Protected><DashboardPage /></Protected>} />
      <Route path="/doc/:id"    element={<Protected><EditorPage /></Protected>} />
      <Route path="/"           element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}