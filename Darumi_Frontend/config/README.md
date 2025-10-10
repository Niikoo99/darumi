# Configuración de la API - Darumi

## 📍 Configuración de IP

Para configurar la IP del backend, edita el archivo `Darumi_Frontend/config/api.js`:

```javascript
const API_CONFIG = {
  // Cambia esta IP por la IP de tu máquina donde está ejecutándose el backend
  BASE_URL: 'http://TU_IP_AQUI:3000',
  // ... resto de la configuración
};
```

## 🔍 Cómo encontrar tu IP:

### En Windows:
```bash
ipconfig
```
Busca la dirección IPv4 de tu adaptador de red (generalmente "Adaptador de LAN inalámbrica Wi-Fi" o "Adaptador de Ethernet")

### En Mac/Linux:
```bash
ifconfig
```
O para una respuesta más simple:
```bash
hostname -I
```

## 🌐 Opciones de configuración:

### 1. **IP de tu máquina local** (recomendado para desarrollo):
```javascript
BASE_URL: 'http://192.168.1.XXX:3000', // Reemplaza XXX con tu IP
```

### 2. **Localhost** (si frontend y backend están en la misma máquina):
```javascript
BASE_URL: 'http://localhost:3000',
```

### 3. **IP de red local** (para testing en dispositivos físicos):
```javascript
BASE_URL: 'http://192.168.1.XXX:3000', // IP de tu máquina en la red local
```

## 🚀 Verificación:

1. Asegúrate de que el backend esté ejecutándose:
   ```bash
   cd Darumi_Backend
   npm start
   ```

2. Verifica que el puerto 3000 esté disponible y el backend esté escuchando

3. Prueba la conexión desde tu navegador:
   ```
   http://TU_IP:3000/categorias/
   ```

## 📱 Para dispositivos móviles:

Si estás probando en un dispositivo físico, asegúrate de que:
- El dispositivo esté en la misma red WiFi
- El firewall de tu máquina permita conexiones en el puerto 3000
- La IP sea accesible desde la red local

## 🔧 Archivos actualizados:

Los siguientes archivos ahora usan la configuración centralizada:
- `Darumi_Frontend/App/Screens/Home.js`
- `Darumi_Frontend/App/Screens/Categories.js`
- `Darumi_Frontend/App/Components/SignInWithOAuth.js`
- `Darumi_Frontend/App/Components/Home/MonthInfo.js`

## ✅ Beneficios:

- ✅ **Configuración centralizada**: Un solo lugar para cambiar la IP
- ✅ **Fácil mantenimiento**: No más búsqueda de URLs hardcodeadas
- ✅ **Flexibilidad**: Fácil cambio entre entornos (desarrollo, testing, producción)
- ✅ **Consistencia**: Todas las llamadas API usan la misma configuración
