import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import BrowseEvents from "./BrowseEvents.jsx";
import Tickets from "./Tickets.jsx";
import Gallery from "./Gallery.jsx";
import RegisteredEvents from "./RegisteredEvents.jsx";
import NotificationPage from "./AudienceNotificationsPanel.jsx";
import FeedbackPage from "./AudienceFeedback.jsx";

const myEvents = ["Registered Events", "Upcoming Events", "Completed Events"];

export default function UserDashboard({ onBackHome, onLogout }) {
  const [activeLink, setActiveLink] = useState("browse");
  const [myEventsOpen, setMyEventsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMyEventsOpen, setMobileMyEventsOpen] = useState(false);
  const profileRef = useRef(null);
  const myEventsRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (myEventsRef.current && !myEventsRef.current.contains(e.target)) setMyEventsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on link selection
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileMyEventsOpen(false);
  }, [activeLink]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
  };

  const renderContent = () => {
    switch (activeLink) {
      case "browse": return <BrowseEvents />;
      case "tickets": return <Tickets />;
      case "gallery": return <Gallery />;
      case "Registered Events": return <RegisteredEvents />;
      case "Upcoming Events": return <BrowseEvents filterType="upcoming" />;
      case "Completed Events": return <BrowseEvents filterType="completed" />;
      case "Notications": return <NotificationPage />;
      case "Feedback": return <FeedbackPage />;
      default: return <BrowseEvents />;
    }
  };

  const navLink = (key, label) => (
    <a
      href={`#${key}`}
      onClick={(e) => { e.preventDefault(); setActiveLink(key); }}
      className={`text-sm font-semibold transition-colors no-underline pb-0.5 ${activeLink === key
          ? "text-orange-500 border-b-2 border-orange-500"
          : "text-stone-600 hover:text-orange-500"
        }`}
    >
      {label}
    </a>
  );

  const mobileNavLink = (key, label) => (
    <a
      href={`#${key}`}
      onClick={(e) => { e.preventDefault(); setActiveLink(key); }}
      className={`block px-4 py-3 text-sm font-semibold no-underline transition-colors rounded-lg ${activeLink === key
          ? "text-orange-500 bg-orange-50"
          : "text-stone-600 hover:bg-stone-50 hover:text-orange-500"
        }`}
    >
      {label}
    </a>
  );

  return (
    <main
      className="min-h-screen font-sans text-stone-900"
      style={{
        background:
          "linear-gradient(135deg,rgba(253,248,242,0.96),rgba(255,247,237,0.82)),radial-gradient(circle at top right,rgba(147,51,234,0.12),transparent 32%),radial-gradient(circle at bottom left,rgba(249,115,22,0.16),transparent 34%)",
      }}
    >
      {/* ── Nav ── */}
      <nav className="w-full px-4 sm:px-6 lg:px-12 py-4 lg:py-5 flex items-center justify-between border-b border-stone-200/60 bg-white/60 backdrop-blur-sm sticky top-0 z-40">
        {/* Brand */}
        <button
          onClick={onBackHome}
          type="button"
          className="border-0 p-0 bg-transparent text-lg font-black cursor-pointer"
          style={{
            background: "linear-gradient(90deg,#ea580c,#9333ea)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          NexEvent
        </button>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-7">
          {navLink("browse", "Browse Events")}

          {/* My Events dropdown */}
          <div ref={myEventsRef} className="relative">
            <button
              type="button"
              onClick={() => setMyEventsOpen((o) => !o)}
              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors border-0 bg-transparent cursor-pointer ${myEvents.includes(activeLink)
                  ? "text-orange-500"
                  : "text-stone-600 hover:text-orange-500"
                }`}
            >
              My Events <ChevronDown size={15} className={`transition-transform ${myEventsOpen ? "rotate-180" : ""}`} />
            </button>

            {myEventsOpen && (
              <div className="absolute top-full left-0 mt-2 w-44 rounded-xl border border-stone-200/60 bg-white shadow-xl py-1.5 z-50">
                {myEvents.map((event) => (
                  <a
                    key={event}
                    href={`#${event}`}
                    onClick={(e) => { e.preventDefault(); setActiveLink(event); setMyEventsOpen(false); }}
                    className={`block px-4 py-2 text-sm no-underline transition-colors ${activeLink === event
                        ? "text-orange-500 bg-orange-50 font-semibold"
                        : "text-stone-600 hover:bg-stone-50 hover:text-orange-500"
                      }`}
                  >
                    {event}
                  </a>
                ))}
              </div>
            )}
          </div>

          {navLink("tickets", "Tickets")}
          {navLink("gallery", "Gallery")}
          {navLink("Notications", "Notifications")}
          {navLink("Feedback", "Feedback")}

          {/* Profile + logout */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black border-0 cursor-pointer transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
            >
              U
            </button>

            {profileOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 rounded-xl border border-stone-200/60 bg-white shadow-xl py-1.5 z-50">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-0 bg-transparent cursor-pointer font-semibold"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="lg:hidden p-2 rounded-lg border-0 bg-transparent cursor-pointer text-stone-600 hover:text-orange-500 hover:bg-orange-50 transition-colors"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* ── Mobile Menu Drawer ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-stone-200/60 bg-white shadow-md sticky top-[60px] z-30 max-h-[calc(100vh-60px)] overflow-y-auto">
          <div className="px-3 py-3 flex flex-col gap-1">
            {mobileNavLink("browse", "Browse Events")}

            {/* My Events collapsible */}
            <button
              type="button"
              onClick={() => setMobileMyEventsOpen((o) => !o)}
              className={`flex items-center justify-between px-4 py-3 text-sm font-semibold border-0 bg-transparent cursor-pointer rounded-lg transition-colors ${myEvents.includes(activeLink)
                  ? "text-orange-500 bg-orange-50"
                  : "text-stone-600 hover:bg-stone-50 hover:text-orange-500"
                }`}
            >
              My Events
              <ChevronDown size={15} className={`transition-transform ${mobileMyEventsOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileMyEventsOpen && (
              <div className="pl-4 flex flex-col gap-1">
                {myEvents.map((event) => (
                  <a
                    key={event}
                    href={`#${event}`}
                    onClick={(e) => { e.preventDefault(); setActiveLink(event); }}
                    className={`block px-4 py-2.5 text-sm no-underline rounded-lg transition-colors ${activeLink === event
                        ? "text-orange-500 bg-orange-50 font-semibold"
                        : "text-stone-600 hover:bg-stone-50 hover:text-orange-500"
                      }`}
                  >
                    {event}
                  </a>
                ))}
              </div>
            )}

            {mobileNavLink("tickets", "Tickets")}
            {mobileNavLink("gallery", "Gallery")}
            {mobileNavLink("Notications", "Notifications")}
            {mobileNavLink("Feedback", "Feedback")}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-0 bg-transparent cursor-pointer font-semibold rounded-lg mt-1 border-t border-stone-100 pt-3"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <section className="px-4 sm:px-6 lg:px-12 py-6 lg:py-8">
        {renderContent()}
      </section>

      {/* ── Footer ── */}
      <footer className="mt-4 px-4 sm:px-6 lg:px-12 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 bg-stone-900 text-stone-400">
        <div>
          <strong
            className="block mb-1 text-base font-black"
            style={{
              background: "linear-gradient(90deg,#fb923c,#a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            NexEvent
          </strong>
          <p className="m-0 text-xs">Discover, plan, and attend events with ease.</p>
        </div>
        <p className="m-0 text-xs text-stone-500">© 2026 NexEvent. All rights reserved.</p>
      </footer>
    </main>
  );
}