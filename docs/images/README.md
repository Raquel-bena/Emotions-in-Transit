# Imágenes y Assets Visuales

Esta carpeta contiene todos los assets visuales utilizados en la documentación del proyecto **Emotions in Transit**.

## 📁 Estructura Recomendada

```
docs/images/
├── screenshots/          # Capturas de pantalla de la aplicación
├── diagrams/            # Diagramas de arquitectura y flujo
├── installation/        # Imágenes para la guía de instalación
├── prototype/           # Fotos de prototipos físicos
└── demo/               # GIFs y videos de demostración
```

## 🖼️ Imágenes Esperadas

### Para el README principal

- **installation_setup.jpg**: Foto de la instalación física (proyección + hardware)
- **system_architecture.png**: Diagrama de arquitectura del sistema
- **demo.gif**: GIF animado mostrando la visualización en acción
- **hand_interaction.jpg**: Foto de la interacción con detección de manos

### Para INSTALLATION.md

- **node_installation.png**: Captura del proceso de instalación de Node.js
- **api_keys_dashboard.png**: Dashboard de TMB/OpenWeather mostrando dónde obtener claves

### Para ARCHITECTURE.md

- **data_flow_diagram.png**: Diagrama de flujo de datos
- **component_architecture.png**: Arquitectura de componentes

## 📸 Cómo Añadir Imágenes

### Opción 1: Desde Google Drive

Si tienes imágenes en Google Drive:

1. Descarga las imágenes a tu máquina local
2. Copia las imágenes a esta carpeta (`docs/images/`)
3. Renombra las imágenes con nombres descriptivos (ej: `installation_setup.jpg`)
4. Añade las imágenes al repositorio:

```bash
git add docs/images/*.jpg docs/images/*.png
git commit -m "docs: add project screenshots and diagrams"
git push
```

### Opción 2: Crear Capturas de Pantalla

Para capturas de pantalla de la aplicación:

1. Abre la aplicación en el navegador (`http://localhost:5173`)
2. Toma capturas con:
   - **Windows**: Windows + Shift + S
   - **macOS**: Cmd + Shift + 4
   - **Linux**: PrtScn o Shutter
3. Guarda en esta carpeta con nombres descriptivos

### Opción 3: Generar Diagramas

Para diagramas técnicos, puedes usar:

- **Excalidraw**: https://excalidraw.com/ (gratis, open source)
- **Draw.io**: https://app.diagrams.net/ (gratis)
- **Figma**: https://figma.com/ (gratis para uso básico)

## 🔗 Cómo Referenciar Imágenes en Markdown

Una vez añadidas las imágenes, actualiza el README.md:

```markdown
![Descripción de la imagen](./docs/images/nombre_imagen.jpg)
```

**Ejemplo**:

```markdown
![Instalación Overview](./docs/images/installation_setup.jpg)
```

## ⚙️ Optimización de Imágenes

Para mantener el repositorio ligero:

1. **Tamaño recomendado**: Máximo 1920px de ancho
2. **Formato**:
   - JPG para fotografías (calidad 80-85%)
   - PNG para diagramas y capturas con texto
   - GIF para animaciones cortas (< 5 MB)
3. **Herramientas de compresión**:
   - TinyPNG: https://tinypng.com/
   - ImageOptim (macOS): https://imageoptim.com/
   - Squoosh: https://squoosh.app/

## 📝 Nota

Actualmente esta carpeta está vacía. Cuando añadas imágenes del Google Drive u otras fuentes, actualiza esta lista con los archivos disponibles.

---

**Última actualización**: Enero 2026
