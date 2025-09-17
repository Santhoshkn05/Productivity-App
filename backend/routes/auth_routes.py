from flask import Blueprint, request, jsonify, current_app
from models.user import User
from db import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from flask_mail import Message

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth/")

@auth_bp.route("/register/", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not all([username, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "Username or email already exists"}), 409

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, email=email, password=hashed_password)
    
    db.session.add(new_user)
    db.session.commit()

    try:
        mail = current_app.extensions.get('mail')
        if mail:
            msg = Message(
                "Registration Successful!",
                sender=current_app.config['MAIL_USERNAME'],
                recipients=[new_user.email]
            )
            msg.body = f"Hello {new_user.username},\n\nWelcome to our To-Do List app! Your account has been successfully created."
            mail.send(msg)
    except Exception as e:
        print(f"Failed to send email: {e}")

    return jsonify({"message": "User registered successfully! A welcome email has been sent."}), 201

@auth_bp.route("/login/", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=user.id)

    return jsonify({
        "token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }), 200

@auth_bp.route("/reset-password/", methods=["POST"])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    new_password = data.get('password')

    if not email or not new_password:
        return jsonify({"message": "Email and new password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if user:
        if check_password_hash(user.password, new_password):
            return jsonify({"message": "New password cannot be the same as your current password."}), 400
        
        user.password = generate_password_hash(new_password)
        db.session.commit()

    return jsonify({"message": "If an account with this email exists, the password has been reset."})