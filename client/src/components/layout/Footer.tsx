import { Link } from "react-router-dom";

const linkGroups = [
  {
    title: "Produit",
    links: ["Services", "Tarifs", "Avis"],
  },
  {
    title: "Société",
    links: ["À propos", "Carrières", "Blog"],
  },
  {
    title: "Support",
    links: ["Aide", "Contact", "FAQ"],
  },
  {
    title: "Légal",
    links: ["Confidentialité", "Conditions", "Cookies"],
  },
];

export function Footer() {
  return (
    <footer className="bg-surface-container-lowest w-full py-stack-lg border-t border-surface-variant">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-section-gap">
          <div className="md:col-span-5 flex flex-col gap-stack-md">
            <div>
              <Link to="/" className="font-headline-md text-headline-md font-bold text-primary mb-4 inline-block">
                Servicely
              </Link>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
                Simplifiez votre quotidien en vous connectant aux meilleurs professionnels locaux.
                Confiance et qualité à chaque service.
              </p>
            </div>
            <div className="mt-stack-md">
              <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider mb-4">
                Restez informé
              </h4>
              <div className="flex gap-2 max-w-sm">
                <input
                  className="flex-grow px-4 py-2 rounded-lg border border-surface-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary outline-none transition-shadow duration-300 font-body-md hover:shadow-md"
                  placeholder="Votre email"
                  type="email"
                />
                <button className="bg-secondary text-on-secondary px-4 py-2 rounded-lg font-button hover:bg-secondary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm">
                  S'abonner
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-gutter">
            {linkGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-4">
                <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider">
                  {group.title}
                </h4>
                <nav className="flex flex-col gap-2">
                  {group.links.map((link) => (
                    <a
                      key={link}
                      href="#"
                      className="text-on-surface-variant hover:text-secondary transition-colors font-body-md"
                    >
                      {link}
                    </a>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-stack-lg border-t border-surface-variant flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body-md text-body-md text-on-surface-variant text-sm">
            &copy; 2024 Servicely Inc. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-on-surface-variant hover:text-secondary transition-all hover:scale-110" aria-label="Facebook">
              <span className="material-symbols-outlined">facebook</span>
            </a>
            <a href="#" className="text-on-surface-variant hover:text-secondary transition-all hover:scale-110" aria-label="Share">
              <span className="material-symbols-outlined">share</span>
            </a>
            <a href="#" className="text-on-surface-variant hover:text-secondary transition-all hover:scale-110" aria-label="Instagram">
              <span className="material-symbols-outlined">photo_camera</span>
            </a>
            <a href="#" className="text-on-surface-variant hover:text-secondary transition-all hover:scale-110" aria-label="LinkedIn">
              <span className="material-symbols-outlined">work</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
