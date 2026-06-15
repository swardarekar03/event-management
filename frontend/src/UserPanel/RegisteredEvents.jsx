import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import Tickets from "./Tickets.jsx";
import QRCode from "react-qr-code";
import {
  CalendarDays,
  MapPin,
  Ticket,
  Plus,
  X,
  QrCode,
  Info,
  Trash2,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const PORT = 5000;

export default function RegisteredEvents() {

  const navigate = useNavigate();

  const [showTicketModal, setShowTicketModal] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  // const [showQRModal, setShowQRModal] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Fetch real registrations from API
  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view your registrations");
        setLoading(false);
        return;
      }

      const res = await axios.get(`https://event-management-ak5b.onrender.com/api/registrations/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setRegistrations(
          res.data.registrations.filter(
            (r) => r.status !== "cancelled"
          )
        );
      }
      else {
        setError("Failed to load registrations");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to load registrations");
    } finally {
      loading && setLoading(false);
    }
  };

  const updateTicketQuantity = async (registration, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://event-management-ak5b.onrender.com/api/registrations/${registration._id}`,
        { ticketsBooked: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setRegistrations(prevRegistrations =>
          prevRegistrations.map(reg =>
            reg._id === registration._id
              ? { ...reg, ticketsBooked: newQuantity }
              : reg
          )
        );
      }
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.message || "Failed to update ticket quantity");
    }
  };

  const handleIncreaseTickets = (registration) => {
    const currentTickets = registration.ticketsBooked || 1;
    const newQuantity = currentTickets + 1;
    updateTicketQuantity(registration, newQuantity);
  };

  const handleDecreaseTickets = (registration) => {
    const currentTickets = registration.ticketsBooked || 1;
    if (currentTickets > 1) {
      const newQuantity = currentTickets - 1;
      updateTicketQuantity(registration, newQuantity);
    }
  };

  const handleCancel = async (registrationId, eventId, ticketsBooked) => {
    if (!window.confirm("Are you sure you want to cancel this registration?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`https://event-management-ak5b.onrender.com/api/registrations/${registrationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert("Registration cancelled successfully!");

        setRegistrations((prev) =>
          prev.filter((r) => r._id !== registrationId)
        );
      }
    } catch (err) {
      console.error("Cancel error:", err);
      alert(err.response?.data?.message || "Failed to cancel registration");
    }
  };

  const handleViewTicket = (registration) => {
    // navigate(`/ticket/${registration._id}`);
    setShowTicketModal(registration);
  };

  const getFilteredEvents = () => {
    const now = new Date();
    switch (activeTab) {
      case "upcoming":
        return registrations.filter(r =>
          !r.checkInStatus && r.event?.date && new Date(r.event.date) > now
        );
      case "past":
        return registrations.filter(r =>
          r.checkInStatus || (r.event?.date && new Date(r.event.date) <= now)
        );
      default:
        return registrations;
    }
  };

  // Helper function to match card gradients with UI spec image categories
  const getCategoryGradient = (category) => {
    const normalized = category?.toLowerCase() || "";
    if (normalized.includes("tech")) return "from-[#a353cd] to-[#876251]";
    if (normalized.includes("business")) return "from-[#4d77d7] to-[#4b6680]";
    if (normalized.includes("workshop")) return "from-[#4f7cdb] to-[#3d6874]";
    return "from-[#a546be] to-[#8d6253]"; // Default fallback gradient ("Other")
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eee7df] flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">🎫</div>
          <p className="text-[#a09990] font-medium">Loading your registrations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#eee7df] flex items-center justify-center px-4">
        <div className="text-center max-w-md p-6 bg-white rounded-2xl shadow-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchRegistrations}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredEvents = getFilteredEvents();

  return (
    <div className="min-h-screen bg-[#eee7df] py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Navigation & Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a] tracking-tight">
              Registered Events
            </h1>
            <span className="text-sm text-[#a09990] block mt-1">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            </span>
          </div>

          <div className="flex gap-2 self-start sm:self-center bg-white/50 p-1.5 rounded-xl border border-[#e4dcd3]">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${activeTab === "upcoming"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              Upcoming ({registrations.filter(r => !r.checkInStatus && r.event?.date && new Date(r.event.date) > new Date()).length})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${activeTab === "past"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              Past ({registrations.filter(r => r.checkInStatus || (r.event?.date && new Date(r.event.date) <= new Date())).length})
            </button>
          </div>
        </div>

        {/* Empty State View */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-[#e4dcd3] px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-50 rounded-full mb-4">
              <Ticket size={36} className="text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Events Found</h3>
            <p className="text-slate-400 text-sm mb-6">You haven't registered for any events in this view.</p>
            <button
              onClick={() => window.location.href = "/events"}
              className="px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition text-sm font-medium"
            >
              Browse Events
            </button>
          </div>
        ) : (
          /* Main Card Container with Horizontal Custom Scrolling styling */
          <div className="events-scroll-container flex gap-5 overflow-x-auto pb-6 scroll-smooth">
            {filteredEvents.map((registration) => {
              const event = registration.event;
              if (!event) return null;

              const totalPaid = (event.price || 0) * (registration.ticketsBooked || 1);

              return (
                <div
                  key={registration._id}
                  className="flex-shrink-0 w-[260px] bg-white rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.06)] flex flex-col justify-between"
                >
                  {/* Card Upper Header with Dynamic Gradient */}
                  <div className={`h-[160px] bg-gradient-to-br ${getCategoryGradient(event.category)} relative flex items-end p-3`}>
                    <span className="bg-black/45 text-white px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                      {event.category || "Technology"}
                    </span>
                  </div>

                  {/* Card Main Dynamic Body Content */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-base font-bold text-black mb-3 truncate" title={event.title}>
                      {event.title}
                    </h3>

                    <div className="mb-4 space-y-1.5 flex-grow">
                      <div className="flex items-center gap-1.5 text-xs text-[#928b81] font-medium">
                        <CalendarDays size={13} className="text-[#e59368]" />
                        <span>
                          {new Date(event.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-[#928b81] font-medium truncate" title={event.venue}>
                        <MapPin size={13} className="text-[#e59368]" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>

                    {/* Embedded Quantity Modifiers & Pricing Layout row */}
                    <div className="flex items-center justify-between mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecreaseTickets(registration)}
                          className="w-6 h-6 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:border-orange-500 hover:text-orange-500 transition font-bold disabled:opacity-40"
                          disabled={registration.ticketsBooked <= 1}
                        >
                          -
                        </button>
                        <span className="text-sm font-bold text-slate-800 min-w-[12px] text-center">
                          {registration.ticketsBooked || 1}
                        </span>
                        <button
                          onClick={() => handleIncreaseTickets(registration)}
                          className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition shadow-sm"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Total: <span className="font-bold text-slate-700">₹{totalPaid}</span>
                      </div>
                    </div>

                    {/* Card Lower Footer Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#f5f2ee] mt-auto">
                      <span className="text-base font-bold text-black">
                        ₹{event.price || 0}
                      </span>
                      <span className="text-xs font-bold text-[#913cd3] flex items-center gap-0.5">
                        <Star size={13} fill="#913cd3" className="text-[#913cd3]" /> 4.8
                      </span>
                    </div>
                  </div>

                  {/* Operational Utility Panel overlaying card bottom */}
                  <div className="grid grid-cols-3 border-t border-slate-100 bg-slate-50 text-xs">
                    <button
                      onClick={() => handleViewTicket(registration)}
                      className="py-2.5 hover:bg-orange-50 text-orange-600 font-semibold flex items-center justify-center gap-1 border-r border-slate-100 transition"
                      title="View QR Ticket"
                    >
                      <QrCode size={13} />
                      Ticket
                    </button>
                    <button
                      onClick={() => setSelectedEvent(registration)}
                      className="py-2.5 hover:bg-slate-100 text-slate-600 font-semibold flex items-center justify-center gap-1 border-r border-slate-100 transition"
                      title="Details"
                    >
                      <Info size={13} />
                      Info
                    </button>
                    <button
                      onClick={() => handleCancel(registration._id, event._id, registration.ticketsBooked)}
                      className="py-2.5 hover:bg-red-50 text-red-500 font-semibold flex items-center justify-center gap-1 transition disabled:opacity-40 disabled:hover:bg-transparent"
                      disabled={registration.checkInStatus}
                      title="Cancel Booking"
                    >
                      <Trash2 size={13} />
                      Drop
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="relative h-48 sm:h-56">
                <img
                  src={selectedEvent.event?.image || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200"}
                  alt={selectedEvent.event?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">
                  {selectedEvent.event?.title}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CalendarDays size={18} className="text-orange-500" />
                      <div>
                        <div className="text-xs text-slate-500">Date</div>
                        <div className="font-medium text-slate-800">
                          {new Date(selectedEvent.event?.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-orange-500" />
                      <div>
                        <div className="text-xs text-slate-500">Venue</div>
                        <div className="font-medium text-slate-800">{selectedEvent.event?.venue}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-500">Tickets Booked</div>
                      <div className="font-medium text-slate-800">{selectedEvent.ticketsBooked || 1}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Total Amount</div>
                      <div className="font-bold text-orange-600 text-xl">
                        ₹{(selectedEvent.event?.price || 0) * (selectedEvent.ticketsBooked || 1)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-2">About this event</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedEvent.event?.description || "No description available"}
                  </p>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setShowTicketModal(selectedEvent);
                      setSelectedEvent(null);
                    }}
                    className="flex-1 px-6 py-3 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl hover:bg-orange-100 transition-all font-semibold text-sm"
                  >
                    View QR Ticket
                  </button>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-medium text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Modal - Same as Tickets.jsx */}
        {showTicketModal && (
          <div
            className="fixed inset-0 z-50 grid place-items-center p-3 sm:p-6 bg-stone-900/50 backdrop-blur-sm"
            onClick={() => setShowTicketModal(null)}
          >
            <div
              className="relative w-full max-w-md rounded-2xl bg-[#fffaf5] border border-white/30 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowTicketModal(null)}
                aria-label="Close"
                className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-md border-0 cursor-pointer hover:bg-white transition-colors"
              >
                <X size={16} className="text-stone-700" />
              </button>

              <div className={`h-24 w-full flex items-end p-4 relative bg-gradient-to-br from-purple-600/80 to-orange-400/75`}>
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent" />
                <span className="relative z-10 text-xs font-bold text-white bg-stone-900/40 px-2.5 py-1 rounded-full">
                  {showTicketModal.event?.category || "Event"}
                </span>
              </div>

              <div className="p-4 sm:p-6">
                <h2 className="m-0 mb-1 text-stone-900 text-xl font-black">{showTicketModal.event?.title}</h2>
                <p className="m-0 mb-5 text-stone-400 text-xs">
                  Official entry pass · Valid for {showTicketModal.ticketsBooked} person{showTicketModal.ticketsBooked !== 1 ? "s" : ""}
                </p>

                <div className="flex flex-col gap-3 mb-5">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50/60">
                    <CalendarDays size={16} className="text-orange-500 mt-0.5" />
                    <div className="min-w-0">
                      <strong className="block text-xs font-bold text-stone-500 uppercase tracking-wide">Date & Time</strong>
                      <span className="text-sm text-stone-700 font-semibold break-words">
                        {showTicketModal.event?.date ? new Date(showTicketModal.event.date).toDateString() : "—"} at {showTicketModal.event?.time || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50/60">
                    <MapPin size={16} className="text-orange-500 mt-0.5" />
                    <div className="min-w-0">
                      <strong className="block text-xs font-bold text-stone-500 uppercase tracking-wide">Venue</strong>
                      <span className="text-sm text-stone-700 font-semibold break-words">{showTicketModal.event?.venue || "—"}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50/60">
                    <Ticket size={16} className="text-orange-500 mt-0.5" />
                    <div className="min-w-0">
                      <strong className="block text-xs font-bold text-stone-500 uppercase tracking-wide">Ticket Price</strong>
                      <span className="text-sm text-stone-700 font-semibold break-words">
                        ₹{showTicketModal.event?.price ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 py-4 border-t border-dashed border-stone-200">
                  <div className="p-3 rounded-xl bg-white shadow-sm">
                    <div className="w-[120px] h-[120px] bg-orange-100 rounded-lg flex items-center justify-center">
                      <QRCode
                        value={JSON.stringify({
                          registrationId: showTicketModal._id,
                          eventId: showTicketModal.event?._id,
                        })}
                        size={120}
                        bgColor="#FFFFFF"
                        fgColor="#f97316"
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="m-0 text-xs text-stone-400 font-bold uppercase tracking-wide mb-1">Booking ID</p>
                    <code className="text-sm font-mono font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-lg break-all">
                      {showTicketModal._id}
                    </code>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTicketModal(null)}
                  className="mt-4 w-full h-10 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Styled JSX scoped block for Custom Scrollbar matching layout mock */}
      <style>{`
        .events-scroll-container::-webkit-scrollbar {
          height: 6px;
        }
        .events-scroll-container::-webkit-scrollbar-track {
          background: #e4dcd3;
          border-radius: 10px;
        }
        .events-scroll-container::-webkit-scrollbar-thumb {
          background: #e2a283;
          border-radius: 10px;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}