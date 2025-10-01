import React, { createContext, useState, useEffect, useContext } from 'react';
import { getRecipes, createRecipe, updateRecipe, deleteRecipe } from '@/api/recipes';

// Datos de fallback para cuando la API falle o para la carga inicial
const FALLBACK_RECIPES = [
  { id: 'sample-1', title: 'Pasta Mediterránea', description: 'Deliciosa pasta con aceitunas, tomates cherry y queso feta', cuisine_type: 'mediterranean', difficulty: 'easy', prep_time: 15, cook_time: 20, servings: 4, meal_category: 'dinner' },
  { id: 'sample-2', title: 'Tacos Veganos', description: 'Tacos saludables con proteína vegetal y vegetales frescos', cuisine_type: 'mexican', difficulty: 'easy', prep_time: 10, cook_time: 15, servings: 2, meal_category: 'lunch' },
  { id: 'sample-3', title: 'Risotto de Champiñones', description: 'Cremoso risotto con champiñones salteados y parmesano', cuisine_type: 'italian', difficulty: 'medium', prep_time: 10, cook_time: 25, servings: 4, meal_category: 'dinner' }
];

const RecipeContext = createContext({
  recipes: [],
  loading: true,
  error: null,
  refetch: () => {},
});

export const useRecipes = () => useContext(RecipeContext);

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const recipeData = await Recipe.list('-created_date');
      setRecipes(recipeData && recipeData.length > 0 ? recipeData : FALLBACK_RECIPES);
    } catch (err) {
      console.error("Fallo al cargar recetas, usando datos de respaldo:", err);
      setError(err);
      setRecipes(FALLBACK_RECIPES); // Proporcionar datos de respaldo en caso de error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const value = { recipes, loading, error, refetch: fetchRecipes };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};