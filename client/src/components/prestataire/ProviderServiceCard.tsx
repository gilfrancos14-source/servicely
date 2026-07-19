interface ProviderServiceCardProps {
  id: string;
  image: string;
  category: string;
  title: string;
  description: string;
  price: string;
  unit: string;
  active?: boolean;
  onToggle?: (id: string, active: boolean) => void;
}

export function ProviderServiceCard({ id, image, category, title, description, price, unit, active, onToggle }: ProviderServiceCardProps) {
  return (
    <article
      className={`bg-surface-container-lowest rounded-xl ambient-shadow-base hover:ambient-shadow-hover transition-shadow duration-300 flex flex-col group border border-outline-variant/20 ${!active ? "opacity-75 grayscale-[0.2]" : ""}`}
    >
      <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
        {image ? (
          <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={image} alt={title} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary-container to-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-on-secondary-container opacity-50">image</span>
          </div>
        )}
        <div className="absolute top-4 left-4 bg-surface-container-lowest/90 backdrop-blur px-3 py-1 rounded-full border border-outline-variant/30">
          <span className="font-label-md text-label-md text-secondary">{category}</span>
        </div>
        {!active && <div className="absolute inset-0 bg-surface-tint/10" />}
      </div>
      <div className="p-6 flex flex-col flex-1 relative">
        {!active && (
          <div className="absolute -top-3 right-6 bg-surface-container-low text-on-surface-variant px-3 py-1 rounded-md text-xs font-bold border border-outline-variant/30 shadow-sm z-10">
            Inactif
          </div>
        )}
        <h3 className="font-headline-md text-headline-md text-primary mb-2">{title}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-6 flex-1">{description}</p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/20">
          <div>
            <span className="font-headline-md text-headline-md text-primary">{price}</span>
            <span className="font-body-md text-body-md text-outline">{unit}</span>
          </div>
          <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => onToggle?.(id, e.target.checked)}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-outline z-10 transition-transform duration-200 ease-in-out"
              id={`toggle-${id}`}
            />
            <label className="toggle-label block overflow-hidden h-6 rounded-full bg-surface-variant cursor-pointer transition-colors duration-200 ease-in-out" htmlFor={`toggle-${id}`} />
          </div>
        </div>
      </div>
    </article>
  );
}
