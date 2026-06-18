from flask import Blueprint, jsonify, render_template, request
from flask_login import login_required, current_user

from backend.database import db
from backend.models.favorite import Favorite
from backend.models.history import History
from backend.services import coingecko
from backend.services import gemini_service

crypto_bp = Blueprint("crypto", __name__)


@crypto_bp.route("/dashboard")
@login_required
def dashboard():
    """RF03 - Dashboard principal."""
    return render_template("dashboard.html")


@crypto_bp.route("/crypto/<string:crypto_id>")
@login_required
def crypto_detail_page(crypto_id):
    """RF07 - Vista Detallada de Criptomoneda.
    
    Renderiza la página de detalle y registra la visita en el historial (RF11).
    """
    # Registrar en historial
    history_entry = History(user_id=current_user.id, crypto_id=crypto_id)
    db.session.add(history_entry)
    db.session.commit()

    return render_template("detail.html", crypto_id=crypto_id)


@crypto_bp.route("/favorites")
@login_required
def favorites_page():
    """RF10 - Vista de Favoritos."""
    return render_template("favorites.html")


@crypto_bp.route("/history")
@login_required
def history_page():
    """RF11 - Vista de Historial."""
    return render_template("history.html")


# ==============================================================================
# API Endpoints
# ==============================================================================

@crypto_bp.route("/api/cryptos")
@login_required
def get_cryptos():
    """RF03 - GET /api/cryptos"""
    cryptos = coingecko.get_top_cryptos(limit=20)
    return jsonify(cryptos)


@crypto_bp.route("/api/crypto/<string:crypto_id>")
@login_required
def get_crypto_detail(crypto_id):
    """RF04/RF05/RF07 - GET /api/crypto/<id>"""
    detail = coingecko.get_crypto_detail(crypto_id)
    if detail is None:
        return jsonify({"error": "Criptomoneda no encontrada"}), 404
    return jsonify(detail)


@crypto_bp.route("/api/crypto/<string:crypto_id>/history")
@login_required
def get_crypto_history(crypto_id):
    """RF05/RF08 - GET /api/crypto/<id>/history"""
    days = request.args.get("days", 7, type=int)
    history = coingecko.get_crypto_history(crypto_id, days=days)
    if history is None:
        return jsonify({"error": "No se pudo obtener el histórico"}), 404
    return jsonify(history)


@crypto_bp.route("/api/analysis", methods=["POST"])
@login_required
def get_crypto_analysis():
    """RF09 - POST /api/analysis
    
    Entrada: {"crypto": "bitcoin"}
    Salida: Análisis de Gemini
    """
    data = request.get_json()
    if not data or "crypto" not in data:
        return jsonify({"error": "Criptomoneda no especificada"}), 400
        
    crypto_id = data["crypto"]
    
    # Obtener datos de la cripto para el prompt
    detail = coingecko.get_crypto_detail(crypto_id)
    if not detail:
        return jsonify({"error": "No se pudieron obtener datos de la criptomoneda para el análisis"}), 404
        
    # Llamar a Gemini
    analysis = gemini_service.analyze_crypto(detail)
    if not analysis:
        return jsonify({"error": "Error al generar el análisis de IA. Comprueba que GEMINI_API_KEY esté configurada."}), 500
        
    return jsonify(analysis)


@crypto_bp.route("/api/favorites/<string:crypto_id>/status")
@login_required
def check_favorite(crypto_id):
    """Comprueba si una criptomoneda es favorita del usuario actual."""
    fav = Favorite.query.filter_by(user_id=current_user.id, crypto_id=crypto_id).first()
    return jsonify({"is_favorite": fav is not None})


@crypto_bp.route("/api/favorites/<string:crypto_id>", methods=["POST", "DELETE"])
@login_required
def toggle_favorite(crypto_id):
    """RF10 - Añadir o eliminar favorito."""
    fav = Favorite.query.filter_by(user_id=current_user.id, crypto_id=crypto_id).first()
    
    if request.method == "POST":
        if not fav:
            new_fav = Favorite(user_id=current_user.id, crypto_id=crypto_id)
            db.session.add(new_fav)
            db.session.commit()
            return jsonify({"status": "added", "is_favorite": True})
        return jsonify({"status": "already_added", "is_favorite": True})
        
    elif request.method == "DELETE":
        if fav:
            db.session.delete(fav)
            db.session.commit()
            return jsonify({"status": "removed", "is_favorite": False})
        return jsonify({"status": "not_found", "is_favorite": False})


@crypto_bp.route("/api/favorites")
@login_required
def get_favorites():
    """Obtiene los IDs de las criptomonedas favoritas del usuario."""
    favs = Favorite.query.filter_by(user_id=current_user.id).all()
    fav_ids = [f.crypto_id for f in favs]
    return jsonify({"favorites": fav_ids})


@crypto_bp.route("/api/history")
@login_required
def get_user_history():
    """Obtiene el historial de consultas del usuario."""
    history = History.query.filter_by(user_id=current_user.id).order_by(History.fecha_consulta.desc()).limit(50).all()
    results = [
        {"crypto_id": h.crypto_id, "fecha_consulta": h.fecha_consulta.isoformat()} 
        for h in history
    ]
    return jsonify({"history": results})
