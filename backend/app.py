# backend/app.py

from flask import Flask, render_template
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from dotenv import load_dotenv
import os

from db import db
# Assuming your models are in backend/models/
from models.user import User
from models.project import Project
from models.task import Task
from models.habit import Habit
from models.todo import Todo
from models.project_updates import ProjectUpdate

# Assuming your blueprints are in backend/routes/
from routes.auth_routes import auth_bp
from routes.task_routes import task_bp
from routes.habit_routes import habit_bp
from routes.project_routes import project_bp
from routes.dashboard_routes import dashboard_bp
from routes.todo_routes import todo_bp
from routes.user_routes import user_bp
from routes.project_updates_routes import update_bp

load_dotenv()

def create_app():
    # ==================== KEY CHANGE ====================
    # The 'static_url_path' tells Flask to serve the contents of the 'static_folder'
    # from the root URL. A request to '/css/login.css' will now correctly
    # serve the file 'frontend/css/login.css'.
    app = Flask(
        __name__,
        template_folder='../frontend',
        static_folder='../frontend',
        static_url_path='/'
    )

    # --- All your app.config settings remain the same ---
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")
    # ... (rest of your config)

    # --- Initializations and API Blueprints ---
    db.init_app(app)
    JWTManager(app)
    Mail(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(auth_bp) # Assuming auth_bp has its own prefix like /api/auth
    app.register_blueprint(task_bp, url_prefix="/api/tasks")
    app.register_blueprint(habit_bp, url_prefix="/api/habits")
    app.register_blueprint(project_bp, url_prefix="/api/projects")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(todo_bp, url_prefix="/api/todos")
    app.register_blueprint(user_bp, url_prefix="/api/user")
    app.register_blueprint(update_bp, url_prefix="/api/projects")

    # --- Routes to serve your HTML pages ---
    @app.route("/")
    def serve_index():
        return render_template('index.html')

    # This dynamic route serves pages like /login, /dashboard, etc.
    @app.route("/<path:page_name>")
    def serve_page(page_name):
        # We check if the requested path is a file (like login.html)
        if '.' in page_name:
            return render_template(page_name)
        # Otherwise, assume it's a page name and add .html
        return render_template(f'{page_name}.html')

    # Fallback for client-side routing. If a page is not found, serve the main app.
    @app.errorhandler(404)
    def not_found(e):
        return render_template('index.html')

    return app

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)