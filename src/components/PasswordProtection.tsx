import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordProtectionProps {
  onAuthenticated: () => void;
  sectionName: string;
}

const ADMIN_PASSWORD = "admin123";

export const PasswordProtection = ({ onAuthenticated, sectionName }: PasswordProtectionProps) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simula una piccola delay per migliorare UX
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        // Salva l'autenticazione in localStorage
        localStorage.setItem("tennis_admin_auth", "true");
        onAuthenticated();
        toast({
          title: "Accesso consentito",
          description: `Benvenuto nella sezione ${sectionName}`,
        });
      } else {
        toast({
          title: "Password errata",
          description: "Inserisci la password corretta per accedere",
          variant: "destructive",
        });
        setPassword("");
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Accesso Protetto</CardTitle>
          <CardDescription>
            Inserisci la password per accedere alla sezione <strong>{sectionName}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Inserisci password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? (
                <>
                  <Lock className="h-4 w-4 mr-2 animate-spin" />
                  Verifica in corso...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Accedi
                </>
              )}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Nota:</strong> Inserisci la password per accedere alle funzioni amministrative e di gestione del sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};