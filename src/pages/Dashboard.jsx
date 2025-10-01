import React, { useState, useEffect } from "react";
import { getCurrentUser } from '@/api/user';
import { getMealPlansByUser } from '@/api/mealPlans';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Calendar, 
  ChefHat, 
  ShoppingCart, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
  AlertCircle,
  LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { startOfWeek } from 'date-fns';
import { useRecipes } from "@/components/providers/RecipeProvider";

// QA-01 & QA-03: Datos de muestra consistentes para Modo Invitado
const GUEST_MODE_DATA = {
  totalRecipes: 25,
  weeklyPlans: 0,
  favorites: 0,
  weeklyBudget: 50,
  householdSize: 1,
  sampleRecipes: [
    { 
      id: '1', 
      title: 'Pasta Mediterránea', 
      cuisine_type: 'mediterranean',
      description: 'Deliciosa pasta con aceitunas, tomates cherry y queso feta'
    },
    { 
      id: '2', 
      title: 'Tacos Veganos', 
      cuisine_type: 'mexican',
      description: 'Tacos saludables con proteína vegetal y vegetales frescos'
    },
    { 
      id: '3', 
      title: 'Risotto de Champiñones', 
      cuisine_type: 'italian',
      description: 'Cremoso risotto con champiñones salteados y parmesano'
    }
  ]
};

