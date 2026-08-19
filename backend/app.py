from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "nexa_db"),
    "port": int(os.getenv("DB_PORT", "3306"))
}

def get_db():
    return mysql.connector.connect(**DB_CONFIG)

@app.get("/")
def home():
    return jsonify({"message": "NEXA API is running", "status": "ok"})

@app.get("/api/health")
def health():
    try:
        db = get_db()
        db.close()
        return jsonify({"status": "healthy", "database": "connected"})
    except Error as e:
        return jsonify({"status": "unhealthy", "database": str(e)}), 503

@app.get("/api/employees")
def get_employees():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT id, name, email, role, department, status, performance,
               DATE_FORMAT(join_date, '%Y-%m-%d') AS join_date
        FROM employees ORDER BY id DESC
    """)
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(rows)

@app.get("/api/employees/<int:employee_id>")
def get_employee(employee_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT id, name, email, role, department, status, performance,
               DATE_FORMAT(join_date, '%Y-%m-%d') AS join_date
        FROM employees WHERE id = %s
    """, (employee_id,))
    row = cursor.fetchone()
    cursor.close()
    db.close()
    if not row:
        return jsonify({"error": "Employee not found"}), 404
    return jsonify(row)

@app.post("/api/employees")
def create_employee():
    data = request.get_json() or {}
    required = ["name", "email", "role", "department"]
    missing = [x for x in required if not data.get(x)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO employees
        (name, email, role, department, status, performance, join_date)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        data["name"], data["email"], data["role"], data["department"],
        data.get("status", "Active"), int(data.get("performance", 75)),
        data.get("join_date") or None
    ))
    db.commit()
    employee_id = cursor.lastrowid
    cursor.close()
    db.close()
    return jsonify({"message": "Employee created", "id": employee_id}), 201

@app.put("/api/employees/<int:employee_id>")
def update_employee(employee_id):
    data = request.get_json() or {}
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        UPDATE employees SET
            name=%s, email=%s, role=%s, department=%s,
            status=%s, performance=%s, join_date=%s
        WHERE id=%s
    """, (
        data.get("name"), data.get("email"), data.get("role"),
        data.get("department"), data.get("status", "Active"),
        int(data.get("performance", 75)), data.get("join_date") or None,
        employee_id
    ))
    db.commit()
    changed = cursor.rowcount
    cursor.close()
    db.close()
    if not changed:
        return jsonify({"error": "Employee not found"}), 404
    return jsonify({"message": "Employee updated"})

@app.delete("/api/employees/<int:employee_id>")
def delete_employee(employee_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM employees WHERE id=%s", (employee_id,))
    db.commit()
    changed = cursor.rowcount
    cursor.close()
    db.close()
    if not changed:
        return jsonify({"error": "Employee not found"}), 404
    return jsonify({"message": "Employee deleted"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
