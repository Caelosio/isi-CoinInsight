import requests

from backend.config import Config

# Timeout para peticiones HTTP (segundos) — mismo que CoinGecko
REQUEST_TIMEOUT = 10

# Caché simple en memoria (misma implementación que coingecko.py)
import time
from functools import wraps


def ttl_cache(ttl_seconds=60):
    def decorator(func):
        cache = {}
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = str(args) + str(kwargs)
            now = time.time()
            if key in cache:
                result, timestamp = cache[key]
                if now - timestamp < ttl_seconds:
                    return result
            result = func(*args, **kwargs)
            if result is not None:
                cache[key] = (result, now)
            return result
        return wrapper
    return decorator


# Placeholder por defecto cuando un artículo no tiene imagen
_NEWS_PLACEHOLDER_IMAGE = "https://via.placeholder.com/80x80?text=News"


@ttl_cache(ttl_seconds=3600)
def get_crypto_news(crypto_name, limit=5):
    """Obtiene noticias recientes sobre una criptomoneda desde NewsAPI.

    Usa el endpoint /v2/everything con búsqueda por nombre.
    Los resultados se cachean 1 hora (las noticias cambian con menor frecuencia
    que los precios).

    Args:
        crypto_name: Nombre de la criptomoneda (ej: 'Bitcoin').
        limit: Número máximo de artículos a devolver (por defecto 5).

    Returns:
        Lista de diccionarios con esquema simplificado, o lista vacía en caso de error.
    """
    # Si no hay API key configurada, retornar silenciosamente
    if not Config.NEWS_API_KEY:
        print("NewsAPI: No hay API key configurada. Omitiendo noticias.")
        return []

    url = f"{Config.NEWS_API_BASE_URL}/everything"
    params = {
        "q": crypto_name,
        "sortBy": "publishedAt",
        "language": "en",
        "pageSize": limit,
    }
    headers = {
        "Authorization": f"Bearer {Config.NEWS_API_KEY}",
    }

    try:
        response = requests.get(url, params=params, headers=headers, timeout=REQUEST_TIMEOUT)

        # Manejo específico de errores HTTP
        if response.status_code == 401:
            print("NewsAPI: Clave inválida (401 Unauthorized).")
            return []
        if response.status_code == 429:
            print("NewsAPI: Límite diario alcanzado (429 Too Many Requests).")
            return []

        response.raise_for_status()
        data = response.json()

        if data.get("status") != "ok":
            print(f"NewsAPI: Respuesta con error — {data.get('message', 'desconocido')}")
            return []

        # Mapear artículos al esquema simplificado
        articles = []
        for article in data.get("articles", []):
            articles.append({
                "source": article.get("source", {}).get("name", "Desconocido"),
                "title": article.get("title", "Sin título"),
                "url": article.get("url", "#"),
                "publishedAt": article.get("publishedAt", ""),
                "image": article.get("urlToImage") or _NEWS_PLACEHOLDER_IMAGE,
            })

        return articles

    except requests.exceptions.RequestException as e:
        print(f"Error al obtener noticias de NewsAPI: {e}")
        return []
