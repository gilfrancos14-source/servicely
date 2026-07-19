const testimonials = [
  {
    name: "Thomas B.",
    location: "Paris",
    content: "Service incroyable ! J'ai trouvé un plombier en moins de 10 minutes pour une urgence. Le professionnel était ponctuel et très compétent.",
    avatar: "/images/avatar-1.jpg",
  },
  {
    name: "Sophie M.",
    location: "Lyon",
    content: "Le service de ménage à domicile a changé mon quotidien. La plateforme est super facile à utiliser et les intervenants sont toujours fiables.",
    avatar: "/images/avatar-2.jpg",
  },
  {
    name: "Julien L.",
    location: "Bordeaux",
    content: "Excellent pour trouver un professeur de soutien scolaire pour ma fille. La qualité de l'enseignement est au rendez-vous. Je recommande vivement !",
    avatar: "/images/avatar-3.jpg",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low">
      <div className="max-w-container-max mx-auto reveal">
        <div className="text-center mb-stack-lg">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-stack-sm">La parole à nos utilisateurs</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Découvrez ce que nos clients disent de leur expérience avec Servicely.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-surface p-6 rounded-xl border border-surface-variant shadow-sm flex flex-col h-full hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-center mb-4 text-secondary">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="font-body-md text-on-surface-variant italic mb-6 flex-grow">&ldquo;{t.content}&rdquo;</p>
              <div className="flex items-center gap-4 mt-auto">
                <img alt={`Avatar ${t.name}`} className="w-12 h-12 rounded-full object-cover" src={t.avatar} />
                <div>
                  <h4 className="font-label-md text-label-md font-bold text-primary">{t.name}</h4>
                  <p className="text-xs text-on-surface-variant">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
