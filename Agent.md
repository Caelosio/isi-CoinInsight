# Agent.md - Sprint 3 - CoinInsight

## Contexto

CoinInsight es una aplicación web desarrollada con Flask que permite consultar información de criptomonedas utilizando APIs externas.

Actualmente el proyecto ya dispone de:

* Sistema de registro y login.
* Dashboard principal.
* Integración con CoinGecko.
* Base de datos SQLite.
* Estructura completa de backend y frontend.

El objetivo del Sprint 3 es completar el producto y dejar una versión final funcional, visualmente atractiva y preparada para demostración.

---

# Stack Tecnológico

## Backend

* Python 3.12
* Flask
* SQLAlchemy
* SQLite
* Flask-Login
* Flask-CORS

## Frontend

* HTML5
* CSS3
* JavaScript
* Bootstrap 5
* Chart.js

## APIs

### CoinGecko

Obtención de:

* Top criptomonedas
* Precio actual
* Capitalización
* Volumen
* Variación porcentual
* Histórico de precios

### Gemini

Generación de análisis inteligentes.

La API Key NO debe almacenarse en el código.

Debe utilizarse un archivo:

.env

y cargarse mediante variables de entorno.

---

# Objetivo Principal

Convertir CoinInsight en una aplicación completamente funcional que permita:

* Consultar criptomonedas.
* Visualizar datos históricos.
* Analizar tendencias mediante IA.
* Gestionar favoritos.
* Disfrutar de una experiencia visual moderna.

---

# Requisitos Funcionales

## RF07 - Vista Detallada de Criptomoneda

Cuando el usuario pulse sobre una criptomoneda del dashboard:

Debe acceder a una página de detalle.

Ruta sugerida:

/crypto/<id>

La página debe mostrar:

* Nombre.
* Símbolo.
* Imagen.
* Precio actual.
* Capitalización de mercado.
* Volumen.
* Variación 24h.
* Variación 7 días.

---

## RF08 - Gráfica Histórica

La página de detalle debe mostrar:

Gráfica interactiva utilizando Chart.js.

Periodo mínimo:

* Últimos 7 días.

Opcional:

* 30 días.
* 90 días.

Los datos deben obtenerse desde CoinGecko.

---

## RF09 - Análisis IA

En la página de detalle debe existir un botón:

"Analizar con IA"

Al pulsarlo:

1. El backend obtiene los datos de la criptomoneda.
2. Construye un prompt estructurado.
3. Envía la información a Gemini.
4. Devuelve una explicación comprensible.

La respuesta debe incluir:

* Resumen general.
* Tendencia actual.
* Riesgo orientativo.
* Posibles factores relevantes.

El lenguaje debe estar orientado a usuarios principiantes.

---

## RF10 - Gestión de Favoritos

El usuario podrá:

* Añadir favoritos.
* Eliminar favoritos.
* Visualizar favoritos desde su cuenta.

Los favoritos deben almacenarse en SQLite.

---

## RF11 - Historial de Consultas

Cada vez que un usuario acceda a una criptomoneda:

Se almacenará:

* Usuario.
* Criptomoneda.
* Fecha.

Posteriormente se mostrará un historial básico.

---

# Gestión de Variables de Entorno

Crear archivo:

.env

Variables:

GEMINI_API_KEY=
SECRET_KEY=

La aplicación debe utilizar python-dotenv.

La clave Gemini nunca debe estar escrita directamente en el código.

---

# Mejoras Visuales

## Dashboard

Mejorar apariencia general utilizando Bootstrap.

Objetivos:

* Diseño moderno.
* Tarjetas para cada criptomoneda.
* Hover visual.
* Adaptación responsive.

---

## Página de Detalle

Diseño tipo dashboard financiero.

Elementos:

* Cabecera con imagen y nombre.
* Tarjetas de métricas.
* Gráfica destacada.
* Panel de análisis IA.

---

## Paleta Visual

Tema oscuro profesional.

Inspiración:

* Binance
* CoinMarketCap
* TradingView

Mantener una estética limpia y minimalista.

---

# Requisitos Técnicos

## Código

* Mantener arquitectura actual.
* Evitar duplicación de código.
* Separar lógica de negocio en services.

---

## Servicios

Crear:

services/gemini_service.py

Responsable de:

* Construir prompts.
* Conectar con Gemini.
* Procesar respuestas.

---

## Seguridad

* Contraseñas hasheadas.
* API Keys fuera del repositorio.
* .env incluido en .gitignore.

---

# Criterios de Aceptación

La entrega Sprint 3 se considera completada cuando:

✓ Login funcional.

✓ Dashboard funcional.

✓ Vista detallada de criptomonedas.

✓ Gráficas históricas.

✓ Integración Gemini operativa.

✓ Favoritos funcionales.

✓ Historial funcional.

✓ Diseño responsive.

✓ Uso de variables de entorno.

✓ Aplicación preparada para demostración final.

---

# Prioridad

Prioridad Alta

1. Integración Gemini.
2. Vista detallada.
3. Gráficas históricas.

Prioridad Media

4. Favoritos.
5. Historial.

Prioridad Baja

6. Mejoras visuales avanzadas.
7. Animaciones y refinamientos UX.

El objetivo es disponer de una versión final estable, demostrable y visualmente atractiva para la presentación del proyecto.
