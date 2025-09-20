from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.todo import Todo
from db import db
from datetime import datetime
import pytz

todo_bp = Blueprint("todo_bp", __name__)

@todo_bp.route("/", methods=["GET", "POST"])
@jwt_required()
def handle_todos():
    user_id = get_jwt_identity()
    if request.method == "POST":
        data = request.get_json()
        if not data or not data.get('content'):
            return jsonify({"error": "Content is required"}), 400

        ist_timezone = pytz.timezone("Asia/Kolkata")
        new_todo = Todo(
            content=data['content'], 
            user_id=user_id,
            created_at=datetime.now(ist_timezone)
        )
        db.session.add(new_todo)
        db.session.commit()
        return jsonify({
            "id": new_todo.id, "content": new_todo.content, 
            "is_completed": new_todo.is_completed, "created_at": new_todo.created_at.isoformat(),
            "completed_at": None
        }), 201

    if request.method == "GET":
        todos = Todo.query.filter_by(user_id=user_id).order_by(Todo.id.desc()).all()
        return jsonify([{
            "id": t.id, "content": t.content, "is_completed": t.is_completed,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "completed_at": t.completed_at.isoformat() if t.completed_at else None
        } for t in todos])


@todo_bp.route("/<int:todo_id>", methods=["PUT", "DELETE"])
@jwt_required()
def handle_single_todo(todo_id):
    user_id = get_jwt_identity()
    todo = Todo.query.filter_by(id=todo_id, user_id=user_id).first()
    if not todo:
        return jsonify({"error": "Todo not found"}), 404
    
    if request.method == "PUT":
        data = request.get_json()
        if 'is_completed' in data:
            todo.is_completed = bool(data['is_completed'])
            if todo.is_completed:
                ist_timezone = pytz.timezone("Asia/Kolkata")
                todo.completed_at = datetime.now(ist_timezone)
            else:
                todo.completed_at = None
            db.session.commit()
        return jsonify({
            "message": "Todo updated successfully",
            "completed_at": todo.completed_at.isoformat() if todo.completed_at else None
        })

    if request.method == "DELETE":
        db.session.delete(todo)
        db.session.commit()
        return jsonify({"message": "Todo deleted successfully"}), 200
