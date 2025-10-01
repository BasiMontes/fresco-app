
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Check, Heart, CheckCircle, X, Sparkles } from "lucide-react"; // Added Sparkles import
import { Toast } from "@/components/ui/feedback";

const STEPS = [
  {
    id: "restrictions",
    title: "¿Tienes alguna restricción dietética?",
    subtitle: "Selecciona todas las que apliquen para personalizar tus recetas",
    progress: 33,
    icon: Heart
  },
  {
    id: "cuisines",
    title: "¿Qué tipo de cocina prefieres?",
    subtitle: "Elige tus favoritas para que podamos sugerirte las mejores recetas",
    progress: 66,
    icon: "🍴"
  },
  {
    id: "basics",
    title: "Información básica",
    subtitle: "Para personalizar las porciones y adaptar las recetas a tu experiencia",
    progress: 100,
    icon: "👥"
  }
];

const DIETARY_OPTIONS = [
  { id: "vegetarian", label: "Vegetariano", icon: "🥬" },
  { id: "vegan", label: "Vegano", icon: "🌱" },
  { id: "gluten_free", label: "Sin gluten", icon: "🌾" },
  { id: "lactose_free", label: "Sin lactosa", icon: "🥛" },
  { id: "keto", label: "Keto", icon: "🥑" },
  { id: "paleo", label: "Paleo", icon: "🍖" },
  { id: "halal", label: "Halal", icon: "☪️" },
  { id: "kosher", label: "Kosher", icon: "✡️" },
  { id: "none", label: "Ninguna", icon: "✅" }
];

const CUISINE_OPTIONS = [
  { id: "mediterranean", label: "Mediterránea", icon: "🫒" },
  { id: "mexican", label: "Mexicana", icon: "🌶️" },
  { id: "italian", label: "Italiana", icon: "🍝" },
  { id: "asian", label: "Asiática", icon: "🥢" },
  { id: "indian", label: "India", icon: "🍛" },
  { id: "spanish", label: "Española", icon: "🥘" },
  { id: "american", label: "Americana", icon: "🍔" },
  { id: "french", label: "Francesa", icon: "🥖" },
  { id: "healthy", label: "Saludable", icon: "🥗" },
  { id: "fast", label: "Rápida", icon: "⚡" }
];

const LEVEL_OPTIONS = [
  { id: "beginner", label: "Principiante", description: "Recetas muy simples", icon: "😊" },
  { id: "intermediate", label: "Intermedio", description: "Instrucciones normales", icon: "🤓" },
  { id: "advanced", label: "Avanzado", description: "Me gusta experimentar", icon: "🔥" }
];

