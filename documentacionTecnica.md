# Documentación Técnica - CoinInsight

Bienvenido a la documentación técnica de **CoinInsight**. Este documento detalla la arquitectura, el stack tecnológico, los componentes principales y las APIs del sistema para facilitar su mantenimiento y futuras expansiones.

---

## 1. Arquitectura del Sistema

El sistema implementa un patrón **Modelo-Vista-Controlador (MVC)** utilizando **Flask** para manejar la lógica de servidor, rutas y renderizado de plantillas.
- **Backend**: Construido con Python y Flask. Expone endpoints internos (`/api/...`) consumidos por el cliente mediante `fetch`.
- **Frontend**: Utiliza el motor de plantillas **Jinja2** (Server-Side Rendering) complementado con **HTML5, CSS3 y JavaScript Vanilla** para la interactividad y llamadas asíncronas a la API.
- **Base de Datos**: Base de datos relacional incrustada (**SQLite**) integrada con el ORM **SQLAlchemy**.

---

## 2. Stack Tecnológico

| Componente | Tecnología |
| :--- | :--- |
| **Backend** | Python 3, Flask |
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla), Jinja2 |
| **Base de Datos** | SQLite3 |
| **ORM** | Flask-SQLAlchemy |
| **Autenticación** | Flask-Login, Werkzeug (para hashing) |
| **CORS** | Flask-CORS |

---

## 3. Integración con Servicios Externos (APIs)

CoinInsight depende de dos servicios externos principales ubicados en el módulo `backend.services`:

1. **CoinGecko API** (`coingecko.py`)
   - **Propósito**: Obtener datos de mercado en tiempo real, histórico de precios y detalles de las criptomonedas.
   - **Endpoints consumidos**: `/coins/markets`, `/coins/{id}`, `/coins/{id}/market_chart`.
   - **Nota**: Se recomienda implementar una caché o manejar los límites de peticiones (rate limiting) de CoinGecko si aumenta el tráfico.

2. **Google Gemini API** (`gemini_service.py`)
   - **Propósito**: Generar un análisis inteligente y recomendaciones basadas en los datos actuales de la criptomoneda.
   - **Requisito**: Necesita la variable de entorno `GEMINI_API_KEY`.

---

## 4. Estructura de la Base de Datos

El esquema se encuentra en `backend/models/`. Consta de 3 tablas principales:

### `User` (Tabla: `usuarios`)
- `id` (Integer, Primary Key)
- `username` (String, Unique)
- `email` (String, Unique)
- `password_hash` (String): Almacena la contraseña hasheada.
- *Relaciones*: `favoritos` (1:N), `historial` (1:N).

### `Favorite` (Tabla: `favoritos`)
- `id` (Integer, Primary Key)
- `user_id` (Integer, Foreign Key a `usuarios.id`)
- `crypto_id` (String): Identificador de la cripto en CoinGecko (ej. 'bitcoin').

### `History` (Tabla: `historial`)
- `id` (Integer, Primary Key)
- `user_id` (Integer, Foreign Key a `usuarios.id`)
- `crypto_id` (String)
- `fecha_consulta` (DateTime): Marca de tiempo de la consulta.

---

## 5. Endpoints de la API Interna

Todos los endpoints (excepto Auth) requieren que el usuario esté autenticado (`@login_required`).

### Autenticación (`auth.py`)
- `GET/POST /register`: Registro de nuevos usuarios.
- `GET/POST /login`: Inicio de sesión de usuarios.
- `GET /logout`: Cierre de sesión.

### Vistas Principales (`crypto.py`)
- `GET /dashboard`: Panel principal con la lista de las top 20 criptomonedas.
- `GET /crypto/<crypto_id>`: Vista detallada (registra automáticamente la visita en el historial).
- `GET /favorites`: Vista de lista de favoritos.
- `GET /history`: Vista de historial.

### API de Datos (`crypto.py`)
- `GET /api/cryptos`: Retorna las top 20 criptomonedas (CoinGecko).
- `GET /api/crypto/<crypto_id>`: Detalles específicos de una moneda.
- `GET /api/crypto/<crypto_id>/history?days=<n>`: Histórico de precios.
- `POST /api/analysis`: Genera y retorna el análisis de Gemini. Espera el body: `{"crypto": "id"}`.

### API de Interacción de Usuario (`crypto.py`)
- `GET /api/favorites/<crypto_id>/status`: Verifica si la moneda actual es favorita.
- `POST /api/favorites/<crypto_id>`: Añade a favoritos.
- `DELETE /api/favorites/<crypto_id>`: Elimina de favoritos.
- `GET /api/favorites`: Obtiene todos los IDs favoritos del usuario.
- `GET /api/history`: Retorna las últimas 50 consultas del usuario en orden descendente.

---

## 6. Configuración e Instalación Local

1. **Clonar repositorio e ir al directorio `coininsight`**:
   ```bash
   cd coininsight
   ```

2. **Crear y activar entorno virtual**:
   ```bash
   python -m venv venv
   # En Windows:
   venv\Scripts\activate
   # En Mac/Linux:
   source venv/bin/activate
   ```

3. **Instalar dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Variables de entorno**:
   - Crear un archivo `.env` en la raíz de `coininsight`.
   - Añadir:
     ```env
     SECRET_KEY=tu_clave_secreta_aqui
     GEMINI_API_KEY=tu_clave_de_gemini
     ```

5. **Ejecutar la aplicación**:
   ```bash
   python backend/app.py
   ```
   La aplicación correrá en `http://127.0.0.1:5000`. La base de datos SQLite se creará automáticamente en el primer inicio.
