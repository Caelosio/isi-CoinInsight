import json
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from backend.config import Config

# 1. Definimos la estructura exacta que queremos que devuelva la IA
class CryptoAnalysis(BaseModel):
    resumen: str = Field(description="Un párrafo de resumen general sobre el estado de la criptomoneda basado en los datos.")
    tendencia: str = Field(description="Alcista, Bajista, o Neutral.")
    riesgo: str = Field(description="Alto, Medio, o Bajo.")
    factores: str = Field(description="Una frase mencionando posibles factores relevantes a vigilar.")

def analyze_crypto(crypto_data):

    print(f"DEBUG - API KEY CARGADA: {bool(Config.GEMINI_API_KEY)}")
    """Genera un análisis de IA estructurado para una criptomoneda usando Gemini.

    Args:
        crypto_data (dict): Diccionario con los datos de la criptomoneda.

    Returns:
        dict: Diccionario con el análisis estructurado, o None si hay error.
    """
    if not Config.GEMINI_API_KEY:
        print("Error: GEMINI_API_KEY no configurada.")
        return None

    try:
        # 2. Inicializamos el nuevo cliente con la API Key
        client = genai.Client(api_key=Config.GEMINI_API_KEY)

        name = crypto_data.get('name', 'la criptomoneda')
        price = crypto_data.get('current_price', 0)
        market_cap = crypto_data.get('market_cap', 0)
        volume = crypto_data.get('total_volume', 0)
        change_24h = crypto_data.get('price_change_percentage_24h', 0)
        change_7d = crypto_data.get('price_change_percentage_7d', 0)

        prompt = f"""
        Eres un analista financiero experto en criptomonedas. Explica a un usuario principiante la situación actual de {name}.
        
        Datos actuales:
        - Precio: ${price}
        - Capitalización de mercado: ${market_cap}
        - Volumen 24h: ${volume}
        - Variación 24h: {change_24h}%
        - Variación 7 días: {change_7d}%

        """

        # 3. Llamamos al modelo forzando el formato JSON estructurado
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=CryptoAnalysis,
                temperature=0.2, # Baja temperatura para que sea más preciso con los datos
            ),
        )
        
        # El SDK ya devuelve un string JSON perfecto y validado. 
        # Solo hacemos un json.loads para transformarlo en diccionario de Python.
        return json.loads(response.text)

    except Exception as e:
        print(f"Error al conectar con Gemini o parsear la respuesta: {e}")
        return None


# Schema para la comparación entre dos criptomonedas
class CryptoComparison(BaseModel):
    comparacion: str = Field(description="Texto de 3-4 párrafos comparando ambas criptomonedas en español.")


def compare_cryptos(crypto_a, crypto_b):
    """Genera una comparación cualitativa entre dos criptomonedas usando Gemini.

    Args:
        crypto_a (dict): Datos de la primera criptomoneda.
        crypto_b (dict): Datos de la segunda criptomoneda.

    Returns:
        dict: Diccionario con la comparación, o None si hay error.
    """
    if not Config.GEMINI_API_KEY:
        print("Error: GEMINI_API_KEY no configurada.")
        return None

    try:
        client = genai.Client(api_key=Config.GEMINI_API_KEY)

        name_a = crypto_a.get('name', 'Moneda A')
        price_a = crypto_a.get('current_price', 0)
        market_cap_a = crypto_a.get('market_cap', 0)
        volume_a = crypto_a.get('total_volume', 0)
        change_24h_a = crypto_a.get('price_change_percentage_24h', 0)
        change_7d_a = crypto_a.get('price_change_percentage_7d', 0)

        name_b = crypto_b.get('name', 'Moneda B')
        price_b = crypto_b.get('current_price', 0)
        market_cap_b = crypto_b.get('market_cap', 0)
        volume_b = crypto_b.get('total_volume', 0)
        change_24h_b = crypto_b.get('price_change_percentage_24h', 0)
        change_7d_b = crypto_b.get('price_change_percentage_7d', 0)

        prompt = f"""
        Eres un analista financiero experto en criptomonedas. Genera una comparación clara y didáctica en español entre {name_a} y {name_b}, dirigida a un usuario principiante.

        Datos actuales de {name_a}:
        - Precio: ${price_a}
        - Capitalización de mercado: ${market_cap_a}
        - Volumen 24h: ${volume_a}
        - Variación 24h: {change_24h_a}%
        - Variación 7 días: {change_7d_a}%

        Datos actuales de {name_b}:
        - Precio: ${price_b}
        - Capitalización de mercado: ${market_cap_b}
        - Volumen 24h: ${volume_b}
        - Variación 24h: {change_24h_b}%
        - Variación 7 días: {change_7d_b}%

        Escribe exactamente 4 párrafos cortos cubriendo:
        1. Diferencias de volatilidad y riesgo basadas en la variación 24h y 7 días.
        2. Diferencia de tamaño y liquidez basada en capitalización de mercado y volumen.
        3. Caso de uso o categoría de cada una (por ejemplo: reserva de valor, smart contracts, stablecoin, pagos, DeFi, etc.) basándote en tu conocimiento general del proyecto.
        4. Un cierre breve y neutral indicando que esta información es orientativa y no constituye consejo financiero; la decisión final es del usuario.

        Usa un tono profesional pero accesible. No uses listas con viñetas, solo párrafos.
        """

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=CryptoComparison,
                temperature=0.2,
            ),
        )

        return json.loads(response.text)

    except Exception as e:
        print(f"Error al generar comparación con Gemini: {e}")
        return None