# Emotions in Transit

Instalación de arte generativo que visualiza datos emocionales del transporte público de Barcelona.

## Despliegue

El proyecto está desplegado en: [https://emotions-in-transit.onrender.com](https://emotions-in-transit.onrender.com)

## Configuración Local

1. Clonar el repositorio.
2. `npm install`
3. Crear `.env` (ver `.env.example` o usar valores por defecto).
4. `npm run dev` (Frontend) o `npm start` (Backend + Frontend).

## Estructura

- `src/pages`: Vistas principales.
- `src/components`: Componentes reutilizables.
- `server`: API backend para datos de TMB/OpenWeather.
