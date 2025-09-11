# 🎯 GUÍA DE PRECISIÓN MATEMÁTICA EN BCOMMERCE

## 📋 Resumen Ejecutivo

Esta guía establece las reglas para mantener precisión matemática perfecta entre backend y frontend en el sistema de cálculos de BCommerce.

**REGLA DE ORO**: Los cálculos del core NO deben redondear valores intermedios. Solo redondear para display/presentación.

## 🚫 QUE NO HACER - Errores Comunes

### ❌ Redondear en Cálculos Intermedios
```typescript
// INCORRECTO - Introduce errores de precisión
const sellerDiscount = Math.round(basePrice * 0.10 * 100) / 100;
const volumeDiscount = Math.round(priceAfterSeller * 0.05 * 100) / 100;
const subtotal = Math.round((priceAfterSeller - volumeDiscount) * quantity * 100) / 100;
```

### ❌ Usar `toFixed()` en Lógica de Negocio
```typescript
// INCORRECTO - Convierte a string y pierde precisión
const tax = parseFloat((subtotal * 0.15).toFixed(2));
```

### ❌ Redondear en Servicios Core
```typescript
// INCORRECTO - En EcommerceCalculator o servicios de cálculo
private calculateTax(amount: number): number {
  return Math.round(amount * this.taxRate * 100) / 100; // ❌ NO HACER
}
```

## ✅ QUE SÍ HACER - Mejores Prácticas

### ✅ Mantener Precisión en Cálculos
```typescript
// CORRECTO - Sin redondeo intermedio
const sellerDiscount = basePrice * 0.10;
const volumeDiscount = priceAfterSeller * 0.05;  
const subtotal = (priceAfterSeller - volumeDiscount) * quantity;
```

### ✅ Redondear Solo Para Display
```typescript
// CORRECTO - Usar utilidades de formateo
import { formatPrice, roundForDisplay } from '../utils/priceFormatter';

// En componentes React
<span>{formatPrice(calculatedTotal)}</span>

// En funciones de display
const displayValue = roundForDisplay(internalValue);
```

### ✅ Separar Lógica vs Presentación
```typescript
// CORRECTO - Archivo de servicio (NO redondear)
export class PricingService {
  calculateTotals(items: Item[]): PricingResult {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * this.taxRate; // Sin redondeo
    return { subtotal, tax, total: subtotal + tax }; // Sin redondeo
  }
}

// CORRECTO - Componente React (SÍ redondear para display)
import { formatPrice } from '../utils/priceFormatter';

function CheckoutSummary({ totals }: Props) {
  return (
    <div>
      <span>Subtotal: {formatPrice(totals.subtotal)}</span>
      <span>Tax: {formatPrice(totals.tax)}</span>
      <span>Total: {formatPrice(totals.total)}</span>
    </div>
  );
}
```

## 🔧 Herramientas Disponibles

### Para Cálculos (Core Logic)
- `EcommerceCalculator` - Calculadora principal sin redondeos intermedios
- `volumeDiscountCalculator` - Solo para descuentos, sin redondear
- `CheckoutItemsService` - Usa EcommerceCalculator internamente

### Para Display (Presentación)
- `priceFormatter.ts` - Utilidades de formateo
  - `formatPrice(price)` - Formatea con símbolo de moneda
  - `formatPriceValue(price)` - Formatea sin símbolo
  - `roundForDisplay(value)` - Redondea SOLO para mostrar
  - `formatPercentage(percent)` - Formatea porcentajes

## 📏 Casos de Uso Específicos

### Cálculo de Descuentos
```typescript
// CORRECTO - Secuencia sin redondeos intermedios
export class DiscountCalculator {
  calculateDiscounts(item: CartItem): DiscountResult {
    const originalPrice = item.basePrice;
    
    // Paso 1: Descuento seller (sin redondear)
    const sellerDiscountAmount = originalPrice * (item.sellerDiscountPercentage / 100);
    const priceAfterSeller = originalPrice - sellerDiscountAmount;
    
    // Paso 2: Descuento volumen (sin redondear) 
    const volumeDiscountAmount = priceAfterSeller * (this.getVolumeDiscountPercentage(item.quantity) / 100);
    const finalPrice = priceAfterSeller - volumeDiscountAmount;
    
    return {
      originalPrice,           // Sin redondear
      priceAfterSeller,       // Sin redondear
      finalPrice,             // Sin redondear
      sellerDiscountAmount,   // Sin redondear
      volumeDiscountAmount    // Sin redondear
    };
  }
}
```

### Display en React Components
```typescript
// CORRECTO - Usar formatters para mostrar al usuario
import { formatPrice, formatPercentage } from '../utils/priceFormatter';

function ProductCard({ product, discountInfo }: Props) {
  return (
    <div>
      <span className="original-price">
        {formatPrice(discountInfo.originalPrice)}
      </span>
      <span className="discounted-price">
        {formatPrice(discountInfo.finalPrice)}
      </span>
      <span className="discount-badge">
        {formatPercentage(product.discountPercentage)}
      </span>
    </div>
  );
}
```

## 🧮 Flujo de Datos Completo

```
[Backend - Sin redondeo intermedio] 
    ↓ (valores precisos)
[Frontend Core Services - Sin redondeo intermedio]
    ↓ (valores precisos) 
[React Components - Redondear SOLO para display]
    ↓ (valores formateados)
[Usuario ve valores redondeados]
```

## 🚨 Validación y Testing

### Tests de Precisión
```typescript
describe('Precision Tests', () => {
  it('should maintain precision through calculation chain', () => {
    const basePrice = 2.50;
    const quantity = 3;
    const sellerDiscount = 0.10; // 10%
    const volumeDiscount = 0.05;  // 5%
    
    // Cálculo manual paso a paso
    const afterSeller = basePrice * (1 - sellerDiscount); // 2.25
    const afterVolume = afterSeller * (1 - volumeDiscount); // 2.1375
    const subtotal = afterVolume * quantity; // 6.4125
    
    const result = EcommerceCalculator.calculate({...});
    
    // Debe coincidir exactamente (sin diferencias de redondeo)
    expect(result.subtotal).toBe(subtotal);
    expect(result.subtotal).toBe(6.4125); // Valor exacto
  });
});
```

## 📝 Checklist para Code Reviews

- [ ] ¿Se usan `Math.round()`, `toFixed()`, o similar en servicios de cálculo?
- [ ] ¿Los valores intermedios se redondean antes de usarse en otros cálculos?
- [ ] ¿Los componentes React usan utilidades de formateo para display?
- [ ] ¿Los tests verifican valores exactos sin tolerancia de redondeo?

## 🔄 Migración de Código Legacy

Si encuentras código con redondeos intermedios:

1. **Identificar**: Buscar `round(`, `toFixed(`, `Math.round(`
2. **Evaluar**: ¿Es lógica de negocio o presentación?
3. **Refactorizar**: 
   - Lógica → Quitar redondeos
   - Presentación → Usar `priceFormatter`
4. **Validar**: Tests de precisión

## 📞 Soporte

Para dudas sobre implementación de precisión matemática:
1. Revisar `EcommerceCalculator.ts` como referencia
2. Consultar tests existentes en `__tests__/`
3. Usar `priceFormatter.ts` para todas las necesidades de display