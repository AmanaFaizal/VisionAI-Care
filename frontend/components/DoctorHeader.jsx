import { Search, Calendar, Bell, LogOut } from "lucide-react";
import { getUser, clearSession } from "../lib/api";

export default function DoctorHeader() {
  const user = getUser();
  const doctorName = user?.full_name?.split(' ')[0] || "Doctor";
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-transparent text-navy px-8 py-6 flex items-center justify-between relative z-10">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Good Morning, <span className="text-brandOrange">Dr. {doctorName}!</span></h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2.5 bg-white border border-[#e8dfce] rounded-xl hover:bg-gray-50 transition shadow-sm">
          <Bell size={20} className="text-gray-500" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border-2 border-white"></span>
        </button>

        {/* Date */}
        <div className="flex items-center gap-2 bg-white border border-[#e8dfce] px-4 py-2.5 rounded-xl text-sm text-gray-500 font-medium shadow-sm">
          <Calendar size={18} className="text-brandOrange" />
          <span>{today}</span>
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients, records..."
            className="bg-white border border-[#e8dfce] text-sm text-navy placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brandOrange transition w-64 shadow-sm"
          />
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            clearSession();
            window.location.href = "/";
          }}
          className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 px-5 py-2.5 rounded-xl text-sm font-bold transition ml-2 shadow-sm"
        >
          <LogOut size={18} />
          <span className="hidden md:inline">Log Out</span>
        </button>
      </div>
    </div>
  );
}
