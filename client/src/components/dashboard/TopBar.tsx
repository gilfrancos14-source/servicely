export function TopBar() {
  return (
    <header className="flex justify-between items-center px-margin-mobile md:px-margin-desktop sticky top-0 z-40 w-full h-16 bg-surface-bright shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="font-headline-md text-headline-md font-bold text-primary md:hidden">Servicely</h2>
      </div>
      <div className="flex items-center gap-stack-md">
        <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-premium cursor-pointer active:scale-90">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-premium cursor-pointer active:scale-90">
          <span className="material-symbols-outlined">help</span>
        </button>
        <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden cursor-pointer hover:ring-2 hover:ring-secondary transition-premium shadow-sm border border-outline-variant">
          <img
            alt="Photo de profil"
            className="w-full h-full object-cover"
            src="https://api.dicebear.com/9.x/initials/svg?seed=User&backgroundColor=6366f1&color=fff"
          />
        </div>
      </div>
    </header>
  );
}
