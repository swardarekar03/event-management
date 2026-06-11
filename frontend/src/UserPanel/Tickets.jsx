import { CalendarDays, Clock, MapPin, Ticket, X, Download, Eye } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import QRCode from "react-qr-code";
import "./UserDashboard.css";

export default function Tickets() {
    const [activeTab, setActiveTab] = useState("Upcoming");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch tickets from backend
    useEffect(() => {
        const fetchTickets = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await fetch("http://localhost:5000/api/tickets/my-tickets", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                if (res.ok) {
                    setTickets(data);
                } else {
                    console.error("Failed to fetch tickets:", data.message);
                }
            } catch (err) {
                console.error("Error fetching tickets:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    // Determine status based on event date
    const getTicketStatus = (ticket) => {
        if (ticket.status === "cancelled") return "Cancelled";
        const eventDate = new Date(ticket.eventId?.date);
        return eventDate >= new Date() ? "Upcoming" : "Past";
    };

    const filteredTickets = useMemo(() => {
        return tickets.filter((ticket) => getTicketStatus(ticket) === activeTab);
    }, [activeTab, tickets]);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "Upcoming": return "status-upcoming";
            case "Past": return "status-past";
            case "Cancelled": return "status-cancelled";
            default: return "";
        }
    };

    return (
        <>
            <section className="tickets-hero">
                <div>
                    <h2>My Tickets</h2>
                    <p>Manage, view, and download tickets for all your upcoming events.</p>
                </div>
            </section>

            <div className="tickets-container">
                <div className="ticket-tabs">
                    <div className="ticket-status">
                        {["Upcoming", "Past", "Cancelled"].map((tab) => (
                            <button
                                key={tab}
                                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <span className="row-heading tab-count">
                        {filteredTickets.length} events
                    </span>
                </div>

                {loading ? (
                    <div className="empty-tickets">
                        <p>Loading tickets...</p>
                    </div>
                ) : filteredTickets.length > 0 ? (
                    <div className="tickets-list">
                        {filteredTickets.map((ticket) => {
                            const status = getTicketStatus(ticket);
                            const event = ticket.eventId;
                            return (
                                <article className="ticket-card" key={ticket._id}>
                                    <div className="ticket-card-header">
                                        <div className="event-category">{event?.category || "Event"}</div>
                                        <span className={`status-badge ${getStatusBadgeClass(status)}`}>
                                            {status}
                                        </span>
                                    </div>
                                    <h3 className="ticket-event-name">{event?.title || "Event"}</h3>
                                    <div className="ticket-info-grid">
                                        <div className="ticket-info-item">
                                            <CalendarDays size={16} />
                                            <span>{event?.date ? new Date(event.date).toDateString() : "—"}</span>
                                        </div>
                                        <div className="ticket-info-item">
                                            <Clock size={16} />
                                            <span>{event?.time || "—"}</span>
                                        </div>
                                        <div className="ticket-info-item">
                                            <MapPin size={16} />
                                            <span>{event?.venue || "—"}</span>
                                        </div>
                                    </div>
                                    <div className="ticket-booking-id">
                                        <Ticket size={14} />
                                        <span>Booking ID: {ticket.ticketId}</span>
                                    </div>
                                    <div className="ticket-card-actions">
                                        <button
                                            className="btn-view-ticket"
                                            onClick={() => setSelectedTicket(ticket)}
                                        >
                                            <Eye size={16} />
                                            View Ticket
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-tickets">
                        <Ticket size={48} />
                        <h3>No {activeTab.toLowerCase()} tickets found</h3>
                        <p>You don't have any {activeTab.toLowerCase()} tickets in your collection.</p>
                    </div>
                )}
            </div>

            {selectedTicket && (
                <div className="ticket-modal-overlay" onClick={() => setSelectedTicket(null)}>
                    <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="ticket-modal-close"
                            onClick={() => setSelectedTicket(null)}
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                        <div className="ticket-modal-header">
                            <div className="event-visual-preview">
                                <span>{selectedTicket.eventId?.category || "Event"}</span>
                            </div>
                            <h2>{selectedTicket.eventId?.title}</h2>
                            <p className="ticket-modal-summary">
                                Official entry pass • Valid for {selectedTicket.quantity} person
                            </p>
                        </div>
                        <div className="ticket-modal-details">
                            <div className="detail-row">
                                <CalendarDays size={18} />
                                <div>
                                    <strong>Date & Time</strong>
                                    <span>
                                        {selectedTicket.eventId?.date
                                            ? new Date(selectedTicket.eventId.date).toDateString()
                                            : "—"} at {selectedTicket.eventId?.time || "—"}
                                    </span>
                                </div>
                            </div>
                            <div className="detail-row">
                                <MapPin size={18} />
                                <div>
                                    <strong>Venue</strong>
                                    <span>{selectedTicket.eventId?.venue || "—"}</span>
                                </div>
                            </div>
                            <div className="detail-row">
                                <Ticket size={18} />
                                <div>
                                    <strong>Ticket Price</strong>
                                    <span>Rs. {selectedTicket.eventId?.price || "—"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="qr-code-section">
                            <div className="qr-container">
                                <QRCode
                                    value={selectedTicket.ticketId}
                                    size={140}
                                    bgColor="#FFFFFF"
                                    fgColor="#FF8A3D"
                                />
                            </div>
                            <div className="booking-id-display">
                                <strong>Booking ID</strong>
                                <code>{selectedTicket.ticketId}</code>
                            </div>
                        </div>
                        <div className="ticket-modal-footer">
                            <button className="btn-close-modal" onClick={() => setSelectedTicket(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}