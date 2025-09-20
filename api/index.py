# /api/index.py

from flask import Flask, render_template
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from dotenv import load_dotenv
import os
import sys

# CRITICAL: This line allows Vercel to find your modules in the 'backend' folder
# It adds your project's root directory to the list of paths Python checks for imports.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# All imports from your project must now be prefixed with 'backend.'
from backend.db import db
from backend.models.user import User
from backend.models.project import Project
from backend.models.task import Task
from backend.models.habit import Habit
from backend.models.todo import Todo
from backend.models.project_updates import ProjectUpdate

from backend.routes.auth_routes import auth_bp
from backend.routes.task_routes import task_bp
from backend.routes.habit_routes import habit_bp
from backend.routes.project_routes import project_bp
from backend.routes.dashboard_routes import dashboard_bp
from backend.routes.todo_routes import todo_bp
from backend.routes.user_routes import user_bp
from backend.routes.project_updates_routes import update_bp

load_dotenv()

def create_app():
    # CORRECTED PATHS: Vercel runs from the root, so we point directly to the 'frontend' folder.
    app = Flask(
        __name__,
        template_folder='frontend',
        static_folder='frontend',
        static_url_path='/'
    )

    # --- All your app.config settings remain the same ---
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Added this for good practice

    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
    app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")

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

    @app.route("/<path:page_name>")
    def serve_page(page_name):
        if '.' in page_name:
            return render_template(page_name)
        return render_template(f'{page_name}.html')

    @app.errorhandler(404)
    def not_found(e):
        return render_template('index.html')

    return app

app = create_app()