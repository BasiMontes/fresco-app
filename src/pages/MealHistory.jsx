import React, { useState, useEffect } from "react";
import { MealPlan } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History, Calendar, Utensils, Loader2, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, parseISO, isAfter, startOfWeek, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { useRecipes } from "@/components/providers/RecipeProvider";
import RobustImage from "@/components/ui/robust-image";
import AuthWall from '../components/auth/AuthWall';

export default function MealHistory() {
  const { recipes, loading: recipesLoading } = useRecipes();
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMealHistory = async () => {
      setLoading(true);
      try {
        const userData = await User.me();
        
        // Cargar todos los planes de comida del usuario
        const allPlans = await MealPlan.filter({ created_by: userData.email });
        
        // Filtrar solo planes de semanas pasadas
        const today = new Date();
        const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
        
        const pastPlans = allPlans.filter(plan => {
          try {
            const planDate = parseISO(plan.week_start);
            return planDate < currentWeekStart && plan.meals.length > 0;
          } catch (error) {
            return false;
          }
        });
        
        // Ordenar por fecha más reciente primero
        pastPlans.sort((a, b) => {
          const dateA = parseISO(a.week_start);
          const dateB = parseISO(b.week_start);
          return dateB - dateA;
        });
        
        setMealPlans(pastPlans);
        setAuthFailed(false);
      } catch (error) {
        console.error("Error loading meal history:", error);
        setAuthFailed(true);
      } finally {
        setLoading(false);
      }
    };
    
    if (!recipesLoading) {
      loadMealHistory();
    }
  }, [recipesLoading]);

  const getRecipeById = (recipeId) => {
    return recipes.find(r => r.id === recipeId);
  };

  const getMealTypeLabel = (mealType) => {
    const labels = {
      breakfast: "Desayuno",
      lunch: "Almuerzo", 
      dinner: "Cena",
      snack: "Snack"
    };
    return labels[mealType] || mealType;
  };

  if (recipesLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-6">
          {[1,2,3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (authFailed) {
    return <AuthWall message="Necesitas iniciar sesión para ver tu historial de menús." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Profile"))}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <History className="w-6 md:w-8 h-6 md:h-8 text-teal-600" />
            Historial de Menús
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Consulta tus recetas y planes de semanas anteriores
          </p>
        </div>
      </div>

      {mealPlans.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No hay historial disponible
            </h3>
            <p className="text-gray-500 mb-6">
              Comienza a planificar tus comidas para crear tu historial
            </p>
            <div className="space-y-4">
              <Button 
                size="lg"
                onClick={() => navigate(createPageUrl("WeeklyPlanner"))}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 px-8 py-3"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Planificar Mi Primera Semana
              </Button>
              <p className="text-sm text-gray-500">
                Organiza tus comidas y empieza a ahorrar tiempo
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {mealPlans.map((plan) => (
            <Card key={plan.id} className="glass-effect border border-gray-200/50">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <Calendar className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        Semana del {format(parseISO(plan.week_start), "d 'de' MMMM, yyyy", { locale: es })}
                      </CardTitle>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-300 flex-shrink-0">
                    {plan.meals.length} comidas
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {plan.meals.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No hay comidas registradas para esta semana
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plan.meals.map((meal, index) => {
                      const recipe = getRecipeById(meal.recipe_id);
                      if (!recipe) return null;

                      return (
                        <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                          <RobustImage
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            fallbackType="meal"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{recipe.title}</p>
                            <p className="text-sm text-gray-600">{getMealTypeLabel(meal.meal_type)}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3"/>
                                {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3"/>
                                {meal.servings} pax
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}