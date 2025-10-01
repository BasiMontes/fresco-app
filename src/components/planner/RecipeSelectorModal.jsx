import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X, Clock, ChefHat } from 'lucide-react';

const RecipeCard = ({ recipe, onSelect }) => (
  <div
    className="border rounded-lg p-3 flex items-center gap-4 hover:bg-teal-50 cursor-pointer transition-colors"
    onClick={() => onSelect(recipe.id)}
  >
    <img
      src={recipe.image_url}
      alt={recipe.title}
      className="w-16 h-16 rounded-md object-cover bg-gray-200"
      key={recipe.id}
    />
    <div className="flex-1">
      <p className="font-semibold text-gray-800">{recipe.title}</p>
      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
        <span className="flex items-center gap-1"><ChefHat className="w-3 h-3" /> {recipe.difficulty}</span>
      </div>
    </div>
  </div>
);

export default function RecipeSelectorModal({ isOpen, onClose, recipes, onSelectRecipe, mealType }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecipes = useMemo(() => {
    let availableRecipes = recipes;
    
    // Filter by meal category
    if (mealType) {
      availableRecipes = availableRecipes.filter(r => r.meal_category === mealType);
    }
    
    // Filter by search term
    if (searchTerm) {
      return availableRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return availableRecipes;
  }, [recipes, searchTerm, mealType]);

  const mealTypeSpanish = {
    breakfast: 'Desayuno',
    lunch: 'Almuerzo',
    dinner: 'Cena'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Seleccionar Receta para
            <Badge variant="outline" className="ml-2 text-lg">
              {mealTypeSpanish[mealType] || 'Comida'}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar recetas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} onSelect={onSelectRecipe} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No hay recetas disponibles para "{mealTypeSpanish[mealType]}".</p>
              <p className="text-sm">Intenta buscar o generar más recetas.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}