export default function Dashboard() {
  const { recipes, loading: recipesLoading, error: recipesError } = useRecipes();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(GUEST_MODE_DATA);
  const [contentLoading, setContentLoading] = useState(false); // Separar loading de contenido inicial
  const [isGuestMode, setIsGuestMode] = useState(true);
  const [showLoginBanner, setShowLoginBanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Carga inmediata del contenido básico
    setStats(prev => ({
      ...prev,
      totalRecipes: recipes.length || GUEST_MODE_DATA.totalRecipes,
      sampleRecipes: recipes.slice(0, 3).length > 0 ? recipes.slice(0, 3) : GUEST_MODE_DATA.sampleRecipes
    }));
    setIsGuestMode(true);
    
    // Autenticación y datos en segundo plano
    const loadUserData = async () => {
      setContentLoading(true);
      try {
        const userData = await User.me();
        
        if (!userData.onboarding_completed) {
          navigate(createPageUrl("Onboarding"));
          return;
        }

        // Cargar datos del usuario de forma no bloqueante
        const today = new Date();
        const weekStartDate = startOfWeek(today, { weekStartsOn: 1 }); 
        const weekStart = weekStartDate.toISOString().split('T')[0];
        
        // Solo cargar planes de comida, las recetas ya están en el proveedor
        const mealPlans = await MealPlan.filter({ week_start: weekStart, created_by: userData.email }).catch(() => []);

        setStats({
          totalRecipes: recipes.length || GUEST_MODE_DATA.totalRecipes,
          weeklyPlans: mealPlans.length,
          favorites: userData.favorite_recipes?.length || 0,
          weeklyBudget: userData.weekly_budget || 50,
          householdSize: userData.household_size || 1,
          sampleRecipes: recipes.slice(0, 3).length > 0 ? recipes.slice(0, 3) : GUEST_MODE_DATA.sampleRecipes
        });
        
        setUser(userData);
        setIsGuestMode(false);
      } catch (error) {
        console.log("Modo invitado activo");
        setShowLoginBanner(true);
      } finally {
        setContentLoading(false);
      }
    };

    // Ejecutar después de que el componente se haya montado
    setTimeout(loadUserData, 100);
  }, [navigate, recipes]); // Añadir 'recipes' como dependencia

  const handleLogin = async () => {
    try {
      await User.loginWithRedirect(window.location.href);
    } catch (error) {
      console.error("Error al redirigir al login:", error);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, onClick, disabled = false, loading = false }) => {
    if (loading) {
      return <Card className="animate-pulse"><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>;
    }
    
    return (
      <Card className={`transition-all duration-300 ${!disabled ? 'hover-lift cursor-pointer' : 'opacity-60'}`} onClick={!disabled ? onClick : undefined}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <div className={`p-2 rounded-xl ${color} bg-opacity-10`}>
            <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </CardContent>
      </Card>
    );
  };

  const QuickAction = ({ title, description, icon: Icon, color, onClick, disabled = false }) => (
    <div 
      className={`p-6 glass-effect rounded-2xl transition-all duration-300 border border-gray-200/50 ${!disabled ? 'hover-lift cursor-pointer' : 'opacity-60'}`}
      onClick={!disabled ? onClick : undefined}
    >
      <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className={`flex items-center text-sm font-medium ${!disabled ? 'text-teal-600' : 'text-gray-400'}`}>
        {disabled ? 'Inicia sesión para usar' : 'Comenzar'} <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  );

  const welcomeName = user?.first_name || 'Invitado';

  if (recipesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recipesError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error de Conexión</h2>
        <p className="text-gray-600 mb-4">No pudimos cargar la aplicación. Es posible que hayas superado el límite de solicitudes.</p>
        <p className="text-gray-600">Por favor, espera un momento y recarga la página.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
      {/* Banner de login optimizado */}
      {showLoginBanner && isGuestMode && (
        <Card className="mb-6 bg-gradient-to-r from-teal-50 to-green-50 border-teal-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-full">
                <Sparkles className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-teal-800 text-sm font-medium">¡Descubre todo el potencial de Fresco!</p>
                <p className="text-teal-600 text-xs">Inicia sesión para planificar menús, guardar favoritos y más</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleLogin} 
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowLoginBanner(false)}
                className="text-teal-600"
              >
                Más tarde
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido principal - sin skeleton de carga inicial */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Hola, {welcomeName}! 👋
        </h1>
        <p className="text-gray-600">
          {isGuestMode 
            ? "Explora recetas deliciosas y descubre cómo Fresco puede ayudarte a cocinar mejor"
            : "¿Qué vas a cocinar hoy? Organiza tu semana y ahorra tiempo y dinero"
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Plan Semanal"
          value={stats.weeklyPlans}
          subtitle="comidas planificadas"
          icon={Calendar}
          color="bg-teal-600"
          onClick={() => navigate(createPageUrl("WeeklyPlanner"))}
          disabled={isGuestMode}
          loading={contentLoading && !isGuestMode}
        />
        <StatCard
          title="Recetas Disponibles"
          value={stats.totalRecipes}
          subtitle="recetas en la biblioteca"
          icon={BookOpen}
          color="bg-orange-500"
          onClick={() => navigate(createPageUrl("Recipes"))}
        />
        <StatCard
          title="Presupuesto Semanal"
          value={`€${stats.weeklyBudget}`}
          subtitle="para esta semana"
          icon={DollarSign}
          color="bg-green-600"
          onClick={() => navigate(createPageUrl("Profile"))}
          disabled={isGuestMode}
        />
        <StatCard
          title="Personas en Casa"
          value={stats.householdSize}
          subtitle="miembros del hogar"
          icon={Users}
          color="bg-purple-600"
          onClick={() => navigate(createPageUrl("Profile"))}
          disabled={isGuestMode}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickAction
            title="Planificar Semana"
            description="Organiza tus comidas para los próximos 7 días"
            icon={Calendar}
            color="bg-teal-600"
            onClick={() => navigate(createPageUrl("WeeklyPlanner"))}
            disabled={isGuestMode}
          />
          <QuickAction
            title="Explorar Recetas"
            description="Descubre nuevas recetas adaptadas a ti"
            icon={ChefHat}
            color="bg-orange-500"
            onClick={() => navigate(createPageUrl("Recipes"))}
          />
          <QuickAction
            title="Lista de Compras"
            description="Genera tu lista automáticamente"
            icon={ShoppingCart}
            color="bg-green-600"
            onClick={() => navigate(createPageUrl("ShoppingList"))}
            disabled={isGuestMode}
          />
        </div>
      </div>

      {/* Sample Recipes Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {isGuestMode ? "Recetas Populares" : "Tus Últimas Recetas"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.sampleRecipes.map((recipe, index) => (
            <Card key={recipe.id || index} className="hover-lift cursor-pointer" onClick={() => navigate(createPageUrl("Recipes"))}>
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-teal-100 flex items-center justify-center relative overflow-hidden">
                <ChefHat className="w-12 h-12 text-teal-600" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900">{recipe.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{recipe.description}</p>
                <p className="text-xs text-gray-500 capitalize">{recipe.cuisine_type}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}