import {
  CalendarDays,
  Clock,
  MapPin,
  Search,
  Star,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const categoryColors = {
  Technology: "bg-gradient-to-br from-purple-600/80 to-orange-400/75",
  Workshop:   "bg-gradient-to-br from-indigo-700/80 to-sky-400/70",
  Sports:     "bg-gradient-to-br from-green-600/75 to-orange-400/70",
  Cultural:   "bg-gradient-to-br from-purple-500/80 to-teal-400/70",
  Business:   "bg-gradient-to-br from-indigo-600/80 to-sky-400/70",
  Music:      "bg-gradient-to-br from-purple-700/80 to-orange-400/75",
  Concerts:   "bg-gradient-to-br from-purple-600/80 to-orange-400/75",
  Food:       "bg-gradient-to-br from-orange-500/85 to-rose-400/70",
  Creative:   "bg-gradient-to-br from-purple-500/80 to-teal-400/70",
  Comedy:     "bg-gradient-to-br from-pink-600/80 to-yellow-400/70",
  Other:      "bg-gradient-to-br from-purple-600/80 to-orange-400/75",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Date TBD";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const filterTitles   = { upcoming: "Upcoming Events", completed: "Completed Events" };
const emptyMessages  = { upcoming: "No upcoming events right now. Check back soon!", completed: "No completed events yet." };

function EventCard({ event, onClick }) {
  const visual = categoryColors[event.category] || categoryColors.Other;
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onClick(event)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(event); } }}
      className="min-w-[238px] max-w-[282px] flex-shrink-0 rounded-xl border border-stone-200/60 bg-white/80 overflow-hidden cursor-pointer shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-orange-400/50 hover:shadow-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 snap-start"
    >
      <div className={`relative h-44 flex items-end p-3 ${visual}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
        <span className="relative z-10 text-xs font-bold text-white bg-stone-900/40 px-2.5 py-1 rounded-full">
          {event.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-stone-900 font-black text-base leading-snug mb-3 min-h-[44px]">
          {event.title}
        </h3>
        <p className="flex items-center gap-2 text-stone-500 text-xs mt-1">
          <CalendarDays size={13} className="text-orange-500 flex-shrink-0" />
          {formatDate(event.date)}
        </p>
        <p className="flex items-center gap-2 text-stone-500 text-xs mt-1.5">
          <MapPin size={13} className="text-orange-500 flex-shrink-0" />
          {event.venue}
        </p>
        <div className="mt-4 flex items-center justify-between text-xs font-black text-stone-900">
          <span>₹{event.price}</span>
          <span className="flex items-center gap-1 text-purple-600">
            <Star size={12} fill="currentColor" />
            {event.rating || "4.8"}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function BrowseEvents({ filterType = "browse" }) {
  const navigate = useNavigate();
  const [query, setQuery]                   = useState("");
  const [selectedEvent, setSelectedEvent]   = useState(null);
  const [events, setEvents]                 = useState([]);
  const [booking, setBooking]               = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    fetch("http://localhost:5000/api/events", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => { setEvents(Array.isArray(data.events) ? data.events : []); setLoading(false); })
      .catch((err) => { console.error("Failed to fetch events:", err); setLoading(false); });
  }, []);

  const today = new Date();

  const upcomingEvents  = useMemo(() => [...events].filter(e => new Date(e.date) >= today).sort((a, b) => new Date(a.date) - new Date(b.date)), [events]);
  const completedEvents = useMemo(() => [...events].filter(e => new Date(e.date) < today).sort((a, b) => new Date(b.date) - new Date(a.date)), [events]);
  const latestAdded     = useMemo(() => [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6), [events]);

  const byCategory = useMemo(() => {
    const cats = [...new Set(events.map(e => e.category))].filter(Boolean);
    return cats.map(cat => ({ title: `${cat} Events`, events: events.filter(e => e.category === cat).slice(0, 6) })).filter(r => r.events.length > 0);
  }, [events]);

  const featuredRows = useMemo(() => {
    const rows = [];
    if (upcomingEvents.length > 0) rows.push({ title: "Upcoming Events", events: upcomingEvents.slice(0, 6) });
    if (latestAdded.length > 0)    rows.push({ title: "Recently Added",  events: latestAdded });
    return [...rows, ...byCategory];
  }, [upcomingEvents, latestAdded, byCategory]);

  const visibleRows = useMemo(() => {
    if (!query.trim()) return featuredRows;
    const q = query.toLowerCase();
    return [{ title: "Search Results", events: events.filter(e => `${e.title} ${e.category} ${e.venue}`.toLowerCase().includes(q)) }];
  }, [query, featuredRows, events]);

  const filteredByType = useMemo(() => {
    switch (filterType) {
      case "upcoming":  return upcomingEvents;
      case "completed": return completedEvents;
      default:          return null;
    }
  }, [filterType, upcomingEvents, completedEvents]);

  const handleBookTicket = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setBooking(true);
    try {
      const res  = await fetch("http://localhost:5000/api/tickets/book", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ eventId: selectedEvent._id, quantity: 1 }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookingSuccess(true);
        setTimeout(() => { setBookingSuccess(false); setSelectedEvent(null); }, 2000);
      } else {
        alert(data.message || "Booking failed. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  // ── Shelf row ───────────────────────────────────────────────────────────────
  const EventRow = ({ title, eventsToShow }) => (
    <div className="mb-10">
      <div className="mb-4 flex items-end justify-between gap-5 pr-6">
        <h2 className="m-0 text-stone-900 text-xl font-black">{title}</h2>
        <span className="text-stone-400 text-xs font-bold">{eventsToShow.length} events</span>
      </div>
      <div
        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(234,88,12,0.26) transparent" }}
      >
        {eventsToShow.map((event) => (
          <EventCard key={`${title}-${event._id}`} event={event} onClick={setSelectedEvent} />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Hero (browse mode only) ── */}
      {filterType === "browse" && (
        <section className="px-0 pt-6 pb-8 grid grid-cols-[1fr_minmax(260px,380px)] gap-8 items-end max-md:grid-cols-1">
          <div>
            <p className="m-0 mb-2 text-orange-500 text-xs font-black tracking-widest uppercase">
              Discover what's happening next
            </p>
            <h1 className="m-0 font-black leading-tight text-stone-900 text-4xl max-md:text-3xl">
              Browse events made for your next great plan.
            </h1>
            <p className="mt-4 text-stone-500 text-sm leading-relaxed max-w-lg">
              Find concerts, conferences, food festivals, creative meetups, comedy nights,
              and sports events from organizers on NexEvent.
            </p>
          </div>
          <label className="flex items-center gap-3 px-4 h-13 rounded-xl border border-stone-200/60 bg-white/80 shadow-lg cursor-text">
            <Search size={17} className="text-purple-600 flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, venues, categories"
              className="w-full border-0 outline-none bg-transparent text-stone-900 text-sm placeholder:text-stone-400"
            />
          </label>
        </section>
      )}

      {/* ── Event shelves ── */}
      <section aria-label="Event collections">
        {loading ? (
          <p className="text-center py-10 text-stone-400 text-sm">Loading events…</p>

        ) : filteredByType !== null ? (
          /* Upcoming / Completed filtered view */
          <>
            <div className="py-4 mb-2">
              <h2 className="text-stone-900 text-xl font-black">{filterTitles[filterType]}</h2>
              <p className="text-stone-400 text-xs mt-1">
                {filteredByType.length} event{filteredByType.length !== 1 ? "s" : ""}
              </p>
            </div>
            {filteredByType.length === 0 ? (
              <p className="text-center py-12 text-stone-400 text-sm">{emptyMessages[filterType]}</p>
            ) : (
              <div
                className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(234,88,12,0.26) transparent" }}
              >
                {filteredByType.map((event) => (
                  <EventCard key={event._id} event={event} onClick={setSelectedEvent} />
                ))}
              </div>
            )}
          </>

        ) : events.length === 0 ? (
          <p className="text-center py-10 text-stone-400 text-sm">
            No approved events available right now. Check back soon!
          </p>

        ) : (
          visibleRows.map((row) =>
            row.events.length > 0 ? (
              <EventRow key={row.title} title={row.title} eventsToShow={row.events} />
            ) : (
              <p key={row.title} className="text-stone-400 text-sm py-4">No events found. Try another search.</p>
            )
          )
        )}
      </section>

      {/* ── Event detail popup ── */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-6 bg-stone-900/50 backdrop-blur-sm"
          onClick={() => setSelectedEvent(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[85vh] grid grid-cols-[minmax(240px,320px)_1fr] overflow-auto rounded-2xl border border-white/30 bg-[#fffaf5] shadow-2xl max-md:grid-cols-1"
          >
            {/* Close */}
            <button
              onClick={() => setSelectedEvent(null)}
              type="button"
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-md border-0 cursor-pointer hover:bg-white transition-colors"
            >
              <X size={16} className="text-stone-700" />
            </button>

            {/* Visual panel */}
            <div className={`relative flex items-end p-4 min-h-[380px] max-md:min-h-[180px] ${categoryColors[selectedEvent.category] || categoryColors.Other}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
              <span className="relative z-10 text-xs font-bold text-white bg-stone-900/40 px-2.5 py-1 rounded-full">
                {selectedEvent.category}
              </span>
            </div>

            {/* Content */}
            <div className="p-9 max-md:p-6">
              <p className="m-0 mb-2 text-orange-500 text-xs font-black tracking-widest uppercase">Event details</p>
              <h2 className="m-0 font-black text-stone-900 leading-tight text-3xl max-md:text-2xl">
                {selectedEvent.title}
              </h2>
              <p className="mt-4 mb-6 text-stone-500 text-sm leading-relaxed">
                {selectedEvent.description || selectedEvent.summary ||
                  `Join us for an exciting ${selectedEvent.category} event. ${selectedEvent.title} promises to be an unforgettable experience.`}
              </p>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                {[
                  { icon: <CalendarDays size={15} />, label: formatDate(selectedEvent.date) },
                  { icon: <Clock size={15} />,        label: selectedEvent.time || "Time TBD" },
                  { icon: <MapPin size={15} />,       label: selectedEvent.venue },
                  { icon: <Users size={15} />,        label: selectedEvent.attendees || "Open to all" },
                ].map(({ icon, label }) => (
                  <span key={label} className="flex items-center gap-2 px-3.5 h-12 rounded-lg bg-orange-50/80 text-stone-600 text-sm font-semibold [&>svg]:text-orange-500 [&>svg]:flex-shrink-0">
                    {icon}{label}
                  </span>
                ))}
              </div>

              {/* Booking bar */}
              <div className="mt-7 p-4 flex items-center justify-between gap-5 rounded-xl bg-stone-900 max-md:flex-col max-md:items-stretch">
                <div>
                  <span className="block text-stone-400 text-xs font-bold uppercase tracking-wider">Ticket price</span>
                  <strong className="block mt-1 text-orange-100 text-2xl font-black">₹{selectedEvent.price}</strong>
                </div>

                {bookingSuccess ? (
                  <button disabled type="button" className="min-w-[148px] h-11 flex items-center justify-center gap-2 rounded-xl bg-green-500 text-white font-bold text-sm border-0">
                    ✅ Booked!
                  </button>
                ) : (
                  <button
                    onClick={handleBookTicket}
                    type="button"
                    disabled={booking}
                    className="min-w-[148px] h-11 flex items-center justify-center gap-2 rounded-xl text-white font-bold text-sm border-0 cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 8px 28px rgba(234,88,12,0.35)" }}
                  >
                    <Ticket size={16} />
                    {booking ? "Booking…" : "Book Ticket"}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}