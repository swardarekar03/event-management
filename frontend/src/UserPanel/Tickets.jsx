import { CalendarDays, Clock, MapPin, Ticket, X, Eye } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import QRCode from "react-qr-code";

const TABS = ["Upcoming", "Past", "Cancelled"];

const statusStyles = {
  Upcoming:  "bg-orange-50 text-orange-500 border border-orange-200",
  Past:      "bg-stone-100 text-stone-500 border border-stone-200",
  Cancelled: "bg-red-50 text-red-400 border border-red-200",
};

const categoryColors = {
  Technology: "bg-gradient-to-br from-purple-600/80 to-orange-400/75",
  Workshop:   "bg-gradient-to-br from-indigo-700/80 to-sky-400/70",
  Sports:     "bg-gradient-to-br from-green-600/75 to-orange-400/70",
  Cultural:   "bg-gradient-to-br from-purple-500/80 to-teal-400/70",
  Business:   "bg-gradient-to-br from-indigo-600/80 to-sky-400/70",
  Music:      "bg-gradient-to-br from-purple-700/80 to-orange-400/75",
  Other:      "bg-gradient-to-br from-purple-600/80 to-orange-400/75",
};

export default function Tickets() {
  const [activeTab, setActiveTab]         = useState("Upcoming");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets]             = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res  = await fetch("http://localhost:5000/api/tickets/my-tickets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setTickets(data);
        else console.error("Failed to fetch tickets:", data.message);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getTicketStatus = (ticket) => {
    if (ticket.status === "cancelled") return "Cancelled";
    return new Date(ticket.eventId?.date) >= new Date() ? "Upcoming" : "Past";
  };

  const filteredTickets = useMemo(
    () => tickets.filter((t) => getTicketStatus(t) === activeTab),
    [activeTab, tickets]
  );

  return (
    <>
      {/* ── Hero ── */}
      <div className="mb-8">
        <p className="m-0 mb-2 text-orange-500 text-xs font-black tracking-widest uppercase">Your tickets</p>
        <h2 className="m-0 text-stone-900 text-3xl font-black">My Tickets</h2>
        <p className="mt-2 text-stone-500 text-sm">Manage, view, and download tickets for all your upcoming events.</p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 h-9 rounded-lg text-sm font-semibold border-0 cursor-pointer transition-all ${
                activeTab === tab
                  ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                  : "bg-white/80 text-stone-500 hover:text-orange-500 hover:bg-orange-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className="text-stone-400 text-xs font-bold">{filteredTickets.length} tickets</span>
      </div>

      {/* ── Ticket list ── */}
      {loading ? (
        <p className="text-center py-12 text-stone-400 text-sm">Loading tickets…</p>

      ) : filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-stone-400">
          <Ticket size={40} className="text-stone-300" />
          <h3 className="m-0 text-base font-bold text-stone-500">No {activeTab.toLowerCase()} tickets</h3>
          <p className="m-0 text-sm">You don't have any {activeTab.toLowerCase()} tickets yet.</p>
        </div>

      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTickets.map((ticket) => {
            const status = getTicketStatus(ticket);
            const event  = ticket.eventId;
            return (
              <article
                key={ticket._id}
                className="rounded-xl border border-stone-200/60 bg-white/80 shadow-md overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-orange-300/50"
              >
                {/* Category banner */}
                <div className={`h-2 w-full ${categoryColors[event?.category] || categoryColors.Other}`} />

                <div className="p-5">
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">
                      {event?.category || "Event"}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyles[status]}`}>
                      {status}
                    </span>
                  </div>

                  {/* Event name */}
                  <h3 className="m-0 mb-4 text-stone-900 font-black text-base leading-snug">
                    {event?.title || "Event"}
                  </h3>

                  {/* Info rows */}
                  <div className="flex flex-col gap-2 mb-4">
                    {[
                      { icon: <CalendarDays size={14} />, label: event?.date ? new Date(event.date).toDateString() : "—" },
                      { icon: <Clock size={14} />,        label: event?.time || "—" },
                      { icon: <MapPin size={14} />,       label: event?.venue || "—" },
                    ].map(({ icon, label }) => (
                      <div key={label} className="flex items-center gap-2 text-stone-500 text-xs [&>svg]:text-orange-400 [&>svg]:flex-shrink-0">
                        {icon}{label}
                      </div>
                    ))}
                  </div>

                  {/* Booking ID */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-4">
                    <Ticket size={12} className="text-orange-400" />
                    <span>ID: <span className="font-mono font-semibold text-stone-600">{ticket.ticketId}</span></span>
                  </div>

                  {/* Action */}
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(ticket)}
                    className="w-full h-9 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold text-orange-500 border border-orange-200 bg-orange-50 hover:bg-orange-500 hover:text-white transition-all cursor-pointer"
                  >
                    <Eye size={15} /> View Ticket
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Ticket modal ── */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-6 bg-stone-900/50 backdrop-blur-sm"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#fffaf5] border border-white/30 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setSelectedTicket(null)}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-md border-0 cursor-pointer hover:bg-white transition-colors"
            >
              <X size={16} className="text-stone-700" />
            </button>

            {/* Category banner */}
            <div className={`h-24 w-full flex items-end p-4 relative ${categoryColors[selectedTicket.eventId?.category] || categoryColors.Other}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent" />
              <span className="relative z-10 text-xs font-bold text-white bg-stone-900/40 px-2.5 py-1 rounded-full">
                {selectedTicket.eventId?.category || "Event"}
              </span>
            </div>

            <div className="p-6">
              <h2 className="m-0 mb-1 text-stone-900 text-xl font-black">{selectedTicket.eventId?.title}</h2>
              <p className="m-0 mb-5 text-stone-400 text-xs">
                Official entry pass · Valid for {selectedTicket.quantity} person{selectedTicket.quantity !== 1 ? "s" : ""}
              </p>

              {/* Details */}
              <div className="flex flex-col gap-3 mb-5">
                {[
                  {
                    icon: <CalendarDays size={16} />,
                    label: "Date & Time",
                    value: `${selectedTicket.eventId?.date ? new Date(selectedTicket.eventId.date).toDateString() : "—"} at ${selectedTicket.eventId?.time || "—"}`,
                  },
                  { icon: <MapPin size={16} />,  label: "Venue",        value: selectedTicket.eventId?.venue || "—" },
                  { icon: <Ticket size={16} />,  label: "Ticket Price", value: `₹${selectedTicket.eventId?.price || "—"}` },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-orange-50/60 [&>svg]:text-orange-500 [&>svg]:flex-shrink-0 [&>svg]:mt-0.5">
                    {icon}
                    <div>
                      <strong className="block text-xs font-bold text-stone-500 uppercase tracking-wide">{label}</strong>
                      <span className="text-sm text-stone-700 font-semibold">{value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* QR */}
              <div className="flex flex-col items-center gap-3 py-4 border-t border-dashed border-stone-200">
                <div className="p-3 rounded-xl bg-white shadow-sm">
                  <QRCode value={selectedTicket.ticketId} size={120} bgColor="#FFFFFF" fgColor="#f97316" />
                </div>
                <div className="text-center">
                  <p className="m-0 text-xs text-stone-400 font-bold uppercase tracking-wide mb-1">Booking ID</p>
                  <code className="text-sm font-mono font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-lg">
                    {selectedTicket.ticketId}
                  </code>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="mt-4 w-full h-10 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}