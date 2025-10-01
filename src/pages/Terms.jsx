
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Users, AlertTriangle, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Terms() {
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
          <FileText className="w-8 h-8 text-teal-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Términos de Servicio
        </h1>
        <p className="text-gray-600 mt-2">Última actualización: Enero 2025</p>
      </div>

      <div className="space-y-6">
        <Card className="glass-effect border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Aceptación de Términos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Al acceder y usar Fresco ("el Servicio"), aceptas estar sujeto a estos Términos de Servicio 
              ("Términos"). Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestro servicio.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Descripción del Servicio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Fresco es una aplicación de planificación de comidas que te ayuda a:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Planificar menús semanales personalizados</li>
              <li>Generar listas de compras automáticas</li>
              <li>Descubrir recetas adaptadas a tus preferencias</li>
              <li>Optimizar tu presupuesto alimentario</li>
              <li>Reducir el desperdicio de alimentos</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-effect border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Cuentas de Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Registro</h4>
              <p className="text-gray-600 mb-3">
                Para usar Fresco, debes crear una cuenta proporcionando información precisa y actualizada. 
                Eres responsable de mantener la confidencialidad de tu cuenta.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Uso Aceptable</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Usar el servicio solo para fines legales y personales</li>
                <li>No compartir contenido ofensivo o inapropiado</li>
                <li>No intentar interferir con la funcionalidad del servicio</li>
                <li>Respetar los derechos de propiedad intelectual</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-teal-600" />
              Propiedad Intelectual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Contenido de Fresco</h4>
              <p className="text-gray-600 mb-3">
                El servicio y su contenido original, características y funcionalidad son y seguirán 
                siendo propiedad exclusiva de Fresco y sus licenciadores.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Tu Contenido</h4>
              <p className="text-gray-600">
                Mantienes todos los derechos sobre el contenido que publiques. Al usar Fresco, 
                nos otorgas una licencia para usar, mostrar y distribuir tu contenido en relación con el servicio.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Limitaciones y Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Información Nutricional</h4>
              <p className="text-gray-600 mb-3">
                Las sugerencias de recetas y información nutricional son solo para fines informativos. 
                Consulta a un profesional de la salud para consejos dietéticos específicos.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Precios de Supermercados</h4>
              <p className="text-gray-600 mb-3">
                Los precios mostrados son estimaciones y pueden no reflejar los precios actuales. 
                Verifica siempre los precios directamente con los proveedores.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Disponibilidad del Servicio</h4>
              <p className="text-gray-600">
                Nos esforzamos por mantener el servicio disponible, pero no garantizamos acceso 
                ininterrumpido. Podemos suspender el servicio temporalmente para mantenimiento.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border border-gray-200/50">
          <CardHeader>
            <CardTitle>Terminación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Puedes terminar tu cuenta en cualquier momento desde la configuración de tu perfil. 
              Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border border-gray-200/50">
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Si tienes preguntas sobre estos Términos de Servicio, contacta con nosotros:
            </p>
            <div className="mt-4 p-4 bg-teal-50 rounded-lg">
              <p className="font-semibold">Fresco - Soporte Legal</p>
              <p>Email: legal@fresco.app</p>
              <p>Dirección: Calle de la Innovación 123, 28001 Madrid, España</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
