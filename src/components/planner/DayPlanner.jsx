import React from 'react';
import MealSlot from './MealSlot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MEAL_TYPES = [
  { id: "breakfast", label: "Desayuno", icon: "🥐", time: "8:00", color: "from-yellow-100 to-orange-100" },
  { id: "lunch", label: "Almuerzo", icon: "🥗", time: "13:00", color: "from-green-100 to-teal-100" },
  { id: "dinner", label: "Cena", icon: "🍝", time: "19:00", color: "from-purple-100 to-indigo-100" }
];

export default function DayPlanner({ meals, onRemoveMeal, onOpenModal }) {
  return (
    <div className="space-y-4 md:space-y-6">
      {MEAL_TYPES.map(mealType => (
        <Card key={mealType.id} className="glass-effect border border-gray-200/50 hover-lift transition-all duration-300">
          <CardHeader className={`bg-gradient-to-r ${mealType.color} rounded-t-lg p-3 md:p-4`}>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-xl md:text-2xl">{mealType.icon}</span>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900">{mealType.label}</h3>
                  <p className="text-xs md:text-sm text-gray-600 font-normal">{mealType.time}h</p>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4">
            <MealSlot 
              recipe={meals[mealType.id]} 
              onRemove={() => onRemoveMeal(mealType.id)}
              onAdd={() => onOpenModal(mealType.id)}
              mealType={mealType}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}