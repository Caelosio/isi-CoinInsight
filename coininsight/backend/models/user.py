from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

from backend.database import db


class User(UserMixin, db.Model):
    """Modelo de usuario para autenticación.

    Campos según Agent.md:
    - id
    - username
    - email
    - password_hash
    """

    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    # Relaciones
    favoritos = db.relationship("Favorite", backref="user", lazy=True)
    historial = db.relationship("History", backref="user", lazy=True)

    def set_password(self, password):
        """Almacena la contraseña mediante hash (RF01)."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verifica la contraseña contra el hash almacenado."""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.username}>"
