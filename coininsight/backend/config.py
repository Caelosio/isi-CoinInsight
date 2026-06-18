import os

from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    """Configuración principal de la aplicación."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "coininsight-dev-secret-key-change-in-production")

    # Base de datos SQLite
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(BASE_DIR, 'database', 'coininsight.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # CoinGecko API (gratuita, sin API key)
    COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"

    # Gemini API — clave cargada desde .env
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
