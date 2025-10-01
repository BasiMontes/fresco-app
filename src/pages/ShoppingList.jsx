
import React, { useState } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Loader2,
  RefreshCw,
  Scale,
  Calendar,
  ChefHat
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthWall from '../components/auth/AuthWall';
import { useShoppingList } from '@/components/providers/ShoppingListProvider';

const CATEGORY_ICONS = {
  vegetables: "🥕",
  fruits: "🍎", 
  dairy: "🥛",
  meat: "🥩",
  fish: "🐟",
  grains: "🌾",
  spices: "🧂",
  oils: "🫒",
  other: "📦"
};

const CATEGORY_NAMES = {
  vegetables: "Verduras",
  fruits: "Frutas",
  dairy: "Lácteos", 
  meat: "Carnes",
  fish: "Pescados",
  grains: "Cereales",
  spices: "Especias",
  oils: "Aceites",
  other: "Otros"
};

export default function ShoppingListPage() {
  const { 
    currentWeekList, 
    loading, 
    hasMealPlan, 
    generateList, 
    updateItem 
  } = useShoppingList();
  
  const [generating, setGenerating] = useState(false);
  const [comparingPrices, setComparingPrices] = useState(false);
  const [priceComparison, setPriceComparison] = useState(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const navigate = useNavigate();

  const handleGenerateList = async () => {
    setGenerating(true);
    try {
      await generateList();
    } catch (error) {
      console.error("Error generating list:", error);
    } finally {
      setGenerating(false);
    }
  };

  const comparePrices = async () => {
    setComparingPrices(true);
    try {
      const itemsText = currentWeekList.items.map(item => 
        `${item.ingredient_name} (${item.quantity} ${item.unit})`
      ).join(', ');

      const response = await InvokeLLM({
        prompt: `Compara precios para los siguientes productos de supermercado en España: ${itemsText}.
        Genera una comparación de precios entre 3 supermercados principales (Mercadona, Carrefour, Lidl).
        Para cada producto, proporciona el precio estimado en cada supermercado y calcula el total por supermercado.
        También incluye recomendaciones sobre dónde es mejor comprar cada categoría de productos.`,
        response_json_schema: {
          type: "object",
          properties: {
            supermarkets: {
              type: "array",
              items: {
                type: "object", 
                properties: {
                  name: { type: "string" },
                  total_cost: { type: "number" },
                  savings: { type: "number" },
                  best_categories: { type: "array", items: { type: "string" } }
                }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  best_store: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      setPriceComparison(response);
      setShowPriceModal(true);
    } catch (error) {
      console.error("Error comparing prices:", error);
    } finally {
      setComparingPrices(false);
    }
  };

  const toggleItemPurchased = async (itemIndex) => {
    if (!currentWeekList) return;
    await updateItem(itemIndex, { 
      is_purchased: !currentWeekList.items[itemIndex].is_purchased 
    });
  };

  const groupedItems = currentWeekList?.items.reduce((groups, item, index) => {
    const category = item.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push({ ...item, index });
    return groups;
  }, {}) || {};

  const completedItems = currentWeekList?.items.filter(item => item.is_purchased).length || 0;
  const totalItems = currentWeekList?.items.length || 0;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const spentAmount = currentWeekList?.items.filter(item => item.is_purchased)
    .reduce((sum, item) => sum + item.estimated_price, 0) || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-teal-600" />
          Lista de Compras
        </h1>
        <p className="text-gray-600">
          Organiza tus compras de forma inteligente y ahorra tiempo
        </p>
      </div>

      {/* Mostrar mensaje PROACTIVO si no hay plan de comidas */}
      {!hasMealPlan ? (
        <Card className="text-center py-12">
          <CardContent>
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Tu lista está vacía porque tu plan semanal no tiene comidas
            </h3>
            <p className="text-gray-500 mb-6">
              ¡Vamos a planificar tus comidas para crear automáticamente tu lista de compras!
            </p>
            <Button
              onClick={() => navigate(createPageUrl("WeeklyPlanner"))}
              className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
              size="lg"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Ir a Planificar Comidas
            </Button>
          </CardContent>
        </Card>
      ) : !currentWeekList ? (
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Lista lista para generar
            </h3>
            <p className="text-gray-500 mb-6">
              Tienes comidas planificadas. ¡Genera tu lista de compras automáticamente!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleGenerateList}
                disabled={generating}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
                size="lg"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {generating ? "Generando..." : "Generar Lista de Compras"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Action Buttons - DISEÑO LIMPIO */}
          <div className="mb-6">
            <div className="flex flex-row gap-3">
              <div className="flex-1">
                <Button
                  onClick={handleGenerateList}
                  disabled={generating}
                  className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 w-full"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {generating ? "Actualizando..." : "Actualizar Lista"}
                </Button>
              </div>
              <div className="flex-1">
                <Button
                  variant="outline"
                  onClick={comparePrices}
                  disabled={comparingPrices}
                  className="w-full"
                >
                  {comparingPrices ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Scale className="w-4 h-4 mr-2" />
                  )}
                  {comparingPrices ? "Comparando..." : "Comparar Precios"}
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <Card className="glass-effect border border-gray-200/50 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Progreso de Compras</span>
                <Badge className={`${progressPercent === 100 ? 'bg-green-600' : 'bg-teal-600'} text-white`}>
                  {completedItems}/{totalItems}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {progressPercent === 100 ? "¡Compra completada!" : `${Math.round(progressPercent)}% completado`}
                  </span>
                  <div className="text-right">
                    {spentAmount > 0 && (
                      <div className="text-sm text-gray-600">
                        Gastado: €{spentAmount.toFixed(2)}
                      </div>
                    )}
                    <span className="text-lg font-semibold text-teal-600">
                      Total: €{currentWeekList.total_estimated_cost?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shopping List */}
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <Card key={category} className="glass-effect border border-gray-200/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">{CATEGORY_ICONS[category]}</span>
                    <span>{CATEGORY_NAMES[category]}</span>
                    <Badge variant="secondary">
                      {items.length} {items.length === 1 ? 'producto' : 'productos'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.index}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                          item.is_purchased
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200 hover:border-teal-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={item.is_purchased}
                            onCheckedChange={() => toggleItemPurchased(item.index)}
                          />
                          <div>
                            <p className={`font-medium ${item.is_purchased ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {item.ingredient_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.quantity} {item.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${item.is_purchased ? 'text-gray-500' : 'text-gray-900'}`}>
                            €{item.estimated_price?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Price Comparison Modal */}
      <Dialog open={showPriceModal} onOpenChange={setShowPriceModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comparación de Precios <Badge className="ml-2 bg-purple-100 text-purple-800">Powered by IA</Badge></DialogTitle>
          </DialogHeader>

          {priceComparison && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {priceComparison.supermarkets?.map((store, index) => {
                  const isLowest = store.total_cost === Math.min(...priceComparison.supermarkets.map(s => s.total_cost));
                  return (
                    <Card key={index} className={`${isLowest ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                          <span>{store.name}</span>
                          {isLowest && <Badge className="bg-green-600">Mejor precio</Badge>}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-gray-900">
                            €{store.total_cost?.toFixed(2)}
                          </div>
                          {store.savings > 0 && (
                            <div className="text-sm text-green-600">
                              Ahorras €{store.savings?.toFixed(2)}
                            </div>
                          )}
                          <div className="text-sm text-gray-600">
                            Mejor en: {store.best_categories?.join(', ')}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div>
                <h3 className="font-semibold mb-4">Recomendaciones por Categoría</h3>
                <div className="space-y-3">
                  {priceComparison.recommendations?.map((rec, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{CATEGORY_NAMES[rec.category] || rec.category}</span>
                        <Badge variant="outline">{rec.best_store}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
