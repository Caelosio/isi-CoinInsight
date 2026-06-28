# isi-CoinInsight

CoinInsight es una aplicación web que te permite monitorear el mercado de criptomonedas, gestionar tus favoritas y obtener análisis de mercado impulsados por la Inteligencia Artificial de Google Gemini.

## 🚀 Inicio Rápido (Quickstart con Docker)

Para probar el proyecto localmente de la forma más rápida y con los mínimos comandos, hemos preparado un entorno en Docker. 

**Requisito previo:** Debes tener [Docker](https://docs.docker.com/get-docker/) y Docker Compose instalados en tu máquina.

Sigue estos pasos exactos en tu terminal:

### 1. Clona el repositorio y entra en el proyecto
```bash
git clone https://github.com/Caelosio/isi-CoinInsight.git
cd isi-CoinInsight
```

### 2. Configura las variables de entorno
Debes crear un archivo `.env` dentro de la carpeta `coininsight/` usando la plantilla de ejemplo.

**En Linux/Mac:**
```bash
cp coininsight/.env.example coininsight/.env
```
**En Windows (PowerShell):**
```powershell
Copy-Item coininsight\.env.example coininsight\.env
```

Abre el archivo `coininsight/.env` que acabas de crear con cualquier editor de texto y configura las claves de API:

#### 🔑 Obtener la API Key de Google Gemini (obligatoria para análisis IA)

1. Ve a [Google AI Studio](https://aistudio.google.com/apikey).
2. Inicia sesión con tu cuenta de Google.
3. Haz clic en **"Create API Key"** y selecciona un proyecto (o crea uno nuevo).
4. Copia la clave generada y pégala en tu `.env`:
   ```
   GEMINI_API_KEY=tu_clave_de_gemini
   ```
> Si no la configuras, el análisis de IA no funcionará, pero el resto de la app seguirá operativa.

#### 📰 Obtener la API Key de NewsAPI (opcional, para noticias)

1. Ve a [newsapi.org](https://newsapi.org/) y haz clic en **"Get API Key"**.
2. Regístrate con tu email (el plan gratuito incluye 100 peticiones/día).
3. Una vez registrado, encontrarás tu API Key en el panel de tu cuenta.
4. Copia la clave y pégala en tu `.env`:
   ```
   NEWSAPI_KEY=tu_clave_de_newsapi
   ```
> Si no la configuras, la sección de noticias en la vista de detalle simplemente no mostrará resultados.

### 3. Ejecuta la aplicación
Lanza el sistema completo (Frontend, Backend y Base de datos) con un solo comando:
```bash
docker-compose up --build -d
```

### 4. ¡Pruébalo!
Abre tu navegador y entra a:
👉 **http://localhost:5000**

Ya puedes registrar un nuevo usuario e iniciar sesión para empezar a probar CoinInsight.

---

### Detener la aplicación
Cuando termines de probar, puedes apagar el sistema ejecutando:
```bash
docker-compose down
```

---

*Para más detalles técnicos o información sobre el uso completo, consulta los siguientes documentos en este repositorio:*
- *[Documentación Técnica](documentacionTecnica.md)*
- *[Manual de Usuario](manualUsuario.md)*
