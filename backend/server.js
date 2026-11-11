const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const {
    authenticateToken,
    authorizeRoles
} = require('./middleware/authMiddleware');
const employeeRoutes = require('./routes/employeeRoutes');
const managerRoutes = require('./routes/managerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Authentication routes
app.use('/api/auth', authRoutes);

app.use('/api/employee', employeeRoutes);
app.use('/api/manager', managerRoutes);
// Welcome API
app.get('/', (req, res) => {
    res.json({
        message: 'Employee Task Management API is running!',
        status: 'Success'
    });
});

// Database health check
app.get('/api/health/db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 AS result');

        res.status(200).json({
            message: 'MySQL connected successfully!',
            database: process.env.DB_NAME,
            result: rows[0].result
        });
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: 'MySQL connection failed.'
        });
    }
});

// Protected employee test API
app.get(
    '/api/employee/test',
    authenticateToken,
    authorizeRoles('Employee'),
    (req, res) => {
        res.status(200).json({
            message: 'Employee authentication successful!',
            userId: req.user.userId,
            role: req.user.role
        });
    }
);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});