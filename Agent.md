# Agent.md - Sprint 2 - CoinInsight

## Contexto del proyecto

CoinInsight es una aplicación web que permite consultar información sobre criptomonedas utilizando datos obtenidos desde APIs externas y generar análisis automáticos mediante Inteligencia Artificial.

El objetivo del Sprint 2 es construir un primer prototipo funcional que conecte frontend y backend, permita autenticación de usuarios y consulte información real de criptomonedas.

---

# Stack Tecnológico

## Backend

* Python 3.12
* Flask
* SQLAlchemy
* SQLite
* Requests
* Flask-Login
* Flask-CORS

## Frontend

* HTML5
* CSS3
* JavaScript
* Bootstrap 5
* Chart.js

## APIs Externas

### CoinGecko API

Obtención de:

* Top criptomonedas
* Precio actual
* Capitalización
* Volumen
* Variación 24h
* Histórico de precios

### CryptoCompare API

Obtención de:

* Información complementaria
* Datos históricos adicionales

### Gemini API

Generación de análisis automáticos para usuarios principiantes.

---

# Objetivos del Sprint 2

Implementar una primera versión funcional del sistema con:

1. Registro de usuarios.
2. Inicio de sesión.
3. Dashboard principal.
4. Consulta de criptomonedas.
5. Visualización de datos básicos.
6. Integración inicial con IA.
7. Persistencia en base de datos.

---

# Requisitos Funcionales

## RF01 - Registro

El usuario podrá:

* Crear una cuenta.
* Introducir nombre.
* Introducir email.
* Introducir contraseña.

La contraseña debe almacenarse mediante hash.

---

## RF02 - Login

El usuario podrá:

* Iniciar sesión.
* Mantener sesión activa.
* Cerrar sesión.

---

## RF03 - Dashboard

Tras iniciar sesión se mostrará:

* Top 20 criptomonedas.
* Precio actual.
* Variación 24 horas.
* Capitalización de mercado.

---

## RF04 - Búsqueda

El usuario podrá:

* Buscar una criptomoneda por nombre.

El sistema mostrará:

* Nombre.
* Símbolo.
* Precio actual.
* Volumen.
* Market Cap.

---

## RF05 - Detalle de criptomoneda

El usuario podrá visualizar:

* Precio actual.
* Variación 24h.
* Volumen.
* Capitalización.
* Gráfica histórica últimos 7 días.

La gráfica debe implementarse con Chart.js.

---

## RF06 - Análisis IA

El usuario podrá pulsar:

"Generar análisis"

El backend enviará datos de la criptomoneda a Gemini.

Gemini devolverá:

* Resumen sencillo.
* Tendencia general.
* Nivel de riesgo orientativo.

---

# Base de Datos

## Tabla usuarios

* id
* username
* email
* password_hash

## Tabla favoritos

* id
* user_id
* crypto_id

## Tabla historial

* id
* user_id
* crypto_id
* fecha_consulta

---

# Endpoints Backend

## Auth

POST /register

POST /login

GET /logout

---

## Criptomonedas

GET /api/cryptos

Devuelve top criptomonedas.

GET /api/crypto/<id>

Devuelve información detallada.

GET /api/crypto/<id>/history

Devuelve histórico de precios.

---

## IA

POST /api/analysis

Entrada:

{
"crypto": "bitcoin"
}

Salida:

{
"analysis": "Texto generado por Gemini"
}

---

# Estructura de Carpetas

coininsight/

backend/

app.py

models/

routes/

services/

database/

frontend/

templates/

static/

css/

js/

docs/

README.md

Agent.md

---


# Criterios de Aceptación

* Registro funcional.
* Login funcional.
* Datos obtenidos desde CoinGecko.
* Dashboard operativo.
* Gráficas visibles.
* Conexión con Gemini.
* Persistencia en SQLite.
* Frontend y backend integrados correctamente.

---

# Prioridad

Alta:

* Login.
* Dashboard.
* Consulta de criptomonedas.

Media:

* Gráficas históricas.
* Análisis IA.

Baja:

* Favoritos.
* Historial.
* Mejoras visuales.

El objetivo principal es disponer de una aplicación navegable y funcional al finalizar el Sprint 2.
