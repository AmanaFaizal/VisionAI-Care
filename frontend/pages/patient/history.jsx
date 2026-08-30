import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LandingNavbar from "../../components/LandingNavbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { api } from "../../lib/api";

import { Eye, Calendar, ChevronRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockProgressData = [
  { month: 1, score: 70, target: 63 },
  { month: 2, score: 75, target: 72 },
  { month: 3, score: 78, target: 74 },
  { month: 4, score: 76, target: 73 },
  { month: 5, score: 80, target: 83 },
  { month: 6, score: 85, target: 82 },
  { month: 7, score: 84, target: 80 },
  { month: 8, score: 90, target: 88 },
  { month: 9, score: 92, target: 90 },
  { month: 10, score: 100, target: 96 },
  { month: 11, score: 98, target: 94 },
  { month: 12, score: 100, target: 100 },
];

function statusBadge(status) {
  const map = {
    pending: "text-orange-600",
    claimed: "text-orange-600",
    reviewed: "text-green-600",
    Complete: "text-blue-600",
  };
  return <span className={`font-medium ${map[status] || "text-gray-600"}`}>{status}</span>;
}

function DashboardContent() {
  const router = useRouter();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .myConsultations()
      .then(setConsultations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleStartTest() {
    setStarting(true);
    setError("");
    try {
      const session = await api.startSession();
      router.push(`/patient/test?session=${session.id}`);
    } catch (e) {
      setError(e.message);
      setStarting(false);
    }
  }

  return (
    <div className="bg-[#fcf8f2] min-h-screen py-10 px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div>
          <h1 className="text-3xl font-bold text-navy mb-6">Welcome Back!</h1>
          <div className="bg-brandOrange text-white rounded-2xl p-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Eye size={24} />
              </div>
              <h2 className="text-2xl font-semibold m-0">Start New Vision Screening</h2>
            </div>
            <button 
              className="bg-[#fff3e0] text-brandOrange font-semibold px-6 py-3 rounded-xl hover:bg-white transition shadow-sm"
              onClick={handleStartTest} 
              disabled={starting}
            >
              {starting ? "Starting..." : "Consult a Specialist"}
            </button>
          </div>
          {error && <p className="error-text mt-2">{error}</p>}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Consultation History Table */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-navy mb-4">Consultation History</h3>
            <div className="bg-white rounded-2xl border border-[#e8dfce] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f9f4ec] text-gray-700 text-sm border-b border-[#e8dfce]">
                      <th className="font-semibold p-4">Date ↓</th>
                      <th className="font-semibold p-4">Consultation Type</th>
                      <th className="font-semibold p-4">Clinician</th>
                      <th className="font-semibold p-4">Status</th>
                      <th className="font-semibold p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {/* Mock static rows to match UI if empty */}
                    {consultations.length === 0 && (
                      <>
                        <tr className="border-b border-gray-100">
                          <td className="p-4">04/10/24</td>
                          <td className="p-4">Comprehensive Eye Exam</td>
                          <td className="p-4 text-gray-600">Dr. Sarah Chen</td>
                          <td className="p-4">{statusBadge('Complete')}</td>
                          <td className="p-4 flex justify-end gap-2">
                            <button className="p-2 bg-[#f9f4ec] rounded-lg text-gray-600 hover:bg-[#e8dfce]"><Eye size={16} /></button>
                            <button className="p-2 bg-[#fcecd9] rounded-lg text-brandOrange hover:bg-orange-200"><ChevronRight size={16} /></button>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="p-4">18/09/24</td>
                          <td className="p-4">Follow-up</td>
                          <td className="p-4 text-gray-600">Dr. Sarah Chen</td>
                          <td className="p-4">{statusBadge('Complete')}</td>
                          <td className="p-4 flex justify-end gap-2">
                            <button className="p-2 bg-[#f9f4ec] rounded-lg text-gray-600 hover:bg-[#e8dfce]"><Eye size={16} /></button>
                            <button className="p-2 bg-[#fcecd9] rounded-lg text-brandOrange hover:bg-orange-200"><ChevronRight size={16} /></button>
                          </td>
                        </tr>
                        <tr className="">
                          <td className="p-4">01/09/24</td>
                          <td className="p-4">Initial Vision Test</td>
                          <td className="p-4 text-gray-600">Dr. Mark Davies</td>
                          <td className="p-4">{statusBadge('Complete')}</td>
                          <td className="p-4 flex justify-end gap-2">
                            <button className="p-2 bg-[#f9f4ec] rounded-lg text-gray-600 hover:bg-[#e8dfce]"><Calendar size={16} /></button>
                            <button className="p-2 bg-[#fcecd9] rounded-lg text-brandOrange hover:bg-orange-200"><ChevronRight size={16} /></button>
                          </td>
                        </tr>
                      </>
                    )}
                    {/* Dynamic rows mapped from backend */}
                    {consultations.map((c) => (
                      <tr key={c.id} className="border-b border-gray-100 last:border-0">
                        <td className="p-4">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="p-4">AI Screening</td>
                        <td className="p-4 text-gray-600">Pending Review</td>
                        <td className="p-4">{statusBadge(c.status)}</td>
                        <td className="p-4 flex justify-end gap-2">
                           <button className="p-2 bg-[#f9f4ec] rounded-lg text-gray-600 hover:bg-[#e8dfce]"><Eye size={16} /></button>
                           <button className="p-2 bg-[#fcecd9] rounded-lg text-brandOrange hover:bg-orange-200"><ChevronRight size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Vision Progress Chart */}
          <div className="md:col-span-1">
             <div className="bg-white rounded-2xl border border-[#e8dfce] shadow-sm p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-navy">Vision Progress</h3>
                  <div className="text-gray-400 font-bold tracking-widest">...</div>
                </div>
                
                <div className="flex-grow w-full h-[250px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#1e293b" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="target" stroke="#ea580c" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  return (
    <ProtectedRoute role="patient">
      <DashboardContent />
    </ProtectedRoute>
  );
}
