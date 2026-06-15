import { useEffect, useState } from "react";
import { CalendarDays, Users, Ticket, Building2, TrendingUp, ArrowUpRight } from "lucide-react";

const statCards = [
    { label: "Total Events", key: "events", icon: CalendarDays, color: "bg-orange-50 text-orange-500", border: "border-orange-100" },
    { label: "Total Users", key: "users", icon: Users, color: "bg-purple-50 text-purple-500", border: "border-purple-100" },
    { label: "Tickets Sold", key: "tickets", icon: Ticket, color: "bg-green-50 text-green-500", border: "border-green-100" },
    { label: "Organizers", key: "organizers", icon: Building2, color: "bg-blue-50 text-blue-500", border: "border-blue-100" },
];

export default function Overview() {
    const [stats, setStats] = useState({ events: 0, users: 0, tickets: 0, organizers: 0 });
    const [recentEvents, setRecentEvents] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch events count
        fetch("https://event-management-ak5b.onrender.com/api/admin/events", { headers })
            .then(r => r.json())
            .then(d => setStats(prev => ({ ...prev, events: d.events?.length || 0 })))
            .catch(() => {});

        // Fetch users count
        fetch("https://event-management-ak5b.onrender.com/api/admin/users", { headers })
            .then(r => r.json())
            .then(d => setStats(prev => ({ ...prev, users: d.users?.length || 0 })))
            .catch(() => {});

        // Fetch tickets count
        fetch("https://event-management-ak5b.onrender.com/api/admin/tickets", { headers })
            .then(r => r.json())
            .then(d => setStats(prev => ({ ...prev, tickets: d.tickets?.length || 0 })))
            .catch(() => {});

        // Fetch recent events
        fetch("https://event-management-ak5b.onrender.com/api/events", { headers })
            .then(r => r.json())
            .then(d => setRecentEvents((d.events || []).slice(0, 5)))
            .catch(() => {});
    }, []);

    return (
        <div className="space-y-6">

            {/* Welcome */}
            <div className="bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl p-6 text-white">
                <p className="text-orange-100 text-sm font-medium uppercase tracking-widest mb-1">Welcome back</p>
                <h2 className="text-2xl font-extrabold">Admin Dashboard</h2>
                <p className="text-orange-100 mt-1 text-sm">Here's what's happening on NexEvent today.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(({ label, key, icon: Icon, color, border }) => (
                    <div key={key} className={`bg-white rounded-2xl border ${border} p-5 flex items-center gap-4`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                            <Icon size={22} />
                        </div>
                        <div>
                            <p className="text-2xl font-extrabold text-gray-800">{stats[key]}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Events Table */}
            <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-orange-50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">Recent Events</h3>
                    <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
                        <TrendingUp size={14} /> Live data
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-orange-50 text-gray-500 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="px-6 py-3 text-left">Event</th>
                                <th className="px-6 py-3 text-left">Category</th>
                                <th className="px-6 py-3 text-left">Venue</th>
                                <th className="px-6 py-3 text-left">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-orange-50">
                            {recentEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading events...</td>
                                </tr>
                            ) : recentEvents.map((event) => (
                                <tr key={event._id} className="hover:bg-orange-50/50 transition">
                                    <td className="px-6 py-4 font-medium text-gray-800">{event.title}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                                            {event.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{event.venue}</td>
                                    <td className="px-6 py-4 font-semibold text-orange-500">Rs. {event.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
