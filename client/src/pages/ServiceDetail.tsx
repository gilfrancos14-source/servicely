import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { getService } from "@/services/bookingService";
import { getServiceReviews, type ReviewWithClient } from "@/services/reviewService";

const inclusionsByCat: Record<string, { title: string; desc: string }[]> = {
  menage: [
    { title: "Nettoyage en profondeur", desc: "Sols, surfaces et recoins difficiles d'accès." },
    { title: "Désinfection sanitaire", desc: "Usage de produits certifiés anti-bactériens." },
    { title: "Nettoyage des vitres", desc: "Intérieur et extérieur (hauteur accessible)." },
    { title: "Dépoussiérage expert", desc: "Objets de valeur, étagères et cadres." },
  ],
  jardinage: [
    { title: "Tonte et finition", desc: "Pelouse tondue avec bordures parfaites." },
    { title: "Taille des haies", desc: "Haies et arbustes taillés avec précision." },
    { title: "Désherbage complet", desc: "Massifs et allées sans mauvaises herbes." },
    { title: "Nettoyage du terrain", desc: "Feuilles mortes et débris évacués." },
  ],
  electricien: [
    { title: "Diagnostic précis", desc: "Recherche de panne et analyse complète." },
    { title: "Réparation sécurisée", desc: "Intervention aux normes NFC 15-100." },
    { title: "Conformité garantie", desc: "Certification et garantie de 2 ans." },
    { title: "Conseil personnalisé", desc: "Recommandations pour votre installation." },
  ],
  plombier: [
    { title: "Dépannage rapide", desc: "Intervention sous 2h en zone couverte." },
    { title: "Diagnostic gratuit", desc: "Devis et inspection sans engagement." },
    { title: "Pièces d'origine", desc: "Équipement professionnel certifié." },
    { title: "Garantie service", desc: "1 an sur toutes les réparations." },
  ],
};

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: () => getService(id!),
    enabled: !!id,
  });

  const { data: reviews } = useQuery<ReviewWithClient[]>({
    queryKey: ["reviews", id],
    queryFn: () => getServiceReviews(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-margin-mobile">
        <span className="material-symbols-outlined text-6xl text-outline-variant">search_off</span>
        <h1 className="font-headline-lg text-headline-lg text-primary">Service introuvable</h1>
        <p className="text-on-surface-variant">Ce service n'existe pas ou a été désactivé.</p>
        <Link to="/services">
          <button className="font-button text-button text-on-secondary bg-secondary px-6 py-3 rounded-lg hover:opacity-90 active:scale-95 transition-premium mt-4">
            Retour aux services
          </button>
        </Link>
      </div>
    );
  }

  const provider = service.provider ?? null;
  const catSlug = service.category?.slug || "menage";
  const inclusions = inclusionsByCat[catSlug] || inclusionsByCat.menage;
  const pricePerUnit = `${Number(service.price).toFixed(0)}€`;
  const unit = service.unit || "h";

  return (
    <main className="pb-section-gap overflow-x-hidden">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <nav className="flex items-center gap-2 mb-stack-lg  pt-8">
          <Link className="text-outline text-label-md font-label-md hover:text-secondary transition-premium" to="/">Accueil</Link>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <Link className="text-outline text-label-md font-label-md hover:text-secondary transition-premium" to="/services">Services</Link>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="text-on-surface-variant text-label-md font-label-md">{service.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8 space-y-stack-lg">
            <div className="rounded-xl overflow-hidden shadow-sm  group">
              {service.imageUrl ? (
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-[300px] md:h-[500px] object-cover transition-premium duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-[300px] md:h-[500px] flex items-center justify-center bg-surface-container-high">
                  <span className="material-symbols-outlined text-8xl text-outline-variant">image</span>
                </div>
              )}
            </div>

            <section className="">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-md font-label-md mb-stack-sm inline-block transition-premium hover:opacity-80 cursor-default">
                {service.category?.name || "Service"}
              </span>
              <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl mb-stack-sm">{service.name}</h1>
              <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                {service.description}
              </p>
            </section>

            <section className=" space-y-stack-md">
              <h2 className="font-headline-md text-headline-md">Ce qui est inclus</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                {inclusions.map((inc) => (
                  <div key={inc.title} className="flex items-start gap-3 p-4 rounded-lg hover:bg-surface-container transition-premium cursor-default group">
                    <span className="material-symbols-outlined text-secondary transition-premium group-hover:scale-110">check_circle</span>
                    <div>
                      <h4 className="font-bold">{inc.title}</h4>
                      <p className="text-on-surface-variant text-label-md">{inc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>


          </div>

          <aside className="lg:col-span-4 space-y-stack-lg">
            <div className="sticky top-28 space-y-stack-md">
              <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant shadow-sm hover-lift ">
                <div className="flex items-baseline gap-2 mb-stack-md">
                  <span className="font-headline-md text-headline-md text-secondary">À partir de {pricePerUnit}</span>
                  <span className="text-on-surface-variant font-label-md">/ {unit}</span>
                </div>
                <p className="text-label-md text-on-surface-variant mb-stack-lg">
                  Réservez en moins de 2 minutes. Annulation gratuite jusqu'à 24h avant.
                </p>
                <Link
                  to={`/services/${service.id}/book`}
                  className="block w-full bg-secondary text-on-secondary font-button text-button text-center py-4 rounded-lg hover:opacity-90 active:scale-95 transition-premium mb-stack-md shadow-md"
                >
                  Réserver maintenant
                </Link>
                <div className="flex items-center justify-center gap-4 text-outline">
                  <div className="flex items-center gap-1 group cursor-default">
                    <span className="material-symbols-outlined text-[18px] transition-premium group-hover:text-secondary">verified_user</span>
                    <span className="text-[12px] font-label-md group-hover:text-on-surface transition-premium">Assuré</span>
                  </div>
                  <div className="flex items-center gap-1 group cursor-default">
                    <span className="material-symbols-outlined text-[18px] transition-premium group-hover:text-secondary">lock</span>
                    <span className="text-[12px] font-label-md group-hover:text-on-surface transition-premium">Paiement Sécurisé</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant hover-lift ">
                <h3 className="font-label-md font-bold mb-stack-md uppercase tracking-wider text-on-surface-variant">Prestataire Recommandé</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative group">
                    {provider?.user?.avatar ? (
                      <img className="w-16 h-16 rounded-full object-cover transition-premium group-hover:scale-105" src={provider?.user?.avatar ?? ""} alt="" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-headline-md font-bold text-on-surface-variant">
                        {provider?.user?.firstName?.charAt(0) ?? ""}{provider?.user?.lastName?.charAt(0) ?? ""}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-secondary text-white rounded-full p-1 border-2 border-white pulse-effect">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-headline-md leading-none mb-1">{provider?.user?.firstName ?? ""} {provider?.user?.lastName ?? ""}</h4>
                    <div className="flex items-center gap-1 cursor-default">
                      <span className="material-symbols-outlined text-secondary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-bold text-label-md">{provider?.rating?.toFixed(1) ?? "0.0"}</span>
                      <span className="text-on-surface-variant text-[12px]">({provider?.reviewCount ?? 0} avis)</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mb-stack-md">
                  {provider.address && (
                    <div className="flex items-center gap-2 text-on-surface-variant group">
                      <span className="material-symbols-outlined text-[18px] transition-premium group-hover:translate-x-1">location_on</span>
                      <span className="text-label-md">{provider.address}</span>
                    </div>
                  )}
                  {provider.title && (
                    <div className="flex items-center gap-2 text-on-surface-variant group">
                      <span className="material-symbols-outlined text-[18px] transition-premium group-hover:translate-x-1">badge</span>
                      <span className="text-label-md">{provider.title}</span>
                    </div>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full text-[12px] font-bold shadow-sm">
                  PRO VÉRIFIÉ
                </span>
              </div>
            </div>
          </aside>
        </div>

        {reviews && reviews.length > 0 && (
        <section className="mt-section-gap space-y-stack-lg ">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-headline-lg text-headline-lg mb-stack-sm">Ce que disent nos clients</h2>
            <p className="text-on-surface-variant">La confiance est au cœur de notre service. Découvrez l'expérience de ceux qui nous font confiance au quotidien.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm hover:shadow-xl transition-premium hover-lift">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className="material-symbols-outlined text-secondary text-[16px]"
                      style={{ fontVariationSettings: `'FILL' ${star <= review.rating ? 1 : 0}` }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="italic text-body-lg font-body-lg text-on-surface mb-6 leading-relaxed">
                  &ldquo;{review.comment || "Avis laissé par un client satisfait."}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  {review.client?.avatar ? (
                    <img src={review.client.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center font-bold text-label-md text-on-surface-variant">
                      {review.client?.firstName?.charAt(0) ?? ""}{review.client?.lastName?.charAt(0) ?? ""}
                    </div>
                  )}
                  <div>
                    <h5 className="font-bold text-label-md">{review.client?.firstName ?? ""} {(review.client?.lastName?.charAt(0) ?? "")}.</h5>
                    <p className="text-on-surface-variant text-[12px]">Client vérifié</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}
      </div>
    </main>
  );
}
