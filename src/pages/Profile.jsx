import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { MealPlan } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton, StatsSkeleton } from "@/components/ui/skeleton";
import AuthWall from '../components/auth/AuthWall';
import {
  Utensils,
  Heart,
  BarChart3,
  Clock,
  Settings,
  Shield,
  HelpCircle,
  FileText,
  Loader2,
  History,
  ChevronRight,
  ArrowRight
} from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ menus: 0, favorites: 0, savings: 0, timeSaved: 0 });
  const [loading, setLoading] = useState(true);
  const [authFailed, setAuthFailed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        const userData = await User.me();
        setUser(userData);
        
        // CALCULAR ESTADÍSTICAS REALES (no más Math.random)
        const realStats = {
          menus: 0,
          favorites: userData.favorite_recipes?.length || 0,
          savings: null, // Eliminar hasta que podamos calcularlo
          timeSaved: null // Eliminar hasta que podamos calcularlo
        };

        // Cargar número real de planes de comida creados
        try {
          const userMealPlans = await MealPlan.filter({ created_by: userData.email });
          realStats.menus = userMealPlans.length;
        } catch (error) {
          console.warn("No se pudieron cargar los planes de comida para estadísticas");
        }

        setStats(realStats);
        setAuthFailed(false);
      } catch (error) {
        console.error("Error loading user data:", error);
        setAuthFailed(true);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  const StatCard = ({ value, label, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl text-center">
      <div className="p-3 bg-teal-100 rounded-full mb-2">
        <Icon className="w-5 h-5 text-teal-600" />
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <Card className="mb-6"><CardContent className="p-6"><div className="flex items-center gap-4 mb-6"><Skeleton className="w-16 h-16 rounded-full" /><div className="flex-1"><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-24" /></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Skeleton className="h-16" /><Skeleton className="h-16" /></div></CardContent></Card>
        <Card className="mb-6"><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><StatsSkeleton /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tu Perfil</h1>
      
      {authFailed ? (
        <AuthWall message="Necesitas iniciar sesión para ver tu perfil y estadísticas." />
      ) : (
        <>
          {/* User Info Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.first_name?.[0] || 'U'}{user?.last_name?.[0] || ''}
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">{user?.first_name || 'Usuario'} {user?.last_name || ''}</h2>
                    </div>
                    <p className="text-gray-500">@{user?.email?.split('@')[0]}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
      
          {/* Stats Card - SOLO MOSTRAR DATOS REALES */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Tus estadísticas</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <StatCard value={stats.menus} label="Menús creados" icon={Utensils} />
                <StatCard value={stats.favorites} label="Recetas favoritas" icon={Heart} />
                {/* ELIMINADO: Stats falsos de ahorro y tiempo hasta que podamos calcularlos de verdad */}
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <BarChart3 className="w-5 h-5" />
                    <span className="font-semibold">Próximamente</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Estamos preparando estadísticas de ahorro y tiempo para que puedas ver el valor real que Fresco te aporta. 
                  </p>
                </div>
                <Button variant="outline" className="w-full justify-between p-4 h-auto text-left" onClick={() => navigate(createPageUrl("MealHistory"))}>
                  <div className="flex items-center gap-3 overflow-hidden"><History className="w-5 h-5 text-teal-600 flex-shrink-0" /><div className="flex-1 min-w-0"><p className="font-semibold truncate">Historial de Menús</p><p className="text-xs text-gray-500 font-normal whitespace-normal">Consulta tus recetas de semanas anteriores</p></div></div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Preferencias</CardTitle></CardHeader>
            <CardContent>
              <div className="min-h-[60px] flex flex-wrap gap-2 items-start">
                {(user?.dietary_preferences || []).concat(user?.favorite_cuisines || []).length > 0 ? 
                  (user?.dietary_preferences || []).concat(user?.favorite_cuisines || []).slice(0, 12).map((pref, i) => (
                    <Badge key={i} variant="outline" className="capitalize text-teal-800 bg-teal-50 border-teal-200 py-2 px-3">{pref.replace(/_/g, ' ')}</Badge>
                  )) : <p className="text-gray-500">Aún no has definido tus preferencias.</p>
                }
              </div>
               <div className="pt-4 mt-4 border-t border-gray-200">
                <Button variant="outline" className="w-full justify-between" onClick={() => navigate(createPageUrl("Onboarding"))}>Actualizar Preferencias <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Help section is always visible */}
      <Card>
        <CardHeader><CardTitle>Ayuda</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-between p-4 h-auto text-left" onClick={() => navigate(createPageUrl("Settings"))} disabled={authFailed}><div className="flex items-center gap-3"><Settings className="w-5 h-5 text-teal-600" /><div><p className="font-semibold">Configuración</p></div></div><ChevronRight className="w-5 h-5 text-gray-400" /></Button>
            <Button variant="outline" className="justify-between p-4 h-auto text-left" onClick={() => navigate(createPageUrl("Privacy"))}><div className="flex items-center gap-3"><Shield className="w-5 h-5 text-teal-600" /><div><p className="font-semibold">Política de Privacidad</p></div></div><ChevronRight className="w-5 h-5 text-gray-400" /></Button>
            <Button variant="outline" className="justify-between p-4 h-auto text-left" onClick={() => navigate(createPageUrl("FAQ"))}><div className="flex items-center gap-3"><HelpCircle className="w-5 h-5 text-teal-600" /><div><p className="font-semibold">FAQ</p></div></div><ChevronRight className="w-5 h-5 text-gray-400" /></Button>
            <Button variant="outline" className="justify-between p-4 h-auto text-left" onClick={() => navigate(createPageUrl("Terms"))}><div className="flex items-center gap-3"><FileText className="w-5 h-5 text-teal-600" /><div><p className="font-semibold">Términos de Servicio</p></div></div><ChevronRight className="w-5 h-5 text-gray-400" /></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}