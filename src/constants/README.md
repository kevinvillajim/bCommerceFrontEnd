# 🔧 Configuración de Constantes

Este directorio contiene las configuraciones centralizadas de la aplicación.

## 📁 Archivos

### `calculationConfig.ts`
**🧮 Configuración de precisión y cálculos financieros**

Maneja todas las tolerancias de precisión para evitar errores de discrepancia entre frontend y backend debido a diferencias de precisión flotante.

#### Variables de entorno soportadas:

```env
# Tolerancia para comparaciones de totales (default: 0.001)
VITE_PRICE_TOLERANCE=0.001

# Tolerancia para validaciones de checkout (default: 0.001)  
VITE_CHECKOUT_TOLERANCE=0.001

# Tolerancia para subtotales (default: 0.001)
VITE_SUBTOTAL_TOLERANCE=0.001

# Tolerancia para impuestos (default: 0.001)
VITE_TAX_TOLERANCE=0.001

# Debug de cálculos (default: false en producción)
VITE_DEBUG_CALCULATIONS=true
VITE_DEBUG_PRECISION=true
```

#### Uso básico:

```typescript
import { isNumberEqual, validateTotalsEquality } from '@/constants/calculationConfig';

// Comparar dos números con tolerancia configurada
const isEqual = isNumberEqual(123.456789, 123.456788); // true (dentro de tolerancia)

// Validar totales de checkout
const isValid = validateTotalsEquality(
  frontendTotal, 
  backendTotal, 
  'Validación de checkout'
);
```

#### Utilidades disponibles:

- **`isNumberEqual(a, b, tolerance?)`**: Compara dos números con tolerancia
- **`validateTotalsEquality(frontend, backend, context?, tolerance?)`**: Valida igualdad de totales con logs detallados
- **`CALCULATION_CONFIG`**: Objeto de configuración con todas las tolerancias

### `apiEndpoints.ts`
Endpoints de la API del backend organizados por módulos.

### `routes.ts`
Rutas del frontend de la aplicación.

## 🎯 Propósito de las tolerancias

Las tolerancias de precisión son necesarias porque:

1. **JavaScript** usa números flotantes de 64 bits
2. **PHP** puede usar diferentes precisiones según la configuración
3. **Operaciones matemáticas** pueden generar pequeñas diferencias (ej: `0.1 + 0.2 ≠ 0.3`)

### Ejemplo de problema sin tolerancia:

```javascript
// ❌ Sin tolerancia - puede fallar
const backendTotal = 428.461875;
const frontendTotal = 428.46187499999996;
console.log(backendTotal === frontendTotal); // false

// ✅ Con tolerancia configurada - siempre funciona
import { isNumberEqual } from '@/constants/calculationConfig';
console.log(isNumberEqual(backendTotal, frontendTotal)); // true
```

## 🔍 Debug y desarrollo

En modo desarrollo, la configuración automáticamente:

- ✅ Muestra logs detallados de comparaciones
- ⚠️ Advierte sobre diferencias detectadas pero toleradas
- 📊 Registra el contexto de cada validación

Esto ayuda a identificar posibles problemas de precisión durante el desarrollo.

## 📝 Configuración recomendada

Para **producción**:
```env
VITE_PRICE_TOLERANCE=0.001
VITE_DEBUG_CALCULATIONS=false
VITE_DEBUG_PRECISION=false
```

Para **desarrollo**:
```env
VITE_PRICE_TOLERANCE=0.001
VITE_DEBUG_CALCULATIONS=true
VITE_DEBUG_PRECISION=true
```

Para **testing**:
```env
VITE_PRICE_TOLERANCE=0.000001
VITE_DEBUG_CALCULATIONS=true
VITE_DEBUG_PRECISION=true
```