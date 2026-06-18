from flask import Blueprint, request, redirect, url_for, render_template, flash
from flask_login import login_user, logout_user, login_required, current_user

from backend.database import db
from backend.models.user import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    """RF01 - Registro de usuarios.

    GET: Muestra formulario de registro.
    POST: Crea un nuevo usuario con contraseña hasheada.
    """
    if current_user.is_authenticated:
        return redirect(url_for("crypto.dashboard"))

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "").strip()

        # Validaciones básicas
        if not username or not email or not password:
            flash("Todos los campos son obligatorios.", "error")
            return render_template("register.html")

        # Verificar si el usuario ya existe
        if User.query.filter_by(username=username).first():
            flash("El nombre de usuario ya está en uso.", "error")
            return render_template("register.html")

        if User.query.filter_by(email=email).first():
            flash("El email ya está registrado.", "error")
            return render_template("register.html")

        # Crear usuario con contraseña hasheada
        user = User(username=username, email=email)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        flash("Cuenta creada correctamente. Inicia sesión.", "success")
        return redirect(url_for("auth.login"))

    return render_template("register.html")


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    """RF02 - Inicio de sesión.

    GET: Muestra formulario de login.
    POST: Valida credenciales e inicia sesión.
    """
    if current_user.is_authenticated:
        return redirect(url_for("crypto.dashboard"))

    if request.method == "POST":
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "").strip()

        if not email or not password:
            flash("Email y contraseña son obligatorios.", "error")
            return render_template("login.html")

        user = User.query.filter_by(email=email).first()

        if user is None or not user.check_password(password):
            flash("Email o contraseña incorrectos.", "error")
            return render_template("login.html")

        # Iniciar sesión y mantener sesión activa
        login_user(user, remember=True)
        flash(f"Bienvenido, {user.username}.", "success")
        return redirect(url_for("crypto.dashboard"))

    return render_template("login.html")


@auth_bp.route("/logout")
@login_required
def logout():
    """RF02 - Cerrar sesión."""
    logout_user()
    flash("Sesión cerrada correctamente.", "success")
    return redirect(url_for("auth.login"))
