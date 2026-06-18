from datetime import datetime, timezone

from backend.database import db


class History(db.Model):
    """Modelo de historial de consultas.

    Campos según Agent.md:
    - id
    - user_id
    - crypto_id
    - fecha_consulta
    """

    __tablename__ = "historial"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    crypto_id = db.Column(db.String(100), nullable=False)
    fecha_consulta = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<History user={self.user_id} crypto={self.crypto_id} fecha={self.fecha_consulta}>"
