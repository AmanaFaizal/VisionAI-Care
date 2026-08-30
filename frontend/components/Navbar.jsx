import { useRouter } from "next/router";
import Link from "next/link";
import { Stethoscope, History } from "lucide-react";
import { clearSession, getUser } from "../lib/api";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <div className="navbar" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 32px', background: 'white', borderBottom: '1px solid var(--border)' }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy)', fontWeight: 'bold', fontSize: '20px' }}>
        <Stethoscope color="#F97316" size={24} />
        VisionAI-Care
      </Link>
      
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        {user && user.role === 'patient' && (
          <Link href="/patient/history" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            History & Reports
          </Link>
        )}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 14 }}>
              {user.full_name} <span className="badge badge-muted">{user.role}</span>
            </span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
