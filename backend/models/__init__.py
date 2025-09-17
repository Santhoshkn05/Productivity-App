from flask_sqlalchemy import SQLAlchemy
from .user import User
from .project import Project
from .task import Task
from .habit import Habit
from .todo import Todo

db = SQLAlchemy()

from .user import User
from .task import Task
from .project import Project
from .habit import Habit
