from db import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    tasks = db.relationship("Task", back_populates="user", lazy="dynamic", cascade="all, delete-orphan")
    projects = db.relationship("Project", back_populates="user", lazy="dynamic", cascade="all, delete-orphan")
    habits = db.relationship("Habit", back_populates="user", lazy="dynamic", cascade="all, delete-orphan")
    todos = db.relationship("Todo", back_populates="user", lazy="dynamic", cascade="all, delete-orphan")