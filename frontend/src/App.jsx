import { Routes, Route, Navigate } from "react-router-dom";
import EditorPage from "./pages/EditorPage";

export default function App() {
  return (
    <Routes>
      {/* Redirect root to a default doc */}
      <Route path="/" element={<Navigate to="/doc/1" replace />} />

      {/* Main editor route */}
      <Route path="/doc/:id" element={<EditorPage />} />

      {/* Catch-all for unknown routes */}
      <Route path="*" element={<Navigate to="/doc/1" replace />} />
    </Routes>
  );
}