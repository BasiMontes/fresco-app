
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { format, addDays, isSameDay, isToday, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

export default function WeekCalendar({ currentDate, onDateSelect, mealPlans, weekStart, onWeekChange }) {
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    return addDays(weekStart, index);
  });

  return (
    <Card className="glass-effect border border-gray-200/50 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => onWeekChange('prev')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h3 className="font-semibold text-gray-900">
              Semana del {format(weekStart, 'd \'de\' MMMM', { locale: es })}
            </h3>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onWeekChange('next')}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => {
            const isSelected = isSameDay(date, currentDate);
            const isPastDay = isPast(date) && !isToday(date);
            const dateKey = format(date, 'yyyy-MM-dd');
            const hasMeals = mealPlans[dateKey] && mealPlans[dateKey].meals.length > 0;
            
            let dayClass = '';
            if (isSelected) {
              dayClass = 'bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-lg transform scale-105';
            } else if (isToday(date)) {
              dayClass = `font-bold ${hasMeals ? 'bg-orange-100 text-orange-800 border-2 border-orange-300' : 'bg-orange-50 text-orange-700 border border-orange-200'}`;
            } else if (hasMeals) {
              dayClass = 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100';
            } else if (isPastDay) {
               dayClass = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
            } else {
              dayClass = 'bg-white text-gray-700 hover:bg-teal-50 hover:text-teal-700 border border-gray-200';
            }

            return (
              <Button
                key={index}
                variant="ghost"
                className={`h-auto p-2 flex flex-col gap-1 transition-all duration-300 hover-lift rounded-lg ${dayClass}`}
                onClick={() => !isPastDay && onDateSelect(date)}
                disabled={isPastDay}
              >
                <div className="text-xs font-medium uppercase opacity-80">
                  {format(date, 'EEE', { locale: es })}
                </div>
                <div className="text-lg font-bold">
                  {format(date, 'd')}
                </div>
              </Button>
            );
          })}
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 pt-4 border-t border-gray-200/50">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-3 h-3 bg-orange-50 border border-orange-200 rounded-full"></div>
            <span>Hoy</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
            <span>Seleccionado</span>
          </div>
           <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-3 h-3 bg-teal-50 border border-teal-200 rounded-full"></div>
            <span>Con Comidas</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-3 h-3 bg-white border border-gray-200 rounded-full"></div>
            <span>Disponible</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
