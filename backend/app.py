from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail, Message  
from db import db
from models.user import User
from models.project import Project
from models.task import Task
from models.habit import Habit
from models.todo import Todo

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://root:Santhosh%40827@localhost/mydb"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = "your-very-secret-key"
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'santhoshskn2105@gmail.com'
app.config['MAIL_PASSWORD'] = 'ermqahfvperkyfbb'
db.init_app(app)
jwt = JWTManager(app)
mail = Mail(app) 

CORS(
    app,
    resources={r"/api/*": {"origins": "http://127.0.0.1:5500"}},
    supports_credentials=True
)

from routes.auth_routes import auth_bp
from routes.task_routes import task_bp
from routes.habit_routes import habit_bp
from routes.project_routes import project_bp
from routes.dashboard_routes import dashboard_bp
from routes.todo_routes import todo_bp
from routes.changepassword_routes import changepassword_bp
from routes.user_routes import user_bp

app.register_blueprint(auth_bp, url_prefix="/api/auth/")
app.register_blueprint(task_bp, url_prefix="/api/tasks/")
app.register_blueprint(habit_bp, url_prefix="/api/habits/")
app.register_blueprint(project_bp, url_prefix="/api/projects/")
app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard/")
app.register_blueprint(todo_bp, url_prefix="/api/todos/")
app.register_blueprint(changepassword_bp, url_prefix='/api/change_password')
app.register_blueprint(user_bp, url_prefix="/api/user/")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)