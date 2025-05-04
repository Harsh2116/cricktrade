-- Migration to create contest_participation table to track user contest participation

CREATE TABLE IF NOT EXISTS contest_participation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    contest_name VARCHAR(100) NOT NULL,
    participation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
