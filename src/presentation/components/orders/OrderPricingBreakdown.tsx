import React from 'react';
import { formatCurrency } from '../../../utils/formatters/formatCurrency';
import { Tag, TrendingDown, Truck, Receipt } from 'lucide-react';

interface PricingBreakdownProps {
  originalSubtotal: number;
  sellerDiscounts: number;
  volumeDiscounts: number;
  couponDiscount: number;
  couponCode?: string;
  subtotalAfterDiscounts: number;
  shipping: number;
  freeShipping: boolean;
  tax: number;
  total: number;
  isSellerView?: boolean; // Si es true, muestra vista del vendedor
}

/**
 * Componente para mostrar el desglose detallado de precios
 * Muestra diferente información según si es para el usuario o el vendedor
 */
const OrderPricingBreakdown: React.FC<PricingBreakdownProps> = ({
  originalSubtotal,
  sellerDiscounts,
  volumeDiscounts,
  couponDiscount,
  couponCode,
  subtotalAfterDiscounts,
  shipping,
  freeShipping,
  tax,
  total,
  isSellerView = false
}) => {
  const totalDiscounts = sellerDiscounts + volumeDiscounts + couponDiscount;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
        <Receipt className="w-5 h-5 mr-2" />
        {isSellerView ? 'Desglose de Ganancias' : 'Desglose de Precio'}
      </h3>
      
      <div className="space-y-3">
        {/* Precio Original */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal original:</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {formatCurrency(originalSubtotal)}
          </span>
        </div>

        {/* Descuentos */}
        {totalDiscounts > 0 && (
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <TrendingDown className="w-4 h-4 mr-2 text-green-600" />
              Descuentos aplicados:</div>
            
            {sellerDiscounts > 0 && (
              <div className="flex justify-between text-sm pl-6">
                <span className="text-gray-600 dark:text-gray-400">
                  Descuento del vendedor:
                </span>
                <span className="text-green-600 dark:text-green-400">
                  -{formatCurrency(sellerDiscounts)}
                </span>
              </div>
            )}
            
            {volumeDiscounts > 0 && (
              <div className="flex justify-between text-sm pl-6">
                <span className="text-gray-600 dark:text-gray-400">
                  Descuento por volumen:
                </span>
                <span className="text-green-600 dark:text-green-400">
                  -{formatCurrency(volumeDiscounts)}
                </span>
              </div>
            )}
            
            {!isSellerView && couponDiscount > 0 && (
              <div className="flex justify-between text-sm pl-6">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  Cupón {couponCode ? `(${couponCode})` : ''}:
                </span>
                <span className="text-green-600 dark:text-green-400">
                  -{formatCurrency(couponDiscount)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Subtotal con descuentos */}
        <div className="flex justify-between text-sm font-medium border-t pt-3">
          <span className="text-gray-700 dark:text-gray-300">
            {isSellerView ? 'Tu ganancia por productos:' : 'Subtotal con descuentos:'}
          </span>
          <span className="text-gray-900 dark:text-white">
            {formatCurrency(isSellerView ? subtotalAfterDiscounts : subtotalAfterDiscounts)}
          </span>
        </div>

        {/* Solo mostrar envío e IVA en vista de usuario */}
        {!isSellerView && (
          <>
            {/* Envío */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Envío {freeShipping && '(Gratis)'}:
              </span>
              <span className={freeShipping ? 'text-green-600' : 'text-gray-900 dark:text-white'}>
                {freeShipping ? 'GRATIS' : formatCurrency(shipping)}
              </span>
            </div>

            {/* IVA */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">IVA (15%):</span>
              <span className="text-gray-900 dark:text-white">
                {formatCurrency(tax)}
              </span>
            </div>
          </>
        )}

        {/* Total */}
        <div className="flex justify-between text-base font-bold border-t pt-3 mt-3">
          <span className="text-gray-900 dark:text-white">
            {isSellerView ? 'Total a recibir:' : 'Total pagado:'}
          </span>
          <span className="text-xl text-gray-900 dark:text-white">
            {formatCurrency(isSellerView ? subtotalAfterDiscounts : total)}
          </span>
        </div>

        {/* Mensaje de ahorro */}
        {!isSellerView && totalDiscounts > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mt-3">
            <p className="text-sm text-green-700 dark:text-green-400 font-medium text-center">
              ¡Has ahorrado {formatCurrency(totalDiscounts)} en esta compra!
            </p>
          </div>
        )}

        {/* Nota para vendedor sobre cupones */}
        {isSellerView && couponDiscount > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-3">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              <strong>Nota:</strong> El cupón de descuento ({couponCode}) es asumido por la plataforma. 
              Recibirás el monto completo mostrado arriba.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPricingBreakdown;