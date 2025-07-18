
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, BarChart3, Shield } from "lucide-react";
import { PlayerManagement } from "@/components/PlayerManagement";
import { MatchRegistration } from "@/components/MatchRegistration";
import { Rankings } from "@/components/Rankings";
import { AdminDashboard } from "@/components/AdminDashboard";

type ActiveTab = 'rankings' | 'players' | 'matches' | 'admin';

const Index = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('rankings');

  const renderContent = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-800">Tennis Pro Rankings</h1>
                <p className="text-sm text-green-600">Sistema di Classifica ATP</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={activeTab === 'rankings' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('rankings')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Classifica
              </Button>
              <Button
                variant={activeTab === 'players' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('players')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Users className="h-4 w-4 mr-2" />
                Giocatori
              </Button>
              <Button
                variant={activeTab === 'matches' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('matches')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Partite
              </Button>
              <Button
                variant={activeTab === 'admin' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('admin')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-green-200 px-4 py-2">
        <div className="flex gap-1 overflow-x-auto">
          <Button
            size="sm"
            variant={activeTab === 'rankings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('rankings')}
            className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
          >
            <Trophy className="h-4 w-4 mr-1" />
            Classifica
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'players' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('players')}
            className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
          >
            <Users className="h-4 w-4 mr-1" />
            Giocatori
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'matches' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('matches')}
            className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Partite
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'admin' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('admin')}
            className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
          >
            <Shield className="h-4 w-4 mr-1" />
            Admin
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-5 w-5" />
            <span className="font-semibold">Tennis Pro Rankings</span>
          </div>
          <p className="text-green-200">Sistema professionale di gestione classifiche tennis ATP</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
