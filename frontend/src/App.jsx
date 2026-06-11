import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import NexEvent from "./NexEvent";
import BrowseEvents from "./BrowseEvents";
import Login from "./pages/login";
import Signup from "./pages/signup";

function AppRoutes() {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/" element={<NexEvent />} />
      <Route path="/events" element={<BrowseEvents onBackHome={() => navigate("/")} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
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
