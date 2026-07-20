import { useRef, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { getMe } from "@/store/authSlice";

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = useAppSelector((s) => s.auth.user);

  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notifSettings, setNotifSettings] = useState<Record<string, boolean>>({});

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
      setNotifSettings(currentUser.notificationSettings ?? {});
    }
  }, [currentUser]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string; phone?: string; notificationSettings?: Record<string, boolean>; twoFactorEnabled?: boolean }) =>
      api.patch("/auth/me/profile", data).then((r) => r.data.data),
    onSuccess: () => {
      dispatch(getMe());
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
      await updateProfileMutation.mutateAsync({ firstName, lastName, phone, notificationSettings: notifSettings, twoFactorEnabled });
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
      <main className="max-w-container-max mx-auto p-margin-mobile md:p-margin-desktop">
        <div className="flex flex-col gap-stack-lg">
          <section className="bg-white rounded-xl ambient-shadow-base p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-low shadow-sm flex items-center justify-center bg-surface-container-high">
                {(!avatarError && avatarSrc) ? (
                  <img className="w-full h-full object-cover" src={avatarSrc} alt="Photo de profil" onError={() => setAvatarError(true)} />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-outline">person</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                className="absolute bottom-0 right-0 bg-secondary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              </button>
            </div>
            <div className="flex-1">
              <h2 className="font-headline-lg text-[28px] mb-1">{firstName} {lastName}</h2>
              <p className="text-on-surface-variant font-body-md mb-4">Client Servicely depuis {new Date(currentUser.createdAt).getFullYear()}</p>
              <div className="flex gap-2">
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
                {saving || updateProfileMutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <div className="bg-white rounded-xl ambient-shadow-base p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-secondary">person</span>
                  <h3 className="font-headline-md text-headline-md">Informations personnelles</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-outline uppercase">Prénom</label>
                    <input className="border border-outline-variant rounded-lg p-3 font-body-md focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-outline uppercase">Nom</label>
                    <input className="border border-outline-variant rounded-lg p-3 font-body-md focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl ambient-shadow-base p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-secondary">contact_mail</span>
                  <h3 className="font-headline-md text-headline-md">Coordonnées</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-outline uppercase">E-mail</label>
                    <input className="border border-outline-variant rounded-lg p-3 font-body-md focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all" type="email" value={email} disabled />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-outline uppercase">Téléphone</label>
                    <input className="border border-outline-variant rounded-lg p-3 font-body-md focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl ambient-shadow-base p-8 border-l-4 border-error/20">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-error">security</span>
                  <h3 className="font-headline-md text-headline-md">Sécurité</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-surface-container">
                    <div>
                      <p className="font-bold">Mot de passe</p>
                      <p className="text-sm text-outline">Dernière modification il y a 3 mois</p>
                    </div>
                    <button className="px-4 py-2 border border-outline-variant rounded-lg font-button text-secondary hover:bg-secondary/5 transition-colors">Modifier le mot de passe</button>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="font-bold">Double authentification (2FA)</p>
                      <p className="text-sm text-outline">Sécurisez davantage votre compte client</p>
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
            </div>

            <div className="flex flex-col gap-8">
              <div className="bg-white rounded-xl ambient-shadow-base p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-secondary">notifications_active</span>
                  <h3 className="font-headline-md text-headline-md">Notifications</h3>
                </div>
                <div className="space-y-5">
                  {[
                    { label: "Confirmation de réservation", key: "booking_confirmation" },
                    { label: "Rappels de rendez-vous", key: "reminders" },
                    { label: "Offres et promotions", key: "promotions" },
                    { label: "News Servicely", key: "news" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span className="font-body-md text-sm">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={notifSettings[item.key] ?? true}
                        onChange={(e) => setNotifSettings((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                        className="rounded text-secondary focus:ring-secondary"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container p-8 rounded-xl flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-secondary">headset_mic</span>
                </div>
                <h4 className="font-bold mb-2">Besoin d'aide ?</h4>
                <p className="text-sm text-outline mb-6">Notre équipe est disponible pour vous accompagner.</p>
                <a className="text-secondary font-bold text-sm hover:underline" href="#">Contacter le support</a>
              </div>
            </div>
          </div>

          <section className="mt-8 pt-8 border-t border-surface-container-highest">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h5 className="text-error font-bold">Zone de danger</h5>
                <p className="text-sm text-on-surface-variant">Supprimer définitivement votre compte client Servicely et toutes vos données associées.</p>
              </div>
              <button className="px-6 py-2 border border-error text-error rounded-lg hover:bg-error hover:text-white transition-all font-button">Désactiver le compte</button>
            </div>
          </section>
        </div>

        <footer className="mt-section-gap py-8 border-t border-surface-container text-center text-outline text-sm">
          © 2024 Servicely France SAS. Tous droits réservés.
        </footer>
      </main>
    </div>
  );
}
