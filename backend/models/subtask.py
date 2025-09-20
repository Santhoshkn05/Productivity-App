from config import db

class SubTask(db.Model):
    __tablename__ = "subtasks"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default="pending")
    task_id = db.Column(db.Integer, db.ForeignKey("tasks.id"), nullable=False)
