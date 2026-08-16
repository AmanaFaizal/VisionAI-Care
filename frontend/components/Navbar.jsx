import { useRouter } from "next/router";
import { clearSession, getUser } from "../lib/api";

export default function Navbar() {
  const router = useRouter();
  const user = getUser();

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <div className="navbar">
      <span className="brand">VisionAI-Care</span>
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
  );
}
