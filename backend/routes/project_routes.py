from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.project import Project
from db import db
from datetime import datetime
import pytz

project_bp = Blueprint("project_bp", __name__)

@project_bp.route("/", methods=["GET", "POST"])
@jwt_required()
def handle_projects():
    user_id = get_jwt_identity()

    if request.method == "POST":
        data = request.get_json()
        if not data.get("name"):
            return jsonify({"error": "Project name is required"}), 400

        new_project = Project(
            name=data["name"],
            description=data.get("description", ""),
            language=data.get("language", ""),
            status="working", 
            details=data.get("details", ""),
            user_id=user_id
        )
        db.session.add(new_project)
        db.session.commit()
        return jsonify({"message": "Project created"}), 201

    projects = Project.query.filter_by(user_id=user_id).order_by(Project.id.desc()).all()
    return jsonify([{
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "language": p.language,
        "status": p.status,
        "details": p.details,
        "completed_at": p.completed_at.isoformat() if p.completed_at else None
    } for p in projects])

@project_bp.route("/<int:project_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def handle_single_project(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    if request.method == "GET":
        return jsonify({
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "language": project.language,
            "status": project.status,
            "details": project.details,
            "completed_at": project.completed_at.isoformat() if project.completed_at else None
        })

    if request.method == "PUT":
        data = request.get_json()
        project.name = data.get("name", project.name)
        project.description = data.get("description", project.description)
        project.language = data.get("language", project.language)
        project.details = data.get("details", project.details)

        if "status" in data:
            project.status = data["status"]
            if project.status == "completed":
                ist = pytz.timezone("Asia/Kolkata")
                project.completed_at = datetime.now(ist)
            else:
                project.completed_at = None

        db.session.commit()
        return jsonify({"message": "Project updated"})

    if request.method == "DELETE":
        db.session.delete(project)
        db.session.commit()
        return jsonify({"message": "Project deleted"})




































# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from models.project import Project
# from db import db
# from datetime import datetime
# import pytz

# project_bp = Blueprint("project_bp", __name__)

# @project_bp.route("/", methods=["GET", "POST"])
# @jwt_required()
# def handle_projects():
#     user_id = get_jwt_identity()
#     if request.method == "POST":
#         data = request.get_json()
#         if not data.get("name"):
#             return jsonify({"error": "Project name is required"}), 400
#         new_project = Project(
#             name=data["name"],
#             description=data.get("description", ""),
#             language=data.get("language", ""),
#             status="working",  # New projects are always 'working'
#             details=data.get("details", ""),
#             user_id=user_id
#         )
#         db.session.add(new_project)
#         db.session.commit()
#         return jsonify({"message": "Project created"}), 201

#     if request.method == "GET":
#         projects = Project.query.filter_by(user_id=user_id).order_by(Project.id.desc()).all()
#         return jsonify([{
#             "id": p.id, "name": p.name, "description": p.description,
#             "language": p.language, "status": p.status, "details": p.details,
#             "completed_at": p.completed_at.isoformat() if p.completed_at else None
#         } for p in projects])

# @project_bp.route("/<int:project_id>", methods=["PUT", "DELETE"])
# @jwt_required()
# def handle_single_project(project_id):
#     user_id = get_jwt_identity()
#     project = Project.query.filter_by(id=project_id, user_id=user_id).first()
#     if not project:
#         return jsonify({"error": "Project not found"}), 404

#     if request.method == "PUT":
#         data = request.get_json()
#         if 'status' in data:
#             project.status = data['status']
#             if project.status == 'completed':
#                 ist_timezone = pytz.timezone("Asia/Kolkata")
#                 project.completed_at = datetime.now(ist_timezone)
#             else:
#                 project.completed_at = None
#             db.session.commit()
#             return jsonify({"message": "Project status updated"})

#     if request.method == "DELETE":
#         db.session.delete(project)
#         db.session.commit()
#         return jsonify({"message": "Project deleted"})