FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Copiar el archivo de dependencias
COPY requirements.txt .

# Instalar las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código
COPY . .

# Añadir el directorio actual al PYTHONPATH
ENV PYTHONPATH=/app
ENV FLASK_APP=backend/app.py

# Exponer el puerto
EXPOSE 5000

# Ejecutar Flask escuchando en todas las interfaces para que Docker pueda rutearlo
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
