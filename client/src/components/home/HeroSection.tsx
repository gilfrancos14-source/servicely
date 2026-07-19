import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (searchLocation.trim()) params.set("location", searchLocation.trim());
    navigate(`/services${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleExampleSearch = (query: string) => {
    navigate(`/services?search=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative bg-surface-container-low pt-section-gap pb-section-gap px-margin-mobile md:px-margin-desktop overflow-hidden flex items-center min-h-[819px]">
      <div className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #89f5e7 0%, transparent 60%)" }} />
      <div className="max-w-container-max mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-gutter relative z-10 items-center reveal">
        <div className="col-span-1 md:col-span-12 lg:col-span-8 flex flex-col justify-center mb-stack-lg md:mb-0">
          <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary mb-stack-md tracking-tight">
            Simplifiez votre quotidien,<br />
            <span className="text-secondary inline-block animate-float">réservez vos services</span> en un clic.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg max-w-2xl">
            Des experts qualifiés pour tous vos besoins. Ménage, bricolage, tutorat ou jardinage : trouvez le professionnel idéal en quelques secondes avec une tarification transparente.
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-stack-md mb-stack-lg">
            Notre plateforme utilise des algorithmes de mise en relation intelligents pour vous garantir une sécurité maximale et une expérience fluide. Chaque intervention est couverte par notre assurance partenaire.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-stack-md">
            {[
              { icon: "verified_user", title: "Fiabilité", desc: "Professionnels vérifiés." },
              { icon: "star", title: "Qualité", desc: "Service d'excellence." },
              { icon: "bolt", title: "Simplicité", desc: "Réservation en 2 min." },
            ].map((item, i) => (
              <div key={item.title} className="flex flex-col items-start gap-2 hover:-translate-y-1 transition-transform duration-300" style={{ transitionDelay: `${i * 100}ms` }}>
                <span className="material-symbols-outlined text-secondary">{item.icon}</span>
                <h4 className="font-label-md text-label-md font-bold text-primary">{item.title}</h4>
                <p className="text-xs text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSearch} className="bg-surface rounded-xl shadow-[0px_10px_30px_rgba(15,23,42,0.08)] p-2 flex flex-col md:flex-row items-center gap-2 max-w-4xl border border-surface-variant mt-8 hover:shadow-lg transition-shadow duration-300">
            <div className="flex-grow w-full md:w-auto relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:ring-0 font-body-md text-on-surface placeholder:text-outline-variant rounded-lg transition-colors"
                placeholder="Quel service recherchez-vous ?"
                type="text"
              />
            </div>
            <div className="hidden md:block w-px h-8 bg-surface-variant" />
            <div className="flex-grow w-full md:w-auto relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">location_on</span>
              <input
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:ring-0 font-body-md text-on-surface placeholder:text-outline-variant rounded-lg transition-colors"
                placeholder="Code postal ou ville"
                type="text"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto font-button text-button bg-secondary text-on-secondary px-6 py-3 rounded-lg hover:bg-secondary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center justify-center whitespace-nowrap"
            >
              Rechercher
            </button>
          </form>

          <div className="mt-stack-md flex items-center gap-4 text-on-surface-variant font-label-md text-label-md">
            <span>Exemples :</span>
            {["Plomberie", "Ménage à domicile"].map((item) => (
              <button key={item} onClick={() => handleExampleSearch(item)} className="hover:text-secondary border-b border-transparent hover:border-secondary transition-colors cursor-pointer bg-transparent p-0 font-label-md text-label-md text-on-surface-variant">
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
