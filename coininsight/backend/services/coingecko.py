import requests

from backend.config import Config

# Timeout para peticiones HTTP (segundos)
REQUEST_TIMEOUT = 10

# Caché simple en memoria para evitar el rate-limiting de CoinGecko
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
            if result:
                cache[key] = (result, now)
            return result
        return wrapper
    return decorator


@ttl_cache(ttl_seconds=60)
def get_top_cryptos(limit=20):
    """Obtiene las top criptomonedas desde CoinGecko.

    Datos devueltos por crypto:
    - id, symbol, name, image
    - current_price, market_cap, total_volume
    - price_change_percentage_24h

    Args:
        limit: Número de criptomonedas a obtener (por defecto 20, según RF03).

    Returns:
        Lista de diccionarios con datos de criptomonedas, o lista vacía en caso de error.
    """
    url = f"{Config.COINGECKO_BASE_URL}/coins/markets"
    params = {
        "vs_currency": "usd",
        "order": "market_cap_desc",
        "per_page": limit,
        "page": 1,
        "sparkline": False,
        "price_change_percentage": "24h,7d",
    }

    try:
        response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error al obtener datos de CoinGecko: {e}")
        return []


@ttl_cache(ttl_seconds=120)
def get_crypto_detail(crypto_id):
    """Obtiene información detallada de una criptomoneda desde CoinGecko.

    Datos devueltos (RF05):
    - Precio actual
    - Variación 24h
    - Volumen
    - Capitalización
    - Descripción

    Args:
        crypto_id: Identificador de la criptomoneda (ej: 'bitcoin').

    Returns:
        Diccionario con datos detallados, o None en caso de error.
    """
    url = f"{Config.COINGECKO_BASE_URL}/coins/{crypto_id}"
    params = {
        "localization": "false",
        "tickers": "false",
        "community_data": "false",
        "developer_data": "false",
    }

    try:
        response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()

        return {
            "id": data.get("id"),
            "symbol": data.get("symbol"),
            "name": data.get("name"),
            "image": data.get("image", {}).get("large", ""),
            "current_price": data.get("market_data", {}).get("current_price", {}).get("usd", 0),
            "market_cap": data.get("market_data", {}).get("market_cap", {}).get("usd", 0),
            "total_volume": data.get("market_data", {}).get("total_volume", {}).get("usd", 0),
            "price_change_percentage_24h": data.get("market_data", {}).get(
                "price_change_percentage_24h", 0
            ),
            "price_change_percentage_7d": data.get("market_data", {}).get(
                "price_change_percentage_7d", 0
            ),
            "description": data.get("description", {}).get("en", ""),
        }
    except requests.exceptions.RequestException as e:
        print(f"Error al obtener detalle de {crypto_id}: {e}")
        return None


@ttl_cache(ttl_seconds=300)
def get_crypto_history(crypto_id, days=7):
    """Obtiene el histórico de precios de una criptomoneda.

    Se usará en RF05 para la gráfica de 7 días.

    Args:
        crypto_id: Identificador de la criptomoneda.
        days: Número de días de histórico (por defecto 7).

    Returns:
        Diccionario con lista de precios [[timestamp, precio], ...], o None en caso de error.
    """
    url = f"{Config.COINGECKO_BASE_URL}/coins/{crypto_id}/market_chart"
    params = {
        "vs_currency": "usd",
        "days": days,
    }

    try:
        response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()

        return {
            "prices": data.get("prices", []),
        }
    except requests.exceptions.RequestException as e:
        print(f"Error al obtener histórico de {crypto_id}: {e}")
        return None
