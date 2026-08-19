CREATE DATABASE IF NOT EXISTS nexa_db;
USE nexa_db;

CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    status ENUM('Active', 'On Leave', 'Inactive') NOT NULL DEFAULT 'Active',
    performance INT NOT NULL DEFAULT 75,
    join_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO employees (name, email, role, department, status, performance, join_date)
VALUES
('Rahul Gowda', 'rahul@nexa.local', 'DevOps Engineer', 'Engineering', 'Active', 92, '2025-07-15'),
('Ankitha Rao', 'ankitha@nexa.local', 'QA Engineer', 'Quality', 'Active', 86, '2025-09-02'),
('Arjun Kumar', 'arjun@nexa.local', 'Backend Developer', 'Engineering', 'Active', 89, '2024-11-21'),
('Priya Sharma', 'priya@nexa.local', 'Product Designer', 'Design', 'On Leave', 78, '2025-02-10'),
('Vikram Singh', 'vikram@nexa.local', 'HR Executive', 'People', 'Active', 81, '2024-08-19')
ON DUPLICATE KEY UPDATE email=email;