const HOUSEHOLD_OPTIONS = [
  { id: "1", label: "Solo/a", icon: "👤" },
  { id: "2", label: "En pareja", icon: "👥" },
  { id: "3", label: "Familia (3-4)", icon: "👪" },
  { id: "5", label: "Familia grande (5+)", icon: "👨‍👩‍👧‍👦👧" }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    dietary_preferences: [],
    favorite_cuisines: [],
    cooking_experience: "intermediate",
    household_size: 2,
    weekly_budget: 50, // Valor por defecto sensato
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      if (userData.onboarding_completed) {
        // Pre-llenar con datos existentes
        setFormData({
          dietary_preferences: userData.dietary_preferences || [],
          favorite_cuisines: userData.favorite_cuisines || [],
          cooking_experience: userData.cooking_experience || "intermediate",
          household_size: userData.household_size || 2,
          weekly_budget: userData.weekly_budget || 50,
        });
      }
    } catch (error) {
      console.error("Error loading user data for onboarding:", error);
      await User.loginWithRedirect(window.location.href);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.dietary_preferences.length > 0;
      case 1: return formData.favorite_cuisines.length > 0;
      case 2: return formData.cooking_experience !== "" && formData.household_size > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    if (user?.onboarding_completed) {
      navigate(createPageUrl("Profile"));
    } else {
      navigate(createPageUrl("Dashboard"));
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await User.updateMyUserData({
        ...formData,
        onboarding_completed: true
      });

      setToast({ type: 'success', message: '¡Perfil configurado correctamente!' });
      setTimeout(() => {
        navigate(createPageUrl("Dashboard"));
      }, 1500);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setToast({ type: 'error', message: 'Error al guardar la configuración. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (array, item) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const currentStepData = STEPS[currentStep];

  const OptionButton = ({ option, selected, onClick, showDescription = false }) => (
    <div
      className={`p-4 rounded-2xl cursor-pointer transition-all hover:scale-105 ${
        selected
          ? 'bg-teal-600 text-white shadow-lg ring-2 ring-teal-300'
          : 'bg-white text-gray-800 border-2 border-gray-200 hover:border-teal-300 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{option.icon}</span>
        <div className="flex-1 text-left">
          <div className="font-semibold">{option.label}</div>
          {showDescription && (
            <div className={`text-sm ${selected ? 'text-teal-100' : 'text-gray-500'}`}>
              {option.description}
            </div>
          )}
        </div>
        {selected && <Check className="w-5 h-5" />}
      </div>
    </div>
  );

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b rounded-t-3xl flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://ethic.es/wp-content/uploads/2023/03/imagen.jpg"
                  alt="Fresco"
                  className="h-8"
                />
                <div>
                  <div className="text-lg font-semibold text-gray-900">Bienvenido a Fresco</div>
                  <div className="text-sm text-gray-500">Paso {currentStep + 1} de {STEPS.length}</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progreso</span>
                <span>{currentStepData.progress}%</span>
              </div>
              <Progress value={currentStepData.progress} className="h-2" />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 flex-1 overflow-y-auto">
            
            {/* Step Icon */}
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {typeof currentStepData.icon === 'string' ? (
                <span className="text-2xl">{currentStepData.icon}</span>
              ) : (
                <currentStepData.icon className="w-8 h-8 text-teal-600" />
              )}
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {currentStepData.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {currentStepData.subtitle}
              </p>
              
              {/* EXPLICACIÓN DE VALOR - Solo en el último paso */}
              {currentStep === 2 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-orange-50 rounded-xl border border-teal-200">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <Sparkles className="w-5 h-5 text-teal-600" />
                    <span className="font-semibold text-teal-800">¿Cómo te ayudamos?</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Con los datos que has guardado, nuestra IA creará <strong>menús personalizados</strong> que respetan 
                    tus preferencias dietéticas y nivel de cocina. Esto te ayudará a <strong>ahorrar tiempo planificando</strong> 
                    y <strong>dinero comprando</strong> solo lo que necesitas cada semana.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              
              {/* Step 0: Dietary Restrictions */}
              {currentStep === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DIETARY_OPTIONS.map((option) => (
                    <OptionButton
                      key={option.id}
                      option={option}
                      selected={formData.dietary_preferences.includes(option.id)}
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          dietary_preferences: toggleArrayItem(prev.dietary_preferences, option.id)
                        }))
                      }
                    />
                  ))}
                </div>
              )}

              {/* Step 1: Cuisine Types */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CUISINE_OPTIONS.map((option) => (
                    <OptionButton
                      key={option.id}
                      option={option}
                      selected={formData.favorite_cuisines.includes(option.id)}
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          favorite_cuisines: toggleArrayItem(prev.favorite_cuisines, option.id)
                        }))
                      }
                    />
                  ))}
                </div>
              )}

              {/* Step 2: Basics Combined */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">¿Cuál es tu nivel de cocina?</Label>
                    <div className="space-y-3">
                      {LEVEL_OPTIONS.map((option) => (
                        <OptionButton
                          key={option.id}
                          option={option}
                          selected={formData.cooking_experience === option.id}
                          onClick={() =>
                            setFormData(prev => ({ ...prev, cooking_experience: option.id }))
                          }
                          showDescription={true}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-3 block">¿Para cuántas personas cocinas?</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {HOUSEHOLD_OPTIONS.map((option) => (
                        <OptionButton
                          key={option.id}
                          option={option}
                          selected={formData.household_size === parseInt(option.id)}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, household_size: parseInt(option.id) }))
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-between p-6 border-t bg-gray-50 rounded-b-3xl flex-shrink-0">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? handleCancel : handlePrevious}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{currentStep === 0 ? 'Más tarde' : 'Anterior'}</span>
              <span className="sm:hidden">{currentStep === 0 ? 'Salir' : 'Volver'}</span>
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
              >
                <span className="hidden sm:inline">Continuar</span>
                <span className="sm:hidden">Siguiente</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading || !isStepValid()}
                className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    ¡Empezar a cocinar!
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
