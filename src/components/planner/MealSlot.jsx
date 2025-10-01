import React from 'react';
import PlannedRecipeCard from './PlannedRecipeCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function MealSlot({ recipe, onRemove, onAdd, mealType }) {
  return (
    <div className="w-full h-full min-h-[150px] flex items-center justify-center">
      {recipe ? (
        <PlannedRecipeCard 
          recipe={recipe} 
          onRemove={onRemove}
          onChange={onAdd}
        />
      ) : (
        <Button 
          variant="outline" 
          className="w-full h-full p-8 border-2 border-dashed hover:border-teal-400 hover:text-teal-600"
          onClick={onAdd}
        >
          <div className="flex flex-col items-center gap-2">
            <Plus className="w-6 h-6" />
            <span className="font-semibold">Añadir {mealType.label}</span>
          </div>
        </Button>
      )}
    </div>
  );
}