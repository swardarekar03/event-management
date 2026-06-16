import { useState, useEffect } from "react";
import axios from "axios";
import { Star, Send, Edit2, Trash2, Calendar, MapPin, MessageCircle } from "lucide-react";
import { API_BASE_URL } from "../config/api.js";

export default function AudienceFeedback() {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState("give"); // give, my

  // Fetch registered events and my feedbacks
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Get user's registered events
      const registrationsRes = await axios.get(`${API_BASE_URL}/registrations/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Get user's existing feedbacks
      const feedbacksRes = await axios.get(`${API_BASE_URL}/feedback/my-feedbacks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (registrationsRes.data.success) {
        const validEvents = registrationsRes.data.registrations
          .filter(r => r.event && new Date(r.event.date) <= new Date())
          .map(r => r.event);
        setRegisteredEvents(validEvents);
      }
      
      if (feedbacksRes.data.success) {
        setMyFeedbacks(feedbacksRes.data.feedbacks);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    if (!selectedEvent) {
      alert("Please select an event");
      return;
    }
    
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    
    if (!comment.trim()) {
      alert("Please write your feedback");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const url = editingFeedback 
        ? `${API_BASE_URL}/feedback/${editingFeedback._id}`
        : `${API_BASE_URL}/feedback/create`;
      
      const method = editingFeedback ? "put" : "post";
      
      const res = await axios[method](
        url,
        { eventId: selectedEvent._id, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        alert(editingFeedback ? "Feedback updated!" : "Feedback submitted! Thank you!");
        resetForm();
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFeedback = (feedback) => {
    setEditingFeedback(feedback);
    setSelectedEvent({ _id: feedback.eventId, title: feedback.eventTitle });
    setRating(feedback.rating);
    setComment(feedback.comment);
    setActiveTab("give");
  };

  const handleDeleteFeedback = async (id) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Feedback deleted");
      fetchData();
      resetForm();
    } catch (err) {
      alert("Failed to delete feedback");
    }
  };

  const resetForm = () => {
    setEditingFeedback(null);
    setSelectedEvent(null);
    setRating(0);
    setComment("");
  };

  const StarRating = ({ rating, setRating, hoverRating, setHoverRating }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none"
          >
            <Star
              size={32}
              className={`transition-all ${
                star <= (hoverRating || rating)
                  ? "fill-orange-500 text-orange-500"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full mb-4">
            <MessageCircle size={16} />
            <span className="text-sm font-semibold tracking-wide">FEEDBACK</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Share Your Experience
          </h1>
          <p className="text-slate-500">
            Your feedback helps organizers improve future events
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => { setActiveTab("give"); resetForm(); }}
            className={`px-6 py-2 font-medium transition ${
              activeTab === "give"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Give Feedback
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-6 py-2 font-medium transition ${
              activeTab === "my"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            My Feedbacks ({myFeedbacks.length})
          </button>
        </div>

        {/* Give Feedback Tab */}
        {activeTab === "give" && (
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
            <form onSubmit={handleSubmitFeedback}>
              {/* Event Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Event *
                </label>
                <select
                  required
                  value={selectedEvent?._id || ""}
                  onChange={(e) => {
                    const event = registeredEvents.find(ev => ev._id === e.target.value);
                    setSelectedEvent(event);
                  }}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:border-orange-300 focus:outline-none"
                >
                  <option value="">— Choose an event —</option>
                  {registeredEvents.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.title} - {new Date(event.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {registeredEvents.length === 0 && (
                  <p className="text-sm text-amber-600 mt-2">
                    No completed events to review yet. Attend events first!
                  </p>
                )}
              </div>

              {selectedEvent && (
                <>
                  {/* Rating */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Your Rating *
                    </label>
                    <StarRating
                      rating={rating}
                      setRating={setRating}
                      hoverRating={hoverRating}
                      setHoverRating={setHoverRating}
                    />
                  </div>

                  {/* Comment */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Your Feedback *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:border-orange-300 focus:outline-none resize-none"
                      placeholder="Share your experience... What did you like? What could be improved?"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition font-medium flex items-center justify-center gap-2"
                    >
                      <Send size={18} />
                      {submitting ? "Submitting..." : editingFeedback ? "Update Feedback" : "Submit Feedback"}
                    </button>
                    {editingFeedback && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </>
              )}
            </form>
          </div>
        )}

        {/* My Feedbacks Tab */}
        {activeTab === "my" && (
          <div className="space-y-4">
            {myFeedbacks.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-12 text-center">
                <MessageCircle size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Feedbacks Yet</h3>
                <p className="text-slate-500">You haven't given any feedback yet.</p>
              </div>
            ) : (
              myFeedbacks.map((feedback) => (
                <div key={feedback._id} className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">{feedback.eventTitle}</h3>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={star <= feedback.rating ? "fill-orange-500 text-orange-500" : "text-gray-300"}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditFeedback(feedback)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteFeedback(feedback._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm">{feedback.comment}</p>
                  <div className="mt-3 text-xs text-slate-400">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </div>
                  {feedback.organizerResponded && (
                    <div className="mt-3 bg-orange-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-orange-600 mb-1">Organizer Response:</p>
                      <p className="text-sm text-slate-600">{feedback.organizerResponse}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}