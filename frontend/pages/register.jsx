import AuthCard from "../components/AuthCard";
import LandingNavbar from "../components/LandingNavbar";

export default function Register() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />
      <div className="py-20">
        <AuthCard initialMode="register" />
      </div>
    </div>
  );
}
