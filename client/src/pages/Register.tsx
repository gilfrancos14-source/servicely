import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/hooks/useAuth";

function getDashboardPath(role?: string): string {
  switch (role) {
    case "PROVIDER": return "/provider";
    case "ADMIN": return "/admin";
    default: return "/dashboard";
  }
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, googleLogin, isLoading, error, resetError } = useAuth();
  const [role, setRole] = useState<"CLIENT" | "PROVIDER">("CLIENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const firstName = name.split(" ").slice(0, -1).join(" ") || name;
  const lastName = name.split(" ").pop() || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    const result = await register({ firstName, lastName, email, password, role });
    if (result.success) navigate(getDashboardPath(result.user?.role || role));
  };

  const onGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    const result = await googleLogin(credentialResponse.credential);
    if (result.success) navigate(getDashboardPath(result.user?.role));
  };

  return (
    <main className="flex flex-1 flex-col md:flex-row overflow-hidden bg-background text-on-surface font-body-md antialiased">
      {/* Left: Image branding */}
      <div className="hidden md:block w-1/2 relative bg-surface-container overflow-hidden">
        <img
          className="absolute inset-0 w-full h-full object-cover animate-slide-in-left"
          alt="Abstract digital artwork representing connection and efficiency"
          src="https://lh3.googleusercontent.com/aida/AP1WRLu1r_ShEpapkmp9-EeR_BhG07t67Jooo1QG_8bMtW7B1zDVctZWRhWV-hOyqv--8NFBSMyDujLNPXv61Ziw8KJu0NtxKC3IbtV8g7nK6IYY77fKmhlf6qCkVEV0SpqgUHLLa8wILImktnpTTIOwMhi_vNWtLE8VcdYtl5BYGB_ivsXbgWJJKIEEeUP61mat97PiOriNesEW_r2yK9Fx-k9Ww1AbPCbl4rCQEtjt6MsYOCuisQ8VSshCsng"
        />
        <div className="absolute inset-0 bg-primary/10" />
        <div className="absolute bottom-stack-lg left-stack-lg right-stack-lg text-on-primary animate-float">
          <div className="mb-stack-md">
            <span className="bg-secondary text-on-secondary px-3 py-1 rounded-full text-label-md font-semibold uppercase tracking-wider">Get Started</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg mb-stack-sm drop-shadow-md text-white">Rejoignez l'Excellence.</h2>
          <p className="font-body-lg text-body-lg text-white/90 drop-shadow-md">Simplifiez la réservation de services avec Servicely.</p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-stack-lg md:p-margin-desktop bg-surface-container-lowest animate-slide-in-right overflow-y-auto">
        <div className="w-full max-w-md flex flex-col justify-center">
          <div className="mb-stack-lg animate-fade-in-up stagger-1">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-stack-sm">Créer un compte</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Commencez votre expérience Servicely dès aujourd'hui.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-sm font-body-md animate-fade-in-up" onClick={resetError} role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-stack-md">
            {/* Role toggle */}
            <div className="animate-fade-in-up stagger-1.5 mb-stack-md">
              <label className="block font-label-md text-label-md uppercase text-on-surface-variant mb-stack-sm">Je suis un...</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container rounded-lg">
                <button
                  type="button"
                  onClick={() => setRole("CLIENT")}
                  className={`py-2 px-4 rounded-lg font-button text-button transition-all duration-300 ${
                    role === "CLIENT"
                      ? "bg-secondary text-on-secondary shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setRole("PROVIDER")}
                  className={`py-2 px-4 rounded-lg font-button text-button transition-all duration-300 ${
                    role === "PROVIDER"
                      ? "bg-secondary text-on-secondary shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  Prestataire
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="animate-fade-in-up stagger-2">
              <label className="block font-label-md text-label-md uppercase text-on-surface-variant mb-stack-sm" htmlFor="name">Nom Complet</label>
              <input
                className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/50 outline-none transition-all duration-300 font-body-md text-on-surface placeholder:text-outline-variant"
                id="name"
                name="name"
                placeholder="Jean Dupont"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="animate-fade-in-up stagger-3">
              <label className="block font-label-md text-label-md uppercase text-on-surface-variant mb-stack-sm" htmlFor="email">Adresse E-mail</label>
              <input
                className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/50 outline-none transition-all duration-300 font-body-md text-on-surface placeholder:text-outline-variant"
                id="email"
                name="email"
                placeholder="jean@exemple.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="animate-fade-in-up stagger-4">
              <label className="block font-label-md text-label-md uppercase text-on-surface-variant mb-stack-sm" htmlFor="password">Mot de passe</label>
              <div className="relative">
                <input
                  className="w-full h-12 pl-4 pr-12 rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/50 outline-none transition-all duration-300 font-body-md text-on-surface placeholder:text-outline-variant"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-secondary transition-colors focus:outline-none flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-container-low"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="animate-fade-in-up stagger-5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-secondary text-on-secondary rounded-lg font-button text-button hover:bg-on-secondary-container hover:scale-[1.02] transform transition-all duration-300 shadow-sm hover:shadow-[0px_10px_30px_rgba(15,23,42,0.12)] mt-stack-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Création en cours..." : "Créer un compte"}
              </button>
            </div>
          </form>

          {/* Social divider */}
          <div className="mt-stack-lg animate-fade-in-up stagger-6">
            <div className="relative flex items-center mb-stack-md">
              <div className="flex-grow border-t border-outline-variant" />
              <span className="flex-shrink-0 mx-4 text-on-surface-variant font-label-md text-label-md">Ou continuer avec</span>
              <div className="flex-grow border-t border-outline-variant" />
            </div>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={() => {}}
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
              />
            </div>

            <p className="text-center mt-stack-md font-body-md text-body-md text-on-surface-variant">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-secondary font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
