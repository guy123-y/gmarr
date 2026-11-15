import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import Login from "./Login";
import Tasks from "./Tasks";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>טוען...</p>;

  return (
    <div dir="rtl">
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/tasks" replace /> : <Login />}
          />
          <Route
            path="/tasks"
            element={
              user ? <Tasks user={user} /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="*"
            element={<Navigate to={user ? "/tasks" : "/login"} replace />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}