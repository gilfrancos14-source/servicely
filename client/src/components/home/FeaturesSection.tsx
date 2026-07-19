const features = [
  { icon: "verified_user", title: "Professionnels Vérifiés", desc: "Des experts rigoureusement sélectionnés pour votre sécurité." },
  { icon: "lock", title: "Paiement Sécurisé", desc: "Transactions transparentes et protégées." },
  { icon: "bolt", title: "Réservation Instantanée", desc: "Réservez votre service en quelques secondes." },
  { icon: "support_agent", title: "Support 24/7", desc: "Une équipe dédiée pour vous accompagner à tout moment." },
];

export function FeaturesSection() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
      <div className="max-w-container-max mx-auto reveal">
        <div className="text-center mb-stack-lg">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-stack-sm">Nos points forts</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Pourquoi choisir Servicely pour vos besoins quotidiens ?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center p-6 bg-surface rounded-xl border border-surface-variant shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-secondary">{feature.icon}</span>
              </div>
              <h3 className="font-headline-md text-[20px] font-semibold text-primary mb-2">{feature.title}</h3>
              <p className="font-body-md text-sm text-on-surface-variant">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
