from db import db
from datetime import datetime

class ProjectUpdate(db.Model):
    __tablename__ = 'project_updates'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)