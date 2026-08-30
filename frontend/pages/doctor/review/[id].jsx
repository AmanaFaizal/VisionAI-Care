import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DoctorHeader from "../../../components/DoctorHeader";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { api } from "../../../lib/api";
import { ArrowLeft, User, Activity, AlertCircle, FileText, CheckCircle } from "lucide-react";

function ReviewContent() {
  const router = useRouter();
  const { id } = router.query;
  const [detail, setDetail] = useState(null);
  const [notes, setNotes] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .consultationDetail(id)
      .then((d) => {
        setDetail(d);
        setNotes(d.consultation.doctor_notes || "");
        setRecommendation(d.consultation.recommendation || "");
        if (d.consultation.status === 'reviewed' || d.consultation.status === 'Complete') {
          setDone(true);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.reviewConsultation(id, { doctor_notes: notes, recommendation });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf8f2]">
        <DoctorHeader />
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandOrange"></div>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-[#fcf8f2]">
        <DoctorHeader />
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-center gap-4">
             <AlertCircle size={24} />
             <p className="font-medium">{error || "Consultation not found."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f2]">
      <DoctorHeader />
      
      <div className="max-w-7xl mx-auto px-8 py-10">
        <button 
          onClick={() => router.push("/doctor/dashboard")}
          className="flex items-center gap-2 text-gray-500 hover:text-brandOrange font-medium mb-6 transition"
        >
          <ArrowLeft size={18} /> Back to Queue
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* LEFT COLUMN: PATIENT DATA */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-navy">Patient Profile</h2>
            
            <div className="bg-white rounded-2xl border border-[#e8dfce] p-6 shadow-sm flex items-center gap-6">
              <div className="bg-orange-50 text-brandOrange p-5 rounded-full">
                <User size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy">{detail.patient?.full_name}</h3>
                <p className="text-gray-500">
                  {detail.patient?.age ? `Age ${detail.patient.age} • ` : ""}
                  {detail.patient?.email}
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-navy pt-4">Screening Results</h2>
            
            <div className="bg-white rounded-2xl border border-[#e8dfce] overflow-hidden shadow-sm">
              <div className="bg-[#f9f4ec] p-4 border-b border-[#e8dfce] flex justify-between items-center">
                <h4 className="font-bold text-navy flex items-center gap-2">
                  <Activity size={18} className="text-brandOrange" /> Session Reliability
                </h4>
              </div>
              <div className="p-6 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Score</p>
                  <p className="text-xl font-bold text-navy">{detail.session?.reliability_score ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Est. Distance</p>
                  <p className="text-xl font-bold text-navy">{detail.session?.test_distance_cm ?? "N/A"} cm</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Status</p>
                  <p className="text-xl font-bold capitalize text-navy">{detail.session?.status}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {detail.results.map((r) => (
                <div key={r.eye} className="bg-white rounded-2xl border border-[#e8dfce] shadow-sm p-6 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${r.eye === 'left' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                  <h4 className="text-lg font-bold text-navy capitalize mb-4">{r.eye} Eye Acuity</h4>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-bold text-navy">{r.acuity_score || "N/A"}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{r.correct_responses}/{r.total_responses} correct responses</p>
                  
                  {r.preliminary_flag && (
                    <div className="bg-orange-50 text-orange-700 text-sm p-3 rounded-xl border border-orange-100 flex gap-2">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{r.preliminary_flag}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: CLINICAL INPUT */}
          <div>
            <div className="bg-white rounded-2xl border border-[#e8dfce] shadow-sm p-8 sticky top-8">
              <h3 className="text-2xl font-bold text-navy flex items-center gap-2 mb-6">
                <FileText size={24} className="text-brandOrange" /> Clinical Review
              </h3>
              
              {done ? (
                <div className="text-center py-12">
                  <div className="bg-green-50 text-green-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-navy mb-2">Review Submitted</h3>
                  <p className="text-gray-500 mb-8">Your clinical notes and recommendations have been sent to the patient.</p>
                  <button 
                    className="bg-brandOrange text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition w-full"
                    onClick={() => router.push("/doctor/dashboard")}
                  >
                    Back to Queue
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-navy mb-2">Clinical Notes (Internal)</label>
                    <textarea 
                      rows={4} 
                      className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brandOrange focus:border-brandOrange outline-none transition resize-none"
                      value={notes} 
                      placeholder="Enter internal clinical observations..."
                      onChange={(e) => setNotes(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-navy mb-2">Recommendation for Patient</label>
                    <textarea
                      rows={4}
                      className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brandOrange focus:border-brandOrange outline-none transition resize-none"
                      value={recommendation}
                      placeholder="What should the patient do next?"
                      onChange={(e) => setRecommendation(e.target.value)}
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-start gap-2">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  <button 
                    className="bg-brandOrange text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition w-full shadow-md disabled:opacity-50 mt-4" 
                    type="submit" 
                    disabled={saving}
                  >
                    {saving ? "Submitting..." : "Submit Official Review"}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function DoctorReview() {
  return (
    <ProtectedRoute role="doctor">
      <ReviewContent />
    </ProtectedRoute>
  );
}
