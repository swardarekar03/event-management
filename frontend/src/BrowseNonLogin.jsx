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
import { Link, useNavigate } from "react-router-dom";

const categoryClass = {
  Technology: "bg-gradient-to-br from-purple-600/80 to-orange-400/75",
  Workshop:   "bg-gradient-to-br from-indigo-700/80 to-sky-400/70",
  Sports:     "bg-gradient-to-br from-green-600/75 to-orange-400/70",
  Cultural:   "bg-gradient-to-br from-purple-500/80 to-teal-400/70",
  Business:   "bg-gradient-to-br from-indigo-600/80 to-sky-400/70",
  Music:      "bg-gradient-to-br from-purple-700/80 to-orange-400/75",
  Other:      "bg-gradient-to-br from-purple-600/80 to-orange-400/75",
};

const formatDate = (d) => {
  if (!d) return "Date TBD";
  return new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
};

const formatTime = (d) => {
  if (!d) return "Time TBD";
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

function EventCard({ event, onClick }) {
  const visual = categoryClass[event.category] || categoryClass.Other;
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onClick(event)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(event);
        }
      }}
      className="
        w-[72vw] xs:w-64 sm:w-[238px] md:w-[258px] lg:w-[282px]
        flex-shrink-0 rounded-xl border border-stone-200/60 bg-white/80
        overflow-hidden cursor-pointer shadow-lg transition-all duration-200
        hover:-translate-y-1 hover:border-orange-400/50 hover:shadow-orange-100
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400
        snap-start
      "
    >
      {/* Visual banner */}
      <div className={`relative h-36 sm:h-44 flex items-end p-3 ${visual}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
        <span className="relative z-10 text-xs font-bold text-white bg-stone-900/40 px-2.5 py-1 rounded-full">
          {event.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-3 sm:p-4">
        <h3 className="text-stone-900 font-black text-sm sm:text-base leading-snug mb-2 sm:mb-3 min-h-[40px] sm:min-h-[44px]">
          {event.title}
        </h3>
        <p className="flex items-center gap-2 text-stone-500 text-xs mt-1">
          <CalendarDays size={13} className="text-orange-500 flex-shrink-0" />
          {formatDate(event.date)}
        </p>
        <p className="flex items-center gap-2 text-stone-500 text-xs mt-1.5">
          <MapPin size={13} className="text-orange-500 flex-shrink-0" />
          <span className="truncate">{event.venue}</span>
        </p>
        <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs font-black text-stone-900">
          <span>₹{event.price}</span>
          <span className="flex items-center gap-1 text-purple-600">
            <Star size={12} fill="currentColor" />
            {event.rating || "4.5"}
          </span>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-400">
          <Ticket size={11} />
          {event.availableTickets} tickets left
        </p>
      </div>
    </article>
  );
}

export default function BrowseNonLogin({ onBackHome }) {
  const navigate = useNavigate();
  const [query, setQuery]                 = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res  = await fetch("http://localhost:5000/api/events");
        const data = await res.json();
        if (data.success && Array.isArray(data.events)) setEvents(data.events);
        else setError("Failed to load events");
      } catch {
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const featuredRows = useMemo(() => {
    const now      = new Date();
    const upcoming = events
      .filter((e) => new Date(e.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const recent     = [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const categories = [...new Set(events.map((e) => e.category))];

    return [
      { title: "Upcoming Events", events: upcoming.slice(0, 6) },
      { title: "Recently Added",  events: recent.slice(0, 6) },
      ...categories.map((cat) => ({
        title: cat,
        events: events.filter((e) => e.category === cat).slice(0, 6),
      })),
    ].filter((r) => r.events.length > 0);
  }, [events]);

  const visibleRows = useMemo(() => {
    if (!query.trim()) return featuredRows;
    const q        = query.toLowerCase();
    const filtered = events.filter((e) =>
      `${e.title} ${e.category} ${e.venue}`.toLowerCase().includes(q)
    );
    return [{ title: `Results for "${query}"`, events: filtered }];
  }, [query, featuredRows, events]);

  const handleBookTicket = () => {
    const token = localStorage.getItem("token");
    if (token) navigate("/userDashboard");
    else navigate("/login");
  };

  // ── Shared nav ─────────────────────────────────────────────────────────────
  const Nav = () => (
    <nav className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-4 sm:py-6 flex items-center justify-between gap-4 flex-wrap">
      <button
        onClick={onBackHome}
        type="button"
        className="border-0 p-0 bg-transparent text-lg font-black cursor-pointer"
        style={{ background: "linear-gradient(90deg,#ea580c,#9333ea)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
      >
        NexEvent
      </button>
      <div className="flex items-center gap-4 sm:gap-7">
        <Link
          to="/login"
          className="text-sm font-semibold text-stone-600 hover:text-orange-500 transition-colors no-underline"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="inline-flex items-center px-4 sm:px-5 h-9 sm:h-10 rounded-xl text-sm font-bold text-white no-underline transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 8px 22px rgba(234,88,12,0.22)" }}
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );

  // ── Loading / Error ────────────────────────────────────────────────────────
  const bgStyle = {
    background:
      "linear-gradient(135deg,rgba(253,248,242,0.96),rgba(255,247,237,0.82)),radial-gradient(circle at top right,rgba(147,51,234,0.12),transparent 32%),radial-gradient(circle at bottom left,rgba(249,115,22,0.16),transparent 34%)",
  };

  if (loading) return (
    <main className="min-h-screen" style={bgStyle}>
      <Nav />
      <div className="flex items-center justify-center py-24 text-stone-400 text-sm">
        Loading events…
      </div>
    </main>
  );

  if (error) return (
    <main className="min-h-screen" style={{ background: "linear-gradient(135deg,rgba(253,248,242,0.96),rgba(255,247,237,0.82))" }}>
      <Nav />
      <div className="flex flex-col items-center justify-center py-24 gap-4 px-4">
        <p className="text-red-500 text-sm text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold"
        >
          Retry
        </button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen font-sans text-stone-900" style={bgStyle}>
      <Nav />

      {/* ── Hero ── */}
      <section className="
        px-4 sm:px-8 md:px-12 lg:px-16
        pt-6 sm:pt-8 md:pt-10 pb-6 sm:pb-8
        grid grid-cols-1 md:grid-cols-[1fr_minmax(280px,420px)]
        gap-6 sm:gap-8 md:gap-9 items-end
      ">
        <div>
          <p className="m-0 mb-2 sm:mb-2.5 text-orange-500 text-xs font-black tracking-widest uppercase">
            Discover what's happening next
          </p>
          <h1
            className="m-0 font-black leading-[1.05] text-stone-900"
            style={{ fontSize: "clamp(28px,5vw,60px)" }}
          >
            Browse events made for your next great plan.
          </h1>
          <p className="mt-4 sm:mt-5 text-stone-500 text-sm sm:text-base leading-relaxed max-w-xl">
            Find concerts, conferences, food festivals, creative meetups, and sports events — all in one place.
          </p>
        </div>

        {/* Search */}
        <label className="flex items-center gap-3 px-4 h-12 sm:h-14 rounded-xl border border-stone-200/60 bg-white/80 shadow-lg cursor-text">
          <Search size={18} className="text-purple-600 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, venues, categories"
            className="w-full border-0 outline-none bg-transparent text-stone-900 text-sm placeholder:text-stone-400"
          />
        </label>
      </section>

      {/* ── Event shelves ── */}
      <section
        className="pl-4 sm:pl-8 md:pl-12 lg:pl-16 pb-8 sm:pb-10"
        aria-label="Event collections"
      >
        {events.length === 0 ? (
          <p className="text-center py-10 text-stone-400 text-sm px-4">
            No events available yet. Check back soon!
          </p>
        ) : (
          visibleRows.map((row) => (
            <div key={row.title} className="mb-8 sm:mb-10">
              <div className="pr-4 sm:pr-8 md:pr-12 lg:pr-16 mb-3 sm:mb-4 flex items-end justify-between gap-5">
                <h2 className="m-0 text-stone-900 text-xl sm:text-2xl font-black">{row.title}</h2>
                <span className="text-stone-400 text-xs font-bold flex-shrink-0">
                  {row.events.length} events
                </span>
              </div>

              {row.events.length > 0 ? (
                <div
                  className="flex gap-3 sm:gap-4 overflow-x-auto pr-4 sm:pr-8 md:pr-12 lg:pr-16 pb-3 sm:pb-4 scroll-smooth snap-x"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(234,88,12,0.26) transparent" }}
                >
                  {row.events.map((event) => (
                    <EventCard
                      key={`${row.title}-${event._id}`}
                      event={event}
                      onClick={setSelectedEvent}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-stone-400 text-sm py-4">
                  No events found. Try another search.
                </p>
              )}
            </div>
          ))
        )}
      </section>

      {/* ── Event detail modal ── */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-3 sm:p-6 bg-stone-900/50 backdrop-blur-sm"
          onClick={() => setSelectedEvent(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="
              relative w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh]
              grid grid-cols-1 md:grid-cols-[minmax(200px,300px)_1fr]
              overflow-auto rounded-2xl border border-white/30
              bg-[#fffaf5] shadow-2xl
            "
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
            <div
              className={`relative flex items-end p-4 min-h-[160px] sm:min-h-[220px] md:min-h-[380px] ${categoryClass[selectedEvent.category] || categoryClass.Other}`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
              <span className="relative z-10 text-xs font-bold text-white bg-stone-900/40 px-2.5 py-1 rounded-full">
                {selectedEvent.category}
              </span>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-7 md:p-9">
              <p className="m-0 mb-2 text-orange-500 text-xs font-black tracking-widest uppercase">
                Event details
              </p>
              <h2
                className="m-0 font-black text-stone-900 leading-tight"
                style={{ fontSize: "clamp(22px,4vw,40px)" }}
              >
                {selectedEvent.title}
              </h2>
              <p className="mt-3 sm:mt-4 mb-4 sm:mb-6 text-stone-500 text-sm leading-relaxed">
                {selectedEvent.description ||
                  `Join us for an exciting ${selectedEvent.category} event. ${selectedEvent.title} promises to be an unforgettable experience.`}
              </p>

              {/* Info grid */}
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
                {[
                  { icon: <CalendarDays size={15} />, label: formatDate(selectedEvent.date) },
                  { icon: <Clock size={15} />,        label: formatTime(selectedEvent.date) },
                  { icon: <MapPin size={15} />,       label: selectedEvent.venue },
                  { icon: <Users size={15} />,        label: selectedEvent.organizer?.name || "Event Organizer" },
                ].map(({ icon, label }) => (
                  <span
                    key={label}
                    className="flex items-center gap-2 px-3 sm:px-3.5 h-11 sm:h-12 rounded-lg bg-orange-50/80 text-stone-600 text-xs sm:text-sm font-semibold [&>svg]:text-orange-500 [&>svg]:flex-shrink-0 overflow-hidden"
                  >
                    {icon}
                    <span className="truncate">{label}</span>
                  </span>
                ))}
              </div>

              {/* Booking bar */}
              <div className="mt-5 sm:mt-7 p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-xl bg-stone-900">
                <div>
                  <span className="block text-stone-400 text-xs font-bold uppercase tracking-wider">
                    Ticket price
                  </span>
                  <strong className="block mt-1 text-orange-100 text-2xl font-black">
                    ₹{selectedEvent.price}
                  </strong>
                </div>
                <div>
                  <span className="block text-stone-400 text-xs font-bold uppercase tracking-wider">
                    Available seats
                  </span>
                  <strong className="block mt-1 text-orange-100 text-xl font-black">
                    {selectedEvent.availableTickets} / {selectedEvent.totalTickets}
                  </strong>
                </div>
                <button
                  onClick={handleBookTicket}
                  type="button"
                  disabled={selectedEvent.availableTickets === 0}
                  className="w-full sm:w-auto sm:min-w-[148px] h-11 flex items-center justify-center gap-2 rounded-xl text-white font-bold text-sm border-0 cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 8px 28px rgba(234,88,12,0.35)" }}
                >
                  <Ticket size={16} />
                  {selectedEvent.availableTickets === 0 ? "Sold Out" : "Login to Book"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="
        mt-4 px-4 sm:px-8 md:px-12 lg:px-16 py-7 sm:py-9
        flex flex-col sm:flex-row sm:items-center sm:justify-between
        gap-5 sm:gap-6 bg-stone-900 text-stone-400
      ">
        <div>
          <strong
            className="block mb-1 text-base font-black"
            style={{ background: "linear-gradient(90deg,#fb923c,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            NexEvent
          </strong>
          <p className="m-0 text-xs">Discover, plan, and attend events with ease.</p>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <a href="#about"    className="text-stone-400 text-xs no-underline hover:text-orange-400 transition-colors">About Us</a>
          <a href="#upcoming" className="text-stone-400 text-xs no-underline hover:text-orange-400 transition-colors">Upcoming Events</a>
          <a href="#contact"  className="text-stone-400 text-xs no-underline hover:text-orange-400 transition-colors">Contact</a>
        </div>
        <p className="m-0 text-xs text-stone-500">© 2026 NexEvent. All rights reserved.</p>
      </footer>
    </main>
  );
}