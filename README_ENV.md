# 🚀 Sistema de Entornos - BCommerce Frontend

## 📋 Archivos de Entorno

### **Disponibles en el root:**
- `.env.local` - Configuración de desarrollo
- `.env.production` - Configuración de producción/staging
- `.env` - Archivo activo (puede ser editado manualmente)

## 🎯 **Comandos de Build Optimizados**

### **Desarrollo Local**
```bash
npm run dev                    # Desarrollo con hot reload
npm run build:local           # Build para testing local
npm run preview:local         # Preview del build local
```

### **Producción/Staging**
```bash
npm run build:production      # Build optimizado para producción
npm run preview:production    # Preview del build de producción
npm run build                 # Build genérico (usa .env actual)
```

## ⚙️ **Configuraciones por Entorno**

### **Desarrollo (.env.local)**
- API: `http://127.0.0.1:8000/api`
- Debug: Habilitado
- DevTools: Habilitado
- Analytics: Deshabilitado
- Cache: Deshabilitado
- Payments: Modo test

### **Producción (.env.production)**
- API: `https://api.comersia.app/api`
- Debug: Deshabilitado
- DevTools: Deshabilitado
- Analytics: Habilitado
- Cache: Habilitado
- Payments: Modo live

## 🔧 **Variables Importantes**

### **URLs**
```env
VITE_API_BASE_URL=https://api.comersia.app/api
VITE_FRONTEND_URL=https://comersia.app
VITE_BACKEND_URL=https://api.comersia.app
```

### **Modos de Payment**
```env
VITE_DATAFAST_MODE=production
VITE_DEUNA_MODE=production
VITE_PAYPAL_MODE=live
```

### **Optimizaciones**
```env
VITE_CACHE_ENABLED=true
VITE_MINIFY=true
VITE_SOURCE_MAPS=false
```

## 🚀 **Workflow de Deploy**

### **Deploy Rápido a Staging/Producción**
```bash
# Build optimizado para producción
npm run build:production

# Preview antes de deploy
npm run preview:production

# Deploy (subir carpeta dist/)
```

### **Testing Local**
```bash
# Desarrollo normal
npm run dev

# Test build local
npm run build:local && npm run preview:local
```

## 💡 **Ventajas del Sistema**

### **Automatic Environment Detection**
- Vite detecta automáticamente `.env.local` en desarrollo
- Vite detecta automáticamente `.env.production` en builds de producción

### **Build Optimizations**
- **Desarrollo**: Source maps, hot reload, debug habilitado
- **Producción**: Minificado, tree shaking, cache optimizado

### **No Manual Changes**
- No necesitas cambiar variables manualmente
- Cada comando usa el entorno correcto automáticamente

## 🛡️ **Seguridad**

### **Variables Públicas (VITE_*)**
- Solo variables con prefijo `VITE_` se incluyen en el bundle
- Variables sensibles nunca se exponen al cliente

### **Git Integration**
- `.env.local` y `.env.production` están en `.gitignore`
- Solo configuraciones no sensibles se trackean

## 🔍 **Debug y Testing**

### **Verificar Build**
```bash
# Ver variables de entorno en build
npm run build:production
# Revisar dist/assets/*.js para confirmar URLs correctas
```

### **Testing API Connections**
```bash
# En desarrollo
curl http://127.0.0.1:8000/api/health

# En producción
curl https://api.comersia.app/api/health
```

¡Ahora tienes deploy instantáneo sin configuración manual! 🎉