import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const testimonials = [
  {
    name: "Thomas B.",
    location: "Paris",
    content: "Service incroyable ! J'ai trouvé un plombier en moins de 10 minutes pour une urgence. Le professionnel était ponctuel et très compétent.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUfs7lJYzID6tenJazyLQdstVCcDByZg4x5Hq2EDcreFsqRTCvlsVqQasUiOVyIhf7MhYGxhTIOyegEccBm0DJfHsKWukbbGsqtGFHoxCDeB_T90VkmqDBRUpx_wCfGndIOsS2Rju3nPKsoGY_hXT4dDdqVe5_mAJnpOoUaLMy62M-Jp0luhuEnp0Sy6jNYGJNOXh_mgnEST5KOf6etQsRN7-3bhLwpIZOlCUfTF_akv2LAe0_yn9SLB0mdazRqTcHwFp5q-comOA",
  },
  {
    name: "Sophie M.",
    location: "Lyon",
    content: "Le service de ménage à domicile a changé mon quotidien. La plateforme est super facile à utiliser et les intervenants sont toujours fiables.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCq5smXGcpW_YHGcuzZ1lCYrG1Uf-TOqh79ybubgsBd3MkR-6KAqIZx5itO_2QyijqprPbG_J2rT_5M8Bnv11znE24iPPL2vuRccbOn86S0XIpXm66lgqUQHLvPLH747jPFbMY_xx0x4hlOEMa8zkpM2PB8lH0hcK0dfq0Yf5yt53etDE_orFjbrZ7PKVBsoLwzieg4BBNCNFLdpEjCm4F86GVsVLSpqJUiWlKrzdgiF4SRL442IqqFn2KeyF42dJUWBuLGy4saVLE",
  },
  {
    name: "Julien L.",
    location: "Bordeaux",
    content: "Excellent pour trouver un professeur de soutien scolaire pour ma fille. La qualité de l'enseignement est au rendez-vous. Je recommande vivement !",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA56ya1TJrwN9XDWaA5UJe_SDFrSmSzc4IfZZMavKsciKr8WnSn3rbK7-WKN5k0tvdPG33Fe_RNLytUVDbov1_tDRdkcHRmxstYuTN34sfcIW_WyS8LfQqqULDY1XQcAp-fhrC3I9B5clCARdg3_o0LzY4wmVxcrsa94kB43KRp1ct0JF8MOh5LOuBne2q4SIFwgKbiYq1iV5n0ejmx3ifKxCCmjjYLfyzlzmKCOTVXBjx-hctOuA-z0KpKlpnbRf6CwJX4lryzApk",
  },
];

const popularServices = [
  {
    tag: "Ménage",
    title: "Entretien du domicile",
    desc: "Nettoyage régulier ou ponctuel par des professionnels certifiés.",
    price: "25€/h",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzQDEPQBJOGrmTJ81D8unEX24ELwakNsmoTRe3vDPp2_Fq_Tao3Nqpwy263isBSZpSqE7uL5JIRVqMsw3mx6n9D2OdzgFRQ2RmApzcmFXECPdIeQFZU-Zju_uW2Rptj5vHr332Ll9BRaWz8j7lTDc4WuBheo0pkE4x9UTE2TwhYqMU0yk-cfySUDNxPpaqCz637c9dwurAQ1oPrQwHqyqM6Y6bBcb4CMjD7HD_EU9tzHoLsVq6YM5PPvIGoWK19Y4sjd1V01se1Fw",
  },
  {
    tag: "Bricolage",
    title: "Petits travaux",
    desc: "Montage de meubles, fixations et réparations mineures.",
    price: "35€/h",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuApFZ2AUcx0lezHhRKW5mLo-4TmZoLW7AMMndg_TvvC7pRgTV1FzDDlOlKE1raoVzvbpFtGqE3PPxpgXMx1Tz-sbgYS_Is4QGgIbe9BgGV0i58S06xCA-D8yciL0fjW75KjPEAKH8XpVMzS3fq9lOoQU4u60g_0dNXS5yLs1muN03rBsRTzPmXyN57vW8-hNCBec_XsrbY4hOKX4ltWdCnKDcUs0jF0IzUEzGmGT_L4IPCzn1uHNhP3RESAYmxzmLOw7n_bT2KKdh8",
  },
  {
    tag: "Soutien",
    title: "Tutorat scolaire",
    desc: "Accompagnement personnalisé pour tous les niveaux.",
    price: "20€/h",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcXXUYdkeqkU5akJIWZQK7uShgxeAZJAy5jUwL6nyB5H6Q32Xh6X9JoQPnI8Eoqi9mLoTCLyjDzIJh7BUUVz_SWrs-iEJSAmH_pJFG9Vc3QPTo5PC1nrG4pdYDuU76DLbf4phVtrSwWPV34obao1VSnkC1gZBTuJCPuMkgiH82EUefcCPSGePTsnJlBmSsFekIJiOqflma70VIeQOkYJaCnE9wNV16IfI7V7gNQ7UwH9CzwoHkhnRwaqTHnGzr5bqvGugcLmry6-0",
  },
  {
    tag: "Extérieur",
    title: "Jardinage",
    desc: "Tonte de pelouse, taille de haies et entretien paysager.",
    price: "30€/h",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9MKvC0NzrLVGruXdOzff3gpL_ux-R-oZ5Iv64WFpHfpq50vO81tw--jfKWr5amzux3cHT94AkzHzMzkfkqP8DHa3kQme541hwbnx7RJdkpqGk86186Z0h3UdFhIDW5fyjKtGg6NaVfytxwmrRY0OfhclEZExos5DOpiANUe-wOzkTHSFWfvvRlgTLULKCzvzesKh7t_F6GCmnsLqcLWy6Ne1RBKORluDaT5SoQgwk74ZgG9zn0JhvEd8-3MjHuXY3kfZYUl0n9Io",
  },
];

