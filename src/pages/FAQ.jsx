
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  ShoppingCart,
  Calendar,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const faqs = [
  {
    category: "General",
    icon: BookOpen,
    questions: [
      {
        question: "¿Qué es Fresco?",
        answer: "Fresco es tu asistente personal de planificación de comidas que te ayuda a organizar menús semanales, generar listas de compras automáticas y descubrir recetas personalizadas según tus preferencias dietéticas y presupuesto."
      },
      {
        question: "¿Es gratis usar Fresco?",
        answer: "Sí, Fresco es completamente gratuito. Ofrecemos todas las funciones principales sin costo, incluyendo planificación de comidas, generación de listas de compras y acceso a nuestra biblioteca de recetas."
      },
      {
        question: "¿Necesito crear una cuenta?",
        answer: "Sí, necesitas crear una cuenta para guardar tus preferencias, planes de comida y recetas favoritas. Puedes registrarte con email o usar tu cuenta de Google o Apple para mayor comodidad."
      }
    ]
  },
  {
    category: "Planificación",
    icon: Calendar,
    questions: [
      {
        question: "¿Cómo planifico mi semana de comidas?",
        answer: "Ve a la sección 'Planificador', selecciona el día que quieres planificar y haz clic en los espacios de desayuno, almuerzo o cena. Aparecerá un modal con recetas sugeridas que puedes añadir a tu plan."
      },
      {
        question: "¿Puedo modificar un plan ya creado?",
        answer: "¡Por supuesto! Puedes cambiar cualquier comida haciendo clic en 'Cambiar' en la receta seleccionada, o eliminarla completamente. Tus cambios se guardan automáticamente."
      },
      {
        question: "¿La IA puede generar un plan completo?",
        answer: "Sí, usa el botón 'Generar con IA' en el planificador. La IA creará un plan equilibrado considerando tus preferencias dietéticas, presupuesto y cocinas favoritas."
      }
    ]
  },
  {
    category: "Lista de Compras",
    icon: ShoppingCart,
    questions: [
      {
        question: "¿Cómo se genera la lista de compras?",
        answer: "La lista se genera automáticamente basándose en las recetas que has planificado. Ve a 'Lista de Compras' y haz clic en 'Generar Lista' para crear una lista organizada por categorías."
      },
      {
        question: "¿Puedo marcar productos como comprados?",
        answer: "Sí, puedes marcar cada producto como comprado usando la casilla de verificación. Esto te ayuda a hacer el seguimiento de tu progreso de compras en tiempo real."
      },
      {
        question: "¿Cómo funcionan las comparaciones de precios?",
        answer: "Próximamente podrás comparar precios entre diferentes supermercados. El sistema te mostrará dónde encontrar los mejores precios para tu lista de compras."
      }
    ]
  },
  {
    category: "Recetas",
    icon: BookOpen,
    questions: [
      {
        question: "¿De dónde vienen las recetas?",
        answer: "Nuestras recetas son generadas por IA considerando variedad nutricional, cocinas del mundo y ingredientes accesibles. También puedes agregar tus propias recetas personalizadas."
      },
      {
        question: "¿Puedo guardar recetas favoritas?",
        answer: "Sí, haz clic en el icono de corazón en cualquier receta para añadirla a tus favoritos. Puedes ver todas tus recetas favoritas desde tu perfil."
      },
      {
        question: "¿Las recetas se adaptan a mis restricciones dietéticas?",
        answer: "Absolutamente. Durante el onboarding configuras tus preferencias y restricciones. Todas las sugerencias de recetas respetan estas configuraciones."
      }
    ]
  },
  {
    category: "Cuenta y Perfil",
    icon: User,
    questions: [
      {
        question: "¿Puedo cambiar mis preferencias dietéticas?",
        answer: "Sí, puedes actualizar tus preferencias en cualquier momento desde tu perfil, o hacer clic en 'Editar Onboarding' para revisar todas tus configuraciones."
      },
      {
        question: "¿Cómo cambio mi foto de perfil?",
        answer: "En tu perfil, haz clic en el icono de edición sobre tu foto actual. Puedes subir una nueva imagen desde tu dispositivo."
      },
      {
        question: "¿Cómo elimino mi cuenta?",
        answer: "Ve a tu perfil y haz clic en 'Eliminar cuenta'. Aparecerá una confirmación antes de eliminar definitivamente todos tus datos. Esta acción no se puede deshacer."
      }
    ]
  }
];

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
          <HelpCircle className="w-8 h-8 text-teal-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Preguntas Frecuentes
        </h1>
        <p className="text-gray-600 mt-2">
          Encuentra respuestas a las preguntas más comunes sobre Fresco
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Buscar en preguntas frecuentes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 text-lg h-14"
        />
      </div>

      {/* FAQ Categories */}
      <div className="space-y-6">
        {filteredFaqs.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="glass-effect border border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <category.icon className="w-6 h-6 text-teal-600" />
                {category.category}
                <span className="text-sm font-normal text-gray-500">
                  ({category.questions.length} preguntas)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.questions.map((faq, questionIndex) => {
                const isExpanded = expandedItems[`${categoryIndex}-${questionIndex}`];
                return (
                  <div key={questionIndex} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleExpanded(categoryIndex, questionIndex)}
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <h4 className="font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </h4>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFaqs.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-gray-500">
              Intenta con otros términos de búsqueda o explora las categorías completas
            </p>
          </CardContent>
        </Card>
      )}

      {/* Contact Section */}
      <Card className="glass-effect border border-gray-200/50 mt-8">
        <CardHeader>
          <CardTitle>¿No encuentras lo que buscas?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Si tu pregunta no está aquí, no dudes en contactar con nuestro equipo de soporte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="bg-gradient-to-r from-teal-600 to-teal-700">
              Contactar Soporte
            </Button>
            <Button variant="outline">
              Enviar Sugerencia
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
