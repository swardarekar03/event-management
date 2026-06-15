import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Bell,
  Building2,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquareText,
  Pencil,
  Phone,
  QrCode,
  ShieldCheck,
  User,
  UserCog,
  Users,
  X,
  Star,
  MessageCircle,
  Images,
  TrendingUp
} from "lucide-react";

const PORT = 5000;

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "events", label: "Event Management", icon: CalendarDays },
  { id: "registrations", label: "Registrations", icon: Users },
  { id: "qr", label: "QR Check-In", icon: QrCode },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "feedback", label: "Feedback & Reviews", icon: MessageSquareText },
  { id: "profile", label: "Profile & Settings", icon: UserCog },
];

// ── BADGE ──
function Badge({ status }) {
  const map = {
    upcoming: "bg-orange-50 text-orange-500",
    completed: "bg-gray-100 text-gray-500",
    confirmed: "bg-green-50 text-green-700",
    pending: "bg-yellow-50 text-yellow-700",
    approved: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-600",
  };
  const cls = map[status] || "bg-gray-100 text-gray-500";
  return (
    <span className={`text-[11px] font-bold px-[10px] py-1 rounded-full tracking-wide ${cls}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── STARS ──
function Stars({ rating }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-base ${i <= rating ? "text-orange-500" : "text-gray-200"}`}>★</span>
      ))}
    </span>
  );
}

// ── BUTTON ──
function Btn({ children, onClick, variant = "primary", type = "button", full }) {
  const styles = {
    primary: "bg-orange-500 text-white border-transparent shadow-md shadow-orange-200 hover:bg-orange-600",
    ghost: "bg-transparent text-gray-500 border border-orange-100 hover:bg-orange-50",
    danger: "bg-transparent text-red-500 border border-red-100 hover:bg-red-50",
    outline: "bg-transparent text-orange-500 border border-orange-200 hover:bg-orange-50",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={`text-[13px] font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all tracking-[0.01em] ${styles[variant]} ${full ? "w-full" : ""}`}
    >
      {children}
    </button>
  );
}

// ── INPUT ──
function Input({ label, value, onChange, type = "text", placeholder, required, as, rows, children }) {
  const base = "w-full border border-orange-100 rounded-xl px-3 py-[9px] text-[13px] text-gray-800 bg-white outline-none box-border focus:border-orange-300 transition-colors";
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[11px] text-gray-400 font-semibold tracking-[0.04em]">{label}</label>}
      {as === "textarea" ? (
        <textarea rows={rows} required={required} value={value} onChange={onChange} placeholder={placeholder} className={`${base} resize-none`} />
      ) : as === "select" ? (
        <select value={value} onChange={onChange} className={base}>{children}</select>
      ) : (
        <input type={type} required={required} value={value} onChange={onChange} placeholder={placeholder} className={base} />
      )}
    </div>
  );
}

