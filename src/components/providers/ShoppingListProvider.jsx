
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { createShoppingList, getShoppingListsByUser } from '@/api/shoppingLists';
import { getMealPlansByUser, createMealPlan, updateMealPlan, deleteMealPlan } from '@/api/mealPlans';
import { getCurrentUser, onAuthStateChanged } from '@/api/user';
import { format, startOfWeek } from 'date-fns';
import { useRecipes } from './RecipeProvider';

const ShoppingListContext = createContext({
  currentWeekList: null,
  loading: false,
  error: null,
  hasMealPlan: false,
  generateList: () => {},
  updateItem: () => {},
  refetch: () => {},
});

export const useShoppingList = () => useContext(ShoppingListContext);

export const ShoppingListProvider = ({ children }) => {
  const { recipes } = useRecipes();
  const [currentWeekList, setCurrentWeekList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [hasMealPlan, setHasMealPlan] = useState(false);

  const getCurrentWeekStart = () => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return format(weekStart, 'yyyy-MM-dd');
  };

  const checkMealPlanAndLoadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await User.me();
      setUser(userData);
      
      const weekStartDate = getCurrentWeekStart();
      
      // 1. Verificar si hay plan de comidas
      const existingPlans = await MealPlan.filter({
        week_start: weekStartDate,
        created_by: userData.email
      });

      if (existingPlans.length > 0 && existingPlans[0].meals?.length > 0) {
        setHasMealPlan(true);
        
        // 2. Si hay plan, intentar cargar lista existente
        const existingList = await ShoppingList.filter({
          week_start: weekStartDate,
          created_by: userData.email
        });

        if (existingList.length > 0) {
          setCurrentWeekList(existingList[0]);
        } else {
          setCurrentWeekList(null);
        }
      } else {
        // No hay plan de comidas
        setHasMealPlan(false);
        setCurrentWeekList(null);
      }
      
    } catch (err) {
      console.error("Error checking meal plan and loading list:", err);
      setError(err);
      setHasMealPlan(false);
      setCurrentWeekList(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateList = async () => {
    if (!user || !hasMealPlan) return;

    try {
      const weekStartDate = getCurrentWeekStart();
      
      // Obtener plan de comidas actual
      const existingPlans = await MealPlan.filter({
        week_start: weekStartDate,
        created_by: user.email
      });

      if (existingPlans.length === 0 || !existingPlans[0].meals?.length) {
        throw new Error("No hay plan de comidas para generar lista");
      }

      const plan = existingPlans[0];
      const ingredientMap = new Map();

      // Procesar ingredientes de cada comida
      plan.meals.forEach(meal => {
        const recipe = recipes.find(r => r.id === meal.recipe_id);
        if (recipe?.ingredients) {
          recipe.ingredients.forEach(ingredient => {
            const key = ingredient.name.toLowerCase();
            
            if (ingredientMap.has(key)) {
              const existing = ingredientMap.get(key);
              existing.quantity += ingredient.quantity * (meal.servings || 1);
            } else {
              ingredientMap.set(key, {
                ingredient_name: ingredient.name,
                quantity: ingredient.quantity * (meal.servings || 1),
                unit: ingredient.unit,
                category: ingredient.category || 'other',
                estimated_price: getEstimatedPrice(ingredient.name),
                is_purchased: false
              });
            }
          });
        }
      });

      const items = Array.from(ingredientMap.values());
      const totalCost = items.reduce((sum, item) => sum + item.estimated_price, 0);

      const listData = {
        meal_plan_id: plan.id,
        week_start: weekStartDate,
        items: items,
        total_estimated_cost: totalCost,
        status: "pending"
      };

      // Crear o actualizar lista
      const existingList = await ShoppingList.filter({
        week_start: weekStartDate,
        created_by: user.email
      });

      let savedList;
      if (existingList.length > 0) {
        savedList = await ShoppingList.update(existingList[0].id, listData);
      } else {
        savedList = await ShoppingList.create(listData);
      }

      setCurrentWeekList(savedList);
      return savedList;
      
    } catch (err) {
      console.error("Error generating shopping list:", err);
      setError(err);
      throw err;
    }
  };

  const updateItem = async (itemIndex, updates) => {
    if (!currentWeekList) return;

    try {
      const updatedItems = [...currentWeekList.items];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updates };

      const updatedList = { ...currentWeekList, items: updatedItems };
      
      if (currentWeekList.id) {
        const saved = await ShoppingList.update(currentWeekList.id, { items: updatedItems });
        setCurrentWeekList(saved);
      } else {
        setCurrentWeekList(updatedList);
      }
      
    } catch (err) {
      console.error("Error updating shopping list item:", err);
      setError(err);
    }
  };

  // PRECIOS MÁS REALISTAS Y EXTENSOS
  const getEstimatedPrice = (ingredientName) => {
    const prices = {
      // Verduras y Hortalizas (por kg o manojo)
      "tomate": 2.20,
      "tomates cherry": 2.85,
      "cebolla": 1.20,
      "ajo": 5.50, // por kg, pero se usa poco
      "pimiento rojo": 2.50,
      "pimiento verde": 2.30,
      "pepino": 1.50,
      "lechuga": 1.10,
      "espinacas": 2.50, // bolsa
      "brócoli": 1.80,
      "zanahoria": 0.90,
      "patata": 1.30,
      "calabacín": 1.60,
      "berenjena": 1.70,
      "champiñones": 3.50, // bandeja

      // Frutas (por kg)
      "manzana": 1.90,
      "plátano": 1.60,
      "naranja": 1.40,
      "limón": 1.80,
      "fresas": 4.50, // temporada
      "aguacate": 4.80,

      // Carnes (por kg o bandeja)
      "pechuga de pollo": 7.50,
      "pollo entero": 4.00,
      "carne picada de ternera": 9.00,
      "filetes de ternera": 14.00,
      "lomo de cerdo": 7.00,
      "jamón serrano": 25.00,
      "jamón cocido": 9.50,

      // Pescado (por kg)
      "salmón": 15.00,
      "merluza": 12.00,
      "atún en lata": 4.00, // pack
      
      // Lácteos y huevos
      "leche": 1.15, // litro
      "queso curado": 13.00,
      "queso feta": 3.50,
      "yogur natural": 1.80, // pack 4
      "huevos": 2.50, // docena
      "mantequilla": 2.80,

      // Pan y Cereales
      "pan de molde": 1.50,
      "pan integral": 1.80,
      "arroz": 1.30,
      "arroz basmati": 2.20,
      "pasta": 1.10,
      "pasta integral": 1.50,
      "lentejas": 1.80,
      "garbanzos": 1.70,

      // Aceites y Especias
      "aceite de oliva virgen extra": 9.50, // litro
      "aceite de girasol": 2.50,
      "vinagre": 1.00,
      "sal": 0.50,
      "pimienta negra": 2.00,
      "pimentón": 1.50,
      
      // Otros
      "aceitunas negras": 1.95,
      "chocolate negro": 2.20,
      "café molido": 3.50
    };
    
    const lowerIngredient = ingredientName.toLowerCase();
    
    // Buscar coincidencia exacta o parcial
    const bestMatch = Object.keys(prices).find(key => lowerIngredient.includes(key));
    return bestMatch ? prices[bestMatch] : 2.50; // Precio por defecto si no se encuentra
  };

  useEffect(() => {
    checkMealPlanAndLoadList();
  }, [checkMealPlanAndLoadList]);

  const value = {
    currentWeekList,
    loading,
    error,
    hasMealPlan,
    generateList,
    updateItem,
    refetch: checkMealPlanAndLoadList,
  };

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
};
