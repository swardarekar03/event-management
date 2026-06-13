import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import NexEvent from "./NexEvent";
import BrowseNonLogin from "./BrowseNonLogin";
import Login from "./pages/login";
import Signup from "./pages/signup";
import OrganizerSignup from "./pages/organizerSignup";
import UserDashboard from "./UserPanel/UserDashoboard";
import OrganizerPanel from "./OrganizerPanel/OrganizerPanel";
import AdminDashboard from "./AdminPanel/AdminDashboard";

function AppRoutes() {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/" element={<NexEvent />} />
      <Route path="/events" element={<BrowseNonLogin onBackHome={() => navigate("/")} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/organizer-signup" element={<OrganizerSignup />} />
      <Route path="/userDashboard" element={<UserDashboard onBackHome={() => navigate("/login")} />} />
      <Route path="/organizerpanel" element={<OrganizerPanel />} />
      <Route path="/admin" element={<AdminDashboard />} />
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
