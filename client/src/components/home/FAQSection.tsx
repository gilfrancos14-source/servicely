import { useState } from "react";

const faqs = [
  { q: "Comment sont sélectionnés les professionnels ?",
    a: "Ils sont rigoureusement vérifiés et notés par notre communauté pour garantir un service de qualité. Nous vérifions les antécédents, les certifications et les références de chaque prestataire." },
  { q: "Comment se passe le paiement ?",
    a: "Le paiement s'effectue en ligne de manière totalement sécurisée après la réalisation de la prestation. Les fonds sont bloqués jusqu'à votre validation finale." },
  { q: "Puis-je annuler une réservation ?",
    a: "Oui, vous pouvez annuler votre réservation gratuitement jusqu'à 24h avant l'intervention prévue directement depuis votre espace client." },
];

export function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
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
                <span className={`material-symbols-outlined text-secondary transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}>expand_more</span>
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
  );
}
