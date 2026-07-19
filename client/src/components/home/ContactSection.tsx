export function ContactSection() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-lowest border-t border-surface-variant reveal" id="contact">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-stack-lg">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-stack-sm">Contactez-nous</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Une question ? Un besoin spécifique ? Notre équipe est à votre disposition.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter bg-surface rounded-xl border border-surface-variant shadow-sm overflow-hidden">
          <div className="p-8 md:p-12 bg-surface-container-low flex flex-col justify-center">
            <h3 className="font-headline-md text-headline-md text-primary mb-6">Informations de contact</h3>
            <div className="space-y-6">
              {[
                { icon: "mail", label: "Email", value: "support@servicely.fr" },
                { icon: "call", label: "Téléphone", value: "+33 1 23 45 67 89" },
                { icon: "location_on", label: "Adresse", value: "123 Avenue des Services\n75000 Paris, France" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-secondary mt-1">{item.icon}</span>
                  <div>
                    <h4 className="font-label-md text-label-md font-bold text-primary">{item.label}</h4>
                    <p className="font-body-md text-on-surface-variant whitespace-pre-line">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-8 md:p-12">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-md text-label-md text-primary mb-2" htmlFor="nom">Nom</label>
                  <input className="w-full px-4 py-3 rounded-lg border border-surface-variant bg-surface focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-shadow duration-300 font-body-md text-on-surface placeholder:text-outline-variant hover:shadow-md" id="nom" placeholder="Votre nom" type="text" />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-primary mb-2" htmlFor="email-contact">Email</label>
                  <input className="w-full px-4 py-3 rounded-lg border border-surface-variant bg-surface focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-shadow duration-300 font-body-md text-on-surface placeholder:text-outline-variant hover:shadow-md" id="email-contact" placeholder="votre@email.com" type="email" />
                </div>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-primary mb-2" htmlFor="sujet">Sujet</label>
                <input className="w-full px-4 py-3 rounded-lg border border-surface-variant bg-surface focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-shadow duration-300 font-body-md text-on-surface placeholder:text-outline-variant hover:shadow-md" id="sujet" placeholder="Comment pouvons-nous vous aider ?" type="text" />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-primary mb-2" htmlFor="message">Message</label>
                <textarea className="w-full px-4 py-3 rounded-lg border border-surface-variant bg-surface focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-shadow duration-300 font-body-md text-on-surface placeholder:text-outline-variant min-h-[120px] resize-y hover:shadow-md" id="message" placeholder="Votre message..." />
              </div>
              <button className="w-full font-button text-button bg-secondary text-on-secondary py-3 rounded-lg hover:bg-secondary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm" type="button">Envoyer</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
