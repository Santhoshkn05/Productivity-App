from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Project, Task, Habit, Todo

dashboard_bp = Blueprint("dashboard_bp", __name__)

@dashboard_bp.route("/stats/", methods=["GET"])
@jwt_required()
def get_stats():
    user_id = get_jwt_identity()

    total_projects = Project.query.filter_by(user_id=user_id).count()
    total_tasks = Task.query.filter_by(user_id=user_id).count()
    completed_tasks = Task.query.filter_by(user_id=user_id, status="completed").count()
    habits_tracked = Habit.query.filter_by(user_id=user_id).count() 

    return jsonify({
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": total_tasks - completed_tasks,
        "habits_tracked": habits_tracked
    })
