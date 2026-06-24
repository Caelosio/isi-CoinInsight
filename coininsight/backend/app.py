import os
import sys

from flask import Flask, redirect, url_for
from flask_login import LoginManager
from flask_cors import CORS

# Asegurar que el directorio coininsight está en el path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + "/.."))

from backend.config import Config
from backend.database import db
from backend.models.user import User
from backend.routes.auth import auth_bp
from backend.routes.crypto import crypto_bp


def create_app():
    """Crea y configura la aplicación Flask."""

    # Rutas a templates y static dentro de frontend/
    template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "templates"))
    static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "static"))

    app = Flask(
        __name__,
        template_folder=template_dir,
        static_folder=static_dir,
    )

    app.config.from_object(Config)

    # Inicializar extensiones
    db.init_app(app)
    CORS(app)

    # Configurar Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    login_manager.login_message = "Inicia sesión para acceder."
    login_manager.login_message_category = "error"

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    # Registrar blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(crypto_bp)

    # Ruta raíz redirige a login
    @app.route("/")
    def index():
        return redirect(url_for("auth.login"))

    # Crear tablas de base de datos e inicializar datos por defecto
    with app.app_context():
        # Asegurar que el directorio database existe
        db_dir = os.path.join(os.path.dirname(__file__), "database")
        os.makedirs(db_dir, exist_ok=True)
        db.create_all()
        
        # Crear un usuario por defecto si la base de datos está vacía
        if not User.query.first():
            default_user = User(username="admin", email="admin@admin.com")
            default_user.set_password("admin123")
            db.session.add(default_user)
            db.session.commit()
            print("Usuario por defecto creado (Email: admin@admin.com, Password: admin)")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
