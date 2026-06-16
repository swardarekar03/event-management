import { useEffect, useState } from "react";
import { Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { API_BASE_URL } from "../../config/api.js";

export default function ManageOrganizers() {
    const [organizers, setOrganizers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(`${API_BASE_URL}/admin/organizers`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => setOrganizers(d.organizers || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleAction = async (id, action) => {
        const token = localStorage.getItem("token");
        try {
            await fetch(`${API_BASE_URL}/admin/organizers/${id}/${action}`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrganizers((prev) =>
                prev.map((o) => o._id === id ? { ...o, status: action === "approve" ? "approved" : "rejected" } : o)
            );
        } catch {
            alert("Action failed.");
        }
    };

    const filtered = organizers.filter((o) => {
        const matchQuery = `${o.name} ${o.email} ${o.orgName}`.toLowerCase().includes(query.toLowerCase());
        const matchFilter = filter === "all" || o.status === filter;
        return matchQuery && matchFilter;
    });

    const counts = {
        all: organizers.length,
        pending: organizers.filter((o) => o.status === "pending").length,
        approved: organizers.filter((o) => o.status === "approved").length,
        rejected: organizers.filter((o) => o.status === "rejected").length,
    };

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-extrabold text-gray-800">Organizers</h2>
                    <p className="text-sm text-gray-400">{counts.pending} pending approvals</p>
                </div>
                <label className="flex items-center gap-2 bg-white border border-orange-100 rounded-xl px-4 py-2.5 w-full sm:w-72">
                    <Search size={16} className="text-gray-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search organizers..."
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
                                <th className="px-6 py-3 text-left">Name</th>
                                <th className="px-6 py-3 text-left">Email</th>
                                <th className="px-6 py-3 text-left">Organization</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-orange-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading organizers...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">No organizers found.</td>
                                </tr>
                            ) : filtered.map((org) => (
                                <tr key={org._id} className="hover:bg-orange-50/40 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center uppercase">
                                                {org.name?.[0] || "O"}
                                            </div>
                                            <span className="font-medium text-gray-800">{org.fullName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{org.email}</td>
                                    <td className="px-6 py-4 text-gray-600">{org.orgName || "—"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1 w-fit px-2 py-1 rounded-full text-xs font-medium ${
                                            org.status === "approved"
                                                ? "bg-green-100 text-green-600"
                                                : org.status === "rejected"
                                                ? "bg-red-100 text-red-500"
                                                : "bg-yellow-100 text-yellow-600"
                                        }`}>
                                            {org.status === "approved" && <CheckCircle size={11} />}
                                            {org.status === "rejected" && <XCircle size={11} />}
                                            {org.status === "pending" && <Clock size={11} />}
                                            {org.status || "pending"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {org.status === "pending" ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAction(org._id, "approve")}
                                                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium transition"
                                                >
                                                    <CheckCircle size={13} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(org._id, "reject")}
                                                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 font-medium transition"
                                                >
                                                    <XCircle size={13} /> Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">No actions</span>
                                        )}
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
// Organizer 
