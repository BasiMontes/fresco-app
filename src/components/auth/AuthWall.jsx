import React from 'react';
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn } from "lucide-react";

export default function AuthWall({ title = "Acceso Restringido", message = "Necesitas iniciar sesión para ver esta página y usar todas las funcionalidades." }) {
  
  const handleLogin = async () => {
    try {
      await User.loginWithRedirect(window.location.href);
    } catch (error) {
      console.error("Error al redirigir al login:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="text-center py-12">
        <CardContent>
          <LogIn className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">{title}</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">{message}</p>
          <Button onClick={handleLogin} className="bg-gradient-to-r from-teal-600 to-teal-700">
            Iniciar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}