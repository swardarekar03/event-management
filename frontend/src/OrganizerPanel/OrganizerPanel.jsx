import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const PORT = 5000;

const sidebarItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "events", label: "Event Management" },
  { id: "registrations", label: "Registrations" },
  { id: "qr", label: "QR Check-In" },
  { id: "notifications", label: "Notifications" },
  { id: "gallery", label: "Gallery" },
  { id: "feedback", label: "Feedback & Reviews" },
  { id: "profile", label: "Profile & Settings" },
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

// ── DESIGN TOKENS (inline style objects for orange/black/white) ──
const C = {
  orange: "#F15A22",
  orangeHover: "#D94E1A",
  orangeLight: "#FFF0EB",
  black: "#111111",
  darkGray: "#1E1E1E",
  midGray: "#4A4A4A",
  lightGray: "#F5F5F5",
  border: "#E8E8E8",
  white: "#FFFFFF",
};

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: accent ? C.black : C.white, borderRadius: 16, padding: "20px 24px", border: `1px solid ${accent ? "transparent" : C.border}`, display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: accent ? "rgba(255,255,255,0.5)" : C.midGray, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      <span style={{ fontSize: 32, fontWeight: 800, color: accent ? C.orange : C.black, lineHeight: 1.1 }}>{value}</span>
      {sub && <span style={{ fontSize: 11, color: accent ? "rgba(255,255,255,0.4)" : "#999" }}>{sub}</span>}
    </div>
  );
}

function Badge({ status }) {
  const map = {
    upcoming: { bg: C.orangeLight, color: C.orange },
    completed: { bg: C.lightGray, color: C.midGray },
    confirmed: { bg: "#EDFAF3", color: "#1A7A4A" },
    pending: { bg: "#FFF8E1", color: "#A06000" },
    approved: { bg: "#EDFAF3", color: "#1A7A4A" },
    rejected: { bg: "#FEF2F2", color: "#C0392B" },
  };
  const s = map[status] || { bg: C.lightGray, color: C.midGray };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: s.bg, color: s.color, letterSpacing: "0.03em" }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function Stars({ rating }) {
  return (
    <span style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= rating ? C.orange : C.border, fontSize: 16 }}>★</span>
      ))}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", type = "button", full }) {
  const styles = {
    primary: { background: C.orange, color: C.white, border: "none" },
    ghost: { background: "transparent", color: C.midGray, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: "#C0392B", border: "1px solid #FAD7D5" },
    outline: { background: "transparent", color: C.orange, border: `1px solid ${C.orange}` },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        ...styles[variant],
        fontSize: 13,
        fontWeight: 700,
        padding: "8px 16px",
        borderRadius: 10,
        cursor: "pointer",
        width: full ? "100%" : undefined,
        transition: "opacity 0.15s",
        fontFamily: "inherit",
        letterSpacing: "0.01em",
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = "0.82"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, required, as, rows, children }) {
  const inputStyle = {
    width: "100%",
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "9px 12px",
    fontSize: 13,
    color: C.black,
    fontFamily: "inherit",
    background: C.white,
    outline: "none",
    boxSizing: "border-box",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 11, color: C.midGray, fontWeight: 600, letterSpacing: "0.04em" }}>{label}</label>}
      {as === "textarea" ? (
        <textarea rows={rows} required={required} value={value} onChange={onChange} placeholder={placeholder} style={{ ...inputStyle, resize: "none" }} />
      ) : as === "select" ? (
        <select value={value} onChange={onChange} style={inputStyle}>{children}</select>
      ) : (
        <input type={type} required={required} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle} />
      )}
    </div>
  );
}

// ── PAGE HEADER ──
function PageHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.black, margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: 13, color: "#999", marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

// ── CARD WRAPPER ──
function Card({ children, style }) {
  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "20px 24px", ...style }}>
      {children}
    </div>
  );
}

