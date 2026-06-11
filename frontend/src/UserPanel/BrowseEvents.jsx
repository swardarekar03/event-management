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
import "../BrowseEvents.css";

export default function BrowseEvents() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Failed to fetch events:", err));
  }, []);

  const featuredRows = useMemo(() => [
    { title: "Trending Now", events: events.slice(0, 4) },
    { title: "Weekend Picks", events: [events[2], events[4], events[5], events[1]].filter(Boolean) },
    { title: "Because You Like Live Experiences", events: [events[0], events[3], events[1], events[5]].filter(Boolean) },
  ], [events]);

  const visibleRows = useMemo(() => {
    if (!query.trim()) return featuredRows;
    const lowerQuery = query.toLowerCase();
    const filteredEvents = events.filter((event) =>
      `${event.title} ${event.category} ${event.venue}`.toLowerCase().includes(lowerQuery)
    );
    return [{ title: "Search Results", events: filteredEvents }];
  }, [query, featuredRows, events]);

  const categoryClass = {
    Concerts: "concert",
    Business: "business",
    Food: "food",
    Creative: "design",
    Comedy: "comedy",
    Sports: "sports",
  };

  const handleBookTicket = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setBooking(true);
    try {
      const res = await fetch("http://localhost:5000/api/tickets/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  // ✅ No <main>, no <nav>, no <footer> — UserDashboard provides those
  return (
    <>
      <section className="browse-hero">
        <div>
          <p className="browse-kicker">Discover what's happening next</p>
          <h1>Browse events made for your next great plan.</h1>
          <p>
            Find concerts, conferences, food festivals, creative meetups, comedy nights,
            and sports events from organizers on NexEvent.
          </p>
        </div>
        <label className="search-shell">
          <Search size={20} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, venues, categories"
          />
        </label>
      </section>

      <section className="event-shelves" aria-label="Event collections">
        {events.length === 0 ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Loading events...</p>
        ) : (
          visibleRows.map((row) => (
            <div className="event-row" key={row.title}>
              <div className="row-heading">
                <h2>{row.title}</h2>
                <span>{row.events.length} events</span>
              </div>
              {row.events.length > 0 ? (
                <div className="event-card-track">
                  {row.events.map((event) => (
                    <article
                      className="event-card"
                      key={`${row.title}-${event._id}`}
                      onClick={() => setSelectedEvent(event)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedEvent(event);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={`event-visual ${categoryClass[event.category] || "concert"}`}>
                        <span>{event.category}</span>
                      </div>
                      <div className="event-card-body">
                        <h3>{event.title}</h3>
                        <p><CalendarDays size={15} />{event.date}</p>
                        <p><MapPin size={15} />{event.venue}</p>
                        <div className="event-card-meta">
                          <span>From Rs. {event.price}</span>
                          <span><Star size={14} fill="currentColor" />{event.rating || "4.8"}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No events found. Try another search.</p>
              )}
            </div>
          ))
        )}
      </section>

      {selectedEvent && (
        <div className="event-popup-backdrop" onClick={() => setSelectedEvent(null)}>
          <section
            aria-modal="true"
            className="event-popup"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="Close event details"
              className="event-popup-close"
              onClick={() => setSelectedEvent(null)}
              type="button"
            >
              <X size={18} />
            </button>
            <div className={`event-visual ${categoryClass[selectedEvent.category] || "concert"}`}>
              <span>{selectedEvent.category}</span>
            </div>
            <div className="event-popup-content">
              <p className="browse-kicker">Event details</p>
              <h2>{selectedEvent.title}</h2>
              <p className="event-popup-summary">{selectedEvent.summary}</p>
              <div className="event-popup-grid">
                <span><CalendarDays size={17} />{selectedEvent.date}</span>
                <span><Clock size={17} />{selectedEvent.time}</span>
                <span><MapPin size={17} />{selectedEvent.venue}</span>
                <span><Users size={17} />{selectedEvent.attendees || "Going"}</span>
              </div>
              <div className="event-popup-booking">
                <div>
                  <span>Ticket price</span>
                  <strong>Rs. {selectedEvent.price}</strong>
                </div>
                {bookingSuccess ? (
                  <button type="button" disabled style={{ background: "green" }}>✅ Booked!</button>
                ) : (
                  <button onClick={handleBookTicket} type="button" disabled={booking}>
                    <Ticket size={18} />
                    {booking ? "Booking..." : "Book Ticket"}
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