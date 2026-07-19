import { ProviderLayout } from "@/components/prestataire/ProviderLayout";
import { ProviderServiceCard } from "@/components/prestataire/ProviderServiceCard";
import { useNavigate } from "react-router-dom";
import { useProviderServices, useUpdateService } from "@/hooks/useProviderQueries";

export function ProviderServices() {
  const navigate = useNavigate();
  const { data: services, isLoading } = useProviderServices();
  const updateService = useUpdateService();

  return (
    <ProviderLayout>
      <main className="flex-1 p-margin-mobile md:p-margin-desktop pb-section-gap">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary mb-4">Gestion des Services</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Configurez et gérez les prestations que vous proposez. Activez ou désactivez leur disponibilité en un clic pour refléter votre emploi du temps.</p>
          </div>
          <button
            className="flex items-center gap-2 bg-secondary text-on-secondary font-button text-button py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 whitespace-nowrap"
            onClick={() => navigate("/provider/services/create")}
          >
            <span className="material-symbols-outlined">add_circle</span>
            Créer un Service
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-outline">
            <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
            Chargement...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {(services || []).map((service) => (
              <ProviderServiceCard
                key={service.id}
                id={service.id}
                image={service.imageUrl || ""}
                category={service.category?.name || "Général"}
                title={service.name}
                description={service.description}
                price={`${service.price.toFixed(2).replace(".", ",")} €`}
                unit={service.unit || (service.duration >= 1440 ? "/ forfait" : "/ heure")}
                active={service.isActive}
                onToggle={(id, active) => updateService.mutate({ id, data: { isActive: active } })}
              />
            ))}
            <article
              className="bg-surface/50 border-2 border-dashed border-outline-variant/50 rounded-xl flex flex-col items-center justify-center p-8 hover:bg-surface-container-low hover:border-secondary/50 transition-colors duration-300 cursor-pointer group min-h-[400px]"
              onClick={() => navigate("/provider/services/create")}
            >
              <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-3xl">add</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary mb-2 text-center group-hover:text-secondary transition-colors">Ajouter une prestation</h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-xs">Développez votre offre en proposant de nouveaux services à vos clients.</p>
            </article>
          </div>
        )}
      </main>
    </ProviderLayout>
  );
}
