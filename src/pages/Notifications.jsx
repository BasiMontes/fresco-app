import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Clock, 
  ChefHat, 
  ShoppingCart, 
  Sparkles,
  CheckCircle,
  X
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";

const initialNotifications = [
  { id: 1, type: "meal_reminder", title: "¡Hora de cocinar!", message: "Es momento de preparar tu pasta primavera para la cena", timestamp: new Date(Date.now() - 30 * 60 * 1000), read: false, icon: ChefHat, color: "text-orange-600 bg-orange-100" },
  { id: 2, type: "shopping_reminder", title: "Lista de compras lista", message: "Tu lista para esta semana está preparada. ¡Ve al supermercado!", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), read: false, icon: ShoppingCart, color: "text-green-600 bg-green-100" },
  { id: 3, type: "ai_suggestion", title: "Nuevas recetas disponibles", message: "Hemos encontrado 3 recetas mediterráneas perfectas para ti", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), read: true, icon: Sparkles, color: "text-purple-600 bg-purple-100" },
  { id: 4, type: "planning_reminder", title: "Planifica tu semana", message: "¡No olvides planificar tus comidas para los próximos 7 días!", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), read: true, icon: Clock, color: "text-teal-600 bg-teal-100" },
  { id: 5, type: "achievement", title: "¡Meta alcanzada!", message: "Has planificado 7 días consecutivos. ¡Excelente trabajo!", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), read: true, icon: CheckCircle, color: "text-blue-600 bg-blue-100" }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [config, setConfig] = useState({
    mealReminders: true,
    aiSuggestions: true,
    shoppingList: false,
    weeklyPlanning: true
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    localStorage.setItem('fresco_unread_notifications', unreadCount.toString());
    window.dispatchEvent(new Event("storage"));
  }, [unreadCount]);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, read: true } : notif));
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8 text-teal-600" />
            Notificaciones
          </h1>
          <p className="text-gray-600">
            Mantente al día con tus comidas y recordatorios
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Marcar todas como leídas ({unreadCount})
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay notificaciones</h3>
              <p className="text-gray-500">Cuando tengas actualizaciones importantes, aparecerán aquí</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`hover-lift transition-all duration-300 ${!notification.read ? 'ring-2 ring-teal-500/20 bg-teal-50/30' : ''}`}
            >
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${notification.color}`}><notification.icon className="w-5 h-5" /></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg font-semibold">{notification.title}</CardTitle>
                        {!notification.read && <Badge className="bg-teal-600 text-white text-xs">Nuevo</Badge>}
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-sm text-gray-500">{format(notification.timestamp, "PPp", { locale: es })}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!notification.read && (
                      <Button variant="ghost" size="icon" onClick={() => markAsRead(notification.id)} className="text-teal-600 hover:text-teal-700 h-8 w-8"><CheckCircle className="w-4 h-4" /></Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => removeNotification(notification.id)} className="text-gray-400 hover:text-red-600 h-8 w-8"><X className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 glass-effect rounded-2xl border border-gray-200/50">
        <h3 className="font-semibold text-gray-900 mb-4">Configurar Notificaciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <span className="text-sm text-gray-700">Recordatorios de comida</span>
            <Switch checked={config.mealReminders} onCheckedChange={(checked) => setConfig(prev => ({...prev, mealReminders: checked}))} />
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <span className="text-sm text-gray-700">Sugerencias de IA</span>
            <Switch checked={config.aiSuggestions} onCheckedChange={(checked) => setConfig(prev => ({...prev, aiSuggestions: checked}))} />
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <span className="text-sm text-gray-700">Lista de compras</span>
            <Switch checked={config.shoppingList} onCheckedChange={(checked) => setConfig(prev => ({...prev, shoppingList: checked}))} />
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <span className="text-sm text-gray-700">Planificación semanal</span>
            <Switch checked={config.weeklyPlanning} onCheckedChange={(checked) => setConfig(prev => ({...prev, weeklyPlanning: checked}))} />
          </div>
        </div>
      </div>
    </div>
  );
}