from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import Project, ProjectUpdate
from backend.db import db
from datetime import datetime
import pytz

update_bp = Blueprint("update_bp", __name__)

# --- GET updates for a specific project ---
@update_bp.route("/<int:project_id>/updates", methods=["GET"])
@jwt_required()
def get_updates(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return jsonify({"error": "Project not found"}), 404

    updates = ProjectUpdate.query.filter_by(project_id=project_id).order_by(ProjectUpdate.created_at.desc()).all()
    return jsonify([{
        "id": u.id,
        "content": u.content,
        "created_at": u.created_at.isoformat()
    } for u in updates])

# --- ADD a new update to a project ---
@update_bp.route("/<int:project_id>/updates", methods=["POST"])
@jwt_required()
def add_update(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return jsonify({"error": "Project not found"}), 404

    data = request.get_json()
    if not data or not data.get('content'):
        return jsonify({"error": "Update content is required"}), 400

    ist_timezone = pytz.timezone("Asia/Kolkata")
    new_update = ProjectUpdate(
        content=data['content'],
        project_id=project_id,
        created_at=datetime.now(ist_timezone)
    )
    db.session.add(new_update)
    db.session.commit()
    return jsonify({"message": "Update added successfully"}), 201