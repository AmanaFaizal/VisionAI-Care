import { useEffect, useState } from "react";
import Link from "next/link";
import { Stethoscope, History } from "lucide-react";
import { getUser } from "../lib/api";

export default function LandingNavbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <nav className="flex items-center justify-between py-4 px-8 max-w-7xl mx-auto">
      <Link href="/" className="flex items-center gap-2 text-navy font-serif font-bold text-xl">
        <Stethoscope className="text-brandOrange" size={24} />
        VisionAI-Care
      </Link>
      
      <div className="hidden md:flex items-center gap-8 text-navy font-medium text-sm">
        {user && <Link href="/" className="hover:text-brandOrange transition">Dashboard</Link>}
        <Link href="/#tests" className="hover:text-brandOrange transition">Tests</Link>
        <Link href="/#how-it-works" className="hover:text-brandOrange transition">How it Works</Link>
        <Link href="/#faq" className="hover:text-brandOrange transition">Education</Link>
        {user && (
          <Link href={user.role === 'patient' ? "/patient/history" : "/doctor/dashboard"} className="hover:text-brandOrange transition flex items-center gap-1">
            <History size={16} /> History & Reports
          </Link>
        )}
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                import("../lib/api").then(m => {
                  m.clearSession();
                  window.location.href = "/";
                });
              }}
              className="font-medium text-sm text-gray-500 hover:text-brandOrange transition"
            >
              Log Out
            </button>
            <div 
              title={user.full_name || "User"}
              className="w-10 h-10 rounded-full bg-brandOrange text-white flex items-center justify-center font-bold text-lg shadow-sm overflow-hidden cursor-default"
            >
              {/* Fallback initial if no image */}
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
            </div>
          </div>
        ) : (
          <>
            <Link href="/login" className="hidden md:block font-medium text-sm text-navy hover:text-brandOrange transition">Sign In</Link>
            <Link href="/login" className="btn !bg-brandOrange !px-6 !py-2.5 !rounded-full hover:!bg-orange-600 transition shadow-sm">
              Take Test
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
