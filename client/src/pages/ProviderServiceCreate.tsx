import { useEffect, useRef, useState } from "react";
import { ProviderLayout } from "@/components/prestataire/ProviderLayout";
import { useNavigate } from "react-router-dom";
import { useCreateService, useUploadServiceImage } from "@/hooks/useProviderQueries";
import { api } from "@/services/api";
import type { ApiResponse, Category } from "@/types";

export function ProviderServiceCreate() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [priceType, setPriceType] = useState<"hour" | "package">("hour");
  const [categories, setCategories] = useState<Category[]>([]);

  const createService = useCreateService();
  const uploadServiceImage = useUploadServiceImage();

  useEffect(() => {
    api.get<ApiResponse<Category[]>>("/categories").then((r) => setCategories(r.data.data)).catch((err) => console.error("Failed to load categories:", err));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setImagePreview(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    const name = (data.get("service_name") as string)?.trim();
    const categoryId = (data.get("category") as string)?.trim();
    const description = (data.get("description") as string)?.trim();
    const rawPrice = data.get("price_amount") as string;

    if (!name || !categoryId || !description || !rawPrice) return;

    const price = parseFloat(rawPrice.replace(",", "."));
    const duration = priceType === "hour" ? 60 : 1440;

    try {
      const service = await createService.mutateAsync({
        name,
        description,
        price,
        duration,
        categoryId,
        unit: priceType === "hour" ? "/ heure" : "/ forfait",
      });

      if (imageFile && service?.id) {
        await uploadServiceImage.mutateAsync({ serviceId: service.id, file: imageFile });
      }

      navigate("/provider/services");
    } catch (err) {
      console.error("Create service error:", err);
    }
  };

  return (
    <ProviderLayout>
      <main className="flex-1 p-margin-mobile md:p-margin-desktop bg-background">
        <div className="max-w-4xl mx-auto mb-stack-lg">
          <nav className="flex items-center gap-2 text-outline mb-2">
            <a className="hover:text-secondary transition-colors font-label-md text-label-md" href="/provider/services">Mes Services</a>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-on-background font-label-md text-label-md">Nouveau Service</span>
          </nav>
          <h2 className="font-headline-lg text-headline-lg text-primary">Créer un nouveau service</h2>
          <p className="text-on-surface-variant font-body-md text-body-md mt-2">Configurez les détails de votre prestation pour attirer vos prochains clients.</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <form className="space-y-stack-lg" onSubmit={handleSubmit}>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">edit_note</span>
                </div>
                <h3 className="font-headline-md text-headline-md">Informations générales</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-outline uppercase tracking-wider" htmlFor="service_name">Nom du service</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 bg-surface-container-lowest outline-none transition-all"
                    id="service_name"
                    name="service_name"
                    placeholder="Ex: Coaching Leadership & Stratégie"
                    type="text"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-outline uppercase tracking-wider" htmlFor="category">Catégorie</label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 bg-surface-container-lowest appearance-none cursor-pointer outline-none"
                      id="category"
                      name="category"
                      required
                      defaultValue=""
                    >
                      <option disabled value="">Sélectionner une catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-outline uppercase tracking-wider" htmlFor="description">Description détaillée</label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 bg-surface-container-lowest outline-none transition-all"
                  id="description"
                  name="description"
                  placeholder="Décrivez votre expertise, ce que le client recevra et votre méthodologie..."
                  rows={5}
                  required
                />
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <h3 className="font-headline-md text-headline-md">Tarification</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-start">
                <div className="flex flex-col gap-4">
                  <label className="font-label-md text-label-md text-outline uppercase tracking-wider">Type de facturation</label>
                  <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                      <input
                        checked={priceType === "hour"}
                        className="hidden peer"
                        name="price_type"
                        type="radio"
                        value="hour"
                        onChange={() => setPriceType("hour")}
                      />
                      <div className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-outline-variant peer-checked:border-secondary peer-checked:bg-secondary-container/20 transition-all">
                        <span className="material-symbols-outlined mb-2 text-outline peer-checked:text-secondary">schedule</span>
                        <span className="font-label-md text-label-md">Par Heure</span>
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input
                        checked={priceType === "package"}
                        className="hidden peer"
                        name="price_type"
                        type="radio"
                        value="package"
                        onChange={() => setPriceType("package")}
                      />
                      <div className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-outline-variant peer-checked:border-secondary peer-checked:bg-secondary-container/20 transition-all">
                        <span className="material-symbols-outlined mb-2 text-outline peer-checked:text-secondary">inventory_2</span>
                        <span className="font-label-md text-label-md">Forfait Fixe</span>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-outline uppercase tracking-wider" htmlFor="price_amount">Montant (EUR)</label>
                  <div className="relative">
                    <input
                      className="w-full pl-4 pr-12 py-3 rounded-lg border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 bg-surface-container-lowest outline-none transition-all"
                      id="price_amount"
                      name="price_amount"
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-outline">€</span>
                  </div>
                  <p className="text-[12px] text-outline mt-1 italic">Note: Une commission de plateforme de 10% sera appliquée.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">image</span>
                </div>
                <h3 className="font-headline-md text-headline-md">Visuel du service</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                <div
                  className="md:col-span-2 relative aspect-video bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant overflow-hidden group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className={`absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant group-hover:text-secondary transition-colors z-10 ${imagePreview ? "bg-black/40 text-white" : "bg-white/20"}`}>
                    <span className="material-symbols-outlined text-4xl mb-2">cloud_upload</span>
                    <p className="font-label-md">{imagePreview ? "Changer l'image" : "Cliquez ou glissez une image ici"}</p>
                    <p className="text-[12px] opacity-60">PNG, JPG ou WEBP (Max. 5Mo)</p>
                  </div>
                  {imagePreview && (
                    <img className="absolute inset-0 w-full h-full object-cover" src={imagePreview} alt="Aperçu" />
                  )}
                  <input
                    ref={fileInputRef}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    id="service_image"
                    name="service_image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="flex flex-col justify-center p-6 bg-surface-container-low rounded-xl">
                  <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
                    Image du service
                  </h4>
                  <p className="text-[13px] text-on-surface-variant">Ajoutez une image pour illustrer votre service. Les formats acceptés sont PNG, JPG et WEBP (max 5 Mo).</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
              <button
                className="w-full sm:w-auto px-10 py-3 rounded-lg font-button text-button border-2 border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-all"
                type="button"
                onClick={() => navigate("/provider/services")}
              >
                Annuler
              </button>
              <button
                className="w-full sm:w-auto px-12 py-3 rounded-lg font-button text-button bg-secondary text-on-secondary shadow-lg shadow-secondary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
                type="submit"
                disabled={createService.isPending}
              >
                {createService.isPending ? (
                  <><span className="material-symbols-outlined animate-spin">progress_activity</span> Publication...</>
                ) : (
                  <><span>Publier le service</span><span className="material-symbols-outlined">send</span></>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </ProviderLayout>
  );
}