// ── PAGE HEADER ──
function PageHeader({ title, sub }) {
  return (
    <div className="mb-7">
      <h2 className="text-[22px] font-extrabold text-gray-800 m-0">{title}</h2>
      {sub && <p className="text-[13px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── CARD ──
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-orange-100 px-6 py-5 ${className}`}>
      {children}
    </div>
  );
}

// ── STAT CARD ──
function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`rounded-2xl px-6 py-5 flex flex-col gap-1 border ${accent ? "bg-orange-500 border-transparent shadow-md shadow-orange-200" : "bg-white border-orange-100"}`}>
      <span className={`text-[10px] font-bold uppercase tracking-[0.1em] ${accent ? "text-white/70" : "text-gray-400"}`}>{label}</span>
      <span className={`text-[32px] font-extrabold leading-none ${accent ? "text-white" : "text-gray-800"}`}>{value}</span>
      {sub && <span className={`text-[11px] ${accent ? "text-white/60" : "text-gray-400"}`}>{sub}</span>}
    </div>
  );
}

// ── DASHBOARD ──
function Dashboard({ events = [] }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:${PORT}/api/organizer/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [events]);

  const today = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= today);
  const completedEvents = events.filter(e => new Date(e.date) < today);

  if (loading) {
    return <div className="p-5 text-center">Loading stats...</div>;
  }

  return (
    <div>
      <PageHeader title="Dashboard" sub="Welcome back. Here's what's happening." />

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Events" value={stats?.totalEvents || events.length.toString()} sub="All time" accent />
        <StatCard label="Total Registrations" value={stats?.totalRegistrations?.toString() || "0"} sub="Across all events" />
        <StatCard label="Available Seats" value={stats?.availableSeats?.toString() || "0"} sub="Remaining capacity" />
        <StatCard label="Total Capacity" value={stats?.totalCapacity?.toString() || "0"} sub="Overall seats" />
      </div>

      <div className="grid grid-cols-2 gap-5 mb-8">
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3">Upcoming Events ({upcomingEvents.length})</h3>
          <div className="flex flex-col gap-2.5">
            {upcomingEvents.slice(0, 3).map(ev => (
              <Card key={ev._id} className="!py-3 !px-4">
                <p className="font-bold text-[13px] m-0 text-gray-800">{ev.title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{new Date(ev.date).toLocaleDateString()} · {ev.venue}</p>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3">Completed Events ({completedEvents.length})</h3>
          <div className="flex flex-col gap-2.5">
            {completedEvents.slice(0, 3).map(ev => (
              <Card key={ev._id} className="!py-3 !px-4">
                <p className="font-bold text-[13px] m-0 text-gray-800">{ev.title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{new Date(ev.date).toLocaleDateString()}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-[0.08em]">Your Events</h3>
      <div className="flex flex-col gap-2.5">
        {events.length > 0 ? (
          events.map(ev => {
            const registered = (stats?.totalRegistrationsPerEvent?.[ev._id]) || (ev.totalTickets - ev.availableTickets);
            const pct = ev.totalTickets > 0 ? (registered / ev.totalTickets) * 100 : 0;
            return (
              <Card key={ev._id} className="flex items-center justify-between gap-4 !py-4 !px-5">
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800 m-0">{ev.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(ev.date).toLocaleDateString()} · {ev.category}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-[11px] text-gray-400">Seats</p>
                    <p className="text-[13px] font-bold text-gray-800">{registered}/{ev.totalTickets}</p>
                  </div>
                  <div className="w-20 bg-orange-50 rounded-full h-1">
                    <div className="bg-orange-500 h-1 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <Badge status={ev.status} />
                </div>
              </Card>
            );
          })
        ) : (
          <Card><p className="text-center text-gray-400 m-0">No events found. Create your first event!</p></Card>
        )}
      </div>
    </div>
  );
}

// ── EVENT MANAGEMENT ──
function EventManagement({ events = [], setEvents, fetchEvents }) {
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({
    title: "", category: "Technology", date: "", venue: "", price: "",
    totalTickets: "", availableTickets: "", organizerName: "", image: ""
  });

  const categories = ["Technology", "Workshop", "Sports", "Cultural", "Business", "Music", "Other"];

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`http://localhost:${PORT}/api/events/create-event`, {
        title: form.title,
        category: form.category,
        date: form.date,
        venue: form.venue,
        price: Number(form.price),
        totalTickets: Number(form.totalTickets),
        availableTickets: Number(form.availableTickets),
        organizer: { name: form.organizerName },
        image: form.image || ""
        // ← status removed: backend sets "pending" automatically
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success && res.data.event) {
        await fetchEvents();
        resetForm();
        setShowForm(false);
        alert("Event submitted for admin approval!");  // ← updated message
      }
    } catch (err) { alert(err.response?.data?.message || "Failed to create event"); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:${PORT}/api/events/update-event/${editingEvent._id}`, {
        title: form.title,
        category: form.category,
        date: form.date,
        venue: form.venue,
        price: Number(form.price),
        totalTickets: Number(form.totalTickets),
        availableTickets: Number(form.availableTickets),
        organizer: { name: form.organizerName },
        image: form.image || ""
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        await fetchEvents();
        resetForm();
        setShowEditForm(false);
        setEditingEvent(null);
        alert("Event updated!");
      }
    } catch (err) {
      console.error("Update error:", err);
      if (err.response?.status === 403) {
        alert("You don't have permission to update this event. Make sure you are the event organizer.");
      } else {
        alert(err.response?.data?.message || "Failed to update event");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:${PORT}/api/events/delete-event/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchEvents();
      alert("Deleted!");
    } catch (err) { alert(err.response?.data?.message || "Failed to delete event"); }
  };

  const handleEdit = (ev) => {
    setEditingEvent(ev);
    setForm({
      title: ev.title || "",
      category: ev.category || "Technology",
      date: ev.date ? new Date(ev.date).toISOString().split('T')[0] : "",
      venue: ev.venue || "",
      price: ev.price?.toString() || "",
      totalTickets: ev.totalTickets?.toString() || "",
      availableTickets: ev.availableTickets?.toString() || "",
      organizerName: ev.organizer?.name || "",
      image: ev.image || ""
    });
    setShowEditForm(true);
    setShowForm(false);
  };

  const resetForm = () => setForm({
    title: "", category: "Technology", date: "", venue: "", price: "",
    totalTickets: "", availableTickets: "", organizerName: "", image: ""
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <PageHeader title="Event Management" sub="Create, edit or remove your events." />
        <Btn onClick={() => { resetForm(); setShowForm(!showForm); setShowEditForm(false); setEditingEvent(null); }}>+ Create Event</Btn>
      </div>

      {(showForm || showEditForm) && (
        <Card className="mb-5">
          <h3 className="text-sm font-bold text-gray-800 mt-0 mb-4">{showEditForm ? "Edit Event" : "New Event"}</h3>
          <form onSubmit={showEditForm ? handleUpdate : handleCreate}>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Input label="Event Title *" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Annual Tech Meetup" /></div>
              <Input label="Category *" required as="select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.map(c => <option key={c}>{c}</option>)}</Input>
              <Input label="Date *" type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              <div className="col-span-2"><Input label="Venue *" required value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="e.g. Mumbai Convention Center" /></div>
              <Input label="Price (₹) *" type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 499" />
              <Input label="Total Tickets *" type="number" required value={form.totalTickets} onChange={e => setForm({ ...form, totalTickets: e.target.value })} placeholder="e.g. 100" />
              <Input label="Available Tickets *" type="number" required value={form.availableTickets} onChange={e => setForm({ ...form, availableTickets: e.target.value })} placeholder="e.g. 100" />
              <Input label="Organizer Name *" required value={form.organizerName} onChange={e => setForm({ ...form, organizerName: e.target.value })} placeholder="e.g. Tech Club" />
              {/* ← Status field removed: admin controls approval, not organizer */}
              <Input label="Image URL (optional)" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://example.com/image.jpg" />
            </div>
            <div className="flex gap-2.5 mt-4">
              <Btn type="submit">{showEditForm ? "Update Event" : "Save Event"}</Btn>
              <Btn variant="ghost" onClick={() => { setShowForm(false); setShowEditForm(false); setEditingEvent(null); resetForm(); }}>Cancel</Btn>
            </div>
          </form>
        </Card>
      )}

      {/* Info banner for organizer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4 text-[13px] text-yellow-700 font-medium">
        ⏳ New events require admin approval before they appear publicly.
      </div>

      <div className="flex flex-col gap-2.5">
        {events.length > 0 ? events.map(ev => (
          <Card key={ev._id} className="flex items-center justify-between gap-4 !py-4 !px-5">
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-800 m-0">{ev.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(ev.date).toLocaleDateString()} · {ev.category} · Available: {ev.availableTickets}/{ev.totalTickets} seats · ₹{ev.price}</p>
              {ev.organizer?.name && <p className="text-[11px] text-gray-400 mt-0.5">Organizer: {ev.organizer.name}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge status={ev.status} />
              <Btn variant="outline" onClick={() => handleEdit(ev)}>Edit</Btn>
              <Btn variant="danger" onClick={() => handleDelete(ev._id)}>Delete</Btn>
            </div>
          </Card>
        )) : (
          <Card><p className="text-center text-gray-400 m-0">No events found. Click "Create Event" to get started.</p></Card>
        )}
      </div>
    </div>
  );
}

// ── REGISTRATIONS ──
function Registrations() {
  const [tab, setTab] = useState("participants");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      // Use the PORT constant instead of hardcoding 5000
      const res = await axios.get(`http://localhost:${PORT}/api/registrations/organizer`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Registrations response:", res.data); // Debug log

      if (res.data.success && Array.isArray(res.data.registrations)) {
        setRegistrations(res.data.registrations);
      } else {
        setRegistrations([]);
        if (res.data.message) setError(res.data.message);
      }
    } catch (err) {
      console.error("Fetch registrations error:", err);
      setError(err.response?.data?.message || "Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCheckIn = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:${PORT}/api/registrations/checkin/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert("Check-in successful!");
        fetchRegistrations();
      }
    } catch (err) {
      console.error("Check-in error:", err);
      alert(err.response?.data?.message || "Failed to check in");
    }
  };

  if (loading) {
    return <div className="p-5 text-gray-500 text-[13px]">Loading registrations...</div>;
  }

  if (error) {
    return (
      <div className="p-5">
        <div className="text-red-500 text-[13px] mb-3">Error: {error}</div>
        <Btn onClick={fetchRegistrations}>Retry</Btn>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Registrations" sub="View participants and attendance records." />

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-orange-100">
          <div className="text-2xl font-bold text-orange-600">{registrations.length}</div>
          <div className="text-xs text-gray-400">Total Registrations</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-orange-100">
          <div className="text-2xl font-bold text-emerald-600">
            {registrations.filter(r => r.checkInStatus).length}
          </div>
          <div className="text-xs text-gray-400">Checked In</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-orange-100">
          <div className="text-2xl font-bold text-amber-600">
            {registrations.filter(r => !r.checkInStatus).length}
          </div>
          <div className="text-xs text-gray-400">Pending Check-in</div>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {["participants", "attendance"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-[13px] font-semibold px-4 py-2 rounded-xl cursor-pointer border-none transition-all ${tab === t ? "bg-orange-500 text-white shadow-md shadow-orange-200" : "bg-white text-gray-500 border border-orange-100"}`}>
            {t === "participants" ? "Participant List" : "Attendance List"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
        {registrations.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-[13px]">
            No registrations found for your events yet.
            <div className="mt-2 text-xs">When audience members register for your events, they'll appear here.</div>
          </div>
        ) : (
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-orange-50">
                {["Name", "Email", "Event", "Tickets", tab === "participants" ? "Status" : "Check-in Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-orange-500 uppercase tracking-[0.1em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registrations.map((registration, i) => (
                <tr key={registration._id} className={`border-b border-orange-50 ${i % 2 === 0 ? "bg-white" : "bg-orange-50/40"}`}>
                  <td className="px-5 py-3 font-semibold text-gray-800">{registration.attendeeName}</td>
                  <td className="px-5 py-3 text-gray-400">{registration.attendeeEmail}</td>
                  <td className="px-5 py-3 text-gray-500">{registration.event?.title || "Event Deleted"}</td>
                  <td className="px-5 py-3 text-gray-500">{registration.ticketsBooked || 1}</td>
                  <td className="px-5 py-3">
                    {tab === "participants" ? (
                      <Badge status="confirmed" />
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-bold px-[10px] py-1 rounded-full ${registration.checkInStatus ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                          {registration.checkInStatus ? "✓ Checked In" : "○ Not Checked In"}
                        </span>
                        {!registration.checkInStatus && (
                          <button
                            onClick={() => handleCheckIn(registration._id)}
                            className="bg-orange-100 hover:bg-orange-200 text-orange-600 text-[10px] font-bold px-2.5 py-1 rounded-lg border-none cursor-pointer transition-colors"
                          >
                            Check In
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>


    </div>
  );
}

// ── QR CHECK-IN ──
// ── QR CHECK-IN ──
function QRCheckin() {
  const [cameraActive, setCameraActive]   = useState(false);
  const [input, setInput]                 = useState("");
  const [result, setResult]               = useState(null);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const html5QrRef = useRef(null);
  const scannerDivId = "qr-reader";

  const fetchRecentCheckins = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:${PORT}/api/registrations/organizer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && Array.isArray(res.data.registrations)) {
        setRecentCheckins(
          res.data.registrations
            .filter((r) => r.checkInStatus)
            .map((r) => ({ id: r._id, name: r.attendeeName, event: r.event?.title || "Event" }))
        );
      }
    } catch (err) { console.error("Failed to load recent checkins", err); }
  };

  useEffect(() => { fetchRecentCheckins(); }, []);

  useEffect(() => { return () => { stopCamera(); }; }, []);

  const startCamera = async () => {
    setResult(null);
    setCameraActive(true);
    setTimeout(async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const qr = new Html5Qrcode(scannerDivId);
        html5QrRef.current = qr;
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          async (decodedText) => {
            await stopCamera();
            await verifyCheckin(decodedText);
          },
          () => {}
        );
      } catch (err) {
        console.error("Camera error:", err);
        setResult({ success: false, message: "Could not access camera. Check browser permissions." });
        setCameraActive(false);
      }
    }, 100);
  };

  const stopCamera = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); html5QrRef.current.clear(); html5QrRef.current = null; } catch {}
    }
    setCameraActive(false);
  };

  const verifyCheckin = async (id) => {
    if (!id?.trim()) return;
    setResult(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:${PORT}/api/registrations/checkin/${id.trim()}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        const reg = res.data.registration;
        setResult({ success: true, message: "Attendance verified!", attendee: reg.attendeeName, event: reg.event?.title });
        fetchRecentCheckins();
      }
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || "Verification failed" });
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    await verifyCheckin(input);
    setInput("");
  };

  return (
    <div>
      <PageHeader title="QR Check-In" sub="Scan attendee QR codes to verify attendance." />
      <div className="grid grid-cols-2 gap-5">
        <Card>
          <h3 className="text-sm font-bold text-gray-800 mt-0 mb-4">Scan QR Code</h3>

          {/* Camera viewport */}
          <div className="relative mb-4 rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center min-h-[220px]">
            <div id={scannerDivId} className={`w-full ${cameraActive ? "block" : "hidden"}`} />
            {!cameraActive && (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-500">
                <QrCode size={40} className="text-orange-300" />
                <p className="text-[12px] m-0">Camera is off</p>
              </div>
            )}
            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-44 h-44">
                  <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-orange-400 rounded-tl" />
                  <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-orange-400 rounded-tr" />
                  <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-orange-400 rounded-bl" />
                  <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-orange-400 rounded-br" />
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            {!cameraActive ? (
              <Btn full onClick={startCamera}>📷 Start Camera</Btn>
            ) : (
              <Btn full variant="ghost" onClick={stopCamera}>⏹ Stop Camera</Btn>
            )}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-orange-100" />
            <span className="text-[11px] text-gray-400 font-semibold">or enter manually</span>
            <div className="flex-1 h-px bg-orange-100" />
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter Registration ID"
              className="flex-1 border border-orange-100 rounded-xl px-3 py-[9px] text-[13px] outline-none focus:border-orange-300 transition-colors"
            />
            <Btn type="submit">Verify</Btn>
          </form>

          {result && (
            <div className={`mt-4 px-4 py-3 rounded-xl border text-[13px] font-semibold ${
              result.success ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"
            }`}>
              {result.success ? "✓" : "✗"} {result.message}
              {result.success && result.attendee && (
                <p className="m-0 mt-0.5 text-[12px] font-normal">{result.attendee} — {result.event}</p>
              )}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-gray-800 mt-0 mb-4">
            Recent Check-ins
            <span className="ml-2 text-[11px] font-bold bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">{recentCheckins.length}</span>
          </h3>
          <div className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto">
            {recentCheckins.length === 0 ? (
              <p className="text-gray-400 text-[13px] m-0">No checked-in attendees yet.</p>
            ) : (
              recentCheckins.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b border-orange-50/60 pb-2 last:border-b-0">
                  <div>
                    <p className="font-semibold text-[13px] text-gray-800 m-0">{p.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{p.event}</p>
                  </div>
                  <span className="text-[11px] font-bold bg-orange-50 text-orange-500 px-[10px] py-1 rounded-full">✓ Checked in</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── NOTIFICATIONS (Updated & Fixed - No Open Rate) ──
function Notifications({ events = [] }) {
  const [msg, setMsg] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("announcement");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [stats, setStats] = useState(null);

  const fetchSentNotifications = async (eventId) => {
    if (!eventId) return;
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching notifications for event:", eventId);
      console.log("Using token:", token);

      const res = await axios.get(
        `http://localhost:${PORT}/api/notifications/organizer/event/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Response:", res.data);

      if (res.data.success) {
        setSentNotifications(res.data.notifications);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch sent notifications:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      if (err.response?.status === 403) {
        alert("You don't have permission to view notifications for this event. Make sure you are the event organizer.");
      } else if (err.response?.status === 401) {
        alert("Please login again. Your session may have expired.");
      } else {
        alert(err.response?.data?.message || "Failed to fetch notifications");
      }
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!selectedEventId) {
      alert("Please select an event");
      return;
    }

    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!msg.trim()) {
      alert("Please enter a message");
      return;
    }

    setSending(true);

    try {
      const token = localStorage.getItem("token");
      console.log("Sending notification to event:", selectedEventId);
      console.log("Payload:", { title, message: msg, type });

      const res = await axios.post(
        `http://localhost:${PORT}/api/notifications/send-to-event/${selectedEventId}`,
        { title, message: msg, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Send response:", res.data);

      if (res.data.success) {
        setSent(true);
        setTitle("");
        setMsg("");
        setTimeout(() => setSent(false), 3000);
        fetchSentNotifications(selectedEventId);
        alert(`✅ Notification sent to ${res.data.count} attendees!`);
      }
    } catch (err) {
      console.error("Send error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      if (err.response?.status === 403) {
        alert("You don't have permission to send notifications for this event. Make sure you are the event organizer.");
      } else if (err.response?.status === 401) {
        alert("Please login again. Your session may have expired.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        alert(err.response?.data?.message || "Failed to send notification");
      }
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchSentNotifications(selectedEventId);
    }
  }, [selectedEventId]);

  return (
    <div>
      <PageHeader title="Notifications" sub="Send announcements or reminders to event attendees." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <Card>
          <h3 className="text-sm font-bold text-gray-800 mb-4">Send Notification</h3>
          <form onSubmit={handleSend} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-400 font-semibold tracking-[0.04em]">
                Select Event *
              </label>
              <select
                required
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="border border-orange-100 rounded-xl px-3 py-[9px] text-[13px] bg-white outline-none focus:border-orange-300 transition-colors"
              >
                <option value="">— Choose an event —</option>
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title} ({new Date(ev.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              {["announcement", "reminder", "update"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`text-[13px] font-semibold px-4 py-2 rounded-xl cursor-pointer border-none transition-all ${type === t
                    ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                    : "bg-orange-50 text-gray-500"
                    }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-400 font-semibold tracking-[0.04em]">
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border border-orange-100 rounded-xl px-3 py-[9px] text-[13px] outline-none focus:border-orange-300 transition-colors"
                placeholder="e.g., Important Update: Venue Changed"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-400 font-semibold tracking-[0.04em]">
                Message *
              </label>
              <textarea
                required
                rows={4}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                className="border border-orange-100 rounded-xl px-3 py-[9px] text-[13px] resize-none outline-none focus:border-orange-300 transition-colors"
                placeholder={
                  type === "reminder"
                    ? "Reminder: Your event is tomorrow at 10 AM. Don't forget to bring your ticket!"
                    : "Announcement: The venue has been changed to Mumbai Convention Center, Hall B."
                }
              />
            </div>

            <Btn type="submit" full disabled={sending}>
              {sending ? "Sending..." : `Send ${type} to All Attendees`}
            </Btn>
          </form>

          {sent && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-[13px] rounded-xl px-4 py-3 mt-3 font-semibold">
              ✓ Notification sent successfully to all attendees!
            </div>
          )}
        </Card>

        {/* Sent Notifications History */}
        <Card>
          <h3 className="text-sm font-bold text-gray-800 mb-4">
            Sent Notifications
          </h3>

          {!selectedEventId ? (
            <p className="text-center text-gray-400 text-[13px] py-8">
              Select an event to view sent notifications
            </p>
          ) : sentNotifications.length === 0 ? (
            <p className="text-center text-gray-400 text-[13px] py-8">
              No notifications sent for this event yet
            </p>
          ) : (
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
              {sentNotifications.map((notif) => (
                <div key={notif._id} className="border border-orange-100 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase bg-orange-50 text-orange-500 px-2 py-0.5 rounded">
                      {notif.type}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="font-semibold text-[13px] text-gray-800 m-0">
                    {notif.title}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1 m-0">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                    <span>📨 Sent to {notif.isBroadcast ? "all attendees" : "1 attendee"}</span>
                    <span>👁️ {notif.isRead ? "Read" : "Unread"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats Section without Open Rate */}
          {stats && stats.totalSent > 0 && (
            <div className="mt-4 pt-3 border-t border-orange-100 grid grid-cols-2 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-orange-600">{stats.totalSent}</div>
                <div className="text-[10px] text-gray-400">Total Sent</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-600">{stats.uniqueRecipients}</div>
                <div className="text-[10px] text-gray-400">Recipients</div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ── GALLERY ──
function Gallery({ events = [] }) {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [viewImage, setViewImage] = useState(null);

  const token = localStorage.getItem("token");

  const fetchImages = async (eventId) => {
    if (!eventId) { setImages([]); return; }
    setLoadingImages(true);
    try {
      const res = await fetch(`http://localhost:5000/api/images/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setImages(data.images);
      else setImages([]);
    } catch { setImages([]); }
    finally { setLoadingImages(false); }
  };

  const handleEventChange = (e) => {
    const id = e.target.value;
    setSelectedEventId(id);
    fetchImages(id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/images/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setImages((prev) => prev.filter((img) => img._id !== id));
      else alert(data.message || "Failed to delete.");
    } catch { alert("Failed to delete image."); }
  };

  return (
    <div>
      <PageHeader title="Gallery" sub="View photos uploaded by attendees for your events." />

      {/* Event selector */}
      <Card className="mb-5">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 font-semibold tracking-[0.04em]">Select Event</label>
          <select
            value={selectedEventId}
            onChange={handleEventChange}
            className="border border-orange-100 rounded-xl px-3 py-[9px] text-[13px] bg-white outline-none focus:border-orange-300 transition-colors"
          >
            <option value="">— Choose an event —</option>
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title}{ev.date ? ` — ${new Date(ev.date).toLocaleDateString()}` : ""}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Images grid */}
      {!selectedEventId ? (
        <Card>
          <div className="py-10 text-center">
            <Images size={36} className="mx-auto mb-2 text-orange-200" />
            <p className="text-sm text-gray-400 m-0 font-semibold">Select an event above to view uploaded photos.</p>
          </div>
        </Card>
      ) : loadingImages ? (
        <Card><p className="text-center text-gray-400 m-0 py-6">Loading images...</p></Card>
      ) : images.length === 0 ? (
        <Card>
          <div className="py-10 text-center">
            <Images size={36} className="mx-auto mb-2 text-orange-200" />
            <p className="text-sm text-gray-500 m-0 font-semibold">No photos uploaded yet</p>
            <p className="text-xs text-gray-400 m-0 mt-1">Attendees can upload photos from their dashboard.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img) => (
            <div key={img._id} className="group relative rounded-xl overflow-hidden border border-orange-100 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="aspect-square cursor-pointer overflow-hidden" onClick={() => setViewImage(img)}>
                <img src={img.imageData} alt={img.caption || img.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-2.5">
                <p className="text-[11px] font-semibold text-gray-700 m-0 truncate">{img.uploaderName}</p>
                {img.caption && <p className="text-[10px] text-gray-400 m-0 mt-0.5 truncate">{img.caption}</p>}
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-gray-400">{new Date(img.createdAt).toLocaleDateString()}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(img._id)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-50 text-red-400 border-0 cursor-pointer hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {viewImage && (
        <div className="fixed inset-0 z-[9999] grid place-items-center p-6 bg-black/60 backdrop-blur-sm" onClick={() => setViewImage(null)}>
          <div className="relative max-w-2xl w-full rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setViewImage(null)} className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-md border-0 cursor-pointer hover:bg-white transition-colors">
              <X size={16} />
            </button>
            <img src={viewImage.imageData} alt={viewImage.caption || viewImage.fileName} className="w-full max-h-[70vh] object-contain bg-gray-100" />
            <div className="p-4">
              <p className="font-bold text-sm text-gray-800 m-0">Uploaded by {viewImage.uploaderName}</p>
              {viewImage.caption && <p className="text-[13px] text-gray-500 m-0 mt-1">{viewImage.caption}</p>}
              <p className="text-[11px] text-gray-400 m-0 mt-1">{new Date(viewImage.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── FEEDBACK (Updated with real data) ──
function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEventFilter, setSelectedEventFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [events, setEvents] = useState([]);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = `http://localhost:${PORT}/api/feedback/organizer/all`;
      const params = new URLSearchParams();
      if (selectedEventFilter) params.append("eventId", selectedEventFilter);
      if (ratingFilter) params.append("rating", ratingFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setFeedbacks(res.data.feedbacks);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Fetch feedbacks error:", err);
      alert("Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:${PORT}/api/events/getMyEvents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error("Fetch events error:", err);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    fetchEvents();
  }, [selectedEventFilter, ratingFilter]);

  const handleRespond = async (feedbackId) => {
    if (!responseText.trim()) {
      alert("Please enter a response");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:${PORT}/api/feedback/organizer/respond/${feedbackId}`,
        { response: responseText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Response added!");
      setSelectedFeedback(null);
      setResponseText("");
      fetchFeedbacks();
    } catch (err) {
      alert("Failed to add response");
    }
  };

  const handleTogglePublish = async (feedbackId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = currentStatus ? "hide" : "publish";
      await axios.put(
        `http://localhost:${PORT}/api/feedback/organizer/${endpoint}/${feedbackId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(currentStatus ? "Feedback hidden" : "Feedback published");
      fetchFeedbacks();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const StarDisplay = ({ rating }) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? "fill-orange-500 text-orange-500" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="p-5 text-center">Loading feedbacks...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Feedback & Reviews"
        sub="See what participants said about your events and respond to them."
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-orange-100">
            <div className="text-2xl font-bold text-orange-600">{stats.total}</div>
            <div className="text-xs text-gray-400">Total Feedbacks</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-orange-100">
            <div className="text-2xl font-bold text-emerald-600">{stats.averageRating}</div>
            <div className="text-xs text-gray-400">Average Rating</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-orange-100">
            <div className="text-2xl font-bold text-blue-600">{stats.responded}</div>
            <div className="text-xs text-gray-400">Responded</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-orange-100">
            <div className="text-2xl font-bold text-amber-600">{stats.notResponded}</div>
            <div className="text-xs text-gray-400">Pending Response</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <select
          value={selectedEventFilter}
          onChange={(e) => setSelectedEventFilter(e.target.value)}
          className="border border-orange-100 rounded-xl px-3 py-2 text-[13px] bg-white outline-none"
        >
          <option value="">All Events</option>
          {events.map(event => (
            <option key={event._id} value={event._id}>{event.title}</option>
          ))}
        </select>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="border border-orange-100 rounded-xl px-3 py-2 text-[13px] bg-white outline-none"
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Feedback List */}
      {feedbacks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-orange-100 p-12 text-center">
          <MessageCircle size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-gray-400">No feedback received yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <Card key={fb._id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-semibold text-gray-800">{fb.audienceName}</span>
                    <StarDisplay rating={fb.rating} />
                    <span className="text-[11px] text-gray-400">
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </span>
                    {!fb.isPublished && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Hidden</span>
                    )}
                  </div>
                  <p className="text-[13px] text-gray-600 mb-2">{fb.comment}</p>
                  <p className="text-[11px] text-gray-400">Event: {fb.eventTitle}</p>

                  {fb.organizerResponded && (
                    <div className="mt-3 bg-orange-50 rounded-lg p-3">
                      <p className="text-[11px] font-semibold text-orange-600 mb-1">Your Response:</p>
                      <p className="text-[13px] text-gray-700">{fb.organizerResponse}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedFeedback(fb);
                      setResponseText(fb.organizerResponse || "");
                    }}
                    className="px-3 py-1.5 text-[11px] bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100"
                  >
                    {fb.organizerResponded ? "Edit Response" : "Respond"}
                  </button>
                  <button
                    onClick={() => handleTogglePublish(fb._id, fb.isPublished)}
                    className={`px-3 py-1.5 text-[11px] rounded-lg ${fb.isPublished
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                  >
                    {fb.isPublished ? "Hide" : "Publish"}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Respond to {selectedFeedback.audienceName}
            </h3>
            <div className="mb-4 p-3 bg-orange-50 rounded-lg">
              <p className="text-[11px] text-gray-500 mb-1">Original Feedback:</p>
              <p className="text-sm text-gray-700">{selectedFeedback.comment}</p>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={14} className={star <= selectedFeedback.rating ? "fill-orange-500" : "text-gray-300"} />
                ))}
              </div>
            </div>
            <textarea
              rows={4}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              className="w-full border border-orange-100 rounded-xl px-3 py-2 text-[13px] resize-none focus:outline-none focus:border-orange-300"
              placeholder="Write your response here..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleRespond(selectedFeedback._id)}
                className="flex-1 bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600"
              >
                Send Response
              </button>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="flex-1 border border-slate-200 py-2 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PROFILE ──
function Profile() {

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    orgName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        console.log("Fetching:", "http://localhost:5000/api/organizer/profile");

        const res = await axios.get(
          `http://localhost:${PORT}/api/organizer/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          setOrganizer(res.data.organizer);

          setFormData({
            fullName: res.data.organizer.fullName || "",
            orgName: res.data.organizer.orgName || "",
            email: res.data.organizer.email || "",
            phone: res.data.organizer.phone || "",
            address: res.data.organizer.address || "",
            city: res.data.organizer.city || "",
            state: res.data.organizer.state || "",
            country: res.data.organizer.country || "",
            pincode: res.data.organizer.pincode || "",
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `http://localhost:${PORT}/api/organizer/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setOrganizer(res.data.user);
        setIsEditing(false);
        alert("Profile updated successfully");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!organizer) {
    return <p>Profile not found</p>;
  }

  return (
    <div>
      <PageHeader
        title="Profile & Settings"
        sub="Manage your organizer account details."
      />

      {/* Profile Header */}
      <Card className="mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-2xl font-extrabold text-white shadow-md shadow-orange-200">
              {organizer.fullName.charAt(0)}
            </div>

            <div>
              <h3 className="text-lg font-bold text-orange-800">
                {organizer.fullName}
              </h3>

              <p className="text-orange-400 text-sm">
                {organizer.orgName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge status={organizer.status} />

            {isEditing && (
              <Btn onClick={handleSave} className="bg-green-600 text-white hover:bg-green-700">
                Save Changes
              </Btn>
            )}

            <Btn onClick={() => setIsEditing(!isEditing)}>
              <Pencil size={14} />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Btn>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="mb-5">
        <h3 className="text-sm font-bold text-orange-800 mb-4">
          Personal Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {isEditing ? (
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="border border-orange-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none rounded-lg p-2 w-full text-orange-900 bg-orange-50/30"
            />
          ) : (
            <InfoBox
              icon={<User size={18} className="text-orange-500" />}
              label="Full Name"
              value={organizer.fullName}
            />
          )}

          {isEditing ? (
            <input
              type="text"
              name="orgName"
              value={formData.orgName}
              onChange={handleChange}
              className="border border-orange-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none rounded-lg p-2 w-full text-orange-900 bg-orange-50/30"
            />
          ) : (
            <InfoBox
              icon={<Building2 size={18} className="text-orange-500" />}
              label="Organization"
              value={organizer.orgName}
            />
          )}

          {isEditing ? (
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border border-orange-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none rounded-lg p-2 w-full text-orange-900 bg-orange-50/30"
            />
          ) : (
            <InfoBox
              icon={<Mail size={18} className="text-orange-500" />}
              label="Email"
              value={organizer.email}
            />
          )}

          {
            isEditing && (
              <div className="mt-5 flex justify-end">
                <Btn onClick={handleSave}>
                  Save Changes
                </Btn>
              </div>
            )
          }
        </div>
      </Card>

      {/* Address Information */}
      <Card className="mb-5">
        <h3 className="text-sm font-bold text-orange-800 mb-4">
          Address Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {isEditing ? (
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="border border-orange-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none rounded-lg p-2 w-full text-orange-900 bg-orange-50/30"
            />
          ) : (
            <InfoBox
              icon={<MapPin size={18} className="text-orange-500" />}
              label="Address"
              value={organizer.address}
            />
          )}

          {isEditing ? (
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="border border-orange-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none rounded-lg p-2 w-full text-orange-900 bg-orange-50/30"
            />
          ) : (
            <InfoBox
              icon={<MapPin size={18} className="text-orange-500" />}
              label="City"
              value={organizer.city}
            />
          )}

          {isEditing ? (
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="border border-orange-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none rounded-lg p-2 w-full text-orange-900 bg-orange-50/30"
            />
          ) : (
            <InfoBox
              icon={<MapPin size={18} className="text-orange-500" />}
              label="State"
              value={organizer.state}
            />
          )}

          {isEditing ? (
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="border border-orange-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none rounded-lg p-2 w-full text-orange-900 bg-orange-50/30"
            />
          ) : (
            <InfoBox
              icon={<MapPin size={18} className="text-orange-500" />}
              label="Pincode"
              value={organizer.pincode}
            />
          )}
        </div>
      </Card>

      {/* Verification Details */}
      <Card>
        <h3 className="text-sm font-bold text-orange-800 mb-4">
          Verification Details
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <InfoBox
            icon={<ShieldCheck size={18} className="text-orange-500" />}
            label="ID Type"
            value={organizer.idType}
          />

          <InfoBox
            icon={<ShieldCheck size={18} className="text-orange-500" />}
            label="ID Number"
            value={organizer.idNumber}
          />

          <InfoBox
            icon={<CalendarDays size={18} className="text-orange-500" />}
            label="Member Since"
            value={
              organizer.createdAt
                ? new Date(organizer.createdAt).toLocaleDateString()
                : "-"
            }
          />

          <InfoBox
            icon={<ShieldCheck size={18} className="text-orange-500" />}
            label="Status"
            value={organizer.status}
          />
        </div>
      </Card>
      {
        isEditing && (
          <div className="mt-5 flex justify-end">
            <Btn onClick={handleSave}>
              Save Changes
            </Btn>
          </div>
        )
      }
    </div>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <div className="border border-orange-100 rounded-xl p-4 flex gap-3">
      <div className="text-orange-500 mt-0.5">
        {icon}
      </div>

      <div>
        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">
          {label}
        </p>

        <p className="text-sm font-semibold text-gray-800 mt-1">
          {value}
        </p>
      </div>
    </div>
  );
}

// ── MAIN EXPORT ──
export default function OrganizerPanel() {
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [organizer, setOrganizer] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:${PORT}/api/events/getMyEvents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success && Array.isArray(res.data.events)) {
        setEvents(res.data.events);
      } else {
        setEvents([]);
        setError("Failed to load events: Invalid response format");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    const fetchOrganizer = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://localhost:${PORT}/api/organizer/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          setOrganizer(res.data.organizer);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrganizer();
  }, []);

  const activeLabel = sidebarItems.find(n => n.id === active)?.label;

  if (loading && events.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#fdf6f0]">
        <div className="text-center">
          <div className="text-2xl mb-4">🎉</div>
          <p className="text-gray-500">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#fdf6f0]">
        <Card className="text-center max-w-sm">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Btn onClick={fetchEvents}>Retry</Btn>
        </Card>
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading organizer profile...</p>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (active) {
      case "dashboard": return <Dashboard key="dashboard" events={events} />;
      case "events": return <EventManagement key="events" events={events} setEvents={setEvents} fetchEvents={fetchEvents} />;
      case "registrations": return <Registrations key="registrations" />;
      case "qr": return <QRCheckin key="qr" />;
      case "notifications": return <Notifications key="notifications" events={events} />;
      case "gallery": return <Gallery key="gallery" events={events} />;
      case "feedback": return <Feedback key="feedback" />;
      case "profile": return <Profile key="profile" />;
      default: return <Dashboard key="dashboard-default" events={events} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#fdf6f0] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-0 overflow-hidden"} transition-all duration-300 bg-white border-r border-orange-100 flex flex-col shrink-0`}>
        {/* Brand */}
        <div className="px-6 py-5 border-b border-orange-100">
          <span className="text-2xl font-extrabold text-orange-500 tracking-tight">
            Nex<span className="text-purple-600">Event</span>
          </span>
          <p className="text-xs text-gray-400 mt-0.5">Organizer Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActive(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${active === id
                  ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
                }`}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-orange-100">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-orange-100 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-orange-500 transition">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-lg font-bold text-gray-800">{activeLabel}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-orange-500 transition">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-lg font-bold text-white shadow-md shadow-orange-200">
              {organizer?.fullName?.charAt(0) || "O"}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}