from flask import Blueprint, jsonify, render_template, request
from flask_login import login_required

from backend.services import coingecko

crypto_bp = Blueprint("crypto", __name__)


@crypto_bp.route("/dashboard")
@login_required
def dashboard():
    """RF03 - Dashboard principal.

    Renderiza la página del dashboard. Los datos de criptomonedas
    se cargan vía JavaScript desde /api/cryptos.
    """
    return render_template("dashboard.html")


@crypto_bp.route("/api/cryptos")
@login_required
def get_cryptos():
    """RF03 - GET /api/cryptos

    Devuelve top 20 criptomonedas desde CoinGecko.
    Datos: nombre, símbolo, precio, variación 24h, market cap.
    """
    cryptos = coingecko.get_top_cryptos(limit=20)
    return jsonify(cryptos)


@crypto_bp.route("/api/crypto/<string:crypto_id>")
@login_required
def get_crypto_detail(crypto_id):
    """RF04/RF05 - GET /api/crypto/<id>

    Devuelve información detallada de una criptomoneda.
    """
    detail = coingecko.get_crypto_detail(crypto_id)

    if detail is None:
        return jsonify({"error": "Criptomoneda no encontrada"}), 404

    return jsonify(detail)


@crypto_bp.route("/api/crypto/<string:crypto_id>/history")
@login_required
def get_crypto_history(crypto_id):
    """RF05 - GET /api/crypto/<id>/history

    Devuelve histórico de precios para la gráfica.
    """
    days = request.args.get("days", 7, type=int)
    history = coingecko.get_crypto_history(crypto_id, days=days)

    if history is None:
        return jsonify({"error": "No se pudo obtener el histórico"}), 404

    return jsonify(history)
