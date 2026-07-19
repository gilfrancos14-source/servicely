import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/hooks/useAuth";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function getDashboardPath(role?: string): string {
  switch (role) {
    case "PROVIDER": return "/provider";
    case "ADMIN": return "/admin";
    default: return "/dashboard";
  }
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, googleLogin, isLoading, error, resetError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    const result = await login(email, password);
    if (result.success) navigate(getDashboardPath(result.user?.role));
  };

  const onGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    const result = await googleLogin(credentialResponse.credential);
    if (result.success) navigate(getDashboardPath(result.user?.role));
  };

  return (
    <main className="split-layout w-full h-full bg-background text-on-surface antialiased">
      {/* Left Panel: Immersive Image */}
      <section className="panel-left">
        <div className="absolute inset-0 z-0">
          <img
            alt=""
            className="object-cover w-full h-full"
            src="https://img.freepik.com/free-photo/group-people-working-together_23-2149235225.jpg"
          />
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-end h-full p-margin-desktop text-on-primary">
          <div className="mb-auto mt-margin-desktop">
            <span className="font-headline-md text-headline-md text-on-primary">Servicely</span>
          </div>
          <div className="max-w-md floating-text">
            <h1 className="font-headline-xl text-headline-xl mb-stack-md">Bon retour parmi nous</h1>
            <p className="font-body-lg text-body-lg opacity-90">Gérez vos rendez-vous et retrouvez vos prestataires favoris en un instant.</p>
          </div>
        </div>
      </section>

      {/* Right Panel: Login Form */}
      <section className="panel-right px-margin-mobile md:px-margin-desktop">
        <div className="w-full max-w-md">
          <div className="mb-section-gap md:hidden">
            <span className="font-headline-md text-headline-md text-primary font-bold">Servicely</span>
          </div>

          <div className="mb-stack-lg fade-in-up">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-stack-sm">Connexion</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Heureux de vous revoir ! Veuillez entrer vos informations.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-sm font-body-md fade-in-up" onClick={resetError} role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-stack-md">
            <div className="fade-in-up delay-100">
              <label className="block font-label-md text-label-md text-on-surface mb-2 uppercase" htmlFor="email">E-mail</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-4 focus:ring-secondary/20 focus:outline-none transition-all duration-300 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50"
                id="email"
                name="email"
                placeholder="exemple@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="fade-in-up delay-200">
              <div className="flex justify-between items-center mb-2">
                <label className="block font-label-md text-label-md text-on-surface uppercase" htmlFor="password">Mot de passe</label>
                <Link to="/forgot-password" className="font-label-md text-label-md text-secondary hover:text-secondary-fixed-dim transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:border-secondary focus:ring-4 focus:ring-secondary/20 focus:outline-none transition-all duration-300 font-body-md text-body-md text-on-surface pr-12"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined">{showPassword ? "visibility" : "visibility_off"}</span>
                </button>
              </div>
            </div>

            <div className="pt-stack-sm fade-in-up delay-300">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#0D9488] text-white rounded-lg font-button text-button hover:bg-[#0b7c72] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-secondary/30 transform hover:-translate-y-1 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </button>
            </div>
          </form>

          <div className="mt-stack-lg fade-in-up delay-400">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md">Ou</span>
              </div>
            </div>

            {GOOGLE_CLIENT_ID && (
              <div className="mt-stack-lg fade-in-up delay-500 flex justify-center">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={() => {}}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>
            )}
          </div>

          <div className="mt-stack-lg text-center fade-in-up delay-600">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Pas encore de compte ?{" "}
              <Link to="/register" className="text-secondary hover:text-secondary-fixed-dim font-medium transition-colors">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
