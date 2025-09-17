from flask import Blueprint, request, jsonify
from models.user import User  
from db import db  
from werkzeug.security import generate_password_hash, check_password_hash

changepassword_bp = Blueprint("changepassword_bp", __name__)

@changepassword_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    email = data.get("email")
    new_password = data.get("password")

    if not email or not new_password:
        return jsonify({"message": "Email and new password are required."}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "User not found."}), 404

    hashed_password = generate_password_hash(new_password)

    user.password = hashed_password
    db.session.commit()

    return jsonify({"message": "Password reset successful! You can now log in with your new password."}), 200