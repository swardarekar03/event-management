import { useState } from "react";
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    Building2,
    Ticket,
    BarChart3,
    LogOut,
    Menu,
    X,
    Bell,
} from "lucide-react";
import ManageEvents from "./pages/ManageEvents";
import ManageUsers from "./pages/ManageUsers";
import ManageOrganizers from "./pages/ManageOrganizers";
import Analytics from "./pages/Analytics";
import Overview from "./pages/Overview";

const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "events", label: "Manage Events", icon: CalendarDays },
    { id: "users", label: "Manage Users", icon: Users },
    { id: "organizers", label: "Organizers", icon: Building2 },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminDashboard() {
    const [activePage, setActivePage] = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const renderPage = () => {
        switch (activePage) {
            case "overview": return <Overview />;
            case "events": return <ManageEvents />;
            case "users": return <ManageUsers />;
            case "organizers": return <ManageOrganizers />;
            case "analytics": return <Analytics />;
            default: return <Overview />;
        }
    };

    const activeLabel = navItems.find((n) => n.id === activePage)?.label;

    return (
        <div className="flex h-screen bg-[#fdf6f0] font-sans overflow-hidden">

            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? "w-64" : "w-0 overflow-hidden"} transition-all duration-300 bg-white border-r border-orange-100 flex flex-col shrink-0`}
            >
                {/* Brand */}
                <div className="px-6 py-5 border-b border-orange-100">
                    <span className="text-2xl font-extrabold text-orange-500 tracking-tight">
                        Nex<span className="text-purple-600">Event</span>
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActivePage(id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                                ${activePage === id
                                    ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
                                }`}
                        >
                            <Icon size={18} />
                            {label}
                        </button>
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-orange-100">
                    <button
                        onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Topbar */}
                <header className="bg-white border-b border-orange-100 px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-orange-500 transition"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <h1 className="text-lg font-bold text-gray-800">{activeLabel}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative p-2 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-orange-500 transition">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
                        </button>
                        <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}
