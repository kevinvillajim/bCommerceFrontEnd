// src/presentation/components/orders/OrderItemsList.tsx
import React, { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters/formatCurrency';
import { useImageCache } from '../../hooks/useImageCache';
import OrderBreakdownService, { type OrderItemBreakdown } from '../../../core/services/OrderBreakdownService';
import type { OrderUI } from '../../../core/adapters/OrderServiceAdapter';

interface OrderItemsListProps {
  order: OrderUI;
  viewType: 'customer' | 'seller';
  sellerId?: number;
}

/**
 * ✅ COMPONENTE: Lista de items con información de descuentos detallada
 * Muestra precios originales, descuentos aplicados y precios finales
 */
const OrderItemsList: React.FC<OrderItemsListProps> = ({ 
  order, 
  viewType, 
  sellerId 
}) => {
  
  // ✅ HOOK PARA GESTIÓN OPTIMIZADA DE IMÁGENES
  const { getOptimizedImageUrl } = useImageCache();
  
  // Estado para el desglose de items
  const [itemsBreakdown, setItemsBreakdown] = useState<OrderItemBreakdown[]>([]);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  
  // Cargar desglose de items cuando se monta el componente
  useEffect(() => {
    const loadBreakdown = async () => {
      if (order.id) {
        setLoadingBreakdown(true);
        try {
          const breakdownService = OrderBreakdownService.getInstance();
          // ✅ PASAR EL viewType AL SERVICIO
          const response = await breakdownService.getOrderItemsBreakdown(order.id, viewType);
          console.log('📊 Desglose recibido en componente (viewType: ' + viewType + '):', response);
          console.log('📦 Items del orden:', order.items);
          setItemsBreakdown(response.items);
        } catch (error) {
          console.error('Error cargando desglose:', error);
        } finally {
          setLoadingBreakdown(false);
        }
      }
    };
    
    loadBreakdown();
  }, [order.id]);
  
  // ✅ FILTRAR ITEMS RELEVANTES
  const relevantItems = viewType === 'seller' && sellerId 
    ? order.items // Por ahora mostrar todos
    : order.items;

  if (!relevantItems || relevantItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          No hay productos en esta orden
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Package className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Productos {viewType === 'seller' ? 'de tu Tienda' : 'Comprados'}
        </h3>
        <span className="ml-2 text-sm text-gray-500">
          ({relevantItems.length} {relevantItems.length === 1 ? 'producto' : 'productos'})
        </span>
      </div>

      <div className="space-y-4">
        {relevantItems.map((item, index) => {
          // ✅ OBTENER URL DE IMAGEN OPTIMIZADA
          const imageUrl = getOptimizedImageUrl(
            { 
              image: item.image,
              main_image: item.image,
            }, 
            "thumbnail"
          );

          return (
          <div key={item.id || index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              {/* Imagen del Producto */}
              <div className="flex-shrink-0">
                {item.image ? (
                  <img 
                    src={imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      // Fallback en caso de error
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                {/* Fallback icon (hidden by default) */}
                <div className="hidden fallback-icon w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              </div>

              {/* Información del Producto */}
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-medium text-gray-900 truncate">
                  {item.name}
                </h4>
                
                {/* ✅ DESGLOSE DETALLADO DE DESCUENTOS DESDE API */}
                {(() => {
                  // Buscar el breakdown correspondiente a este item
                  // item.productId puede venir como productId o product_id según la fuente
                  const itemProductId = item.productId || (item as any).product_id;
                  console.log('🔍 Buscando breakdown para producto:', {
                    itemProductId,
                    item,
                    itemsBreakdown,
                    breakdownProductIds: itemsBreakdown.map(b => b.product_id)
                  });
                  const itemBreakdown = itemsBreakdown.find(b => b.product_id === itemProductId || b.product_id === Number(itemProductId));
                  
                  if (loadingBreakdown) {
                    return (
                      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    );
                  }
                  
                  if (!itemBreakdown) {
                    return null;
                  }
                  
                  return (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-3">
                        {/* ✅ INFORMACIÓN CRÍTICA PARA EL SELLER */}
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="text-sm font-semibold text-gray-700"> Cantidad a enviar:</span>
                          <span className="text-lg font-bold text-primary-600">{itemBreakdown.quantity}</span>
                        </div>
                        
                        {/* Precios */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Precio unitario original:</span>
                            <span className="text-sm text-gray-900">{formatCurrency(itemBreakdown.original_price_per_unit)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Precio unitario final:</span>
                            <span className="text-sm font-medium text-gray-900">{formatCurrency(itemBreakdown.final_price_per_unit)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-700">Subtotal del producto:</span>
                            <span className="text-sm font-bold text-gray-900">{formatCurrency(itemBreakdown.subtotal)}</span>
                          </div>
                        </div>

                        {/* Descuentos aplicados */}
                        {itemBreakdown.breakdown_steps && itemBreakdown.breakdown_steps.length > 1 && (
                          <div className="border-t border-gray-200 pt-2">
                            <span className="text-sm font-semibold text-gray-700 mb-2 block">Descuentos aplicados:</span>
                            {itemBreakdown.breakdown_steps
                              .filter(step => step.is_discount)
                              .map((step, stepIndex) => (
                                <div key={stepIndex} className="flex justify-between items-center text-sm">
                                  <span className="text-green-600">• {step.label}</span>
                                  <span className="text-green-600 font-medium">-{step.percentage}%</span>
                                </div>
                            ))}
                          </div>
                        )}

                        {/* Información específica para Seller */}
                        {viewType === 'seller' && (
                          <div className="border-t border-gray-200 pt-2 bg-blue-50 p-3 rounded -m-3 mt-3">
                            <span className="text-sm font-semibold text-blue-800 mb-2 block">💰 Información de ganancias:</span>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-blue-700">Comisión de plataforma:</span>
                                <span className="text-blue-900 font-medium">10%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-700">Tu ganancia (productos):</span>
                                <span className="text-blue-900 font-bold">{formatCurrency(itemBreakdown.subtotal * 0.9)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Resumen de Descuentos por Items */}
      {relevantItems.some(item => item.hasVolumeDiscount) && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="text-sm font-semibold text-green-800 mb-2">
            🎉 Descuentos por Volumen Aplicados
          </h4>
          <div className="text-sm text-green-700">
            {relevantItems.filter(item => item.hasVolumeDiscount).length} producto(s) 
            con descuentos automáticos por cantidad comprada.
          </div>
        </div>
      )}

      {/* Nota para Sellers */}
      {viewType === 'seller' && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Información del Vendedor:</strong> Los precios mostrados son los finales 
            que se usaron para calcular tu comisión. Los descuentos ya están aplicados.
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderItemsList;