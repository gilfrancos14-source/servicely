export function AboutSection() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low">
      <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-gutter items-center reveal">
        <div className="flex flex-col justify-center">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-stack-md">À propos</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Simplifier votre quotidien en vous connectant aux meilleurs professionnels locaux. Confiance, qualité et transparence sont au cœur de notre service.
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-stack-md mb-stack-lg">
            Notre plateforme utilise des algorithmes de mise en relation intelligents pour vous garantir une sécurité maximale et une expérience fluide. Chaque intervention est couverte par notre assurance partenaire.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-stack-md">
            {[
              { icon: "verified_user", title: "Fiabilité", desc: "Professionnels vérifiés." },
              { icon: "star", title: "Qualité", desc: "Service d'excellence." },
              { icon: "bolt", title: "Simplicité", desc: "Réservation en 2 min." },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-start gap-2">
                <span className="material-symbols-outlined text-secondary">{item.icon}</span>
                <h4 className="font-label-md text-label-md font-bold text-primary">{item.title}</h4>
                <p className="text-xs text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full">
          <img
            alt="Professionals working together"
            className="w-full h-[400px] object-cover rounded-xl shadow-[0px_10px_30px_rgba(15,23,42,0.08)] animate-float"
            src="/images/hero.jpg"
          />
        </div>
      </div>
    </section>
  );
}
