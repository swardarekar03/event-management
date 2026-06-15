import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import NexEvent from "./NexEvent";
import BrowseNonLogin from "./BrowseNonLogin";
import Login from "./pages/login";
import Signup from "./pages/signup";
import OrganizerSignup from "./pages/organizerSignup";
import UserDashboard from "./UserPanel/UserDashoboard";
import OrganizerPanel from "./OrganizerPanel/OrganizerPanel";
import AdminDashboard from "./AdminPanel/AdminDashboard";
import Notification from "./UserPanel/AudienceNotificationsPanel.jsx";
import Tickets from "./UserPanel/Tickets.jsx";

// ── Guard: only logged-in users with a matching role ──────────────────────────
function PrivateRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  const location = useLocation();

  if (!token) {
    // Save the page they tried to visit so we can redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // Logged in but wrong role → send to their own panel
    if (role === "admin")     return <Navigate to="/admin"          replace />;
    if (role === "organizer") return <Navigate to="/organizerpanel" replace />;
    return <Navigate to="/userDashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  const navigate = useNavigate();
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route path="/"               element={<NexEvent />} />
      <Route path="/events"         element={<BrowseNonLogin onBackHome={() => navigate("/")} />} />
      <Route path="/login"          element={<Login />} />
      <Route path="/signup"         element={<Signup />} />
      <Route path="/organizer-signup" element={<OrganizerSignup />} />
      <Route path="/ticket/:id" element={<Tickets />} />

      {/* ── Protected: regular users ── */}
      <Route
        path="/userDashboard"
        element={
          <PrivateRoute requiredRole="user">
            <UserDashboard
              onBackHome={() => navigate("/")}
              onLogout={() => navigate("/login")}
            />
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute requiredRole="user">
            <Notification />
          </PrivateRoute>
        }
      />

      {/* ── Protected: organizers ── */}
      <Route
        path="/organizerpanel"
        element={
          <PrivateRoute requiredRole="organizer">
            <OrganizerPanel />
          </PrivateRoute>
        }
      />

      {/* ── Protected: admins ── */}
      <Route
        path="/admin"
        element={
          <PrivateRoute requiredRole="admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* ── Fallback: redirect unknown paths to home ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
