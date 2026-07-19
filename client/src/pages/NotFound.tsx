import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Home } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center px-4 animate-fade-up">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 mb-8">
          <Search className="h-10 w-10 text-primary" />
        </div>

        <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-foreground/10 select-none">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-4">
          Page non trouvée
        </h2>

        <p className="text-muted-foreground mt-3 max-w-sm mx-auto leading-relaxed">
          La page que vous recherchez n'existe pas ou a été déplacée. 
          Vérifiez l'URL ou explorez nos services.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link to="/">
            <Button className="shadow-sm">
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          <Link to="/services">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Explorer les services
            </Button>
          </Link>
        </div>

        <div className="mt-10 max-w-xs mx-auto">
          <p className="text-xs text-muted-foreground mb-2">Ou recherchez directement</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher un service..."
              className="pl-9 h-10 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
