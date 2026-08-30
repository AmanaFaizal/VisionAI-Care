import AuthCard from "../components/AuthCard";
import LandingNavbar from "../components/LandingNavbar";

export default function Login() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />
      <div className="py-20">
        <AuthCard initialMode="login" />
      </div>
    </div>
  );
}