const pricingPlans = [
  {
    name: "Basique",
    price: "0€",
    period: "/mois",
    popular: false,
    features: [
      "Accès aux services de base",
      "1 réservation par mois",
      "Support par email",
      "Profil utilisateur standard",
    ],
  },
  {
    name: "Standard",
    price: "29€",
    period: "/mois",
    popular: true,
    features: [
      "Accès illimité aux services",
      "Réservations prioritaires",
      "Support client 24/7",
      "Assurance premium incluse",
      "Réductions exclusives",
    ],
  },
  {
    name: "Premium",
    price: "59€",
    period: "/mois",
    popular: false,
    features: [
      "Tout le forfait Standard",
      "Conciergerie dédiée",
      "Interventions d'urgence",
      "Services personnalisés",
      "Accès aux événements VIP",
    ],
  },
];

const faqs = [
  {
    q: "Comment sont sélectionnés les professionnels ?",
    a: "Ils sont rigoureusement vérifiés et notés par notre communauté pour garantir un service de qualité. Nous vérifions les antécédents, les certifications et les références de chaque prestataire.",
  },
  {
    q: "Comment se passe le paiement ?",
    a: "Le paiement s'effectue en ligne de manière totalement sécurisée après la réalisation de la prestation. Les fonds sont bloqués jusqu'à votre validation finale.",
  },
  {
    q: "Puis-je annuler une réservation ?",
    a: "Oui, vous pouvez annuler votre réservation gratuitement jusqu'à 24h avant l'intervention prévue directement depuis votre espace client.",
  },
];

export function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      const bar = document.getElementById("scroll-progress");
      if (bar) bar.style.width = scrolled + "%";
    };

    const observerOptions = { root: null, rootMargin: "0px", threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    window.addEventListener("scroll", handleScroll);
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      {/* Hero Section */}
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

            {/* Search Bar */}
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

      {/* Features */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto reveal">
          <div className="text-center mb-stack-lg">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-stack-sm">Nos points forts</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Pourquoi choisir Servicely pour vos besoins quotidiens ?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {[
              { icon: "verified_user", title: "Professionnels Vérifiés", desc: "Des experts rigoureusement sélectionnés pour votre sécurité." },
              { icon: "lock", title: "Paiement Sécurisé", desc: "Transactions transparentes et protégées." },
              { icon: "bolt", title: "Réservation Instantanée", desc: "Réservez votre service en quelques secondes." },
              { icon: "support_agent", title: "Support 24/7", desc: "Une équipe dédiée pour vous accompagner à tout moment." },
            ].map((feature) => (
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

      {/* Testimonials */}
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

      {/* Popular Services */}
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

      {/* About */}
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
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkG4AiR2vtfpt7Fxq6hoKPbb2euWpgcd2IRCUH_7691YnOgoy9Ji8eNKWsM13lgoPO3x_QSIKsD9EbT85BIhd3udL-jHKZGcTJx8b8mbY5C54oUqO_zzT7p4QmbN0WyrCrPvgJlx_daCR3R6WioAVnNuDxWzHEEno9Twb980PYuFPuv-EFMVHpaFRuLkMqykuPWMkxR77hPW4fvnLHpqfosU55gKGK05FcSZBS5Zc0WL5otpAc44eLzXdkLfA6YuJXNx5kpadI9x8"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low" id="pricing">
        <div className="max-w-container-max mx-auto reveal">
          <div className="text-center mb-stack-lg">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-stack-sm">Nos Tarifs</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Choisissez le forfait qui correspond le mieux à vos besoins pour profiter pleinement de nos services.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-surface rounded-xl p-6 flex flex-col h-full shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ${
                  plan.popular ? "border-2 border-secondary relative" : "border border-surface-variant"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Populaire
                  </div>
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
                <button
                  className={`w-full font-button text-button rounded py-3 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    plan.popular
                      ? "bg-secondary text-on-secondary hover:bg-secondary/90 shadow-sm"
                      : "text-secondary border-[1.5px] border-secondary hover:bg-secondary/10"
                  }`}
                >
                  {plan.popular ? "Choisir Standard" : plan.name === "Premium" ? "Choisir Premium" : "Commencer gratuitement"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-3xl mx-auto reveal">
          <div className="text-center mb-stack-lg">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-stack-sm">FAQ</h2>
          </div>
          <div className="flex flex-col space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item group bg-surface-container-low rounded-xl border border-transparent hover:border-secondary/20 transition-all duration-300">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <h3 className="font-headline-md text-[20px] font-semibold text-primary">{faq.q}</h3>
                  <span className={`material-symbols-outlined text-secondary transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>
                <div className={`faq-content ${openFaq === i ? "open" : ""}`}>
                  <div className="px-6 pb-6">
                    <p className="font-body-md text-on-surface-variant">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
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
    </>
  );
}
