import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DoctorHeader from "../../components/DoctorHeader";
import ProtectedRoute from "../../components/ProtectedRoute";
import { api, getUser } from "../../lib/api";
import { Users, FileText, CheckCircle, ChevronRight, Stethoscope } from "lucide-react";

function statusBadge(status) {
  const map = {
    pending: "text-orange-600 bg-orange-50",
    claimed: "text-blue-600 bg-blue-50",
    reviewed: "text-green-600 bg-green-50",
    Complete: "text-green-600 bg-green-50",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${map[status] || "text-gray-600 bg-gray-50"}`}>
      {status}
    </span>
  );
}

function DashboardContent() {
  const router = useRouter();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claimingId, setClaimingId] = useState(null);
  const user = getUser();

  function load() {
    setLoading(true);
    api
      .consultationQueue()
      .then(setQueue)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleClaim(id) {
    setClaimingId(id);
    try {
      await api.claimConsultation(id);
      router.push(`/doctor/review/${id}`);
    } catch (e) {
      setError(e.message);
      setClaimingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#fcf8f2]">
      <DoctorHeader />
      
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-[#e8dfce] p-6 shadow-sm flex items-center gap-4">
            <div className="bg-orange-50 text-brandOrange p-4 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Screenings</p>
              <p className="text-2xl font-bold text-navy">{queue.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#e8dfce] p-6 shadow-sm flex items-center gap-4">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-xl">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Claimed by You</p>
              <p className="text-2xl font-bold text-navy">
                {queue.filter(q => q.status === 'claimed').length}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#e8dfce] p-6 shadow-sm flex items-center gap-4">
            <div className="bg-green-50 text-green-600 p-4 rounded-xl">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Reviews Completed</p>
              <p className="text-2xl font-bold text-navy">--</p>
            </div>
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-white rounded-2xl border border-[#e8dfce] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#e8dfce] flex justify-between items-center bg-[#f9f4ec]">
            <h3 className="text-xl font-bold text-navy">Consultation Queue</h3>
            <button onClick={load} className="text-sm font-medium text-brandOrange hover:text-orange-700 transition">
              Refresh Queue
            </button>
          </div>
          
          <div className="p-6">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandOrange"></div>
              </div>
            ) : queue.length === 0 ? (
              <div className="text-center py-16">
                <Stethoscope size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-navy">No pending consultations</h3>
                <p className="text-gray-500">The queue is completely clear right now.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-gray-500 text-sm border-b border-gray-100">
                      <th className="font-semibold p-4 pt-0">Date Submitted</th>
                      <th className="font-semibold p-4 pt-0">Consultation Type</th>
                      <th className="font-semibold p-4 pt-0">Status</th>
                      <th className="font-semibold p-4 pt-0 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {queue.map((c) => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="p-4">{new Date(c.created_at).toLocaleString()}</td>
                        <td className="p-4 font-medium text-navy">Vision AI Screening</td>
                        <td className="p-4">{statusBadge(c.status)}</td>
                        <td className="p-4 text-right">
                          <button
                            className="bg-brandOrange text-white px-5 py-2 rounded-xl font-medium hover:bg-orange-600 transition disabled:opacity-50 inline-flex items-center gap-2"
                            onClick={() => handleClaim(c.id)}
                            disabled={claimingId === c.id}
                          >
                            {claimingId === c.id ? "Claiming..." : "Review"}
                            {!claimingId && <ChevronRight size={16} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  return (
    <ProtectedRoute role="doctor">
      <DashboardContent />
    </ProtectedRoute>
  );
}
