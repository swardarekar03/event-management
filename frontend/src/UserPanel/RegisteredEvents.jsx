import { useState, useEffect } from "react";
import axios from "axios";
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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showQRModal, setShowQRModal] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      const res = await axios.get(`http://localhost:${PORT}/api/registrations/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setRegistrations(res.data.registrations);
      } else {
        setError("Failed to load registrations");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (registrationId, eventId, ticketsBooked) => {
    if (!window.confirm("Are you sure you want to cancel this registration?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`http://localhost:${PORT}/api/registrations/${registrationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert("Registration cancelled successfully!");
        
        // Also update the event's available tickets (backend handles this, just refresh)
        fetchRegistrations();
      }
    } catch (err) {
      console.error("Cancel error:", err);
      alert(err.response?.data?.message || "Failed to cancel registration");
    }
  };

  const handleMoreTickets = (registration) => {
    // Redirect to event detail page to book more tickets
    window.location.href = `/events/${registration.event._id}`;
  };

  const handleViewTicket = (registration) => {
    setShowQRModal(registration);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">🎫</div>
          <p className="text-slate-500">Loading your registrations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md p-6 bg-white rounded-2xl shadow-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchRegistrations}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full mb-4">
            <Sparkles size={16} />
            <span className="text-sm font-semibold tracking-wide">MY EVENTS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Your Registered Events
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Manage all events you've registered for and get ready for amazing experiences.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-12">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-orange-600">{registrations.length}</div>
            <div className="text-slate-500 text-sm">Total Events</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-emerald-600">
              {registrations.filter(r => !r.checkInStatus && r.event?.status === 'approved').length}
            </div>
            <div className="text-slate-500 text-sm">Upcoming</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-emerald-600">
              {registrations.filter(r => r.checkInStatus).length}
            </div>
            <div className="text-slate-500 text-sm">Attended</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-orange-600">
              {registrations.reduce((sum, r) => sum + (r.ticketsBooked || 1), 0)}
            </div>
            <div className="text-slate-500 text-sm">Total Tickets</div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-orange-500" size={24} />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Your Events</h2>
          </div>
          <span className="text-sm text-slate-400">{registrations.length} events</span>
        </div>

        {registrations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 px-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-50 rounded-full mb-4">
              <Ticket size={40} className="text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Events Yet</h3>
            <p className="text-slate-500 mb-6">You haven't registered for any events.</p>
            <button 
              onClick={() => window.location.href = "/events"}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition shadow-md font-medium"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {registrations.map((registration) => {
              const event = registration.event;
              if (!event) return null;
              
              const totalPaid = (event.price || 0) * (registration.ticketsBooked || 1);
              
              return (
                <div
                  key={registration._id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100"
                >
                  {/* Image Section */}
                  <div className="relative h-44 sm:h-52 overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600">
                    <img
                      src={event.image || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200"}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-orange-600 shadow-sm">
                        {event.category || "Event"}
                      </span>
                    </div>

                    {/* Check-in Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm ${registration.checkInStatus ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {registration.checkInStatus ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {registration.checkInStatus ? "Attended" : "Upcoming"}
                      </span>
                    </div>

                    {/* Rating placeholder */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-sm font-medium">4.8</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 line-clamp-1">
                      {event.title}
                    </h3>

                    {/* Date and Venue */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <CalendarDays size={16} className="text-orange-500 shrink-0" />
                        <span>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <MapPin size={16} className="text-orange-500 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>

                    {/* Price and Tickets */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2 flex-wrap">
                      <div>
                        <div className="text-xs text-slate-500">Total Paid</div>
                        <div className="text-xl font-bold text-orange-600">
                          ₹{totalPaid}
                        </div>
                        <div className="text-xs text-slate-400">
                          ₹{event.price || 0} × {registration.ticketsBooked || 1} ticket
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="bg-orange-50 px-3 py-1.5 rounded-lg">
                          <div className="flex items-center gap-1">
                            <Ticket size={14} className="text-orange-600" />
                            <span className="font-semibold text-slate-800 text-sm">
                              {registration.ticketsBooked || 1}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleMoreTickets(registration)}
                          className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition transform hover:scale-105 shadow-sm shrink-0"
                          title="Book more tickets"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Description Preview */}
                    <p className="text-slate-500 text-sm mt-3 line-clamp-2">
                      {event.description || "No description available"}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <button
                        onClick={() => handleViewTicket(registration)}
                        className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                        disabled={registration.checkInStatus}
                      >
                        <QrCode size={16} />
                        QR Ticket
                      </button>

                      <button
                        onClick={() => setSelectedEvent(registration)}
                        className="flex-1 sm:flex-initial px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Info size={16} />
                        Details
                      </button>

                      <button
                        onClick={() => handleCancel(registration._id, event._id, registration.ticketsBooked)}
                        className="flex-1 sm:flex-initial px-4 py-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                        disabled={registration.checkInStatus}
                      >
                        <Trash2 size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Event Details Modal - Same as before */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="relative h-48 sm:h-64">
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

              <div className="p-5 sm:p-6 lg:p-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 flex-1">
                    {selectedEvent.event?.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CalendarDays size={18} className="text-orange-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm text-slate-500">Date</div>
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

                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-orange-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm text-slate-500">Venue</div>
                        <div className="font-medium text-slate-800 break-words">{selectedEvent.event?.venue}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Ticket size={18} className="text-orange-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm text-slate-500">Tickets</div>
                        <div className="font-medium text-slate-800">{selectedEvent.ticketsBooked || 1} tickets</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-slate-500">Category</div>
                      <div className="font-medium text-slate-800">{selectedEvent.event?.category || "General"}</div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-500">Price per ticket</div>
                      <div className="font-medium text-slate-800">₹{selectedEvent.event?.price || 0}</div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-500">Total Paid</div>
                      <div className="font-bold text-orange-600 text-xl">
                        ₹{(selectedEvent.event?.price || 0) * (selectedEvent.ticketsBooked || 1)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-2">About this event</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedEvent.event?.description || "No description available"}
                  </p>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowQRModal(selectedEvent)}
                    className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-md flex items-center justify-center gap-2 font-medium"
                  >
                    <QrCode size={18} />
                    View QR Ticket
                  </button>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-8 text-center shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="mb-4">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode size={40} className="text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Your Ticket</h3>
                <p className="text-slate-500 text-sm mt-1">{showQRModal.event?.title}</p>
              </div>

              {/* Simulated QR Code */}
              <div className="bg-slate-800 p-4 sm:p-6 rounded-2xl mb-6 inline-block mx-auto">
                <div className="w-40 h-40 sm:w-48 sm:h-48 bg-white rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Ticket size={60} className="text-slate-800 mx-auto mb-2" />
                    <div className="text-xs text-slate-600 font-mono break-all px-2">QR-{showQRModal._id}</div>
                    <div className="text-xs text-slate-500 mt-1">Ticket #{Math.random().toString(36).substr(2, 8).toUpperCase()}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-left bg-slate-50 p-4 rounded-xl mb-6">
                <div className="flex justify-between text-sm gap-2">
                  <span className="text-slate-600">Ticket Holder:</span>
                  <span className="font-medium text-slate-800 text-right truncate">{showQRModal.attendeeName}</span>
                </div>
                <div className="flex justify-between text-sm gap-2">
                  <span className="text-slate-600">Email:</span>
                  <span className="font-medium text-slate-800 text-right truncate">{showQRModal.attendeeEmail}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tickets:</span>
                  <span className="font-medium text-slate-800">{showQRModal.ticketsBooked || 1}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Status:</span>
                  <span className={`font-medium ${showQRModal.checkInStatus ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {showQRModal.checkInStatus ? "Attended" : "Not Checked In"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowQRModal(null)}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Implement PDF download logic here
                    alert("Download feature coming soon!");
                    setShowQRModal(null);
                  }}
                  className="flex-1 px-6 py-3 border border-orange-300 text-orange-600 rounded-xl hover:bg-orange-50 transition-all font-medium"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
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