import { useState, useEffect } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  QrCode,
  Bell,
  Images,
  MessageSquareText,
  UserCog,
  Menu,
  X,
  LogOut,
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

const mockParticipants = [
  { id: 1, name: "Aisha Khan", email: "aisha@email.com", event: "Tech Summit 2025", status: "confirmed", attended: false },
  { id: 2, name: "Rohan Mehta", email: "rohan@email.com", event: "Tech Summit 2025", status: "confirmed", attended: true },
  { id: 3, name: "Priya Sharma", email: "priya@email.com", event: "Design Workshop", status: "pending", attended: false },
  { id: 4, name: "Arjun Das", email: "arjun@email.com", event: "Design Workshop", status: "confirmed", attended: true },
];

const mockFeedback = [
  { id: 1, user: "Rohan Mehta", event: "Startup Meetup", rating: 5, comment: "Amazing event, very well organized!", date: "2025-06-12" },
  { id: 2, user: "Priya Sharma", event: "Startup Meetup", rating: 4, comment: "Great networking opportunities.", date: "2025-06-11" },
  { id: 3, user: "Arjun Das", event: "Startup Meetup", rating: 3, comment: "Good content but venue was small.", date: "2025-06-11" },
];

// ── BADGE ──
function Badge({ status }) {
  const map = {
    upcoming:  "bg-orange-50 text-orange-500",
    completed: "bg-gray-100 text-gray-500",
    confirmed: "bg-green-50 text-green-700",
    pending:   "bg-yellow-50 text-yellow-700",
    approved:  "bg-green-50 text-green-700",
    rejected:  "bg-red-50 text-red-600",
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
    ghost:   "bg-transparent text-gray-500 border border-orange-100 hover:bg-orange-50",
    danger:  "bg-transparent text-red-500 border border-red-100 hover:bg-red-50",
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
  const eventCount = events.length;
  const totalRegistrations = events.reduce((sum, e) => {
    const reg = e.totalTickets - e.availableTickets;
    return sum + (reg > 0 ? reg : 0);
  }, 0);
  const totalSeats = events.reduce((sum, e) => sum + (e.totalTickets || 0), 0);
  const availableSeats = events.reduce((sum, e) => sum + (e.availableTickets || 0), 0);
  const today = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= today);
  const completedEvents = events.filter(e => new Date(e.date) < today);

  return (
    <div>
      <PageHeader title="Dashboard" sub="Welcome back. Here's what's happening." />
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Events" value={eventCount.toString()} sub="All time" accent />
        <StatCard label="Total Registrations" value={totalRegistrations.toString()} sub="Across all events" />
        <StatCard label="Available Seats" value={availableSeats.toString()} sub="Remaining capacity" />
        <StatCard label="Total Capacity" value={totalSeats.toString()} sub="Overall seats" />
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
            const registered = ev.totalTickets - ev.availableTickets;
            const pct = (registered / ev.totalTickets) * 100;
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
    // ← status removed: backend always sets it to "pending" on create
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
    } catch (err) { alert(err.response?.data?.message || "Failed to update event"); }
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
  return (
    <div>
      <PageHeader title="Registrations" sub="View participants and attendance records." />
      <div className="flex gap-2 mb-5">
        {["participants", "attendance"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-[13px] font-semibold px-4 py-2 rounded-xl cursor-pointer border-none transition-all ${tab === t ? "bg-orange-500 text-white shadow-md shadow-orange-200" : "bg-white text-gray-500 border border-orange-100"}`}>
            {t === "participants" ? "Participant List" : "Attendance List"}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-orange-50">
              {["Name", "Email", "Event", tab === "participants" ? "Status" : "Attended"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-orange-500 uppercase tracking-[0.1em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockParticipants.map((p, i) => (
              <tr key={p.id} className={`border-b border-orange-50 ${i % 2 === 0 ? "bg-white" : "bg-orange-50/40"}`}>
                <td className="px-5 py-3 font-semibold text-gray-800">{p.name}</td>
                <td className="px-5 py-3 text-gray-400">{p.email}</td>
                <td className="px-5 py-3 text-gray-500">{p.event}</td>
                <td className="px-5 py-3">
                  {tab === "participants"
                    ? <Badge status={p.status} />
                    : <span className={`text-[11px] font-bold px-[10px] py-1 rounded-full ${p.attended ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{p.attended ? "Present" : "Absent"}</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── QR CHECK-IN ──
function QRCheckin() {
  const [scanned, setScanned] = useState(false);
  const [input, setInput] = useState("");

  function handleScan(e) {
    e.preventDefault();
    setScanned(true);
    setTimeout(() => setScanned(false), 3000);
    setInput("");
  }

  return (
    <div>
      <PageHeader title="QR Check-In" sub="Scan attendee QR codes to verify attendance." />
      <div className="grid grid-cols-2 gap-5">
        <Card>
          <h3 className="text-sm font-bold text-gray-800 mt-0 mb-4">Scan QR Code</h3>
          <div className="bg-orange-50 rounded-xl flex items-center justify-center h-44 border-2 border-dashed border-orange-200 mb-4">
            <div className="text-center text-orange-300">
              <QrCode size={40} className="mx-auto mb-1.5" />
              <p className="text-[11px] m-0">Camera scanner goes here</p>
            </div>
          </div>
          <form onSubmit={handleScan} className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              className="flex-1 border border-orange-100 rounded-xl px-3 py-[9px] text-[13px] outline-none focus:border-orange-300 transition-colors"
              placeholder="Or enter ticket ID manually" />
            <Btn type="submit">Verify</Btn>
          </form>
          {scanned && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-[13px] rounded-xl px-4 py-3 mt-3 font-semibold">
              Attendance verified successfully.
            </div>
          )}
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-gray-800 mt-0 mb-4">Recent Check-ins</h3>
          <div className="flex flex-col gap-3.5">
            {mockParticipants.filter(p => p.attended).map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[13px] text-gray-800 m-0">{p.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{p.event}</p>
                </div>
                <span className="text-[11px] font-bold bg-orange-50 text-orange-500 px-[10px] py-1 rounded-full">Checked in</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── NOTIFICATIONS ──
function Notifications({ events = [] }) {
  const [msg, setMsg] = useState("");
  const [type, setType] = useState("reminder");
  const [sent, setSent] = useState(false);

  function handleSend(e) {
    e.preventDefault();
    setSent(true);
    setMsg("");
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <div>
      <PageHeader title="Notifications" sub="Send reminders or announcements to participants." />
      <Card className="max-w-[480px]">
        <div className="flex gap-2 mb-5">
          {["reminder", "announcement"].map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`text-[13px] font-semibold px-4 py-2 rounded-xl cursor-pointer border-none transition-all ${type === t ? "bg-orange-500 text-white shadow-md shadow-orange-200" : "bg-orange-50 text-gray-500"}`}>
              {t === "reminder" ? "Send Reminder" : "Send Announcement"}
            </button>
          ))}
        </div>
        <form onSubmit={handleSend} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400 font-semibold tracking-[0.04em]">Select Event</label>
            <select className="border border-orange-100 rounded-xl px-3 py-[9px] text-[13px] bg-white outline-none focus:border-orange-300 transition-colors">
              {events.map(ev => <option key={ev._id}>{ev.title}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400 font-semibold tracking-[0.04em]">Message</label>
            <textarea required rows={4} value={msg} onChange={e => setMsg(e.target.value)}
              className="border border-orange-100 rounded-xl px-3 py-[9px] text-[13px] resize-none outline-none focus:border-orange-300 transition-colors"
              placeholder={type === "reminder" ? "Reminder: Your event is tomorrow at 10 AM..." : "Announcement: Venue has changed to..."} />
          </div>
          <Btn type="submit" full>Send to All Participants</Btn>
        </form>
        {sent && (
          <div className="bg-orange-50 border border-orange-200 text-orange-500 text-[13px] rounded-xl px-4 py-3 mt-3 font-semibold">
            {type === "reminder" ? "Reminder" : "Announcement"} sent successfully.
          </div>
        )}
      </Card>
    </div>
  );
}

// ── GALLERY ──
function Gallery() {
  return (
    <div>
      <PageHeader title="Gallery" sub="Manage event photos and media." />
      <Card>
        <div className="border-2 border-dashed border-orange-200 rounded-xl py-10 px-6 text-center cursor-pointer mb-5 hover:border-orange-400 hover:bg-orange-50/50 transition-colors">
          <Images size={28} className="mx-auto mb-2 text-orange-300" />
          <p className="text-sm font-bold text-gray-500 m-0 mb-1">Click to upload photos or videos</p>
          <p className="text-xs text-gray-400 m-0">PNG, JPG, MP4 supported</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-orange-50 rounded-xl flex items-center justify-center">
              <span className="text-[11px] text-orange-200 font-semibold uppercase tracking-[0.1em]">Photo</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── FEEDBACK ──
function Feedback() {
  return (
    <div>
      <PageHeader title="Feedback & Reviews" sub="See what participants said about your events." />
      <div className="flex flex-col gap-3">
        {mockFeedback.map(f => (
          <Card key={f.id}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-bold text-sm text-gray-800 m-0">{f.user}</p>
                <p className="text-xs text-gray-400 mt-0.5">{f.event} · {f.date}</p>
              </div>
              <Stars rating={f.rating} />
            </div>
            <p className="text-[13px] text-gray-500 m-0 italic">"{f.comment}"</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── PROFILE ──
function Profile() {
  return (
    <div>
      <PageHeader title="Profile & Settings" sub="Manage your organizer account." />
      <Card className="max-w-[480px]">
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-orange-100">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-xl font-extrabold text-white shadow-md shadow-orange-200">O</div>
          <div>
            <p className="font-bold text-[15px] text-gray-800 m-0">OrganizerName</p>
            <p className="text-[13px] text-gray-400 mt-0.5">organizer@email.com</p>
          </div>
        </div>
        <div className="flex flex-col gap-3.5 mb-5">
          {["Full Name", "Email", "Phone", "Organization"].map(field => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-400 font-semibold tracking-[0.04em]">{field}</label>
              <input className="border border-orange-100 rounded-xl px-3 py-[9px] text-[13px] outline-none focus:border-orange-300 transition-colors" placeholder={field} />
            </div>
          ))}
        </div>
        <Btn>Save Changes</Btn>
      </Card>
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

  useEffect(() => { fetchEvents(); }, []);

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

  const renderActiveView = () => {
    switch (active) {
      case "dashboard":     return <Dashboard key="dashboard" events={events} />;
      case "events":        return <EventManagement key="events" events={events} setEvents={setEvents} fetchEvents={fetchEvents} />;
      case "registrations": return <Registrations key="registrations" />;
      case "qr":            return <QRCheckin key="qr" />;
      case "notifications": return <Notifications key="notifications" events={events} />;
      case "gallery":       return <Gallery key="gallery" />;
      case "feedback":      return <Feedback key="feedback" />;
      case "profile":       return <Profile key="profile" />;
      default:              return <Dashboard key="dashboard-default" events={events} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#fdf6f0] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-0 overflow-hidden"} transition-all duration-300 bg-white border-r border-orange-100 flex flex-col shrink-0`}>
        <div className="px-6 py-5 border-b border-orange-100">
          <span className="text-2xl font-extrabold text-orange-500 tracking-tight">
            Nex<span className="text-purple-600">Event</span>
          </span>
          <p className="text-xs text-gray-400 mt-0.5">Organizer Panel</p>
        </div>
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
        <div className="px-3 py-4 border-t border-orange-100">
          <button
            onClick={() => window.location.href = "/"}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
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
            <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">O</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}