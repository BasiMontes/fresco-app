import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getMealPlansByUser, createMealPlan, updateMealPlan, deleteMealPlan } from '@/api/mealPlans';
import { getCurrentUser, onAuthStateChanged } from '@/api/user';
import { format, startOfWeek } from 'date-fns';

const MealPlanContext = createContext({
  currentWeekPlan: null,
  loading: false,
  error: null,
  refetch: () => {},
  updatePlan: () => {},
  addMealToPlan: () => {},
});

export const useMealPlan = () => useContext(MealPlanContext);

export const MealPlanProvider = ({ children }) => {
  const [currentWeekPlan, setCurrentWeekPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const getCurrentWeekStart = () => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return format(weekStart, 'yyyy-MM-dd');
  };

  const fetchCurrentWeekPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener usuario primero
      const userData = await User.me();
      setUser(userData);
      
      const weekStartDate = getCurrentWeekStart();
      const plans = await MealPlan.filter({
        week_start: weekStartDate,
        created_by: userData.email
      });

      if (plans.length > 0) {
        setCurrentWeekPlan(plans[0]);
      } else {
        setCurrentWeekPlan(null);
      }
    } catch (err) {
      console.error("Error fetching meal plan:", err);
      setError(err);
      setCurrentWeekPlan(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlan = async (updatedMeals) => {
    if (!user) return;
    
    try {
      const weekStartDate = getCurrentWeekStart();
      
      if (currentWeekPlan) {
        // Actualizar plan existente
        const updated = await MealPlan.update(currentWeekPlan.id, { 
          meals: updatedMeals,
          status: 'active'
        });
        setCurrentWeekPlan(updated);
      } else {
        // Crear nuevo plan
        const created = await MealPlan.create({
          week_start: weekStartDate,
          meals: updatedMeals,
          status: 'planning'
        });
        setCurrentWeekPlan(created);
      }
    } catch (err) {
      console.error("Error updating meal plan:", err);
      setError(err);
    }
  };

  const addMealToPlan = async (recipeId, date, mealType, servings = 1) => {
    if (!user) return;

    try {
      const dateKey = format(date, 'yyyy-MM-dd');
      const currentMeals = currentWeekPlan?.meals || [];
      
      // Filtrar comida existente para ese día y tipo
      const filteredMeals = currentMeals.filter(m => 
        !(m.date === dateKey && m.meal_type === mealType)
      );
      
      // Añadir nueva comida
      const newMeal = {
        date: dateKey,
        meal_type: mealType,
        recipe_id: recipeId,
        servings: servings
      };
      
      const updatedMeals = [...filteredMeals, newMeal];
      await updatePlan(updatedMeals);
      
    } catch (err) {
      console.error("Error adding meal to plan:", err);
      setError(err);
    }
  };

  useEffect(() => {
    fetchCurrentWeekPlan();
  }, [fetchCurrentWeekPlan]);

  const value = {
    currentWeekPlan,
    loading,
    error,
    refetch: fetchCurrentWeekPlan,
    updatePlan,
    addMealToPlan,
    hasActivePlan: !!(currentWeekPlan?.meals?.length > 0)
  };

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  );
};