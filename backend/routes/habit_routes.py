from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models.habit import Habit
from backend.db import db
from datetime import datetime
import pytz

habit_bp = Blueprint("habit_bp", __name__)

@habit_bp.route("/", methods=["GET", "POST"])
@jwt_required()
def handle_habits():
    user_id = get_jwt_identity()

    if request.method == "POST":
        data = request.get_json()
        if not data or not data.get('name'):
            return jsonify({"error": "Habit name is required"}), 400
        
        new_habit = Habit(
            name=data['name'], 
            user_id=user_id, 
            description=data.get('description')
        )
        db.session.add(new_habit)
        db.session.commit()
        return jsonify({"message": "Habit created", "id": new_habit.id}), 201

    if request.method == "GET":
        habits = Habit.query.filter_by(user_id=user_id).order_by(Habit.id.desc()).all()
        return jsonify([{
            "id": h.id, "name": h.name, "description": h.description,
            "status": h.status,
            "completed_at": h.completed_at.isoformat() if h.completed_at else None
        } for h in habits])

@habit_bp.route("/<int:habit_id>", methods=["PUT", "DELETE"])
@jwt_required()
def handle_single_habit(habit_id):
    user_id = get_jwt_identity()
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()

    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    if request.method == "PUT":
        data = request.get_json()
        if 'status' in data:
            habit.status = data['status']
            if habit.status == 'completed':
                ist_timezone = pytz.timezone("Asia/Kolkata")
                habit.completed_at = datetime.now(ist_timezone)
            else:
                habit.completed_at = None
            db.session.commit()
            return jsonify({
                "message": "Habit updated",
                "completed_at": habit.completed_at.isoformat() if habit.completed_at else None
            })
    
    if request.method == "DELETE":
        db.session.delete(habit)
        db.session.commit()
        return jsonify({"message": "Habit deleted successfully"})