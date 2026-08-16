import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getUser } from "../lib/api";

export default function ProtectedRoute({ role, children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    if (role && user.role !== role) {
      router.replace(user.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
      return;
    }
    setReady(true);
  }, [router, role]);

  if (!ready) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  return children;
}
