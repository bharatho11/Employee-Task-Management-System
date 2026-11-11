# Employee Task & Productivity Management System

A full-stack web application designed to simplify employee task assignment, task tracking, and productivity monitoring through separate Manager and Employee dashboards.

## Project Overview

The Employee Task & Productivity Management System enables managers to create tasks, assign them to employees, and monitor their progress. Employees can view their assigned tasks and update their status. The application also maintains task history and sends automatic notifications to managers when employees update task progress.

## Key Features

### Manager Module
- Manager login and role-based access.
- View dashboard statistics.
- View and manage employee information.
- Create tasks and assign them to employees.
- Monitor task assignments and progress.
- Receive notifications when employees update task statuses.
- View and manage notifications.

### Employee Module
- Employee registration and login.
- Employee dashboard.
- View assigned tasks.
- Update task status:
  - Pending
  - In Progress
  - Completed

### System Features
- JWT-based authentication and authorization.
- RESTful API integration.
- MySQL relational database.
- Task status history tracking.
- Automated manager notifications.
- Separate role-based application access.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, HTML, CSS |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | JSON Web Token (JWT) |
| API Testing | Postman |
| Development Tools | VS Code, Git, GitHub |

## Project Structure

```text
Employee-Task-Management-System/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   └── employee_task_management.sql
│
├── screenshots/
│
├── .gitignore
└── README.md
```

## Database Design

The application uses MySQL with the following six tables:

1. **users** – Stores manager and employee information.
2. **teams** – Stores team-related information.
3. **tasks** – Stores task details and creator information.
4. **task_assignments** – Maintains employee-specific task assignments and statuses.
5. **task_history** – Records task status changes.
6. **notifications** – Stores notifications for users.

## Installation and Setup

### Prerequisites

- Node.js and npm
- MySQL Server
- MySQL Workbench
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/bharatho11/Employee-Task-Management-System.git
cd Employee-Task-Management-System
```

### 2. Set Up the Database

1. Open MySQL Workbench.
2. Open `database/employee_task_management.sql`.
3. Execute the SQL script.
4. Verify that the `employee_task_management` database and its tables are created.

### 3. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=employee_task_management
JWT_SECRET=your_secure_random_secret
```

Replace the database credentials and JWT secret with your local values.

### 4. Start the Backend

```bash
npm run dev
```

Backend server:

```text
http://localhost:5000
```

### 5. Configure and Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend application:

```text
http://localhost:5173
```

## Application Screenshots

Screenshots will be added here.

<!-- Add screenshots after uploading them to the screenshots folder -->

## Authentication

The application uses JWT-based authentication to protect routes and provide role-specific access to Manager and Employee functionalities.

## Future Enhancements

- Team management functionality.
- Advanced task filtering and search.
- Dashboard analytics and reporting.
- Improved notification management.
- Deployment to a production hosting environment.

## Author

**Bharath O**

- GitHub: https://github.com/bharatho11
- LinkedIn: https://www.linkedin.com/in/bharath-o

## License

This project is developed for academic and learning purposes.