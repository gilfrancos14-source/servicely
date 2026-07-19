const pricingPlans = [
  { name: "Basique", price: "0€", period: "/mois", popular: false,
    features: ["Accès aux services de base", "1 réservation par mois", "Support par email", "Profil utilisateur standard"] },
  { name: "Standard", price: "29€", period: "/mois", popular: true,
    features: ["Accès illimité aux services", "Réservations prioritaires", "Support client 24/7", "Assurance premium incluse", "Réductions exclusives"] },
  { name: "Premium", price: "59€", period: "/mois", popular: false,
    features: ["Tout le forfait Standard", "Conciergerie dédiée", "Interventions d'urgence", "Services personnalisés", "Accès aux événements VIP"] },
];

export function PricingSection() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low" id="pricing">
      <div className="max-w-container-max mx-auto reveal">
        <div className="text-center mb-stack-lg">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-stack-sm">Nos Tarifs</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Choisissez le forfait qui correspond le mieux à vos besoins pour profiter pleinement de nos services.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {pricingPlans.map((plan) => (
            <div key={plan.name} className={`bg-surface rounded-xl p-6 flex flex-col h-full shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ${plan.popular ? "border-2 border-secondary relative" : "border border-surface-variant"}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Populaire</div>
              )}
              <div className="mb-6">
                <h3 className="font-headline-md text-headline-md text-primary mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-headline-lg font-bold text-primary">{plan.price}</span>
                  <span className="text-on-surface-variant">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full font-button text-button rounded py-3 transition-all hover:scale-[1.02] active:scale-[0.98] ${plan.popular ? "bg-secondary text-on-secondary hover:bg-secondary/90 shadow-sm" : "text-secondary border-[1.5px] border-secondary hover:bg-secondary/10"}`}>
                {plan.popular ? "Choisir Standard" : plan.name === "Premium" ? "Choisir Premium" : "Commencer gratuitement"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
