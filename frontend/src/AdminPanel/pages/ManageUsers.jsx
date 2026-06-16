import { useEffect, useState } from "react";
import { Search, UserX, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "../../config/api.js";

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(`${API_BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => setUsers(d.users || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleBan = async (id) => {
        const token = localStorage.getItem("token");
        try {
            await fetch(`${API_BASE_URL}/admin/users/${id}/ban`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers((prev) =>
                prev.map((u) => u._id === id ? { ...u, banned: !u.banned } : u)
            );
        } catch {
            alert("Action failed.");
        }
    };

    const filtered = users.filter((u) =>
        `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-extrabold text-gray-800">All Users</h2>
                    <p className="text-sm text-gray-400">{users.length} registered users</p>
                </div>
                <label className="flex items-center gap-2 bg-white border border-orange-100 rounded-xl px-4 py-2.5 w-full sm:w-72">
                    <Search size={16} className="text-gray-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search users..."
                        className="text-sm outline-none w-full bg-transparent text-gray-700 placeholder-gray-400"
                    />
                </label>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-orange-50 text-gray-500 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="px-6 py-3 text-left">Name</th>
                                <th className="px-6 py-3 text-left">Email</th>
                                <th className="px-6 py-3 text-left">Role</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-orange-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading users...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">No users found.</td>
                                </tr>
                            ) : filtered.map((user) => (
                                <tr key={user._id} className="hover:bg-orange-50/40 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center uppercase">
                                                {user.name?.[0] || "U"}
                                            </div>
                                            <span className="font-medium text-gray-800">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            user.role === "admin"
                                                ? "bg-purple-100 text-purple-600"
                                                : user.role === "organizer"
                                                ? "bg-blue-100 text-blue-600"
                                                : "bg-gray-100 text-gray-500"
                                        }`}>
                                            {user.role || "user"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            user.banned
                                                ? "bg-red-100 text-red-500"
                                                : "bg-green-100 text-green-600"
                                        }`}>
                                            {user.banned ? "Banned" : "Active"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleBan(user._id)}
                                            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                                                user.banned
                                                    ? "bg-green-50 text-green-600 hover:bg-green-100"
                                                    : "bg-red-50 text-red-500 hover:bg-red-100"
                                            }`}
                                        >
                                            {user.banned
                                                ? <><ShieldCheck size={13} /> Unban</>
                                                : <><UserX size={13} /> Ban</>
                                            }
                                        </button>
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

//needs to be Responsive
