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
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0qGxdHKhKAxvw6in1j8o-RPNH9mNVJZzTkMSQ_hDaLJ4DhQIJ4dLCSRj64RGLK9LBQQzlkjBxFj8WAIxLa9ZIrf9B9LurUxnb1l_ZMABa68canvq16hsumA6BcnNHN0FYkzqSzd8cNOQAaakIkkJxh-9TNKVe6RiT_bEVr9JkZIai0A_mr4VDYs86GQlXd_9hbTp76PsuQ6woNJv2YZyHtZ1utmDT6SrmmLi9whusOhkgQZ9iWg1qdQDsGMWMAjPRGbBhP7rhr5g"
          />
        </div>
      </div>
    </header>
  );
}
