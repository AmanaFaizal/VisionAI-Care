import { useEffect } from "react";
import { useRouter } from "next/router";
import { getUser } from "../lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
    } else if (user.role === "doctor") {
      router.replace("/doctor/dashboard");
    } else {
      router.replace("/patient/dashboard");
    }
  }, [router]);

  return (
    <div className="container">
      <p>Loading VisionAI-Care...</p>
    </div>
  );
}
