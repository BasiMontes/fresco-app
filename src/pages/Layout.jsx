

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Home, 
  Calendar, 
  BookOpen, 
  ShoppingCart, 
  User,
  Bell,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { RecipeProvider } from "@/components/providers/RecipeProvider";
import { MealPlanProvider } from "@/components/providers/MealPlanProvider";
import { ShoppingListProvider } from "@/components/providers/ShoppingListProvider";

const navigationItems = [
  { title: "Inicio", url: createPageUrl("Dashboard"), icon: Home },
  { title: "Calendario", url: createPageUrl("WeeklyPlanner"), icon: Calendar },
  { title: "Lista de Compras", url: createPageUrl("ShoppingList"), icon: ShoppingCart },
  { title: "Recetas", url: createPageUrl("Recipes"), icon: BookOpen },
  { title: "Perfil", url: createPageUrl("Profile"), icon: User },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    // Simulating checking for unread notifications
    const unreadCount = parseInt(localStorage.getItem('fresco_unread_notifications') || '5', 10);
    setHasUnread(unreadCount > 0);

    const handleStorageChange = () => {
      const newUnreadCount = parseInt(localStorage.getItem('fresco_unread_notifications') || '0', 10);
      setHasUnread(newUnreadCount > 0);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const FrescoLogo = () => (
    <div className="flex items-center gap-3">
      <img 
        src="https://ethic.es/wp-content/uploads/2023/03/imagen.jpg" 
        alt="Fresco" 
        className="h-8 w-auto"
      />
    </div>
  );

  return (
    <AuthProvider>
      <RecipeProvider>
        <MealPlanProvider>
          <ShoppingListProvider>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
              <style>
                {`
                  :root {
                    --primary-green: #0C6F66;
                    --accent-orange: #FF9F1C;
                    --soft-green: #E6F7F5;
                    --warm-white: #FEFEFE;
                  }
                  
                  .glass-effect {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                  }
                  
                  .animate-fade-in {
                    animation: fadeIn 0.5s ease-out;
                  }
                  
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                  
                  .hover-lift {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                  }
                  
                  .hover-lift:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
                  }
                `}
              </style>

              {/* Header */}
              <header className="glass-effect border-b border-gray-200/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-16">
                    <FrescoLogo />
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.title}
                          to={item.url}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover-lift relative ${
                            location.pathname === item.url
                              ? 'text-teal-700 bg-teal-50'
                              : 'text-gray-600 hover:text-teal-700 hover:bg-white/50'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.title}
                          {location.pathname === item.url && (
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-teal-600 rounded-full"></div>
                          )}
                        </Link>
                      ))}
                    </nav>

                    <div className="flex items-center gap-2">
                      <Link to={createPageUrl("Favorites")}>
                        <Button variant="ghost" size="icon">
                          <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 hover:fill-red-500 transition-colors" />
                        </Button>
                      </Link>
                      <Link to={createPageUrl("Notifications")}>
                        <Button variant="ghost" size="icon" className="relative">
                          <Bell className="w-5 h-5" />
                          {hasUnread && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                          )}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main className="min-h-screen">
                <div className="animate-fade-in">
                  {children}
                </div>
              </main>

              {/* Mobile Bottom Navigation */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 glass-effect border-t border-gray-200/50 z-50">
                <div className="grid grid-cols-5 py-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`flex flex-col items-center gap-1 px-1 py-2 transition-all duration-200 relative ${
                        location.pathname === item.url
                          ? 'text-teal-600'
                          : 'text-gray-500 hover:text-teal-600'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-xs font-medium text-center leading-tight">
                        {item.title === "Lista de Compras" ? "Lista" : item.title === "Calendario" ? "Calendario" : item.title}
                      </span>
                      {location.pathname === item.url && (
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-teal-600 rounded-full"></div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </ShoppingListProvider>
        </MealPlanProvider>
      </RecipeProvider>
    </AuthProvider>
  );
}

