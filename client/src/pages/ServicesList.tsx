import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { getServices, getCategories } from "@/services/publicService";
import { Search, MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react";

const SORT_OPTIONS = [
  { label: "Pertinence", value: "" },
  { label: "Prix croissant", value: "price_asc" },
  { label: "Mieux notés", value: "rating" },
];

export function ServicesListPage() {
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(200);
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const categoryQuery = selectedCategories.length > 0 ? selectedCategories.join(",") : undefined;

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ["services", search, categoryQuery, priceRange, location, minRating, sort, page],
    queryFn: () =>
      getServices({
        search: search || undefined,
        categoryId: categoryQuery,
        maxPrice: priceRange < 200 ? priceRange : undefined,
        location: location || undefined,
        minRating: minRating || undefined,
        sort: sort || undefined,
        page,
        limit: 12,
      }),
    staleTime: 30 * 1000,
  });

  const services = servicesData?.data || [];
  const meta = servicesData?.meta;
  const totalPages = meta?.totalPages || 1;

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setPage(1);
  };

  const totalLabel = meta?.total !== undefined ? `${meta.total} professionnel${meta.total > 1 ? "s" : ""} disponibles` : "Chargement...";

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg lg:flex gap-gutter">
        <aside className="w-full lg:w-72 shrink-0 space-y-stack-lg lg:sticky lg:top-24 h-fit mb-section-gap lg:mb-0">
          <div className="bg-surface-container-lowest p-stack-lg rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-outline-variant/30">
            <h2 className="font-headline-md text-headline-md text-primary mb-stack-lg">Filtres</h2>

            <div className="mb-stack-lg">
              <label className="font-label-md text-label-md text-outline uppercase block mb-stack-md">Catégories</label>
              <div className="space-y-stack-sm max-h-64 overflow-y-auto custom-scrollbar">
                {categories?.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-stack-sm cursor-pointer hover:text-secondary transition-colors">
                    <input
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="rounded text-secondary focus:ring-secondary border-outline-variant"
                      type="checkbox"
                    />
                    <span className="text-body-md">{cat.name}</span>
                  </label>
                ))}
                {(!categories || categories.length === 0) && (
                  <p className="text-outline text-body-md">Aucune catégorie</p>
                )}
              </div>
            </div>

            <div className="mb-stack-lg">
              <label className="font-label-md text-label-md text-outline uppercase block mb-stack-md">
                Prix maximum : {priceRange < 200 ? `${priceRange}€` : "200€+"}
              </label>
              <input
                type="range"
                min={15}
                max={200}
                value={priceRange}
                onChange={(e) => { setPriceRange(Number(e.target.value)); setPage(1); }}
                className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-secondary"
              />
              <div className="flex justify-between mt-2 text-label-md text-on-surface-variant font-medium">
                <span>15€</span>
                <span>200€+</span>
              </div>
            </div>

            <div className="mb-stack-lg">
              <label className="font-label-md text-label-md text-outline uppercase block mb-stack-md">Localisation</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant h-4 w-4" />
                <input
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                  placeholder="Ville ou code postal"
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-container-low border-outline-variant text-body-md focus:ring-secondary focus:border-secondary"
                />
              </div>
            </div>

            <div className="mb-stack-lg">
              <label className="font-label-md text-label-md text-outline uppercase block mb-stack-md">Note minimum</label>
              <div className="space-y-stack-sm">
                {[4, 3, 2, 1].map((n) => (
                  <button
                    key={n}
                    onClick={() => { setMinRating(minRating === n ? 0 : n); setPage(1); }}
                    className={`flex items-center gap-2 w-full p-2 rounded-lg transition-colors text-body-md ${
                      minRating === n ? "bg-secondary/10 text-secondary" : "hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex text-secondary">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${s <= n ? "fill-current" : ""}`}
                        />
                      ))}
                    </div>
                    <span>{n}+ Étoiles</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setSelectedCategories([]);
                setPriceRange(200);
                setLocation("");
                setMinRating(0);
                setSort("");
                setPage(1);
              }}
              className="w-full bg-secondary text-on-secondary font-button text-button py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </aside>

        <section className="flex-grow">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-stack-lg gap-stack-md">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant h-4 w-4" />
              <input
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); }}
                placeholder="Rechercher un service..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-body-md focus:ring-secondary focus:border-secondary"
              />
            </div>
            <div className="flex items-center gap-stack-md">
              <span className="text-label-md text-outline uppercase">Trier par:</span>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="border-none bg-transparent font-semibold text-secondary focus:ring-0 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-stack-md">
            <h1 className="font-headline-lg text-headline-lg text-primary">
              {search ? `Résultats pour "${search}"` : "Tous les services"}
            </h1>
            <p className="text-body-lg text-on-surface-variant mt-1">{totalLabel}</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-8 w-8 border-2 border-secondary border-t-transparent rounded-full" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 text-outline">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-body-lg">Aucun service trouvé</p>
              <p className="text-body-md mt-2">Essayez de modifier vos filtres</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
              {services.map((service) => (
                <Link
                  key={service.id}
                  to={`/services/${service.id}`}
                  className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-outline-variant/30 hover-lift group block"
                >
                  <div className="relative aspect-square overflow-hidden">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                        <span className="text-outline/30 text-6xl font-bold">{service.name.charAt(0)}</span>
                      </div>
                    )}
                    {service.provider.rating >= 4.5 && (
                      <div className="absolute top-4 right-4 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-md font-bold shadow-sm">
                        PRO VÉRIFIÉ
                      </div>
                    )}
                  </div>
                  <div className="p-stack-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-primary/5 text-secondary text-[12px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        {service.category?.name || "Service"}
                      </span>
                      <div className="flex items-center gap-1 text-secondary">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-bold text-body-md">{service.provider.rating.toFixed(1)}</span>
                        <span className="text-outline text-label-md">({service.provider.reviewCount})</span>
                      </div>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-primary mb-1">
                      {service.provider.user.firstName} {service.provider.user.lastName}
                    </h3>
                    <p className="text-body-md text-on-surface-variant line-clamp-2 mb-stack-lg">{service.description}</p>
                    <div className="flex items-center justify-between mt-auto pt-stack-md border-t border-outline-variant/20">
                      <div>
                        <span className="text-label-md text-outline block">À partir de</span>
                        <span className="font-bold text-headline-md text-primary">
                          {Number(service.price).toFixed(0)}€
                          <small className="text-body-md font-normal">
                            {service.unit ? `/${service.unit}` : "/h"}
                          </small>
                        </span>
                      </div>
                      <span className="bg-primary text-white px-6 py-2.5 rounded-lg font-button text-button hover:bg-secondary active:scale-95 transition-all inline-block">
                        Réserver
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-section-gap flex justify-center">
              <nav className="flex items-center gap-stack-sm bg-surface-container-lowest p-2 rounded-xl shadow-sm border border-outline-variant/30">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-outline disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, i, arr) => (
                    <span key={p} className="contents">
                      {i > 0 && arr[i - 1] !== p - 1 && <span className="px-2 text-outline">...</span>}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium ${
                          p === page
                            ? "bg-secondary text-on-secondary font-bold"
                            : "hover:bg-surface-container transition-colors"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-secondary disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
