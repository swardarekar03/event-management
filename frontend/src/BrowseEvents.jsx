import {
  CalendarDays,
  ChevronDown,
  Clock,
  MapPin,
  Search,
  Star,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./BrowseEvents.css";

const categories = ["Concerts", "Business", "Food", "Creative", "Comedy", "Sports"];

const events = [
  {
    id: 1,
    title: "Neon Nights Music Fest",
    category: "Concerts",
    date: "Jun 28, 2026",
    time: "7:00 PM",
    venue: "Skyline Arena, Mumbai",
    price: "From Rs. 799",
    rating: "4.8",
    attendees: "2.4k going",
    imageClass: "event-visual concert",
    summary:
      "A high-energy live music evening with indie bands, headline DJs, food stalls, and immersive light shows.",
  },
  {
    id: 2,
    title: "Startup Connect 2026",
    category: "Business",
    date: "Jul 04, 2026",
    time: "10:00 AM",
    venue: "NexHub Convention Centre",
    price: "From Rs. 1,499",
    rating: "4.7",
    attendees: "850 going",
    imageClass: "event-visual business",
    summary:
      "Meet founders, investors, product leaders, and hiring teams across a packed day of panels and networking.",
  },
  {
    id: 3,
    title: "The Grand Food Carnival",
    category: "Food",
    date: "Jul 12, 2026",
    time: "12:00 PM",
    venue: "Riverfront Grounds",
    price: "From Rs. 399",
    rating: "4.9",
    attendees: "3.1k going",
    imageClass: "event-visual food",
    summary:
      "Taste signature plates from pop-up kitchens, dessert studios, coffee bars, and celebrated city chefs.",
  },
  {
    id: 4,
    title: "Designers After Dark",
    category: "Creative",
    date: "Jul 18, 2026",
    time: "6:30 PM",
    venue: "Art House Studio",
    price: "From Rs. 599",
    rating: "4.6",
    attendees: "420 going",
    imageClass: "event-visual design",
    summary:
      "A cozy creative mixer with portfolio showcases, live critiques, visual installations, and studio conversations.",
  },
  {
    id: 5,
    title: "Comedy House Live",
    category: "Comedy",
    date: "Jul 25, 2026",
    time: "8:30 PM",
    venue: "Laugh Loft Theatre",
    price: "From Rs. 499",
    rating: "4.5",
    attendees: "680 going",
    imageClass: "event-visual comedy",
    summary:
      "An evening of sharp stand-up sets from touring comics, local favorites, and surprise guest performers.",
  },
  {
    id: 6,
    title: "Marathon for Change",
    category: "Sports",
    date: "Aug 02, 2026",
    time: "5:30 AM",
    venue: "Central Park Loop",
    price: "From Rs. 299",
    rating: "4.8",
    attendees: "5k going",
    imageClass: "event-visual sports",
    summary:
      "Choose your run, join community fitness crews, and support local education initiatives with every ticket.",
  },
];

const featuredRows = [
  { title: "Trending Now", events: events.slice(0, 4) },
  { title: "Weekend Picks", events: [events[2], events[4], events[5], events[1]] },
  { title: "Because You Like Live Experiences", events: [events[0], events[3], events[1], events[5]] },
];

export default function BrowseEvents({ onBackHome }) {
  const [query, setQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const visibleRows = useMemo(() => {
    if (!query.trim()) return featuredRows;

    const lowerQuery = query.toLowerCase();
    const filteredEvents = events.filter((event) =>
      `${event.title} ${event.category} ${event.venue}`.toLowerCase().includes(lowerQuery)
    );

    return [{ title: "Search Results", events: filteredEvents }];
  }, [query]);

  return (
    <main className="browse-page">
      <nav className="browse-nav">
        <button className="browse-brand" onClick={onBackHome} type="button">
          NexEvent
        </button>

        <div className="browse-nav-links">
          <a href="#about">About Us</a>
          <div className="category-menu">
            <button type="button">
              Categories
              <ChevronDown size={16} />
            </button>
            <div className="category-dropdown">
              {categories.map((category) => (
                <a href={`#${category.toLowerCase()}`} key={category}>{category}</a>
              ))}
            </div>
          </div>
          <a href="#upcoming">Upcoming Events</a>
          <Link to="/login">Login</Link>
          <Link className="signup-link" to="/signup">Sign Up</Link>
        </div>
      </nav>

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
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events, venues, categories"
          />
        </label>
      </section>

      <section className="event-shelves" aria-label="Event collections">
        {visibleRows.map((row) => (
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
                    key={`${row.title}-${event.id}`}
                    onClick={() => setSelectedEvent(event)}
                    onKeyDown={(keyEvent) => {
                      if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                        keyEvent.preventDefault();
                        setSelectedEvent(event);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={event.imageClass}>
                      <span>{event.category}</span>
                    </div>
                    <div className="event-card-body">
                      <h3>{event.title}</h3>
                      <p><CalendarDays size={15} />{event.date}</p>
                      <p><MapPin size={15} />{event.venue}</p>
                      <div className="event-card-meta">
                        <span>{event.price}</span>
                        <span><Star size={14} fill="currentColor" />{event.rating}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="empty-state">No events found. Try another search.</p>
            )}
          </div>
        ))}
      </section>

      {selectedEvent && (
        <div className="event-popup-backdrop" onClick={() => setSelectedEvent(null)}>
          <section
            aria-modal="true"
            className="event-popup"
            onClick={(event) => event.stopPropagation()}
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

            <div className={selectedEvent.imageClass}>
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
                <span><Users size={17} />{selectedEvent.attendees}</span>
              </div>

              <div className="event-popup-booking">
                <div>
                  <span>Ticket price</span>
                  <strong>{selectedEvent.price}</strong>
                </div>
                <button type="button">
                  <Ticket size={18} />
                  Book Ticket
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      <footer className="browse-footer">
        <div>
          <strong>NexEvent</strong>
          <p>Discover, plan, and attend events with ease.</p>
        </div>
        <div className="footer-links">
          <a href="#about">About Us</a>
          <a href="#upcoming">Upcoming Events</a>
          <a href="#contact">Contact</a>
        </div>
        <p className="footer-copy">© 2026 NexEvent. All rights reserved.</p>
      </footer>
    </main>
  );
}
