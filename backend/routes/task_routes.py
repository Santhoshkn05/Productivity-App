from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models.task import Task
from backend.db import db
from datetime import datetime
import pytz

task_bp = Blueprint("task_bp", __name__)

@task_bp.route("/", methods=["GET", "POST"])
@jwt_required()
def handle_tasks():
    user_id = get_jwt_identity()

    if request.method == "POST":
        data = request.get_json()
        if not data or not data.get('title'):
            return jsonify({"error": "Task title is required"}), 400
        
        new_task = Task(
            title=data['title'],
            description=data.get('description'),
            status='pending',
            user_id=user_id
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify({"message": "Task created successfully", "id": new_task.id}), 201

    if request.method == "GET":
        tasks = Task.query.filter_by(user_id=user_id).order_by(Task.id.desc()).all()
        return jsonify([{
            "id": t.id, 
            "title": t.title, 
            "description": t.description, 
            "status": t.status,
            "completed_at": t.completed_at.isoformat() if t.completed_at else None
        } for t in tasks])

@task_bp.route("/<int:task_id>", methods=["PUT", "DELETE"])
@jwt_required()
def handle_single_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()

    if not task:
        return jsonify({"error": "Task not found"}), 404

    if request.method == "PUT":
        data = request.get_json()
        if 'status' in data:
            task.status = data['status']
            if task.status == 'completed':
                ist_timezone = pytz.timezone("Asia/Kolkata")
                task.completed_at = datetime.now(ist_timezone)
            else:
                task.completed_at = None
        
        db.session.commit()
        return jsonify({
            "message": "Task updated successfully",
            "completed_at": task.completed_at.isoformat() if task.completed_at else None
        })

    if request.method == "DELETE":
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted successfully"})