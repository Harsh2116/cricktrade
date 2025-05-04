# Deployment Instructions for Crickfest Backend and Database

## Overview
This document provides step-by-step instructions to deploy the Crickfest backend server and MySQL database in a production environment.

---

## 1. MySQL Database Setup

### Option A: Self-Hosted MySQL Server
- Install MySQL Server on your production server or VPS.
- Start the MySQL service and ensure it runs automatically on system boot.
- Create the required database and tables using your existing `db-setup.sql` script:
  ```bash
  mysql -u root -p < db-setup.sql
  ```
- Configure user permissions and secure your MySQL installation.
- Note the hostname, port (default 3306), username, and password for your database.

### Option B: Cloud-Hosted MySQL
- Use a cloud database provider (e.g., AWS RDS, Azure Database, Google Cloud SQL).
- Create a MySQL instance and configure network access.
- Import your database schema using the `db-setup.sql` file.
- Obtain the connection details (host, port, username, password).

---

## 2. Backend Server Deployment

### Prerequisites
- Node.js installed on the production server.
- Network access to the MySQL database from the backend server.

### Steps
1. Upload your backend code (`crickfest-backend` folder) to the production server.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update the MySQL connection configuration in `server.js`:
   ```js
   const pool = mysql.createPool({
       host: 'YOUR_DB_HOST',
       user: 'YOUR_DB_USER',
       password: 'YOUR_DB_PASSWORD',
       database: 'crickfest_db',
       waitForConnections: true,
       connectionLimit: 10,
       queueLimit: 0
   });
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```
5. (Optional) Use a process manager like `pm2` to keep the server running:
   ```bash
   npm install -g pm2
   pm2 start server.js --name crickfest-backend
   pm2 save
   pm2 startup
   ```

---

## 3. Frontend Deployment

- Host your frontend files (`crickfest` folder) on any static hosting service or the same server.
- Ensure the frontend connects to the backend server's URL and port for WebSocket communication.
- Update any URLs in frontend scripts if backend URL or port changes.

---

## 4. Network and Security

- Open necessary ports on your server firewall (e.g., 8080 for backend).
- Use HTTPS and secure WebSocket (wss://) in production.
- Secure your database with strong passwords and restricted access.
- Consider environment variables or config files for sensitive data instead of hardcoding.

---

## 5. Summary

- MySQL runs independently and must be started before backend.
- Backend connects to MySQL and serves frontend requests.
- Frontend communicates with backend via WebSocket.
- Use process managers and secure your deployment.

---

If you need help with specific deployment platforms or automation scripts, please let me know.
