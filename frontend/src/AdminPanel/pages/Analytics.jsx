import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, Ticket, CalendarDays } from "lucide-react";
import { API_BASE_URL } from "../../config/api.js";

export default function Analytics() {
    // Store analytics data
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalUsers: 0,
        totalTickets: 0,
        totalRevenue: 0,
        categoryBreakdown: [],
    });

    // Loading state while fetching dashboard data
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch events, users, and tickets simultaneously
        Promise.all([
            fetch(`${API_BASE_URL}/events`, { headers }).then(r => r.json()),
            fetch(`${API_BASE_URL}/admin/users`, { headers }).then(r => r.json()),
            fetch(`${API_BASE_URL}/admin/tickets`, { headers }).then(r => r.json()),
        ])
            .then(([eventsData, usersData, ticketsData]) => {
                const events = eventsData.events || [];
                const users = usersData.users || [];
                const tickets = ticketsData.tickets || [];

                // Calculate event count by category
                const catMap = {};
                events.forEach((e) => {
                    catMap[e.category] = (catMap[e.category] || 0) + 1;
                });

                const categoryBreakdown = Object.entries(catMap)
                    .map(([name, count]) => ({
                        name,
                        count,
                        percent: Math.round((count / events.length) * 100),
                    }))
                    .sort((a, b) => b.count - a.count);

                // Estimate total revenue from sold tickets
                const totalRevenue = tickets.reduce((sum, t) => {
                    return sum + (t.eventId?.price || 0) * (t.quantity || 1);
                }, 0);

                setStats({
                    totalEvents: events.length,
                    totalUsers: users.length,
                    totalTickets: tickets.length,
                    totalRevenue,
                    categoryBreakdown,
                });
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // Colors used for category progress bars
    const categoryColors = [
        "bg-orange-400",
        "bg-purple-400",
        "bg-blue-400",
        "bg-green-400",
        "bg-pink-400",
        "bg-yellow-400",
    ];

    // Summary cards displayed at the top
    const summaryCards = [
        { label: "Total Events", value: stats.totalEvents, icon: CalendarDays, bg: "bg-orange-50", text: "text-orange-500" },
        { label: "Total Users", value: stats.totalUsers, icon: Users, bg: "bg-purple-50", text: "text-purple-500" },
        { label: "Tickets Sold", value: stats.totalTickets, icon: Ticket, bg: "bg-green-50", text: "text-green-500" },
        { label: "Est. Revenue", value: `Rs. ${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, bg: "bg-blue-50", text: "text-blue-500" },
    ];

    return (
        <div className="space-y-6">

            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map(({ label, value, icon: Icon, bg, text }) => (
                    <div key={label} className="bg-white rounded-2xl border border-orange-100 p-5">
                        <div className={`w-10 h-10 rounded-xl ${bg} ${text} flex items-center justify-center mb-3`}>
                            <Icon size={20} />
                        </div>
                        <p className="text-2xl font-extrabold text-gray-800">{loading ? "—" : value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* Event Category Statistics */}
            <div className="bg-white rounded-2xl border border-orange-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                    <BarChart3 size={18} className="text-orange-500" />
                    <h3 className="font-bold text-gray-800">Events by Category</h3>
                </div>

                {loading ? (
                    <p className="text-center text-gray-400 py-6">Loading...</p>
                ) : stats.categoryBreakdown.length === 0 ? (
                    <p className="text-center text-gray-400 py-6">No data available.</p>
                ) : (
                    <div className="space-y-4">
                        {stats.categoryBreakdown.map(({ name, count, percent }, i) => (
                            <div key={name}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-medium text-gray-700">{name}</span>
                                    <span className="text-xs text-gray-400">{count} events ({percent}%)</span>
                                </div>

                                {/* Visual category percentage bar */}
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full ${categoryColors[i % categoryColors.length]} transition-all duration-700`}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Additional Analytics Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-orange-100 p-6">
                    <h3 className="font-bold text-gray-800 mb-1">Avg. Tickets per Event</h3>
                    <p className="text-3xl font-extrabold text-orange-500 mt-2">
                        {loading || stats.totalEvents === 0
                            ? "—"
                            : (stats.totalTickets / stats.totalEvents).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Based on all sold tickets</p>
                </div>

                <div className="bg-white rounded-2xl border border-orange-100 p-6">
                    <h3 className="font-bold text-gray-800 mb-1">Avg. Revenue per Ticket</h3>
                    <p className="text-3xl font-extrabold text-purple-500 mt-2">
                        {loading || stats.totalTickets === 0
                            ? "—"
                            : `Rs. ${(stats.totalRevenue / stats.totalTickets).toFixed(0)}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Estimated from ticket prices</p>
                </div>
            </div>
        </div>
    );
}
