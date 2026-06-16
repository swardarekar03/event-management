import { useEffect, useState } from "react";
import { Trash2, Search, CalendarDays, MapPin, CheckCircle, XCircle, Clock } from "lucide-react";
import { API_BASE_URL } from "../../config/api.js";

const categoryColors = {
    Concerts: "bg-pink-100 text-pink-600",
    Business: "bg-blue-100 text-blue-600",
    Food: "bg-green-100 text-green-600",
    Creative: "bg-purple-100 text-purple-600",
    Comedy: "bg-yellow-100 text-yellow-600",
    Sports: "bg-red-100 text-red-600",
    Technology: "bg-cyan-100 text-cyan-600",
    Fest: "bg-orange-100 text-orange-600",
};

export default function ManageEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [deleteId, setDeleteId] = useState(null);

    const fetchEvents = () => {
        const token = localStorage.getItem("token");
        fetch(`${API_BASE_URL}/admin/events`, {  // ← using central API config
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => setEvents(d.events || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleDelete = async (id) => {
        const token = localStorage.getItem("token");
        try {
            await fetch(`${API_BASE_URL}/admin/events/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            setEvents((prev) => prev.filter((e) => e._id !== id));
        } catch {
            alert("Failed to delete event.");
        } finally {
            setDeleteId(null);
        }
    };

    const handleAction = async (id, action) => {
        const token = localStorage.getItem("token");
        try {
            await fetch(`${API_BASE_URL}/admin/events/${id}/${action}`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            setEvents((prev) =>
                prev.map((e) => e._id === id
                    ? { ...e, status: action === "approve" ? "approved" : "rejected" }
                    : e
                )
            );
        } catch {
            alert("Action failed.");
        }
    };

    const counts = {
        all: events.length,
        pending: events.filter((e) => e.status === "pending").length,
        approved: events.filter((e) => e.status === "approved").length,
        rejected: events.filter((e) => e.status === "rejected").length,
    };

    const filtered = events.filter((e) => {
        const matchQuery = `${e.title} ${e.category} ${e.venue}`.toLowerCase().includes(query.toLowerCase());
        const matchFilter = filter === "all" || e.status === filter;
        return matchQuery && matchFilter;
    });

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-extrabold text-gray-800">All Events</h2>
                    <p className="text-sm text-gray-400">{counts.pending} pending approvals</p>
                </div>
                <label className="flex items-center gap-2 bg-white border border-orange-100 rounded-xl px-4 py-2.5 w-full sm:w-72">
                    <Search size={16} className="text-gray-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search events..."
                        className="text-sm outline-none w-full bg-transparent text-gray-700 placeholder-gray-400"
                    />
                </label>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {["all", "pending", "approved", "rejected"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition ${
                            filter === tab
                                ? "bg-orange-500 text-white"
                                : "bg-white border border-orange-100 text-gray-500 hover:border-orange-300"
                        }`}
                    >
                        {tab} ({counts[tab]})
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-orange-50 text-gray-500 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="px-6 py-3 text-left">Event</th>
                                <th className="px-6 py-3 text-left">Category</th>
                                <th className="px-6 py-3 text-left">Date</th>
                                <th className="px-6 py-3 text-left">Venue</th>
                                <th className="px-6 py-3 text-left">Price</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-orange-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">Loading events...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">No events found.</td>
                                </tr>
                            ) : filtered.map((event) => (
                                <tr key={event._id} className="hover:bg-orange-50/40 transition">
                                    <td className="px-6 py-4 font-semibold text-gray-800 max-w-[180px] truncate">{event.title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[event.category] || "bg-gray-100 text-gray-500"}`}>
                                            {event.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <CalendarDays size={13} />
                                            {new Date(event.date).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={13} />
                                            {event.venue}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-orange-500">Rs. {event.price}</td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1 w-fit px-2 py-1 rounded-full text-xs font-medium ${
                                            event.status === "approved" ? "bg-green-100 text-green-600"
                                            : event.status === "rejected" ? "bg-red-100 text-red-500"
                                            : "bg-yellow-100 text-yellow-600"
                                        }`}>
                                            {event.status === "approved" && <CheckCircle size={11} />}
                                            {event.status === "rejected" && <XCircle size={11} />}
                                            {event.status === "pending" && <Clock size={11} />}
                                            {event.status || "pending"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {event.status === "pending" && (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(event._id, "approve")}
                                                        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium transition"
                                                    >
                                                        <CheckCircle size={13} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(event._id, "reject")}
                                                        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 font-medium transition"
                                                    >
                                                        <XCircle size={13} /> Reject
                                                    </button>
                                                </>
                                            )}
                                            {deleteId === event._id ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDelete(event._id)}
                                                        className="text-xs px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteId(null)}
                                                        className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteId(event._id)}
                                                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}