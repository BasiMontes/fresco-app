
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, UserCheck, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-20 md:pb-12">
      {/* Header */}
      <div className="text-center mb-10">
        <Link to={createPageUrl("Profile")} className="inline-block mb-4">
          <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Volver al Perfil
          </Button>
        </Link>
        <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-teal-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Política de Privacidad
        </h1>
        <p className="text-gray-600 mt-2">Última actualización: Enero 2025</p>
      </div>

      <div className="space-y-6">
        <Card className="glass-effect border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-teal-600" />
              Información que Recopilamos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Información Personal</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Nombre y dirección de correo electrónico</li>
                <li>Preferencias dietéticas y alergias alimentarias</li>
                <li>Información del hogar (número de personas, presupuesto)</li>
                <li>Recetas favoritas y planes de comida</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Información de Uso</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Cómo utilizas la aplicación y sus funciones</li>
                <li>Recetas que visualizas y guardas</li>
                <li>Patrones de planificación de comidas</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600" />
              Cómo Usamos tu Información
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Personalizar recomendaciones de recetas y planes de comida</li>
              <li>Generar listas de compras automáticas basadas en tus planes</li>
              <li>Mejorar nuestros algoritmos de IA para mejores sugerencias</li>
              <li>Enviarte notificaciones sobre recordatorios de comidas (si está habilitado)</li>
              <li>Analizar tendencias de uso para mejorar la aplicación</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-effect border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              Protección de Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Seguridad</h4>
              <p className="text-gray-600 mb-3">
                Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger 
                tu información personal contra acceso no autorizado, alteración, divulgación o destrucción.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Compartir Información</h4>
              <p className="text-gray-600">
                No vendemos, intercambiamos o transferimos tu información personal a terceros, 
                excepto para proporcionar nuestros servicios (como integraciones con supermercados) 
                o cuando sea requerido por ley.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Tus Derechos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>Acceso:</strong> Puedes acceder a tu información personal en cualquier momento</li>
              <li><strong>Rectificación:</strong> Puedes corregir información inexacta desde tu perfil</li>
              <li><strong>Eliminación:</strong> Puedes solicitar la eliminación de tu cuenta y datos</li>
              <li><strong>Portabilidad:</strong> Puedes exportar tus recetas y planes de comida</li>
              <li><strong>Oposición:</strong> Puedes oponerte al procesamiento de tus datos para marketing</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-effect border border-gray-200/50">
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Si tienes preguntas sobre esta política de privacidad o quieres ejercer tus derechos, 
              contacta con nosotros en:
            </p>
            <div className="mt-4 p-4 bg-teal-50 rounded-lg">
              <p className="font-semibold">Fresco - Equipo de Privacidad</p>
              <p>Email: privacy@fresco.app</p>
              <p>Dirección: Calle de la Innovación 123, 28001 Madrid, España</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
