# Guía de Instalación - Emotions in Transit

Esta guía proporciona instrucciones detalladas para instalar y ejecutar **Emotions in Transit** en diferentes entornos.

---

## 📋 Tabla de Contenidos

- [Requisitos del Sistema](#requisitos-del-sistema)
- [Instalación Rápida](#instalación-rápida)
- [Instalación Detallada](#instalación-detallada)
  - [1. Clonar el Repositorio](#1-clonar-el-repositorio)
  - [2. Instalar Node.js](#2-instalar-nodejs)
  - [3. Instalar Dependencias](#3-instalar-dependencias)
  - [4. Configurar Variables de Entorno](#4-configurar-variables-de-entorno)
  - [5. Obtener API Keys](#5-obtener-api-keys)
  - [6. Iniciar el Proyecto](#6-iniciar-el-proyecto)
- [Instalación del Entorno Python (Opcional)](#instalación-del-entorno-python-opcional)
- [Troubleshooting](#troubleshooting)
- [Despliegue en Producción](#despliegue-en-producción)

---

## Requisitos del Sistema

### Mínimos

| Componente | Versión Mínima |
|------------|----------------|
| **Node.js** | v18.0.0 |
| **npm** | v8.0.0 |
| **RAM** | 4 GB |
| **Navegador** | Chrome 90+, Firefox 88+, Safari 14+ |

### Recomendados

- **Node.js** v20.x LTS
- **RAM** 8 GB
- **GPU** Compatible con WebGL 2.0
- **Cámara web** (para detección de manos con HandsFree.js)

### Sistemas Operativos Soportados

- ✅ **Windows** 10/11
- ✅ **macOS** 11 Big Sur o superior
- ✅ **Linux** (Ubuntu 20.04+, Debian 11+, Fedora 35+)

---

## Instalación Rápida

```bash
# 1. Clonar repositorio
git clone https://github.com/Raquel-bena/Emotions-in-Transit.git
cd Emotions-in-Transit

# 2. Instalar dependencias
npm install

# 3. Copiar archivo de entorno
cp .env.example .env

# 4. Iniciar en modo desarrollo
npm run dev
```

**Listo!** Abre `http://localhost:5173` en tu navegador.

---

## Instalación Detallada

### 1. Clonar el Repositorio

#### Opción A: HTTPS

```bash
git clone https://github.com/Raquel-bena/Emotions-in-Transit.git
cd Emotions-in-Transit
```

#### Opción B: SSH (recomendado si tienes SSH configurado)

```bash
git clone git@github.com:Raquel-bena/Emotions-in-Transit.git
cd Emotions-in-Transit
```

#### Verificar la clonación

```bash
ls -la
# Deberías ver: index.html, package.json, server/, src/, etc.
```

---

### 2. Instalar Node.js

#### Windows

1. Descarga el instalador desde [nodejs.org](https://nodejs.org/)
2. Ejecuta el instalador y sigue las instrucciones
3. Verifica la instalación:

```powershell
node --version  # Debe mostrar v18.0.0 o superior
npm --version   # Debe mostrar v8.0.0 o superior
```

#### macOS

**Con Homebrew:**

```bash
brew install node@20
```

**O descarga desde** [nodejs.org](https://nodejs.org/)

#### Linux (Ubuntu/Debian)

```bash
# Usar NodeSource para obtener la última versión
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar
node --version
npm --version
```

---

### 3. Instalar Dependencias

```bash
npm install
```

**Esto instalará:**
- `p5@1.9.4` - Framework de creative coding
- `tone@15.1.22` - Síntesis de audio
- `express@4.19.2` - Servidor backend
- `cors@2.8.5` - Middleware para CORS
- `dotenv@16.4.5` - Gestión de variables de entorno
- `vite@5.2.0` - Build tool (devDependency)

**Si hay errores**, intenta:

```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

### 4. Configurar Variables de Entorno

#### Crear archivo `.env`

```bash
cp .env.example .env
```

**Si no existe `.env.example`, créalo manualmente:**

```bash
touch .env
```

#### Editar `.env`

Abre `.env` con tu editor favorito y añade:

```bash
# APIs Externas
TMB_APP_ID=tu_app_id_tmb
TMB_APP_KEY=tu_clave_tmb
OWM_API_KEY=tu_clave_openweathermap

# Servidor
PORT=3000
NODE_ENV=development

# Flask API (opcional)
FLASK_API_URL=https://emotions-in-transit-m2ts.onrender.com/api/emotions
```

**⚠️ Nota**: Sin API keys, el proyecto funcionará en **modo simulación** (Ghost Mode).

---

### 5. Obtener API Keys

#### TMB API (Transporte de Barcelona)

1. Ve a [TMB Developers](https://developer.tmb.cat/)
2. Crea una cuenta
3. Solicita acceso a la API de Metro
4. Copia `app_id` y `app_key` a tu archivo `.env`

**Tiempo estimado**: 24-48 horas para aprobación

#### OpenWeatherMap API

1. Ve a [OpenWeatherMap](https://openweathermap.org/api)
2. Crea una cuenta gratuita
3. Ve a **API Keys** en tu dashboard
4. Copia la clave a `OWM_API_KEY` en `.env`

**Tiempo estimado**: Instantáneo (plan gratuito)

---

### 6. Iniciar el Proyecto

#### Modo Desarrollo (Frontend con Hot Reload)

```bash
npm run dev
```

**Salida esperada:**

```
  VITE v5.2.0  ready in 523 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Abre `http://localhost:5173` en tu navegador.

#### Modo Producción (Backend + Frontend)

```bash
# 1. Compilar frontend
npm run build

# 2. Iniciar servidor
npm start
```

**Salida esperada:**

```
✅ Servidor Emotions (in) Transit corriendo en puerto 3000
📡 Ruta TMB disponible en: http://localhost:3000/api/tmb/transport
```

Abre `http://localhost:3000` en tu navegador.

#### Modo Desarrollo del Backend (con auto-reload)

```bash
npm run server
```

Útil para desarrollar rutas de API sin reiniciar el servidor.

---

## Instalación del Entorno Python (Opcional)

Solo necesario si quieres entrenar el modelo de K-Means o ejecutar análisis de datos.

### 1. Instalar Python

**Windows**: Descarga desde [python.org](https://www.python.org/)

**macOS**:
```bash
brew install python@3.11
```

**Linux**:
```bash
sudo apt-get install python3.11 python3-pip
```

### 2. Crear entorno virtual

```bash
cd analysis
python3 -m venv venv

# Activar entorno
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate
```

### 3. Instalar dependencias Python

```bash
pip install -r requirements.txt
```

**Esto instalará:**
- `Flask` - API server
- `scikit-learn` - K-Means clustering
- `pandas` - Data manipulation
- `numpy` - Cálculos numéricos

### 4. Ejecutar el servidor Flask

```bash
python data_app.py
```

**Salida esperada:**

```
 * Running on http://127.0.0.1:5000
 * Endpoint disponible: /api/emotions
```

---

## Troubleshooting

### ❌ Error: `npm: command not found`

**Solución**: Node.js no está instalado o no está en el PATH.

```bash
# Verificar instalación
which node
which npm

# Si no están instalados, sigue la sección "2. Instalar Node.js"
```

---

### ❌ Error: `Cannot find module 'express'`

**Solución**: Las dependencias no se instalaron correctamente.

```bash
rm -rf node_modules package-lock.json
npm install
```

---

### ❌ Error: `EADDRINUSE: address already in use :::3000`

**Solución**: El puerto 3000 ya está en uso.

**Opción 1: Cambiar puerto**

```bash
# En .env
PORT=3001
```

**Opción 2: Matar proceso en puerto 3000**

```bash
# Linux/macOS
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

---

### ❌ Error: `Failed to fetch` en el navegador

**Síntomas**: Las APIs no cargan datos.

**Soluciones**:

1. **Verificar que el backend esté corriendo**:
   ```bash
   curl http://localhost:3000/api/tmb/transport
   ```

2. **Verificar variables de entorno**:
   ```bash
   cat .env
   # Asegúrate de que las claves están presentes
   ```

3. **Comprobar CORS**:
   - Asegúrate de que el frontend se ejecuta en `localhost:5173` o `localhost:3000`

---

### ❌ Error: `Handsfree is not defined`

**Solución**: La librería HandsFree.js no se cargó.

1. Verifica tu conexión a Internet (la librería se carga desde CDN)
2. Revisa `index.html` línea 12:

```html
<script src="https://unpkg.com/handsfree@8.5.1/build/lib/handsfree.js"></script>
```

---

### ❌ Problema: Cámara no detecta manos

**Soluciones**:

1. **Permitir acceso a la cámara**: El navegador pedirá permiso
2. **Iluminación**: Asegúrate de tener buena iluminación
3. **Distancia**: Coloca la mano a 30-60cm de la cámara
4. **Navegador compatible**: Usa Chrome 90+ o Firefox 88+

---

### ❌ Error: `vite: command not found`

**Solución**: Vite no está instalado globalmente, usa npm scripts:

```bash
# ❌ No hagas esto
vite

# ✅ Haz esto
npm run dev
```

---

## Despliegue en Producción

### Opción 1: Render.com (Recomendado)

1. **Conecta tu repositorio GitHub a Render**
2. **Crea un nuevo Web Service**
3. **Configura las variables de entorno** en el dashboard de Render:
   - `TMB_APP_ID`
   - `TMB_APP_KEY`
   - `OWM_API_KEY`
   - `NODE_ENV=production`

4. **Render detectará automáticamente** el archivo `render.yaml`:

```yaml
services:
  - type: web
    name: emotions-in-transit
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
```

5. **Deploy**: Render compilará y desplegará automáticamente

**URL de ejemplo**: `https://emotions-in-transit.onrender.com`

---

### Opción 2: Vercel (Solo Frontend)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Nota**: Necesitarás desplegar el backend por separado.

---

### Opción 3: Heroku

```bash
# Instalar Heroku CLI
brew install heroku/brew/heroku  # macOS

# Login
heroku login

# Crear app
heroku create emotions-in-transit

# Configurar variables de entorno
heroku config:set TMB_APP_ID=xxx
heroku config:set TMB_APP_KEY=xxx
heroku config:set OWM_API_KEY=xxx

# Deploy
git push heroku main
```

---

## Verificación Post-Instalación

### ✅ Checklist

- [ ] `npm install` ejecutado sin errores
- [ ] `.env` creado con API keys
- [ ] `npm run dev` inicia el servidor Vite
- [ ] Navegador abre `http://localhost:5173`
- [ ] Se ven las 3 franjas de visualización
- [ ] La cámara solicita permisos
- [ ] Los datos de clima aparecen en la franja superior
- [ ] Backend responde en `http://localhost:3000/api/tmb/transport`

---

## Próximos Pasos

Una vez instalado:

1. Lee [ARCHITECTURE.md](./ARCHITECTURE.md) para entender el diseño del sistema
2. Revisa [API.md](./API.md) para conocer los endpoints disponibles
3. Experimenta modificando los parámetros visuales en `index.html`
4. Lee [CONTRIBUTING.md](./CONTRIBUTING.md) si quieres contribuir al proyecto

---

## Soporte

Si encuentras problemas no cubiertos en esta guía:

1. **Revisa los issues**: [GitHub Issues](https://github.com/Raquel-bena/Emotions-in-Transit/issues)
2. **Crea un nuevo issue**: Incluye logs de error y tu entorno (OS, Node.js version)
3. **Contacto**: Ver sección de contacto en el README principal

---

**¡Disfruta experimentando con Emotions in Transit!** 🎨🚇
