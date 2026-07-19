import { useRef, useState, useEffect } from "react";
import { ProviderLayout } from "@/components/prestataire/ProviderLayout";
import { useProviderProfile, useUpdateProfile, useUploadAvatar } from "@/hooks/useProviderQueries";
import { useAppDispatch } from "@/hooks/useRedux";
import { getMe } from "@/store/authSlice";
import { api } from "@/services/api";

export function ProviderParametres() {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: provider, isLoading, error } = useProviderProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const user = provider?.user;
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalSaving, setPaypalSaving] = useState(false);
  const [paypalMessage, setPaypalMessage] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notifSettings, setNotifSettings] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const avatarSrc = avatar || user?.avatar;
  useEffect(() => {
    setAvatarError(false);
  }, [avatarSrc]);

  useEffect(() => {
    if (provider) {
      setFirstName(provider.user?.firstName || "");
      setLastName(provider.user?.lastName || "");
      setTitle(provider.title || "");
      setBio(provider.bio || "");
      setPhone(provider.user?.phone || "");
      setAddress(provider.address || "");
      setEmail(provider.user?.email || "");
      setPaypalEmail(provider.paypalEmail || "");
      setTwoFactorEnabled(provider.user?.twoFactorEnabled ?? false);
      setNotifSettings(provider.user?.notificationSettings ?? {});
    }
  }, [provider]);

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
    try {
      await uploadAvatar.mutateAsync(file);
      dispatch(getMe());
    } catch (err) {
      console.error("Upload avatar error:", err);
    }
  };

  const handlePaypalSave = async () => {
    setPaypalSaving(true);
    setPaypalMessage(null);
    try {
      await api.put("/providers/me/paypal-email", { email: paypalEmail });
      setPaypalMessage("Email PayPal enregistré.");
    } catch (err: any) {
      const detail = err?.response?.data?.error?.message || err?.message || "";
      setPaypalMessage(`Erreur : ${detail}`);
    }
    setPaypalSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile.mutateAsync({ firstName, lastName, title, bio, phone, address, notificationSettings: notifSettings, twoFactorEnabled });
    } catch (err) {
      console.error("Update profile error:", err);
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <ProviderLayout>
        <main className="flex-1 p-margin-mobile md:p-margin-desktop max-w-container-max mx-auto flex items-center justify-center">
          <div className="text-outline text-center">
            <span className="material-symbols-outlined animate-spin text-3xl inline-block">progress_activity</span>
            <p className="mt-4">Chargement du profil...</p>
          </div>
        </main>
      </ProviderLayout>
    );
  }

  if (error || !provider) {
    return (
      <ProviderLayout>
        <main className="flex-1 p-margin-mobile md:p-margin-desktop max-w-container-max mx-auto flex items-center justify-center">
          <div className="text-error text-center">
            <span className="material-symbols-outlined text-3xl inline-block">error</span>
            <p className="mt-4 font-bold">Impossible de charger le profil</p>
            <p className="text-outline mt-1">Vérifiez que vous avez bien un compte expert et que le serveur est lancé.</p>
          </div>
        </main>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <main className="flex-1 p-margin-mobile md:p-margin-desktop max-w-container-max mx-auto">
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
              <p className="text-on-surface-variant font-body-md mb-4">{provider.title || "Expert Servicely"} • Expert Servicely depuis {new Date(provider.createdAt).getFullYear()}</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[12px] font-bold">VÉRIFIÉ</span>
                <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-[12px] font-bold">NIVEAU {provider.level || 1}</span>
              </div>
            </div>
            <div>
              <button
                className="bg-secondary text-white px-8 py-3 rounded-lg font-button hover:opacity-90 transition-all shadow-md disabled:opacity-60"
                onClick={handleSave}
                disabled={saving || updateProfile.isPending}
              >
                {saving || updateProfile.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
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
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-outline uppercase">Titre professionnel</label>
                    <input className="border border-outline-variant rounded-lg p-3 font-body-md focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Électricien certifié & Domotique" />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-outline uppercase">Biographie professionnelle</label>
                    <textarea className="border border-outline-variant rounded-lg p-3 font-body-md focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
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
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-outline uppercase">Adresse d'intervention principale</label>
                    <div className="relative">
                      <input className="w-full border border-outline-variant rounded-lg p-3 font-body-md pr-10 focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all" type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                      <span className="material-symbols-outlined absolute right-3 top-3 text-outline text-[20px]">location_on</span>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-outline uppercase">Email PayPal</label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border border-outline-variant rounded-lg p-3 font-body-md focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all"
                        type="email"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder="email-paypal@exemple.com"
                      />
                      <button
                        onClick={handlePaypalSave}
                        disabled={paypalSaving}
                        className="px-4 py-2 bg-secondary text-white rounded-lg font-button hover:opacity-90 transition-all disabled:opacity-60"
                      >
                        {paypalSaving ? "..." : "Sauvegarder"}
                      </button>
                    </div>
                    {paypalMessage && (
                      <p className={`text-sm ${paypalMessage.includes("Erreur") ? "text-error" : "text-success"}`}>
                        {paypalMessage}
                      </p>
                    )}
                    <p className="text-xs text-outline">Les paiements PayPal seront envoyés directement à cette adresse.</p>
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
                      <p className="text-sm text-outline">Sécurisez davantage votre compte expert</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative inline-block w-12 align-middle select-none">
                        <input type="checkbox" checked={twoFactorEnabled} onChange={(e) => setTwoFactorEnabled(e.target.checked)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-outline z-10 transition-transform duration-200 ease-in-out" id="toggle-2fa" />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-surface-variant cursor-pointer" htmlFor="toggle-2fa" />
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
                    { label: "Nouvelles réservations", key: "new_bookings" },
                    { label: "Messages clients", key: "messages" },
                    { label: "Rappels de planning", key: "reminders" },
                    { label: "Alertes de revenus", key: "revenue_alerts" },
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

              <div className="bg-primary-container text-white rounded-xl p-8 relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="font-headline-md text-white mb-4">Statut de visibilité</h4>
                  <p className="text-sm opacity-80 mb-6">Votre profil est actuellement public et reçoit des demandes de devis.</p>
                  <div className="bg-white/10 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Complétion du profil</span>
                      <span className="text-sm font-bold">92%</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full rounded-full" style={{ width: "92%" }} />
                    </div>
                  </div>
                  <button className="w-full py-3 rounded-lg border border-white/30 hover:bg-white/10 transition-colors font-button">Voir mon profil public</button>
                </div>
              </div>

              <div className="bg-surface-container p-8 rounded-xl flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-secondary">support_agent</span>
                </div>
                <h4 className="font-bold mb-2">Besoin d'aide ?</h4>
                <p className="text-sm text-outline mb-6">Notre équipe dédiée aux experts est disponible pour vous accompagner dans votre configuration.</p>
                <a className="text-secondary font-bold text-sm hover:underline" href="#">Contacter le support expert</a>
              </div>
            </div>
          </div>

          <section className="mt-8 pt-8 border-t border-surface-container-highest">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h5 className="text-error font-bold">Zone de danger</h5>
                <p className="text-sm text-on-surface-variant">Supprimer définitivement votre compte expert Servicely et toutes vos données associées.</p>
              </div>
              <button className="px-6 py-2 border border-error text-error rounded-lg hover:bg-error hover:text-white transition-all font-button">Désactiver le compte</button>
            </div>
          </section>
        </div>

        <footer className="mt-section-gap py-8 border-t border-surface-container text-center text-outline text-sm">
          © 2024 Servicely France SAS. Tous droits réservés. Espace Expert Certifié.
        </footer>
      </main>
    </ProviderLayout>
  );
}
