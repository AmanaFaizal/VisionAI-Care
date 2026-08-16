import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api, saveSession } from "../lib/api";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "patient",
    age: "",
    specialization: "",
    license_number: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      if (form.role === "patient" && form.age) payload.age = parseInt(form.age, 10);
      if (form.role === "doctor") {
        payload.specialization = form.specialization;
        payload.license_number = form.license_number;
      }
      const data = await api.register(payload);
      saveSession(data.access_token, data.user);
      router.push(data.user.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 460, marginTop: 40 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Create your VisionAI-Care account</h2>
        <form onSubmit={handleSubmit}>
          <label>I am a</label>
          <select value={form.role} onChange={(e) => update("role", e.target.value)}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>

          <label>Full name</label>
          <input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required />

          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            minLength={8}
            required
          />

          {form.role === "patient" && (
            <>
              <label>Age</label>
              <input type="number" value={form.age} onChange={(e) => update("age", e.target.value)} />
            </>
          )}

          {form.role === "doctor" && (
            <>
              <label>Specialization</label>
              <input
                value={form.specialization}
                onChange={(e) => update("specialization", e.target.value)}
              />
              <label>License number</label>
              <input
                value={form.license_number}
                onChange={(e) => update("license_number", e.target.value)}
              />
            </>
          )}

          {error && <p className="error-text">{error}</p>}
          <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 14 }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