// ── DASHBOARD (UPDATED) ──
function Dashboard({ events = [] }) {
  const eventCount = events.length;
  
  // Calculate statistics from actual events
  const totalRegistrations = events.reduce((sum, event) => {
    const registered = event.totalTickets - event.availableTickets;
    return sum + (registered > 0 ? registered : 0);
  }, 0);
  
  const totalSeats = events.reduce((sum, event) => sum + (event.totalTickets || 0), 0);
  const availableSeats = events.reduce((sum, event) => sum + (event.availableTickets || 0), 0);
  
  // Get upcoming events (date >= today)
  const today = new Date();
  const upcomingEvents = events.filter(event => new Date(event.date) >= today);
  const completedEvents = events.filter(event => new Date(event.date) < today);
  
  return (
    <div>
      <PageHeader title="Dashboard" sub="Welcome back. Here's what's happening." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Events" value={eventCount.toString()} sub="All time" accent />
        <StatCard label="Total Registrations" value={totalRegistrations.toString()} sub="Across all events" />
        <StatCard label="Available Seats" value={availableSeats.toString()} sub="Remaining capacity" />
        <StatCard label="Total Capacity" value={totalSeats.toString()} sub="Overall seats" />
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.black, marginBottom: 12 }}>Upcoming Events ({upcomingEvents.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingEvents.slice(0, 3).map(ev => (
              <Card key={ev._id} style={{ padding: "12px 16px" }}>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{ev.title}</p>
                <p style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                  {new Date(ev.date).toLocaleDateString()} · {ev.venue}
                </p>
              </Card>
            ))}
          </div>
        </div>
        
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.black, marginBottom: 12 }}>Completed Events ({completedEvents.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {completedEvents.slice(0, 3).map(ev => (
              <Card key={ev._id} style={{ padding: "12px 16px" }}>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{ev.title}</p>
                <p style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                  {new Date(ev.date).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.black, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Your Events</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {events.length > 0 ? (
          events.map(ev => {
            const registered = ev.totalTickets - ev.availableTickets;
            const percentage = (registered / ev.totalTickets) * 100;
            
            return (
              <Card key={ev._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 20px" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: C.black, margin: 0 }}>{ev.title}</p>
                  <p style={{ fontSize: 12, color: "#999", marginTop: 3 }}>
                    {new Date(ev.date).toLocaleDateString()} · {ev.category}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 11, color: "#999" }}>Seats</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.black }}>
                      {registered}/{ev.totalTickets}
                    </p>
                  </div>
                  <div style={{ width: 80, background: C.lightGray, borderRadius: 99, height: 4 }}>
                    <div style={{ background: C.orange, height: 4, borderRadius: 99, width: `${percentage}%` }} />
                  </div>
                  <Badge status={ev.status} />
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <p style={{ textAlign: "center", color: C.midGray, margin: 0 }}>No events found. Create your first event!</p>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── EVENT MANAGEMENT (UPDATED) ──
function EventManagement({ events = [], setEvents, fetchEvents }) {
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({ 
    title: "", 
    category: "Technology", 
    date: "", 
    venue: "", 
    price: "", 
    totalTickets: "", 
    availableTickets: "",
    organizerName: "",
    status: "pending",
    image: ""
  });

  // Map category options from schema
  const categories = [
    "Technology",
    "Workshop",
    "Sports",
    "Cultural",
    "Business",
    "Music",
    "Other"
  ];

  const statuses = ["pending", "approved", "rejected"];

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Format the data according to your schema
      const eventData = {
        title: form.title,
        category: form.category,
        date: form.date,
        venue: form.venue,
        price: Number(form.price),
        totalTickets: Number(form.totalTickets),
        availableTickets: Number(form.availableTickets),
        organizer: { name: form.organizerName },
        status: form.status,
        image: form.image || ""
      };

      const res = await axios.post(`http://localhost:${PORT}/api/events/create-event`, eventData);

      if (res.data.success && res.data.event) {
        await fetchEvents(); // Refresh the events list
        resetForm();
        setShowForm(false);
        alert("Event created successfully!");
      }
    }
    catch (error) {
      console.error("Error creating event:", error);
      alert(error.response?.data?.message || "Failed to create event");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        title: form.title,
        category: form.category,
        date: form.date,
        venue: form.venue,
        price: Number(form.price),
        totalTickets: Number(form.totalTickets),
        availableTickets: Number(form.availableTickets),
        organizer: { name: form.organizerName },
        status: form.status,
        image: form.image || ""
      };

      const res = await axios.put(`http://localhost:${PORT}/api/events/update-event/${editingEvent._id}`, eventData);

      if (res.data.success) {
        await fetchEvents();
        resetForm();
        setShowEditForm(false);
        setEditingEvent(null);
        alert("Event updated successfully!");
      }
    }
    catch (error) {
      console.error("Error updating event:", error);
      alert(error.response?.data?.message || "Failed to update event");
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    
    try {
      await axios.delete(`http://localhost:${PORT}/api/events/delete-event/${eventId}`);
      await fetchEvents(); // Refresh the events list
      alert("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert(error.response?.data?.message || "Failed to delete event");
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setForm({
      title: event.title || "",
      category: event.category || "Technology",
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : "",
      venue: event.venue || "",
      price: event.price?.toString() || "",
      totalTickets: event.totalTickets?.toString() || "",
      availableTickets: event.availableTickets?.toString() || "",
      organizerName: event.organizer?.name || "",
      status: event.status || "pending",
      image: event.image || ""
    });
    setShowEditForm(true);
    setShowForm(false);
  };

  const resetForm = () => {
    setForm({
      title: "",
      category: "Technology",
      date: "",
      venue: "",
      price: "",
      totalTickets: "",
      availableTickets: "",
      organizerName: "",
      status: "pending",
      image: ""
    });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <PageHeader title="Event Management" sub="Create, edit or remove your events." />
        <Btn onClick={() => {
          resetForm();
          setShowForm(!showForm);
          setShowEditForm(false);
          setEditingEvent(null);
        }}>
          + Create Event
        </Btn>
      </div>

      {(showForm || showEditForm) && (
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.black, marginTop: 0, marginBottom: 16 }}>
            {showEditForm ? "Edit Event" : "New Event"}
          </h3>
          <form onSubmit={showEditForm ? handleUpdate : handleCreate}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "span 2" }}>
                <Input
                  label="Event Title *"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Annual Tech Meetup"
                />
              </div>
              
              <Input
                label="Category *"
                required
                as="select"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Input>
              
              <Input
                label="Date *"
                type="date"
                required
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
              
              <div style={{ gridColumn: "span 2" }}>
                <Input
                  label="Venue *"
                  required
                  value={form.venue}
                  onChange={e => setForm({ ...form, venue: e.target.value })}
                  placeholder="e.g. Mumbai Convention Center"
                />
              </div>
              
              <Input
                label="Price (₹) *"
                type="number"
                required
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. 499"
              />
              
              <Input
                label="Total Tickets *"
                type="number"
                required
                value={form.totalTickets}
                onChange={e => setForm({ ...form, totalTickets: e.target.value })}
                placeholder="e.g. 100"
              />
              
              <Input
                label="Available Tickets *"
                type="number"
                required
                value={form.availableTickets}
                onChange={e => setForm({ ...form, availableTickets: e.target.value })}
                placeholder="e.g. 100"
              />
              
              <Input
                label="Organizer Name *"
                required
                value={form.organizerName}
                onChange={e => setForm({ ...form, organizerName: e.target.value })}
                placeholder="e.g. Tech Club"
              />
              
              <Input
                label="Status"
                required
                as="select"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </Input>
              
              <Input
                label="Image URL (optional)"
                value={form.image}
                onChange={e => setForm({ ...form, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Btn type="submit">{showEditForm ? "Update Event" : "Save Event"}</Btn>
              <Btn variant="ghost" onClick={() => {
                setShowForm(false);
                setShowEditForm(false);
                setEditingEvent(null);
                resetForm();
              }}>
                Cancel
              </Btn>
            </div>
          </form>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {events && events.length > 0 ? (
          events.map(ev => (
            <Card key={ev._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 20px" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: C.black, margin: 0 }}>{ev.title}</p>
                <p style={{ fontSize: 12, color: "#999", marginTop: 3 }}>
                  {new Date(ev.date).toLocaleDateString()} · {ev.category} · 
                  Available: {ev.availableTickets}/{ev.totalTickets} seats · 
                  ₹{ev.price}
                </p>
                {ev.organizer?.name && (
                  <p style={{ fontSize: 11, color: "#AAA", marginTop: 2 }}>
                    Organizer: {ev.organizer.name}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <Badge status={ev.status} />
                <Btn variant="outline" onClick={() => handleEdit(ev)}>Edit</Btn>
                <Btn variant="danger" onClick={() => handleDelete(ev._id)}>Delete</Btn>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p style={{ textAlign: "center", color: C.midGray, margin: 0 }}>No events found. Click "Create Event" to get started.</p>
          </Card>
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
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["participants", "attendance"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 10, cursor: "pointer", border: "none", fontFamily: "inherit",
            background: tab === t ? C.black : C.lightGray, color: tab === t ? C.white : C.midGray, transition: "all 0.15s",
          }}>
            {t === "participants" ? "Participant List" : "Attendance List"}
          </button>
        ))}
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.black }}>
              {["Name", "Email", "Event", tab === "participants" ? "Status" : "Attended"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 20px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</th>
              ))}
             </tr>
          </thead>
          <tbody>
            {mockParticipants.map((p, i) => (
              <tr key={p.id} style={{ background: i % 2 === 0 ? C.white : "#FAFAFA", borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "12px 20px", fontWeight: 600, color: C.black }}>{p.name}</td>
                <td style={{ padding: "12px 20px", color: "#999" }}>{p.email}</td>
                <td style={{ padding: "12px 20px", color: C.midGray }}>{p.event}</td>
                <td style={{ padding: "12px 20px" }}>
                  {tab === "participants"
                    ? <Badge status={p.status} />
                    : <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: p.attended ? "#EDFAF3" : "#FEF2F2", color: p.attended ? "#1A7A4A" : "#C0392B" }}>{p.attended ? "Present" : "Absent"}</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.black, marginTop: 0, marginBottom: 16 }}>Scan QR Code</h3>
          <div style={{ background: C.lightGray, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", height: 176, border: `2px dashed ${C.border}`, marginBottom: 16 }}>
            <div style={{ textAlign: "center", color: "#CCC" }}>
              <div style={{ fontSize: 40, marginBottom: 6, fontWeight: 300 }}>[  ]</div>
              <p style={{ fontSize: 11, margin: 0 }}>Camera scanner goes here</p>
            </div>
          </div>
          <form onSubmit={handleScan} style={{ display: "flex", gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", outline: "none" }}
              placeholder="Or enter ticket ID manually" />
            <Btn type="submit">Verify</Btn>
          </form>
          {scanned && (
            <div style={{ background: "#EDFAF3", border: "1px solid #B2EFD0", color: "#1A7A4A", fontSize: 13, borderRadius: 10, padding: "12px 16px", marginTop: 12, fontWeight: 600 }}>
              Attendance verified successfully.
            </div>
          )}
        </Card>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.black, marginTop: 0, marginBottom: 16 }}>Recent Check-ins</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mockParticipants.filter(p => p.attended).map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, color: C.black, margin: 0 }}>{p.name}</p>
                  <p style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{p.event}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, background: C.orangeLight, color: C.orange, padding: "4px 10px", borderRadius: 999 }}>Checked in</span>
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
      <Card style={{ maxWidth: 480 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["reminder", "announcement"].map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 10, cursor: "pointer", border: "none", fontFamily: "inherit",
              background: type === t ? C.black : C.lightGray, color: type === t ? C.white : C.midGray,
            }}>
              {t === "reminder" ? "Send Reminder" : "Send Announcement"}
            </button>
          ))}
        </div>
        <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, color: C.midGray, fontWeight: 600, letterSpacing: "0.04em" }}>Select Event</label>
            <select style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", background: C.white, outline: "none" }}>
              {events.map(ev => <option key={ev._id}>{ev.title}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, color: C.midGray, fontWeight: 600, letterSpacing: "0.04em" }}>Message</label>
            <textarea required rows={4} value={msg} onChange={e => setMsg(e.target.value)}
              style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none" }}
              placeholder={type === "reminder" ? "Reminder: Your event is tomorrow at 10 AM..." : "Announcement: Venue has changed to..."} />
          </div>
          <Btn type="submit" full>Send to All Participants</Btn>
        </form>
        {sent && (
          <div style={{ background: C.orangeLight, border: `1px solid ${C.orange}`, color: C.orange, fontSize: 13, borderRadius: 10, padding: "12px 16px", marginTop: 12, fontWeight: 600 }}>
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
        <div style={{ border: `2px dashed ${C.border}`, borderRadius: 12, padding: "40px 24px", textAlign: "center", color: "#CCC", cursor: "pointer", marginBottom: 20, transition: "border-color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.orange}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.midGray, margin: "0 0 4px" }}>Click to upload photos or videos</p>
          <p style={{ fontSize: 12, color: "#AAA", margin: 0 }}>PNG, JPG, MP4 supported</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ aspectRatio: "1", background: C.lightGray, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, color: "#CCC", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Photo</span>
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
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mockFeedback.map(f => (
          <Card key={f.id}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: C.black, margin: 0 }}>{f.user}</p>
                <p style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{f.event} · {f.date}</p>
              </div>
              <Stars rating={f.rating} />
            </div>
            <p style={{ fontSize: 13, color: C.midGray, margin: 0, fontStyle: "italic" }}>"{f.comment}"</p>
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
      <Card style={{ maxWidth: 480 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: C.black, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: C.orange }}>O</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: C.black, margin: 0 }}>OrganizerName</p>
            <p style={{ fontSize: 13, color: "#999", marginTop: 2 }}>organizer@email.com</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
          {["Full Name", "Email", "Phone", "Organization"].map(field => (
            <div key={field} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, color: C.midGray, fontWeight: 600, letterSpacing: "0.04em" }}>{field}</label>
              <input style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", outline: "none" }} placeholder={field} />
            </div>
          ))}
        </div>
        <Btn>Save Changes</Btn>
      </Card>
    </div>
  );
}

// ── NAV ICONS (simple SVG, no emoji) ──
const NavIcon = ({ id, active }) => {
  const color = active ? C.orange : "#999";
  const icons = {
    dashboard: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill={color} /><rect x="9" y="1" width="6" height="6" rx="1.5" fill={color} /><rect x="1" y="9" width="6" height="6" rx="1.5" fill={color} /><rect x="9" y="9" width="6" height="6" rx="1.5" fill={color} /></svg>,
    events: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="12" rx="2" stroke={color} strokeWidth="1.5" /><path d="M5 1v4M11 1v4M1 7h14" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>,
    registrations: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke={color} strokeWidth="1.5" /><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>,
    qr: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5" /><rect x="10" y="1" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5" /><rect x="1" y="10" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5" /><path d="M10 10h5M13 13v2M10 13h2" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>,
    notifications: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2a5 5 0 00-5 5v3l-1 2h12l-1-2V7a5 5 0 00-5-5z" stroke={color} strokeWidth="1.5" /><path d="M6.5 13.5a1.5 1.5 0 003 0" stroke={color} strokeWidth="1.5" /></svg>,
    gallery: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke={color} strokeWidth="1.5" /><circle cx="5.5" cy="7" r="1.5" fill={color} /><path d="M2 13l4-4 3 3 2-2 3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    feedback: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.5 3.5 3.5.5-2.5 2.5.5 3.5L8 10.5 5 12l.5-3.5L3 6l3.5-.5L8 2z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /></svg>,
    profile: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke={color} strokeWidth="1.5" /><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>,
  };
  return icons[id] || null;
};

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
      const res = await axios.get(`http://localhost:${PORT}/api/events/get-events`);
      
      if (res.data && res.data.success && Array.isArray(res.data.events)) {
        setEvents(res.data.events);
      } else {
        console.warn("Unexpected response structure:", res.data);
        setEvents([]);
        setError("Failed to load events: Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(error.response?.data?.message || "Failed to fetch events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading && events.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>🎉</div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Card style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ color: "#C0392B", marginBottom: 16 }}>Error: {error}</p>
          <Btn onClick={fetchEvents}>Retry</Btn>
        </Card>
      </div>
    );
  }

  const renderActiveView = () => {
    switch(active) {
      case "dashboard":
        return <Dashboard key="dashboard" events={events} />;
      case "events":
        return <EventManagement key="events" events={events} setEvents={setEvents} fetchEvents={fetchEvents} />;
      case "registrations":
        return <Registrations key="registrations" />;
      case "qr":
        return <QRCheckin key="qr" />;
      case "notifications":
        return <Notifications key="notifications" events={events} />;
      case "gallery":
        return <Gallery key="gallery" />;
      case "feedback":
        return <Feedback key="feedback" />;
      case "profile":
        return <Profile key="profile" />;
      default:
        return <Dashboard key="dashboard-default" events={events} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.lightGray, fontFamily: "'Inter', 'Helvetica Neue', sans-serif", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 60, background: C.black, display: "flex", flexDirection: "column",
        transition: "width 0.25s cubic-bezier(.4,0,.2,1)", flexShrink: 0, overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", minHeight: 64 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: C.white, flexShrink: 0 }}>E</div>
          {sidebarOpen && <span style={{ fontWeight: 800, fontSize: 15, color: C.white, whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>EventMS</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none",
              cursor: "pointer", fontFamily: "inherit", fontWeight: active === item.id ? 700 : 500, fontSize: 13, textAlign: "left",
              background: active === item.id ? "rgba(241,90,34,0.12)" : "transparent",
              color: active === item.id ? C.orange : "rgba(255,255,255,0.5)",
              transition: "all 0.15s", whiteSpace: "nowrap",
            }}
              onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { if (active !== item.id) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ flexShrink: 0 }}><NavIcon id={item.id} active={active === item.id} /></span>
              {sidebarOpen && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
            border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13,
            background: "transparent", color: "rgba(255,255,255,0.35)", transition: "all 0.15s", whiteSpace: "nowrap",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "#FF6B6B"; e.currentTarget.style.background = "rgba(255,100,100,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
            onClick={() => window.location.href = "/"}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 8, color: C.midGray, display: "flex", alignItems: "center" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#AAA", fontWeight: 500 }}>Organizer Panel</span>
            <div style={{ width: 34, height: 34, borderRadius: 99, background: C.black, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: C.orange }}>O</div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}