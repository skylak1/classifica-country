
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, BarChart3, Shield, LogOut, Lock } from "lucide-react";
import { PlayerManagement } from "@/components/PlayerManagement";
import { MatchRegistration } from "@/components/MatchRegistration";
import { Rankings } from "@/components/Rankings";
import { AdminDashboard } from "@/components/AdminDashboard";
import { PasswordProtection } from "@/components/PasswordProtection";
import { useToast } from "@/hooks/use-toast";

type ActiveTab = 'rankings' | 'players' | 'matches' | 'admin' | 'login';

const Index = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('rankings');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Controlla se l'utente è già autenticato
    const authStatus = localStorage.getItem("tennis_admin_auth");
    setIsAuthenticated(authStatus === "true");
  }, []);

  const protectedSections: ActiveTab[] = ['players', 'matches', 'admin'];

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    // Dopo l'autenticazione, torna alla classifica
    setActiveTab('rankings');
  };

  const handleLogout = () => {
    localStorage.removeItem("tennis_admin_auth");
    setIsAuthenticated(false);
    setActiveTab('rankings');
    toast({
      title: "Logout effettuato",
      description: "Sei stato disconnesso dalle sezioni protette",
    });
  };

  const getSectionName = (tab: ActiveTab) => {
    switch(tab) {
      case 'players': return 'Giocatori';
      case 'matches': return 'Partite';
      case 'admin': return 'Admin';
      default: return '';
    }
  };

  const renderContent = () => {
    // Se è la sezione login, mostra sempre il componente di protezione
    if (activeTab === 'login') {
      return (
        <PasswordProtection
          onAuthenticated={handleAuthenticated}
          sectionName="Admin"
        />
      );
    }

    // Se la sezione è protetta e l'utente non è autenticato, reindirizza alla classifica
    if (protectedSections.includes(activeTab) && !isAuthenticated) {
      setActiveTab('rankings');
      return <Rankings />;
    }

    switch(activeTab) {
      case 'rankings':
        return <Rankings />;
      case 'players':
        return <PlayerManagement />;
      case 'matches':
        return <MatchRegistration />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Rankings />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="/lovable-uploads/3bc61267-ab37-409e-816f-cd8142967548.png" 
                  alt="Tennis Country Club Alcamo" 
                  className="h-14 w-auto rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-white/50"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">Tennis Rankings</h1>
                <p className="text-sm text-primary/70">Sistema di Classifica Country Club</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={activeTab === 'rankings' ? 'default' : 'ghost'}
                onClick={() => handleTabChange('rankings')}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Classifica
              </Button>
              
              {/* Mostra i pulsanti protetti solo se autenticato */}
              {isAuthenticated && (
                <>
                  <Button
                    variant={activeTab === 'players' ? 'default' : 'ghost'}
                    onClick={() => handleTabChange('players')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Giocatori
                  </Button>
                  <Button
                    variant={activeTab === 'matches' ? 'default' : 'ghost'}
                    onClick={() => handleTabChange('matches')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Partite
                  </Button>
                  <Button
                    variant={activeTab === 'admin' ? 'default' : 'ghost'}
                    onClick={() => handleTabChange('admin')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </>
              )}
              
              {/* Pulsante di accesso/logout */}
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="ml-2"
                  title="Logout dalle sezioni protette"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={() => handleTabChange('login')}
                  className="ml-2 bg-amber-600 hover:bg-amber-700"
                  title="Accedi alle sezioni amministrative"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Accesso Admin
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-primary/20 px-4 py-2">
        <div className="flex gap-1 overflow-x-auto">
          <Button
            size="sm"
            variant={activeTab === 'rankings' ? 'default' : 'ghost'}
            onClick={() => handleTabChange('rankings')}
            className="whitespace-nowrap"
          >
            <Trophy className="h-4 w-4 mr-1" />
            Classifica
          </Button>
          
          {/* Mostra i pulsanti protetti solo se autenticato */}
          {isAuthenticated && (
            <>
              <Button
                size="sm"
                variant={activeTab === 'players' ? 'default' : 'ghost'}
                onClick={() => handleTabChange('players')}
                className="whitespace-nowrap"
              >
                <Users className="h-4 w-4 mr-1" />
                Giocatori
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'matches' ? 'default' : 'ghost'}
                onClick={() => handleTabChange('matches')}
                className="whitespace-nowrap"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Partite
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'admin' ? 'default' : 'ghost'}
                onClick={() => handleTabChange('admin')}
                className="whitespace-nowrap"
              >
                <Shield className="h-4 w-4 mr-1" />
                Admin
              </Button>
            </>
          )}
          
          {/* Pulsante di accesso/logout mobile */}
          {isAuthenticated ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              className="whitespace-nowrap"
              title="Logout dalle sezioni protette"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="default"
              onClick={() => handleTabChange('login')}
              className="whitespace-nowrap bg-amber-600 hover:bg-amber-700"
              title="Accedi alle sezioni amministrative"
            >
              <Lock className="h-4 w-4 mr-1" />
              Admin
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-5 w-5" />
            <span className="font-semibold">Tennis Rankings</span>
          </div>
          <p className="text-primary-foreground/80">Sistema di gestione classifiche tennis Country Club Alcamo</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
