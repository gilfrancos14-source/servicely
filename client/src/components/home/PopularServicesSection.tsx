const popularServices = [
  { tag: "Ménage", title: "Entretien du domicile", desc: "Nettoyage régulier ou ponctuel par des professionnels certifiés.", price: "25€/h", image: "/images/service-cleaning.jpg" },
  { tag: "Bricolage", title: "Petits travaux", desc: "Montage de meubles, fixations et réparations mineures.", price: "35€/h", image: "/images/service-diy.jpg" },
  { tag: "Soutien", title: "Tutorat scolaire", desc: "Accompagnement personnalisé pour tous les niveaux.", price: "20€/h", image: "/images/service-tutoring.jpg" },
  { tag: "Extérieur", title: "Jardinage", desc: "Tonte de pelouse, taille de haies et entretien paysager.", price: "30€/h", image: "/images/service-gardening.jpg" },
];

export function PopularServicesSection() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface">
      <div className="max-w-container-max mx-auto reveal">
        <div className="text-center mb-stack-lg">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-stack-sm">Services Populaires</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Découvrez les services les plus demandés par notre communauté pour simplifier votre organisation.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {popularServices.map((s) => (
            <div key={s.title} className="group bg-surface rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.05)] hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-surface-variant overflow-hidden flex flex-col h-full cursor-pointer relative">
              <div className="h-48 w-full bg-surface-container-low overflow-hidden relative">
                <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${s.image})` }} />
                <div className="absolute top-4 left-4 bg-tertiary-container text-on-tertiary-container font-label-md text-label-md uppercase px-3 py-1 rounded-full text-xs">{s.tag}</div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-headline-md text-[20px] font-semibold text-primary mb-2">{s.title}</h3>
                <p className="font-body-md text-sm text-on-surface-variant mb-4 flex-grow">{s.desc}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-label-md text-label-md text-on-surface-variant">À partir de</span>
                  <span className="font-headline-md text-headline-md text-secondary">{s.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-stack-lg text-center">
          <button className="font-button text-button text-secondary border-[1.5px] border-secondary rounded hover:bg-secondary/10 px-6 py-3 transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center">
            Voir tous les services <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  );
}
