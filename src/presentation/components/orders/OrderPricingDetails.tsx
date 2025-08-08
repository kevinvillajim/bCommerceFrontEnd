// src/presentation/components/orders/OrderPricingDetails.tsx
import React from 'react';
import { ShoppingCart, Store, Truck, Receipt, Percent } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters/formatCurrency';
import type { OrderUI } from '../../../core/adapters/OrderServiceAdapter';

interface OrderPricingDetailsProps {
  order: OrderUI;
  viewType: 'customer' | 'seller';
  sellerId?: number;
}

/**
 * ✅ COMPONENTE CRÍTICO: Muestra detalles de pricing según el tipo de usuario
 * 
 * CUSTOMER VIEW: Muestra todos los descuentos, envío y total final ($8.87)
 * SELLER VIEW: Muestra solo valor de productos de su tienda (con descuentos seller/volumen)
 */
const OrderPricingDetails: React.FC<OrderPricingDetailsProps> = ({ 
  order, 
  viewType, 
  sellerId 
}) => {
  
  // ✅ FILTRAR ITEMS DEL SELLER (si es vista de seller)
  const relevantItems = viewType === 'seller' && sellerId 
    ? order.items.filter(item => {
        // Aquí deberías filtrar por seller_id del producto
        // Por ahora asumimos que todos los items son del seller
        return true;
      })
    : order.items;

  // ✅ CALCULAR VALORES SEGÚN EL TIPO DE VISTA
  const calculateValues = () => {
    if (viewType === 'customer') {
      // ✅ VISTA CLIENTE: Mostrar TODO (descuentos, envío, IVA, total)
      return {
        subtotalOriginal: relevantItems.reduce((sum, item) => 
          sum + (item.originalPrice || item.price) * item.quantity, 0),
        subtotalWithDiscounts: relevantItems.reduce((sum, item) => 
          sum + item.price * item.quantity, 0),
        sellerDiscounts: relevantItems.reduce((sum, item) => 
          sum + ((item.originalPrice || item.price) - item.price) * item.quantity, 0),
        volumeDiscounts: order.volumeDiscountSavings || 0,
        couponDiscounts: order.totalDiscounts - (order.volumeDiscountSavings || 0), // Cupones = total - volumen
        shippingCost: order.shippingCost || 0,
        taxAmount: order.taxAmount,
        finalTotal: order.total,
        showShipping: true,
        showTax: true,
        showCoupons: true
      };
    } else {
      // ✅ VISTA SELLER: Solo productos de su tienda (sin cupones, sin envío final)
      const sellerSubtotal = relevantItems.reduce((sum, item) => 
        sum + item.price * item.quantity, 0);
      
      const sellerDiscountAmount = relevantItems.reduce((sum, item) => 
        sum + ((item.originalPrice || item.price) - item.price) * item.quantity, 0);
      
      // El seller recibe: subtotal + envío (como ingreso) - 10% plataforma - 5% logística
      const platformFee = sellerSubtotal * 0.10; // 10% de la plataforma
      const logisticsFee = sellerSubtotal * 0.05; // 5% logística  
      const sellerPayout = sellerSubtotal + (order.shippingCost || 0) - platformFee - logisticsFee;
      
      return {
        subtotalOriginal: relevantItems.reduce((sum, item) => 
          sum + (item.originalPrice || item.price) * item.quantity, 0),
        subtotalWithDiscounts: sellerSubtotal,
        sellerDiscounts: sellerDiscountAmount,
        volumeDiscounts: order.volumeDiscountSavings || 0,
        couponDiscounts: 0, // Seller no ve cupones (los asume la tienda)
        shippingCost: order.shippingCost || 0, // Seller ve envío como ingreso
        platformFee,
        logisticsFee,
        finalTotal: sellerPayout, // Lo que realmente recibe el seller
        showShipping: true,
        showTax: false, // Seller no maneja IVA directamente
        showCoupons: false, // Seller no ve cupones
        showFees: true // Mostrar comisiones
      };
    }
  };

  const values = calculateValues();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        {viewType === 'customer' ? (
          <Receipt className="w-5 h-5 text-blue-600 mr-2" />
        ) : (
          <Store className="w-5 h-5 text-green-600 mr-2" />
        )}
        <h3 className="text-lg font-semibold text-gray-900">
          {viewType === 'customer' ? 'Detalles de tu Compra' : 'Resumen de Venta'}
        </h3>
      </div>

      <div className="space-y-3">
        {/* Subtotal Original */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-600">Subtotal (precio original)</span>
          <span className="font-medium">{formatCurrency(values.subtotalOriginal)}</span>
        </div>

        {/* Descuentos del Seller */}
        {values.sellerDiscounts > 0 && (
          <div className="flex justify-between items-center py-2 text-green-600">
            <div className="flex items-center">
              <Percent className="w-4 h-4 mr-1" />
              <span>Descuentos del vendedor</span>
            </div>
            <span className="font-medium">-{formatCurrency(values.sellerDiscounts)}</span>
          </div>
        )}

        {/* Descuentos por Volumen */}
        {values.volumeDiscounts > 0 && (
          <div className="flex justify-between items-center py-2 text-green-600">
            <div className="flex items-center">
              <ShoppingCart className="w-4 h-4 mr-1" />
              <span>Descuentos por volumen</span>
            </div>
            <span className="font-medium">-{formatCurrency(values.volumeDiscounts)}</span>
          </div>
        )}

        {/* Subtotal con Descuentos */}
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="font-medium text-gray-800">Subtotal con descuentos</span>
          <span className="font-semibold">{formatCurrency(values.subtotalWithDiscounts)}</span>
        </div>

        {/* Cupones (Solo Cliente) */}
        {values.showCoupons && values.couponDiscounts > 0 && (
          <div className="flex justify-between items-center py-2 text-blue-600">
            <div className="flex items-center">
              <Percent className="w-4 h-4 mr-1" />
              <span>Descuento por cupón</span>
            </div>
            <span className="font-medium">-{formatCurrency(values.couponDiscounts)}</span>
          </div>
        )}

        {/* Envío */}
        {values.showShipping && (
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center">
              <Truck className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-gray-600">
                {viewType === 'customer' ? 'Costo de envío' : 'Envío (ingreso)'}
              </span>
            </div>
            <span className="font-medium text-gray-800">
              {order.freeShipping ? (
                <span className="text-green-600 font-semibold">GRATIS</span>
              ) : (
                <span className={viewType === 'seller' ? 'text-green-600' : ''}>
                  {viewType === 'seller' ? '+' : ''}{formatCurrency(values.shippingCost)}
                </span>
              )}
            </span>
          </div>
        )}

        {/* Comisiones (Solo Seller) */}
        {values.showFees && (
          <>
            <div className="flex justify-between items-center py-2 text-red-600">
              <span>Comisión plataforma (10%)</span>
              <span className="font-medium">-{formatCurrency(values.platformFee!)}</span>
            </div>
            <div className="flex justify-between items-center py-2 text-red-600">
              <span>Comisión logística (5%)</span>
              <span className="font-medium">-{formatCurrency(values.logisticsFee!)}</span>
            </div>
          </>
        )}

        {/* IVA (Solo Cliente) */}
        {values.showTax && (
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">IVA (15%)</span>
            <span className="font-medium">{formatCurrency(values.taxAmount)}</span>
          </div>
        )}

        {/* Total Final */}
        <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 mt-4">
          <span className="text-lg font-bold text-gray-900">
            {viewType === 'customer' ? 'Total Pagado' : 'Total a Recibir'}
          </span>
          <span className="text-xl font-bold text-gray-900">
            {formatCurrency(values.finalTotal)}
          </span>
        </div>

        {/* Notas Informativas */}
        {viewType === 'seller' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Los cupones de descuento son asumidos por la tienda. 
              El envío se incluye como ingreso y las comisiones se descuentan del total.
            </p>
          </div>
        )}

        {viewType === 'customer' && order.volumeDiscountsApplied && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>¡Ahorraste!</strong> Se aplicaron descuentos por volumen en tu compra.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPricingDetails;