from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager
from flask_cors import CORS
from datetime import timedelta
import os
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///mydatabase.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5 MB

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

jwt = JWTManager(app)
db = SQLAlchemy(app)
#CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})



class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    profile_pic = db.Column(db.String(200), nullable=True)


class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    movie_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(200), nullable=False)

@app.route('/')
def home():
    return "Home"

@app.route('/api/auth', methods=["POST"])
def auth():
    username = request.json.get('username')
    email = request.json.get('email')
    phone = request.json.get('phone')
    print("Data gotten")

    if not username or not email:
        return jsonify({"message": "Fill all fields"}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if user:
        if user.username != username or user.email != email:
            return jsonify({"message": "Invalid credentials"}), 400
        
        print("Okayyy. Login")
        access_token = create_access_token(identity=user.id)
        return jsonify({"message": "Login successful", "access_token": access_token}), 200
    
    print("Okayyyy. Sign up")
    new_user = User(username=username, email=email, phone=phone)
    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=new_user.id)
    return jsonify({"message": "User created successfully", "access_token": access_token}), 201


@app.route('/api/update', methods=["PUT"])
@jwt_required()
def update_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.form  # For text fields
    username = data.get('username')
    email = data.get('email')
    phone = data.get('phone')

    # Update text fields
    if username:
        user.username = username
    if email:
        user.email = email
    if phone:
        user.phone = phone
    
    db.session.commit()

    return jsonify({
        "message": "User updated successfully",
        "user": {
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
        }
    }), 200


@app.route("/api/toogle_favorites", methods=["POST"])
@jwt_required()
def toogle_favourite():
    try:
        current_user_id = get_jwt_identity()
        data  = request.get_json()
        movie_id = data['movie_id']
        title = data['title']

        existing_favorite = Favorite.query.filter_by(user_id=current_user_id, movie_id=movie_id).first()

        if existing_favorite:
            db.session.delete(existing_favorite)
            db.session.commit()
            return jsonify({"action": "removed"}), 200
        else:
            new_favourite = Favorite(user_id=current_user_id, movie_id=movie_id, title=title)
            db.session.add(new_favourite)
            db.session.commit()
            return jsonify({"action": "added"}), 200
        
    except Exception as e:
        print(f"Error in toggle_favorite: {str(e)}")
        return jsonify({"error": str(e)}), 401


@app.route("/api/check_favorite", methods=["GET"])
@jwt_required()
def check_favorite():
    try:
        current_user_id = get_jwt_identity()
        movie_id = request.args.get("movie_id")

        existing_favorite = Favorite.query.filter_by(user_id=current_user_id, movie_id=movie_id).first()

        return jsonify({"is_favorite": existing_favorite is not None}), 200
    
    except Exception as e:
        print(f"Error in check_favorite: {str(e)}")
        return jsonify({"error": str(e)}), 401


@app.route("/api/favorites", methods=["GET"])
@jwt_required()
def get_favorites():
    try:
        current_user_id = get_jwt_identity()
        favorites = Favorite.query.filter_by(user_id=current_user_id).all()

        result = [
            {
                "id": fav.movie_id,
                "title": fav.title,
            }
            for fav in favorites
        ]

        return jsonify({"favorites": result}), 200

    except Exception as e:
        print(f"Error in get_favorites: {str(e)}")
        return jsonify({"error": str(e)}), 401

@app.route('/api/upload', methods=["POST"])
@jwt_required()
def upload():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Debugging logs
    print("Request content type:", request.content_type)
    print("Request data:", request.data)
    print("Request form:", request.form)
    print("Request files:", request.files)

    if 'profile_picture' not in request.files:
        print("No file received!")
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['profile_picture']
    if file:
        filename = f"{uuid.uuid4().hex}_{file.filename}"
        file_path = os.path.join('static', filename)
        file.save(file_path)

        user.profile_picture = f"http://localhost:5000/{file_path}"
        db.session.commit()

        print(f"Uploaded file to: {file_path}")
        return jsonify({"profile_picture": user.profile_picture})

    print("No file received!")
    return jsonify({"error": "Failed to upload file"}), 400


"""
@app.route('/api/upload', methods=["POST"])
@jwt_required()
def upload():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    file = request.files.get('file')
    if file:
        file_path = f"static/{file.filename}"
        file.save(file_path)
        user.profile_picture = f"http://localhost:5000/{file_path}"
        db.session.commit()
        return jsonify({"profile_picture": user.profile_picture})
    return jsonify({"message": "Failed to upload"}), 400
"""

# ✅ Serve uploaded images
@app.route('/uploads/<filename>')
def get_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


    
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
app.run(host="0.0.0.0", port=5000, debug=True)

