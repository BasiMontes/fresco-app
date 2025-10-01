import React, { useState } from 'react';
import { getMealPlansByUser, createMealPlan, updateMealPlan, deleteMealPlan } from '@/api/mealPlans';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Check, Loader2 } from 'lucide-react';

const MEAL_TYPES = [
  { id: "breakfast", label: "Desayuno" },
  { id: "lunch", label: "Almuerzo" },
  { id: "dinner", label: "Cena" }
];

export default function AddToPlanModal({ isOpen, onClose, recipe, user, onSuccess }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!recipe || !user) return null;

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleSave = async () => {
    if (!selectedDay || !selectedMealType) return;
    setSaving(true);
    try {
        const dateKey = format(selectedDay, 'yyyy-MM-dd');
        const weekStartKey = format(weekStart, 'yyyy-MM-dd');

        // Buscar plan existente
        const existingPlans = await MealPlan.filter({ week_start: weekStartKey, created_by: user.email });
        
        const newMeal = {
            date: dateKey,
            meal_type: selectedMealType,
            recipe_id: recipe.id,
            servings: user.household_size || 1,
        };

        if (existingPlans.length > 0) {
            const plan = existingPlans[0];
            // Filtrar comidas existentes para ese día y tipo de comida, luego añadir la nueva
            const updatedMeals = plan.meals.filter(m => !(m.date === dateKey && m.meal_type === selectedMealType));
            updatedMeals.push(newMeal);
            await MealPlan.update(plan.id, { meals: updatedMeals });
        } else {
            // Crear nuevo plan si no existe
            await MealPlan.create({
                week_start: weekStartKey,
                meals: [newMeal],
                status: 'planning',
            });
        }

        // Notificar éxito al componente padre
        if (onSuccess) {
            onSuccess(recipe.id, dateKey, selectedMealType);
        }

        onClose();
        setSelectedDay(null);
        setSelectedMealType(null);
    } catch (error) {
        console.error("Error saving to meal plan:", error);
    } finally {
        setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir "{recipe.title}" al plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Selecciona un día</h4>
            <div className="grid grid-cols-4 gap-2">
              {weekDays.map(day => (
                <Button 
                  key={day.toString()}
                  variant={format(day, 'yyyy-MM-dd') === (selectedDay ? format(selectedDay, 'yyyy-MM-dd') : '') ? 'default' : 'outline'}
                  onClick={() => setSelectedDay(day)}
                  className="flex flex-col h-auto p-2"
                >
                  <span className="text-xs capitalize">{format(day, 'EEE', { locale: es })}</span>
                  <span className="text-lg font-bold">{format(day, 'd')}</span>
                </Button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Selecciona una comida</h4>
            <div className="grid grid-cols-3 gap-2">
              {MEAL_TYPES.map(meal => (
                <Button 
                  key={meal.id}
                  variant={selectedMealType === meal.id ? 'default' : 'outline'}
                  onClick={() => setSelectedMealType(meal.id)}
                >
                  {meal.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
          <Button onClick={handleSave} disabled={!selectedDay || !selectedMealType || saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from 'react';
import { MealPlan } from '@/api/entities';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Check, Loader2 } from 'lucide-react';

const MEAL_TYPES = [
  { id: "breakfast", label: "Desayuno" },
  { id: "lunch", label: "Almuerzo" },
  { id: "dinner", label: "Cena" }
];

export default function AddToPlanModal({ isOpen, onClose, recipe, user, onSuccess }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!recipe || !user) return null;

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleSave = async () => {
    if (!selectedDay || !selectedMealType) return;
    setSaving(true);
    try {
        const dateKey = format(selectedDay, 'yyyy-MM-dd');
        const weekStartKey = format(weekStart, 'yyyy-MM-dd');

        // Buscar plan existente
        const existingPlans = await MealPlan.filter({ week_start: weekStartKey, created_by: user.email });
        
        const newMeal = {
            date: dateKey,
            meal_type: selectedMealType,
            recipe_id: recipe.id,
            servings: user.household_size || 1,
        };

        if (existingPlans.length > 0) {
            const plan = existingPlans[0];
            // Filtrar comidas existentes para ese día y tipo de comida, luego añadir la nueva
            const updatedMeals = plan.meals.filter(m => !(m.date === dateKey && m.meal_type === selectedMealType));
            updatedMeals.push(newMeal);
            await MealPlan.update(plan.id, { meals: updatedMeals });
        } else {
            // Crear nuevo plan si no existe
            await MealPlan.create({
                week_start: weekStartKey,
                meals: [newMeal],
                status: 'planning',
            });
        }

        // Notificar éxito al componente padre
        if (onSuccess) {
            onSuccess(recipe.id, dateKey, selectedMealType);
        }

        onClose();
        setSelectedDay(null);
        setSelectedMealType(null);
    } catch (error) {
        console.error("Error saving to meal plan:", error);
    } finally {
        setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir "{recipe.title}" al plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Selecciona un día</h4>
            <div className="grid grid-cols-4 gap-2">
              {weekDays.map(day => (
                <Button 
                  key={day.toString()}
                  variant={format(day, 'yyyy-MM-dd') === (selectedDay ? format(selectedDay, 'yyyy-MM-dd') : '') ? 'default' : 'outline'}
                  onClick={() => setSelectedDay(day)}
                  className="flex flex-col h-auto p-2"
                >
                  <span className="text-xs capitalize">{format(day, 'EEE', { locale: es })}</span>
                  <span className="text-lg font-bold">{format(day, 'd')}</span>
                </Button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Selecciona una comida</h4>
            <div className="grid grid-cols-3 gap-2">
              {MEAL_TYPES.map(meal => (
                <Button 
                  key={meal.id}
                  variant={selectedMealType === meal.id ? 'default' : 'outline'}
                  onClick={() => setSelectedMealType(meal.id)}
                >
                  {meal.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
          <Button onClick={handleSave} disabled={!selectedDay || !selectedMealType || saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}