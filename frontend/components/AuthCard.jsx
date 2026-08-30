import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api, saveSession } from "../lib/api";

export default function AuthCard({ initialMode = "login" }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";
  const title = useMemo(() => {
    if (isRegister) return "Create your VisionAI-Care account";
    return "Sign in to VisionAI-Care";
  }, [isRegister]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        const payload = {
          full_name: fullName,
          email,
          password,
          role,
        };

        if (role === "patient" && age) payload.age = parseInt(age, 10);
        if (role === "doctor") {
          payload.specialization = specialization;
          payload.license_number = licenseNumber;
        }

        data = await api.register(payload);
      } else {
        data = await api.login(email, password, role);
      }

      saveSession(data.access_token, data.user);
      router.push(data.user.role === "doctor" ? "/doctor/dashboard" : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 460, marginTop: 40 }}>
      <div className="card">
        <div className="auth-switch">
          <button
            type="button"
            className={`auth-switch-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`auth-switch-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <h2 style={{ marginTop: 18 }}>{title}</h2>

        <form onSubmit={handleSubmit}>
          <label>Select role</label>
          <div className="role-switch" role="tablist" aria-label="Select account role">
            <button
              type="button"
              className={`role-switch-btn ${role === "patient" ? "active" : ""}`}
              onClick={() => setRole("patient")}
            >
              Patient
            </button>
            <button
              type="button"
              className={`role-switch-btn ${role === "doctor" ? "active" : ""}`}
              onClick={() => setRole("doctor")}
            >
              Doctor
            </button>
          </div>

          {isRegister && (
            <>
              <label>Full name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </>
          )}

          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={isRegister ? 8 : undefined}
            required
          />

          {isRegister && role === "patient" && (
            <>
              <label>Age</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
            </>
          )}

          {isRegister && role === "doctor" && (
            <>
              <label>Specialization</label>
              <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
              <label>License number</label>
              <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
            </>
          )}

          {error && <p className="error-text">{error}</p>}

          <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading
              ? isRegister
                ? "Creating account..."
                : "Signing in..."
              : isRegister
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 14 }}>
          {isRegister ? (
            <>
              Already have an account? <Link href="/login">Sign in</Link>
            </>
          ) : (
            <>
              No account? <Link href="/register">Create one</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}