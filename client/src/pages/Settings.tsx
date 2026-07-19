import { useRef, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { getMe } from "@/store/authSlice";

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = useAppSelector((s) => s.auth.user);
  const queryClient = useQueryClient();

  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const avatarSrc = avatar || currentUser?.avatar;
  useEffect(() => {
    setAvatarError(false);
  }, [avatarSrc]);

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setPhone(currentUser.phone || "");
      setEmail(currentUser.email || "");
      setTwoFactorEnabled(currentUser.twoFactorEnabled ?? false);
    }
  }, [currentUser]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string; phone?: string; twoFactorEnabled?: boolean }) =>
      api.patch("/auth/me/profile", data).then((r) => r.data.data),
    onSuccess: () => {
      dispatch(getMe());
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setAvatar(ev.target.result as string);
    };
    reader.onerror = () => {
      console.error("FileReader error");
    };
    reader.readAsDataURL(file);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post("/upload/avatar", formData);
      dispatch(getMe());
    } catch (err) {
      console.error("Upload avatar error:", err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfileMutation.mutateAsync({ firstName, lastName, phone, twoFactorEnabled });
    } catch (err) {
      console.error("Update profile error:", err);
    }
    setSaving(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-section-gap">
        <div className="flex flex-col gap-stack-lg">
          {/* Header */}
          <section className="bg-surface-container-lowest rounded-xl p-8 flex flex-col md:flex-row gap-8 items-start md:items-center shadow-sm border border-outline-variant/30">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-surface-container-low shadow-sm flex items-center justify-center bg-surface-container-high">
                {(!avatarError && avatarSrc) ? (
                  <img className="w-full h-full object-cover" src={avatarSrc} alt="" onError={() => setAvatarError(true)} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/10 text-secondary font-headline-xl text-3xl">
                    {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" />
              <button
                className="absolute bottom-0 right-0 bg-secondary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              </button>
            </div>
            <div className="flex-1">
              <h2 className="font-headline-lg text-[28px] mb-1">{firstName} {lastName}</h2>
              <p className="text-on-surface-variant font-body-md mb-3">Client Servicely</p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[12px] font-bold">
                  {currentUser.loyaltyPoints || 0} pts fidélité
                </span>
                <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-[12px] font-bold">
                  {currentUser.isVerified ? "VÉRIFIÉ" : "NON VÉRIFIÉ"}
                </span>
              </div>
            </div>
            <div>
              <button
                className="bg-secondary text-white px-8 py-3 rounded-lg font-button hover:opacity-90 transition-all shadow-md disabled:opacity-60"
                onClick={handleSave}
                disabled={saving || updateProfileMutation.isPending}
              >
                {saving || updateProfileMutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Personal info */}
              <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/30">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-secondary">person</span>
                  <h3 className="font-headline-md text-headline-md">Informations personnelles</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-outline uppercase">Prénom</label>
                    <input
                      className="border border-outline-variant rounded-lg p-3 font-body-md focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all"
                      type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-outline uppercase">Nom</label>
                    <input
                      className="border border-outline-variant rounded-lg p-3 font-body-md focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all"
                      type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/30">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-secondary">contact_mail</span>
                  <h3 className="font-headline-md text-headline-md">Coordonnées</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-outline uppercase">E-mail</label>
                    <input
                      className="border border-outline-variant rounded-lg p-3 font-body-md bg-surface-container-high outline-none transition-all cursor-not-allowed"
                      type="email" value={email} disabled
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-outline uppercase">Téléphone</label>
                    <input
                      className="border border-outline-variant rounded-lg p-3 font-body-md focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all"
                      type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-8">
              <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/30">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-secondary">security</span>
                  <h3 className="font-headline-md text-headline-md">Sécurité</h3>
                </div>
                <div className="space-y-5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-outline-variant/30">
                    <div>
                      <p className="font-bold">Mot de passe</p>
                      <p className="text-sm text-outline">Modifié il y a 3 mois</p>
                    </div>
                    <button className="px-4 py-2 border border-outline-variant rounded-lg font-button text-secondary hover:bg-secondary/5 transition-colors">
                      Modifier
                    </button>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="font-bold">Double authentification</p>
                      <p className="text-sm text-outline">Sécurisez votre compte</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative inline-block w-12 align-middle select-none">
                        <input type="checkbox" checked={twoFactorEnabled} onChange={(e) => setTwoFactorEnabled(e.target.checked)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-outline z-10 transition-transform duration-200 ease-in-out" id="toggle-2fa-client" />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-surface-variant cursor-pointer" htmlFor="toggle-2fa-client" />
                      </div>
                      <span className="text-sm font-medium">{twoFactorEnabled ? "Activé" : "Désactivé"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary-container/20 rounded-xl p-8 border border-primary-container/30">
                <h4 className="font-headline-md text-headline-md text-primary mb-4">À propos</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Membre depuis {new Date(currentUser.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-secondary text-lg">stars</span>
                  <span className="font-bold">{currentUser.loyaltyPoints || 0} points fidélité</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
