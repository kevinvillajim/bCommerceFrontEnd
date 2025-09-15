# UniversalToast System

Sistema centralizado de notificaciones toast para BCommerce. Reemplaza el anterior "frankenstein" de múltiples sistemas independientes.

## Características

- ✅ **Diseño elegante** con transparencias y bordes
- ✅ **Posición personalizable** (por defecto: bottom-right)
- ✅ **Auto-apilado** de múltiples toasts
- ✅ **Barra de progreso** animada
- ✅ **Botones de acción** opcionales
- ✅ **Toasts persistentes** (no se cierran automáticamente)
- ✅ **API súper simple** de usar

## Uso Básico

```tsx
import { useToast } from '../UniversalToast';
import { NotificationType } from '../../types/NotificationTypes';

function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast(NotificationType.SUCCESS, 'Operación completada exitosamente');
  };

  const handleError = () => {
    showToast(NotificationType.ERROR, 'Algo salió mal');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Éxito</button>
      <button onClick={handleError}>Error</button>
    </div>
  );
}
```

## Uso Avanzado

```tsx
const { showToast } = useToast();

// Toast con botón de acción
showToast(NotificationType.ERROR, 'Falló la conexión', {
  duration: 10000,
  actionButton: {
    label: 'Reintentar',
    onClick: () => retry()
  }
});

// Toast persistente (no se cierra automáticamente)
showToast(NotificationType.INFO, 'Proceso en curso...', {
  persistent: true,
  showProgress: false
});

// Toast en posición personalizada
showToast(NotificationType.WARNING, 'Advertencia importante', {
  position: 'top-center',
  duration: 8000
});
```

## API Completa

### `showToast(type, message, options?)`

**Parámetros:**
- `type`: `NotificationType` - Tipo de notificación (importar desde `../../types/NotificationTypes`)
- `message`: `string` - Mensaje a mostrar
- `options`: `ToastOptions` (opcional)

### `ToastOptions`

```tsx
interface ToastOptions {
  duration?: number;        // Duración en ms (default: 5000)
  position?: ToastPosition; // Posición (default: 'bottom-right')
  showProgress?: boolean;   // Mostrar barra de progreso (default: true)
  persistent?: boolean;     // No auto-cerrar (default: false)
  actionButton?: {          // Botón de acción opcional
    label: string;
    onClick: () => void;
  };
}
```

## Integración

El sistema ya está integrado globalmente en `main.tsx`. Solo importa el hook `useToast` en cualquier componente.

## Migración desde sistemas anteriores

**Antes:**
```tsx
// Sistema antiguo del CartContext
const [toasts, setToasts] = useState([]);
const showToast = (type, message) => { /* lógica compleja */ };
// + renderizar contenedor de toasts manualmente
```

**Después:**
```tsx
// Sistema nuevo
import { NotificationType } from '../../types/NotificationTypes';
const { showToast } = useToast();
showToast(NotificationType.SUCCESS, 'Mensaje');
// ¡Eso es todo!
```