
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RecipeSkeleton } from "@/components/ui/skeleton";
import {
  Search,
  SlidersHorizontal,
  Clock,
  Users,
  ChefHat,
  Heart,
  Plus,
  Sparkles,
  DollarSign,
  X,
  Loader2,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Toast } from "@/components/ui/feedback";
import RecipeDetailModal from "../components/recipes/RecipeDetailModal";
import AddToPlanModal from "../components/planner/AddToPlanModal";
import { useRecipes } from "@/components/providers/RecipeProvider";
import { Recipe } from "@/api/entities"; // Keep for bulkCreate

export default function Recipes() {
  const { recipes, loading: initialLoading, error: recipesError, refetch: refetchRecipes } = useRecipes();
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [selectedMealCategories, setSelectedMealCategories] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [showAddToPlanModal, setShowAddToPlanModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await User.me().catch(() => null);
        if (userData) {
          setUser(userData);
          setFavorites(userData?.favorite_recipes || []);
        }
      } catch (error) {
        console.log("Usando modo invitado para favoritos");
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    let filtered = recipes;

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(lowerSearchTerm) ||
        recipe.description?.toLowerCase().includes(lowerSearchTerm) ||
        recipe.tags?.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (selectedCuisines.length > 0) {
      filtered = filtered.filter(recipe => selectedCuisines.includes(recipe.cuisine_type));
    }

    if (selectedDifficulties.length > 0) {
      filtered = filtered.filter(recipe => selectedDifficulties.includes(recipe.difficulty));
    }

    if (selectedMealCategories.length > 0) {
      filtered = filtered.filter(recipe => selectedMealCategories.includes(recipe.meal_category));
    }

    if (showFavoritesOnly && user) {
      filtered = filtered.filter(recipe => favorites.includes(recipe.id));
    }

    setFilteredRecipes(filtered);
  }, [recipes, searchTerm, selectedCuisines, selectedDifficulties, selectedMealCategories, showFavoritesOnly, favorites, user]);

  const toggleFilter = (filterArray, setFilterArray, value) => {
    if (filterArray.includes(value)) {
      setFilterArray(filterArray.filter(item => item !== value));
    } else {
      setFilterArray([...filterArray, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedCuisines([]);
    setSelectedDifficulties([]);
    setSelectedMealCategories([]);
    setSearchTerm("");
  };

  const activeFilters = [
    ...selectedMealCategories.map(c => c === "breakfast" ? "Desayuno" : c === "lunch" ? "Almuerzo" : "Cena"),
    ...selectedCuisines.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
    ...selectedDifficulties.map(d => d.charAt(0).toUpperCase() + d.slice(1))
  ];

  const generateRecipesWithAI = async () => {
    setGenerating(true);
    try {
      const existingTitles = recipes.map(r => r.title).join(", ");
      const prompt = `Como experto culinario, genera 5 recetas nuevas, creativas y variadas que no estén en esta lista: ${existingTitles}. Las recetas deben ser saludables y cubrir diferentes momentos del día.`;

      const response = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recipes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  cuisine_type: { type: "string", enum: ["mediterranean", "mexican", "italian", "asian", "indian", "american", "spanish", "french", "other"] },
                  difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                  meal_category: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] },
                  prep_time: { type: "number" },
                  cook_time: { type: "number" },
                  servings: { type: "number" },
                  ingredients: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        quantity: { type: "number" },
                        unit: { type: "string" },
                        category: { type: "string", enum: ["vegetables", "fruits", "dairy", "meat", "fish", "grains", "spices", "oils", "other"] }
                      }
                    }
                  },
                  instructions: { type: "array", items: { type: "string" } },
                  estimated_cost: { type: "number" },
                  tags: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      if (response?.recipes) {
        const newRecipes = response.recipes.map((recipe, index) => ({
          ...recipe,
          id: `generated-${Date.now()}-${index}`,
          image_url: `https://images.unsplash.com/photo-${1500000000 + Math.floor(Math.random() * 100000000)}?w=400&h=300&fit=crop&q=80&auto=format`
        }));
        
        await Recipe.bulkCreate(newRecipes);
        await refetchRecipes(); // Recargar recetas desde el proveedor global
        setToast({ type: 'success', message: '¡5 nuevas recetas generadas exitosamente!' });
      }
    } catch (error) {
      console.error("Error generating recipes:", error);
      setToast({ type: 'error', message: 'Hubo un error al generar recetas. Inténtalo de nuevo.' });
    } finally {
      setGenerating(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const toggleFavorite = async (recipeId) => {
    if (!user) {
      setToast({ type: 'error', message: 'Inicia sesión para guardar favoritos' });
      return;
    }

    try {
      const currentFavorites = [...favorites];
      const newFavorites = currentFavorites.includes(recipeId)
        ? currentFavorites.filter(id => id !== recipeId)
        : [...currentFavorites, recipeId];

      await User.updateMyUserData({ favorite_recipes: newFavorites });
      setFavorites(newFavorites);
      setToast({ 
        type: 'success', 
        message: newFavorites.includes(recipeId) ? 'Añadido a favoritos' : 'Eliminado de favoritos'
      });
    } catch (error) {
      setToast({ type: 'error', message: 'Error al actualizar favoritos' });
    }
  };

  const handleOpenAddToPlan = (recipe) => {
    if (!user) {
      setToast({ type: 'error', message: 'Inicia sesión para usar el planificador' });
      return;
    }
    setSelectedRecipe(recipe);
    setShowAddToPlanModal(true);
  };
  
  const RecipeCard = ({ recipe }) => (
    <Card className="hover-lift transition-all duration-300 overflow-hidden flex flex-col">
      <div className="aspect-video bg-gray-200 relative cursor-pointer" onClick={() => setSelectedRecipe(recipe)}>
        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-teal-100 flex items-center justify-center">
          <ChefHat className="w-12 h-12 text-teal-600" />
        </div>
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/80 hover:bg-white rounded-full"
            onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
          >
            <Heart className={`w-4 h-4 ${favorites.includes(recipe.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </Button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
         <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 cursor-pointer" onClick={() => setSelectedRecipe(recipe)}>
          {recipe.title}
        </CardTitle>
        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{recipe.description}</p>
        
        <div className="flex-grow mt-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <Badge className={getDifficultyColor(recipe.difficulty)}>
              {recipe.difficulty === "easy" ? "Fácil" : recipe.difficulty === "medium" ? "Medio" : "Difícil"}
            </Badge>
            <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</div>
            <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {recipe.servings}</div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-8">
        {/* Header optimizado */}
        <div className="flex flex-col justify-between items-start mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Biblioteca de Recetas</h1>
            <p className="text-gray-600">Descubre recetas deliciosas y saludables para toda la semana</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              variant={showFavoritesOnly ? "default" : "outline"}
              className={`flex items-center justify-center gap-2 ${showFavoritesOnly ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
              disabled={!user}
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-white' : ''}`} />
              Favoritos
            </Button>
            <div className="relative">
              <Button
                onClick={generateRecipesWithAI}
                disabled={generating}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 flex items-center justify-center gap-2 w-full"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? "Generando..." : "Generar con IA"}
              </Button>
              {/* EXPLICACIÓN DE LA IA */}
              <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 text-center leading-tight">
                Crea 5 recetas nuevas según tus preferencias dietéticas
              </div>
            </div>
          </div>
        </div>

        {/* Filters optimizados */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar recetas, ingredientes, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="relative">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setFiltersVisible(!filtersVisible)} 
                className="flex-shrink-0"
              >
                <SlidersHorizontal className="w-5 h-5"/>
              </Button>
              {activeFilters.length > 0 && 
                <Badge className="absolute -top-2 -right-2 px-1.5 h-5 flex items-center justify-center text-xs">{activeFilters.length}</Badge>
              }
            </div>
          </div>

          <AnimatePresence>
            {filtersVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-4 border-t overflow-hidden"
              >
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tipo de Comida</Label>
                  <div className="flex flex-wrap gap-2">
                    {["breakfast", "lunch", "dinner"].map(cat => (
                      <Button 
                        key={cat} 
                        variant={selectedMealCategories.includes(cat) ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => toggleFilter(selectedMealCategories, setSelectedMealCategories, cat)} 
                        className="text-xs"
                      >
                        {cat === "breakfast" ? "Desayuno" : cat === "lunch" ? "Almuerzo" : "Cena"}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Tipo de Cocina</Label>
                  <div className="flex flex-wrap gap-2">
                    {["mediterranean", "mexican", "italian", "asian", "indian", "spanish", "american", "french"].map(cui => (
                      <Button 
                        key={cui} 
                        variant={selectedCuisines.includes(cui) ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => toggleFilter(selectedCuisines, setSelectedCuisines, cui)} 
                        className="text-xs capitalize"
                      >
                        {cui}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Dificultad</Label>
                  <div className="flex flex-wrap gap-2">
                    {["easy", "medium", "hard"].map(diff => (
                      <Button 
                        key={diff} 
                        variant={selectedDifficulties.includes(diff) ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => toggleFilter(selectedDifficulties, setSelectedDifficulties, diff)} 
                        className="text-xs"
                      >
                        {diff === "easy" ? "Fácil" : diff === "medium" ? "Medio" : "Difícil"}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {activeFilters.map(filter => (
                <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                  {filter}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-500 hover:bg-red-50">
                Limpiar todo
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        {initialLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => <RecipeSkeleton key={i} />)}
          </div>
        ) : recipesError ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error al cargar recetas</h3>
            <p className="text-gray-600">No pudimos conectarnos para obtener las recetas. Inténtalo de nuevo más tarde.</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No se encontraron recetas</h3>
            <p className="text-gray-600">Intenta ajustar tus filtros o genera nuevas recetas con IA.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
          </div>
        )}

        <RecipeDetailModal 
          recipe={selectedRecipe} 
          isOpen={!!selectedRecipe} 
          onClose={() => setSelectedRecipe(null)}
          onAddToPlan={() => {
              handleOpenAddToPlan(selectedRecipe);
          }}
        />
        <AddToPlanModal
          isOpen={showAddToPlanModal}
          onClose={() => setShowAddToPlanModal(false)}
          recipe={selectedRecipe}
          user={user}
        />
      </div>
    </>
  );
}
