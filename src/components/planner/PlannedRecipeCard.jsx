import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Clock, Users, RefreshCw } from 'lucide-react';

export default function PlannedRecipeCard({ recipe, onRemove, onChange }) {
  if (!recipe) return null;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full animate-fade-in overflow-hidden">
      <div className="flex">
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className="w-24 h-full object-cover hidden sm:block"
          key={recipe.id}
        />
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">{recipe.title}</h4>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
              <Badge className={`text-xs ${getDifficultyColor(recipe.difficulty)}`}>
                {recipe.difficulty === "easy" ? "Fácil" : recipe.difficulty === "medium" ? "Medio" : "Difícil"}
              </Badge>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)}min</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onChange}
              className="flex-1 text-xs h-7"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Cambiar
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-red-500 hover:bg-red-50 hover:text-red-600 h-7 w-7"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}