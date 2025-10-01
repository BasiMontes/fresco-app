
import React, { useState, useEffect } from 'react';
import { getMealPlansByUser, createMealPlan, updateMealPlan, deleteMealPlan } from '@/api/mealPlans';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RobustImage from "@/components/ui/robust-image";
import { Skeleton } from "@/components/ui/skeleton";
import RecipeDetailModal from "../components/recipes/RecipeDetailModal";
import RecipeSelectorModal from '../components/planner/RecipeSelectorModal';
import AuthWall from '../components/auth/AuthWall';
import {
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  AlertCircle
} from 'lucide-react';
import { format, addDays, startOfWeek, isToday, isSameDay, subDays, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRecipes } from '@/components/providers/RecipeProvider';
import { useAuth } from '@/components/providers/AuthProvider';

const MEAL_TYPES = [
  { id: "breakfast", label: "Desayuno" },
  { id: "lunch", label: "Almuerzo" },
  { id: "dinner", label: "Cena" }
];

// Datos de muestra para el planificador (funciona sin API)
const SAMPLE_MEAL_PLAN = {
  // week_start will be set dynamically based on currentWeekStart
  meals: [],
  status: 'planning'
};

export default function WeeklyPlanner() {
  // Empezar siempre en el día actual
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mealPlan, setMealPlan] = useState(null);
  
  // Estados locales para interacciones de UI
  const [generating, setGenerating] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Hooks de proveedores de datos
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const { recipes, loading: recipesLoading, error: recipesError } = useRecipes();

  // Calcular las 3 semanas permitidas
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const previousWeekStart = subWeeks(currentWeekStart, 1);
  const nextWeekStart = addWeeks(currentWeekStart, 1);
  
  // Rango completo permitido: desde lunes de semana pasada hasta domingo de semana siguiente
  const minAllowedDate = previousWeekStart;
  const maxAllowedDate = addDays(nextWeekStart, 6); // domingo de semana siguiente

  useEffect(() => {
    // La carga de datos ahora depende del estado de autenticación
    const loadInitialData = async () => {
      if (isLoggedIn && user) {
        const weekStartDateFormatted = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const cacheKey = `meal_plan_${weekStartDateFormatted}_${user.email}`;
        const cachedPlan = localStorage.getItem(cacheKey);

        if (cachedPlan) {
          try {
            const parsedPlan = JSON.parse(cachedPlan);
            if (parsedPlan.week_start === weekStartDateFormatted) {
              setMealPlan(parsedPlan);
            } else {
              setMealPlan({ ...SAMPLE_MEAL_PLAN, week_start: weekStartDateFormatted });
              localStorage.removeItem(cacheKey);
            }
          } catch (e) {
            console.error("Error parsing cached meal plan:", e);
            setMealPlan({ ...SAMPLE_MEAL_PLAN, week_start: weekStartDateFormatted });
            localStorage.removeItem(cacheKey);
          }
        } else {
          setMealPlan({ ...SAMPLE_MEAL_PLAN, week_start: weekStartDateFormatted });
        }
      } else if (!authLoading) {
        setMealPlan(null);
      }
    };
    
    if (!recipesLoading) {
      loadInitialData();
    }
  }, [currentDate, recipesLoading, isLoggedIn, user, authLoading]);

  const generateWeekPlan = async (targetWeekStart = null) => {
    // AuthWall handles non-logged-in state, so we don't need a specific check here.
    if (!user) {
      console.warn("Attempted to generate plan without user context.");
      return;
    }

    setGenerating(true);
    try {
      // Si no se especifica una semana, usar la semana que está viendo actualmente
      const selectedWeekStart = targetWeekStart || startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekDays = Array.from({ length: 7 }, (_, i) => addDays(selectedWeekStart, i));
      const mealTypes = ['breakfast', 'lunch', 'dinner'];

      const getRecipeFor = (mealType) => {
        const filtered = recipes.filter(r => r.meal_category === mealType);
        return filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : null;
      };

      let newMeals = [];
      for (const date of weekDays) {
        for (const mealType of mealTypes) {
          const recipe = getRecipeFor(mealType);
          if (recipe) {
            newMeals.push({
              date: format(date, 'yyyy-MM-dd'),
              meal_type: mealType,
              recipe_id: recipe.id,
              servings: user?.household_size || 1
            });
          }
        }
      }

      const planData = {
        week_start: format(selectedWeekStart, 'yyyy-MM-dd'),
        meals: newMeals,
        status: 'active',
        created_by: user.email
      };

      setMealPlan(planData);
      const cacheKey = `meal_plan_${format(selectedWeekStart, 'yyyy-MM-dd')}_${user.email}`;
      localStorage.setItem(cacheKey, JSON.stringify(planData));

      try {
        const existingPlans = await MealPlan.filter({ week_start: planData.week_start, created_by: user.email });
        if (existingPlans.length > 0) {
          const updatedPlan = await MealPlan.update(existingPlans[0].id, planData);
          setMealPlan(updatedPlan);
          localStorage.setItem(cacheKey, JSON.stringify(updatedPlan));
        } else {
          const newPlan = await MealPlan.create(planData);
          setMealPlan(newPlan);
          localStorage.setItem(cacheKey, JSON.stringify(newPlan));
        }
      } catch (apiError) {
        console.warn("Plan generado y guardado localmente. No se pudo sincronizar con el servidor:", apiError);
      }

      setShowGenerateModal(false);
    } catch (error) {
      console.error("Error generando el plan semanal:", error);
    } finally {
      setGenerating(false);
    }
  };

  const generateSingleDay = async (targetDate) => {
    if (!user) {
      console.warn("Attempted to generate single day plan without user context.");
      return;
    }

    setGenerating(true);
    try {
      const selectedWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const mealTypes = ['breakfast', 'lunch', 'dinner'];

      const getRecipeFor = (mealType) => {
        const filtered = recipes.filter(r => r.meal_category === mealType);
        return filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : null;
      };

      // Generar solo para un día específico
      let newMealsForDay = [];
      for (const mealType of mealTypes) {
        const recipe = getRecipeFor(mealType);
        if (recipe) {
          newMealsForDay.push({
            date: format(targetDate, 'yyyy-MM-dd'),
            meal_type: mealType,
            recipe_id: recipe.id,
            servings: user?.household_size || 1
          });
        }
      }

      // Obtener plan actual y reemplazar solo las comidas de ese día
      const weekStartKey = format(selectedWeekStart, 'yyyy-MM-dd');
      const cacheKey = `meal_plan_${weekStartKey}_${user.email}`;

      let currentPlanFromCache = null;
      try {
        const cachedPlan = localStorage.getItem(cacheKey);
        if (cachedPlan) {
          currentPlanFromCache = JSON.parse(cachedPlan);
        }
      } catch (e) {
        console.error("Error parsing cached meal plan for single day generation:", e);
      }

      let existingMeals = (currentPlanFromCache?.meals || []).filter(meal => 
        meal.date !== format(targetDate, 'yyyy-MM-dd')
      );

      const allMeals = [...existingMeals, ...newMealsForDay];
      
      const planData = {
        id: currentPlanFromCache?.id, // Preserve existing ID if updating
        week_start: weekStartKey,
        meals: allMeals,
        status: 'active',
        created_by: user.email
      };

      setMealPlan(planData); // Update local state immediately
      localStorage.setItem(cacheKey, JSON.stringify(planData)); // Update local storage immediately

      // Sincronizar con base de datos
      try {
        const existingPlansFromDB = await MealPlan.filter({ week_start: weekStartKey, created_by: user.email });
        if (existingPlansFromDB.length > 0) {
          const updatedPlan = await MealPlan.update(existingPlansFromDB[0].id, { meals: allMeals, status: 'active' });
          setMealPlan(updatedPlan);
          localStorage.setItem(cacheKey, JSON.stringify(updatedPlan));
        } else {
          const newPlan = await MealPlan.create(planData); // Create new plan if none existed for this week
          setMealPlan(newPlan);
          localStorage.setItem(cacheKey, JSON.stringify(newPlan));
        }
      } catch (apiError) {
        console.warn("Cambios guardados localmente. No se pudo sincronizar con el servidor:", apiError);
      }

      setShowGenerateModal(false);
      setCurrentDate(targetDate); // Navigate to the generated day
    } catch (error) {
      console.error("Error generando día:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleAddRecipeToMeal = async (recipeId, date, mealType) => {
    if (!user) {
      console.warn("Attempted to add recipe without user context.");
      return;
    }

    try {
      const dateKey = format(date, 'yyyy-MM-dd');
      const selectedWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const currentPlan = mealPlan || { 
        ...SAMPLE_MEAL_PLAN, 
        week_start: format(selectedWeekStart, 'yyyy-MM-dd'),
        created_by: user.email
      };
      
      const otherMeals = currentPlan.meals.filter(meal =>
        !(meal.date === dateKey && meal.meal_type === mealType)
      );

      const updatedMeals = [...otherMeals, {
        date: dateKey,
        meal_type: mealType,
        recipe_id: recipeId,
        servings: user?.household_size || 1
      }];

      const planData = {
        ...currentPlan,
        meals: updatedMeals,
        status: 'active'
      };

      setMealPlan(planData);
      const cacheKey = `meal_plan_${format(selectedWeekStart, 'yyyy-MM-dd')}_${user.email}`;
      localStorage.setItem(cacheKey, JSON.stringify(planData));

      try {
        if (planData.id) {
          await MealPlan.update(planData.id, { meals: planData.meals, status: 'active' });
        } else {
          const existingPlans = await MealPlan.filter({ 
            week_start: planData.week_start, 
            created_by: user.email 
          });
          if (existingPlans.length > 0) {
            await MealPlan.update(existingPlans[0].id, { meals: planData.meals, status: 'active' });
            setMealPlan(prev => prev ? { ...prev, id: existingPlans[0].id } : null);
            localStorage.setItem(cacheKey, JSON.stringify({...planData, id: existingPlans[0].id}));
          } else {
            const newPlan = await MealPlan.create(planData);
            setMealPlan(newPlan);
            localStorage.setItem(cacheKey, JSON.stringify(newPlan));
          }
        }
      } catch (apiError) {
        console.warn("Cambios guardados localmente. No se pudo sincronizar con el servidor:", apiError);
      }

      setIsSelectorOpen(false);
    } catch (error) {
      console.error("Error añadiendo receta al plan:", error);
    }
  };

  const handleOpenRecipeSelector = (mealType, date) => {
    if (!isLoggedIn) return;
    setSelectedMealType(mealType);
    setCurrentDate(date);
    setIsSelectorOpen(true);
  };

  // Nueva lógica de navegación: permite movimiento entre las 3 semanas
  const handleDateChange = (direction) => {
    const newDate = direction === 1 ? addDays(currentDate, 1) : subDays(currentDate, 1);
    
    // Verificar que la nueva fecha esté dentro del rango permitido (3 semanas)
    if (newDate >= minAllowedDate && newDate <= maxAllowedDate) {
      setCurrentDate(newDate);
    }
  };

  // Mostrar 7 días de la semana actual seleccionada
  const selectedWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const visibleDays = Array.from({ length: 7 }, (_, i) => addDays(selectedWeekStart, i));

  // Ensure mealPlan is not null before accessing its meals property
  const mealsForCurrentDate = (mealPlan?.meals || []).filter(m =>
    m.date === format(currentDate, 'yyyy-MM-dd')
  ) || [];

  // Determinar qué semanas están disponibles para generar
  const getAvailableWeeks = () => {
    const weeks = [];
    const currentWeek = startOfWeek(today, { weekStartsOn: 1 });
    const nextWeek = addWeeks(currentWeek, 1);

    // Solo mostrar semanas futuras o actual (no generar planes para el pasado)
    if (format(currentWeek, 'yyyy-MM-dd') <= format(maxAllowedDate, 'yyyy-MM-dd')) {
      weeks.push({
        start: currentWeek,
        label: "Esta semana",
        sublabel: `${format(currentWeek, 'dd MMM', { locale: es })} - ${format(addDays(currentWeek, 6), 'dd MMM', { locale: es })}`
      });
    }

    if (format(nextWeek, 'yyyy-MM-dd') <= format(maxAllowedDate, 'yyyy-MM-dd')) {
      weeks.push({
        start: nextWeek,
        label: "Próxima semana", 
        sublabel: `${format(nextWeek, 'dd MMM', { locale: es })} - ${format(addDays(nextWeek, 6), 'dd MMM', { locale: es })}`
      });
    }

    return weeks;
  };

  // Determinar qué días están disponibles para generar individualmente
  const getAvailableDays = () => {
    const days = [];
    const today = new Date();
    
    // Próximos 7 días desde hoy
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      days.push({
        date: date,
        label: format(date, 'EEEE d', { locale: es }),
        sublabel: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : format(date, 'MMM', { locale: es })
      });
    }
    
    return days;
  };

  if (authLoading || recipesLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 md:pb-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-24 w-full mb-6" />
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="w-10 h-10" />
          <div className="flex-1 grid grid-cols-7 gap-2">
            {[1,2,3,4,5,6,7].map(i => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
          <Skeleton className="w-10 h-10" />
        </div>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthWall message="Necesitas iniciar sesión para ver y gestionar tu calendario de comidas." />;
  }

  if (recipesError) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error de Conexión</h2>
          <p className="text-gray-600 mb-4">No pudimos cargar los datos de las recetas. Es posible que hayas superado el límite de solicitudes.</p>
          <p className="text-gray-600">Por favor, espera un momento y vuelve a intentarlo más tarde.</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 md:pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Calendario</h1>
          <p className="text-gray-600">Organiza tus comidas de forma inteligente</p>
        </div>

        {/* Generate Plan Card */}
        <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white mb-6">
          <CardContent className="p-4 md:p-6 text-center">
            <Button
              onClick={() => setShowGenerateModal(true)}
              disabled={generating}
              className="bg-white text-teal-600 hover:bg-gray-100 font-semibold px-6 py-2 rounded-lg mb-3"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generar plan
                </>
              )}
            </Button>
            <p className="text-sm text-teal-100 leading-relaxed">
              <strong>Usando tu perfil y preferencias:</strong> La IA selecciona recetas según tus restricciones dietéticas, cocinas favoritas y nivel de experiencia. 
              <br className="hidden sm:block" />
              <span className="text-xs opacity-90">Distribuye automáticamente desayunos, almuerzos y cenas para una semana equilibrada.</span>
            </p>
          </CardContent>
        </Card>

        {/* Calendar Navigation - ESPACIADO MÓVIL MEJORADO */}
        <div className="flex items-center justify-between mb-6 gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDateChange(-1)}
            className="flex-shrink-0"
            disabled={isSameDay(currentDate, minAllowedDate)}
            title={isSameDay(currentDate, minAllowedDate) ? "No puedes retroceder más (límite: semana pasada)" : "Día anterior"}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex-1 grid grid-cols-7 gap-1 md:gap-2">
            {visibleDays.map((date) => {
              const isSelected = isSameDay(date, currentDate);
              const isCurrentDay = isToday(date);

              return (
                <Button
                  key={date.toString()}
                  variant="ghost"
                  className={`h-auto p-1 md:p-2 flex flex-col gap-1 transition-all duration-300 rounded-lg text-xs ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-lg'
                      : isCurrentDay
                        ? 'bg-orange-100 text-orange-800 border-2 border-orange-300 font-bold'
                        : 'bg-white text-gray-700 hover:bg-teal-50 hover:text-teal-700 border border-gray-200'
                  }`}
                  onClick={() => setCurrentDate(date)}
                >
                  <div className="font-medium capitalize opacity-80 text-xs md:text-sm">
                    {format(date, 'EEE', { locale: es })}
                  </div>
                  <div className="text-sm md:text-lg font-bold">
                    {format(date, 'd')}
                  </div>
                </Button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDateChange(1)}
            className="flex-shrink-0"
            disabled={isSameDay(currentDate, maxAllowedDate)}
            title={isSameDay(currentDate, maxAllowedDate) ? "No puedes avanzar más (límite: semana siguiente)" : "Día siguiente"}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Selected Day Display */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
            {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
          </h2>

          {/* Meals for Selected Day */}
          <div className="space-y-6">
            {MEAL_TYPES.map(mealType => {
              const plannedMeal = mealsForCurrentDate.find(m => m.meal_type === mealType.id);
              const recipe = plannedMeal ? recipes.find(r => r.id === plannedMeal.recipe_id) : null;

              return (
                <Card key={mealType.id} className="border-2 border-gray-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">{mealType.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recipe ? (
                      <div className="flex flex-col sm:flex-row gap-4">
                        <RobustImage
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="w-full sm:w-32 h-32 rounded-lg object-cover flex-shrink-0"
                          fallbackType="meal"
                        />
                        <div className="flex-1">
                          <h3
                            className="font-bold text-gray-800 cursor-pointer hover:text-teal-600"
                            onClick={() => setSelectedRecipe(recipe)}
                          >
                            {recipe.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{recipe.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3"/>
                              {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3"/>
                              {recipe.servings}
                            </span>
                          </div>
                        </div>
                        <div className="self-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenRecipeSelector(mealType.id, currentDate)}
                          >
                            Cambiar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 border-2 border-dashed rounded-lg">
                        <p className="text-gray-500 mb-2">No hay receta seleccionada</p>
                        <Button
                          size="sm"
                          onClick={() => handleOpenRecipeSelector(mealType.id, currentDate)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Añadir receta
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal para Generar Plan - MÁS COMPACTO */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto">
            {/* Header compacto */}
            <div className="text-center p-4 pb-2">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Generar Plan con IA
              </h3>
              <p className="text-gray-600 text-sm">
                ¿Qué quieres planificar?
              </p>
            </div>

            <div className="px-4 pb-4 space-y-3">
              {/* Opción: Generar Semana Completa - MÁS COMPACTO */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  📅 Generar plan semanal
                </h4>
                <p className="text-xs text-gray-600 mb-3">Genera 7 días completos (21 comidas)</p>
                <div className="space-y-2">
                  {getAvailableWeeks().map((week, index) => (
                    <button
                      key={index}
                      onClick={() => generateWeekPlan(week.start)}
                      disabled={generating}
                      className="w-full p-2 text-left border border-gray-200 rounded hover:border-teal-300 hover:bg-teal-50 transition-all text-sm"
                    >
                      <div className="font-medium text-gray-900">{week.label}</div>
                      <div className="text-xs text-gray-500">{week.sublabel}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Opción: Generar Día Específico - MÁS COMPACTO + MÁS DÍAS */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  🍽️ Generar plan de un día
                </h4>
                <p className="text-xs text-gray-600 mb-3">Genera solo las 3 comidas de un día específico</p>
                <div className="grid grid-cols-2 gap-1">
                  {getAvailableDays().map((day, index) => (
                    <button
                      key={index}
                      onClick={() => generateSingleDay(day.date)}
                      disabled={generating}
                      className="p-2 text-left border border-gray-200 rounded hover:border-teal-300 hover:bg-teal-50 transition-all text-sm"
                    >
                      <div className="font-medium text-gray-900 text-xs capitalize">{day.label}</div>
                      <div className="text-xs text-gray-500">{day.sublabel}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setShowGenerateModal(false)}
                disabled={generating}
                className="w-full"
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <RecipeSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        recipes={recipes}
        onSelectRecipe={(recipeId) => handleAddRecipeToMeal(recipeId, currentDate, selectedMealType)}
        mealType={selectedMealType}
      />

      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        user={user}
      />
    </>
  );
}
