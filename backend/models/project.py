from db import db

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    language = db.Column(db.String(50))
    status = db.Column(db.String(50), nullable=False, default='working')
    details = db.Column(db.Text)
    completed_at = db.Column(db.DateTime, nullable=True) 
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship("User", back_populates="projects")