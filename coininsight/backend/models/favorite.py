from backend.database import db


class Favorite(db.Model):
    """Modelo de favoritos.

    Campos según Agent.md:
    - id
    - user_id
    - crypto_id
    """

    __tablename__ = "favoritos"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    crypto_id = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f"<Favorite user={self.user_id} crypto={self.crypto_id}>"
