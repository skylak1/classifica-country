
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, BarChart3, Shield, LogOut } from "lucide-react";
import { PlayerManagement } from "@/components/PlayerManagement";
import { MatchRegistration } from "@/components/MatchRegistration";
import { Rankings } from "@/components/Rankings";
import { AdminDashboard } from "@/components/AdminDashboard";
import { PasswordProtection } from "@/components/PasswordProtection";
import { useToast } from "@/hooks/use-toast";

type ActiveTab = 'rankings' | 'players' | 'matches' | 'admin';

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
    if (protectedSections.includes(tab) && !isAuthenticated) {
      // Non cambiare tab, mostra il componente di protezione
      setActiveTab(tab);
    } else {
      setActiveTab(tab);
    }
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
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
    // Se la sezione è protetta e l'utente non è autenticato, mostra il componente di protezione
    if (protectedSections.includes(activeTab) && !isAuthenticated) {
      return (
        <PasswordProtection
          onAuthenticated={handleAuthenticated}
          sectionName={getSectionName(activeTab)}
        />
      );
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
              <Button
                variant={activeTab === 'players' ? 'default' : 'ghost'}
                onClick={() => handleTabChange('players')}
                className="relative"
              >
                <Users className="h-4 w-4 mr-2" />
                Giocatori
                {protectedSections.includes('players') && (
                  <Shield className="h-3 w-3 ml-1 text-amber-600" />
                )}
              </Button>
              <Button
                variant={activeTab === 'matches' ? 'default' : 'ghost'}
                onClick={() => handleTabChange('matches')}
                className="relative"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Partite
                {protectedSections.includes('matches') && (
                  <Shield className="h-3 w-3 ml-1 text-amber-600" />
                )}
              </Button>
              <Button
                variant={activeTab === 'admin' ? 'default' : 'ghost'}
                onClick={() => handleTabChange('admin')}
                className="relative"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin
                {protectedSections.includes('admin') && (
                  <Shield className="h-3 w-3 ml-1 text-amber-600" />
                )}
              </Button>
              {isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="ml-2"
                  title="Logout dalle sezioni protette"
                >
                  <LogOut className="h-4 w-4" />
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
          <Button
            size="sm"
            variant={activeTab === 'players' ? 'default' : 'ghost'}
            onClick={() => handleTabChange('players')}
            className="whitespace-nowrap relative"
          >
            <Users className="h-4 w-4 mr-1" />
            Giocatori
            {protectedSections.includes('players') && (
              <Shield className="h-3 w-3 ml-1 text-amber-600" />
            )}
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'matches' ? 'default' : 'ghost'}
            onClick={() => handleTabChange('matches')}
            className="whitespace-nowrap relative"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Partite
            {protectedSections.includes('matches') && (
              <Shield className="h-3 w-3 ml-1 text-amber-600" />
            )}
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'admin' ? 'default' : 'ghost'}
            onClick={() => handleTabChange('admin')}
            className="whitespace-nowrap relative"
          >
            <Shield className="h-4 w-4 mr-1" />
            Admin
            {protectedSections.includes('admin') && (
              <Shield className="h-3 w-3 ml-1 text-amber-600" />
            )}
          </Button>
          {isAuthenticated && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              className="whitespace-nowrap"
              title="Logout dalle sezioni protette"
            >
              <LogOut className="h-4 w-4" />
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
