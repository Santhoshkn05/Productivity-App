from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from dotenv import load_dotenv
import os

from db import db
from models.user import User
from models.project import Project
from models.task import Task
from models.habit import Habit
from models.todo import Todo
from models.project_updates import ProjectUpdate

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
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
    app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")

    db.init_app(app)
    JWTManager(app)
    Mail(app)
    CORS(
        app,
        resources={r"/api/*": {"origins": "http://127.0.0.1:5500"}},
        supports_credentials=True
    )

    app.register_blueprint(auth_bp)
    app.register_blueprint(task_bp, url_prefix="/api/tasks/")
    app.register_blueprint(habit_bp, url_prefix="/api/habits/")
    app.register_blueprint(project_bp, url_prefix="/api/projects/")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard/")
    app.register_blueprint(todo_bp, url_prefix="/api/todos/")
    app.register_blueprint(user_bp, url_prefix="/api/user/")
    app.register_blueprint(update_bp, url_prefix="/api/projects/")

    @app.route("/")
    def index():
        return "Your Flask API is running!"

    return app
app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all() 
    app.run(debug=True, port=5000)