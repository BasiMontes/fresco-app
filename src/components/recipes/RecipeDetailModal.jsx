
import React, { useState, useEffect } from 'react';
import { getMealPlansByUser, createMealPlan, updateMealPlan, deleteMealPlan } from '@/api/mealPlans';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RobustImage from "@/components/ui/robust-image";
import { Clock, Users, DollarSign, Plus, Check } from "lucide-react";
import { format, startOfWeek } from 'date-fns';

export default function RecipeDetailModal({ recipe, isOpen, onClose, onAddToPlan, user }) {
    const [isInPlan, setIsInPlan] = useState(false);

    useEffect(() => {
        // Verificar si la receta ya está en el plan actual
        const checkIfInPlan = async () => {
            if (!recipe || !user) return;
            
            try {
                const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
                const weekStartKey = format(weekStart, 'yyyy-MM-dd');
                
                const plans = await MealPlan.filter({ week_start: weekStartKey, created_by: user.email });
                if (plans.length > 0) {
                    const hasRecipe = plans[0].meals.some(meal => meal.recipe_id === recipe.id);
                    setIsInPlan(hasRecipe);
                }
            } catch (error) {
                console.error("Error checking meal plan:", error);
            }
        };

        if (isOpen) {
            checkIfInPlan();
        }
    }, [recipe, user, isOpen]);

    const handleAddToPlan = () => {
        if (onAddToPlan) {
            onAddToPlan(recipe);
        }
    };

    const handlePlanSuccess = () => {
        setIsInPlan(true);
    };

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
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold pr-8">{recipe.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <RobustImage
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-64 object-cover rounded-lg"
              fallbackType="food"
            />
            
            <div className="flex flex-wrap gap-2">
              <Badge className={getDifficultyColor(recipe.difficulty)}>
                {recipe.difficulty === "easy" ? "Fácil" : recipe.difficulty === "medium" ? "Medio" : "Difícil"}
              </Badge>
              {recipe.cuisine_type && <Badge variant="outline">{recipe.cuisine_type}</Badge>}
              {recipe.meal_category && (
                <Badge variant="outline">
                  {recipe.meal_category === "breakfast" ? "Desayuno" : recipe.meal_category === "lunch" ? "Almuerzo" : recipe.meal_category === "dinner" ? "Cena" : "Snack"}
                </Badge>
              )}
              {recipe.tags?.map((tag, index) => <Badge key={index} variant="secondary">{tag}</Badge>)}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div><Clock className="mx-auto mb-1 text-teal-600" /> <p className="text-sm font-medium">{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</p> <p className="text-xs text-gray-500">Tiempo total</p></div>
              <div><Users className="mx-auto mb-1 text-teal-600" /> <p className="text-sm font-medium">{recipe.servings} personas</p> <p className="text-xs text-gray-500">Porciones</p></div>
              <div>
                <DollarSign className="mx-auto mb-1 text-teal-600" /> 
                <p className="text-sm font-medium">€{recipe.estimated_cost?.toFixed(2) || "2.50"}</p> 
                <p className="text-xs text-gray-500">Por porción <span className="text-xs text-blue-500 font-semibold">(Estimado por IA)</span></p>
              </div>
            </div>

            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Ingredientes</h3>
                <ul className="space-y-2 list-disc list-inside">
                  {recipe.ingredients.map((ing, i) => <li key={i}>{ing.quantity} {ing.unit} {ing.name}</li>)}
                </ul>
              </div>
            )}

            {recipe.instructions && recipe.instructions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Instrucciones</h3>
                <ol className="space-y-3">
                  {recipe.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3"><span className="flex-shrink-0 w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm">{i + 1}</span><span>{step}</span></li>
                  ))}
                </ol>
              </div>
            )}
             
            <div className="flex justify-end pt-4">
                <Button 
                    onClick={handleAddToPlan}
                    disabled={isInPlan}
                    className={isInPlan ? "bg-green-600 hover:bg-green-600" : ""}
                >
                    {isInPlan ? (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            Añadido al plan
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4 mr-2" />
                            Añadir al planificador
                        </>
                    )}
                </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
}
