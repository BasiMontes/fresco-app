import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowLeft, Clock, Users, ChefHat, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useRecipes } from "@/components/providers/RecipeProvider";
import RecipeDetailModal from "../components/recipes/RecipeDetailModal";
import AddToPlanModal from "../components/planner/AddToPlanModal";
import { Skeleton, RecipeSkeleton } from "@/components/ui/skeleton";
import RobustImage from "@/components/ui/robust-image";
import AuthWall from '../components/auth/AuthWall';

export default function Favorites() {
  const { recipes, loading: recipesLoading } = useRecipes();
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showAddToPlanModal, setShowAddToPlanModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authFailed, setAuthFailed] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        const userData = await User.me();
        setUser(userData);
        setFavorites(userData.favorite_recipes || []);
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

  const favoriteRecipes = recipes.filter(recipe => favorites.includes(recipe.id));

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleOpenAddToPlan = (recipe) => {
    setSelectedRecipe(recipe);
    setShowAddToPlanModal(true);
  };

  if (loading || recipesLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <RecipeSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (authFailed) {
    return <AuthWall message="Necesitas iniciar sesión para ver tus recetas favoritas." />;
  }

  const RecipeCard = ({ recipe }) => (
    <Card className="hover-lift transition-all duration-300 overflow-hidden flex flex-col">
      <div className="aspect-video bg-gray-200 relative cursor-pointer" onClick={() => setSelectedRecipe(recipe)}>
        <RobustImage
          src={recipe.image_url}
          alt={recipe.title}
          className="w-full h-full object-cover"
          fallbackType="meal"
        />
      </div>

      <div className="p-4 flex flex-col flex-grow">
         <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 cursor-pointer mb-2" onClick={() => setSelectedRecipe(recipe)}>
          {recipe.title}
        </CardTitle>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{recipe.description}</p>
        
        <div className="flex-grow">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <Badge className={getDifficultyColor(recipe.difficulty)}>
              {recipe.difficulty === "easy" ? "Fácil" : recipe.difficulty === "medium" ? "Medio" : "Difícil"}
            </Badge>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</div>
              <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {recipe.servings}</div>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => handleOpenAddToPlan(recipe)}
          className="w-full bg-teal-600 hover:bg-teal-700"
        >
          Añadir al planificador
        </Button>
      </div>
    </Card>
  );

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Profile")}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              Mis Favoritos
            </h1>
            <p className="text-gray-600">
              Tus recetas guardadas para cocinar cuando quieras
            </p>
          </div>
        </div>

        {favoriteRecipes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Aún no tienes favoritos
              </h3>
              <p className="text-gray-500 mb-6">
                Explora recetas y haz clic en el ❤️ para guardar tus favoritas aquí
              </p>
              <div className="space-y-4">
                <Link to={createPageUrl("Recipes")}>
                  <Button size="lg" className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 px-8 py-3">
                    <ChefHat className="w-5 h-5 mr-2" />
                    Explorar Recetas
                  </Button>
                </Link>
                <p className="text-sm text-gray-500">
                  O genera nuevas recetas personalizadas con IA
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6 text-center">
              <Badge variant="outline" className="text-lg px-4 py-2">
                {favoriteRecipes.length} {favoriteRecipes.length === 1 ? 'receta favorita' : 'recetas favoritas'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </>
        )}
      </div>

      <RecipeDetailModal 
        recipe={selectedRecipe} 
        isOpen={!!selectedRecipe} 
        onClose={() => setSelectedRecipe(null)}
        onAddToPlan={() => {
          handleOpenAddToPlan(selectedRecipe);
        }}
        user={user}
      />
      
      <AddToPlanModal
        isOpen={showAddToPlanModal}
        onClose={() => setShowAddToPlanModal(false)}
        recipe={selectedRecipe}
        user={user}
        onSuccess={() => {
          setShowAddToPlanModal(false);
          // Aquí podrías añadir una notificación de éxito
        }}
      />
    </>
  );
}