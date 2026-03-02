import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Star, Bot, Map, Trophy, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return <Outlet />;

  const navItems = [
    { path: "/dashboard", icon: <Home className="w-5 h-5" />, label: "Home" },
    { path: "/quran", icon: <BookOpen className="w-5 h-5" />, label: "Quran" },
    { path: "/ai-coach", icon: <Bot className="w-5 h-5" />, label: "Coach" },
    { path: "/challenges", icon: <Trophy className="w-5 h-5" />, label: "Squad" },
    { path: "/profile", icon: <User className="w-5 h-5" />, label: "Profile" },
  ];

  return (
    <div className="pb-20 md:pb-0 min-h-screen bg-base-50" data-theme="ramadan">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-base-200 px-2 py-2 md:hidden z-50">
        <ul className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex flex-col items-center gap-0.5 transition-colors ${isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <div className={`${isActive ? "bg-primary/10 p-2 rounded-xl text-primary" : "p-2"} transition-all`}>
                    {item.icon}
                  </div>
                  <span className="text-[9px] tracking-wide uppercase font-semibold">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
