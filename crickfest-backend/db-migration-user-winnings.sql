-- Migration to create user_winnings table to store contest winnings

CREATE TABLE IF NOT EXISTS user_winnings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    contest_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    winning_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
