
const express = require('express');
const router = express.Router();

const db = require('../config/db');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/authMiddleware');

// All manager routes require Manager authentication
router.use(authenticateToken, authorizeRoles('Manager'));

// GET Manager Dashboard Statistics
router.get('/dashboard', async (req, res) => {
    try {
        const [employeeResult] = await db.query(
            "SELECT COUNT(*) AS totalEmployees FROM users WHERE role = 'Employee'"
        );

        const [taskResult] = await db.query(`
            SELECT
                COUNT(*) AS totalTasks,
                COALESCE(SUM(status = 'Pending'), 0) AS pendingTasks,
                COALESCE(SUM(status = 'In Progress'), 0) AS inProgressTasks,
                COALESCE(SUM(status = 'Completed'), 0) AS completedTasks
            FROM task_assignments
        `);

        res.status(200).json({
            message: 'Manager dashboard statistics retrieved successfully.',
            stats: {
                totalEmployees: employeeResult[0].totalEmployees,
                totalTasks: taskResult[0].totalTasks,
                pendingTasks: taskResult[0].pendingTasks,
                inProgressTasks: taskResult[0].inProgressTasks,
                completedTasks: taskResult[0].completedTasks
            }
        });

    } catch (error) {
        console.error('Manager dashboard error:', error);

        res.status(500).json({
            message: 'Unable to retrieve manager dashboard statistics.'
        });
    }
});


// GET All Employees
router.get('/employees', async (req, res) => {
    try {
        const [employees] = await db.query(`
            SELECT
                u.user_id,
                u.name,
                u.email,
                u.role,
                t.team_name
            FROM users u
            LEFT JOIN teams t ON u.team_id = t.team_id
            WHERE u.role = 'Employee'
            ORDER BY u.name ASC
        `);

        res.status(200).json({
            message: 'Employees retrieved successfully.',
            employees
        });

    } catch (error) {
        console.error('Get employees error:', error);

        res.status(500).json({
            message: 'Unable to retrieve employees.'
        });
    }
});


// POST Create and Assign Task
router.post('/tasks', async (req, res) => {
    const {
        title,
        description,
        priority,
        dueDate,
        employeeIds
    } = req.body;

    // Validate required fields
    if (!title || !priority || !dueDate ||
        !Array.isArray(employeeIds) || employeeIds.length === 0) {
        return res.status(400).json({
            message: 'Title, priority, due date and at least one employee are required.'
        });
    }

    if (!['Low', 'Medium', 'High'].includes(priority)) {
        return res.status(400).json({
            message: 'Invalid task priority.'
        });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Verify that all selected users are employees
        const uniqueEmployeeIds = [...new Set(employeeIds.map(Number))];

        if (
            uniqueEmployeeIds.some(id => !Number.isInteger(id) || id <= 0)
        ) {
            await connection.rollback();
            return res.status(400).json({
                message: 'Invalid employee ID.'
            });
        }

        const placeholders = uniqueEmployeeIds.map(() => '?').join(',');

        const [employees] = await connection.query(
            `SELECT user_id FROM users
             WHERE role = 'Employee'
             AND user_id IN (${placeholders})`,
            uniqueEmployeeIds
        );

        if (employees.length !== uniqueEmployeeIds.length) {
            await connection.rollback();
            return res.status(400).json({
                message: 'One or more selected employees are invalid.'
            });
        }

        // Create the task
        const [taskResult] = await connection.query(
            `INSERT INTO tasks
             (title, description, priority, due_date, status, created_by)
             VALUES (?, ?, ?, ?, 'Pending', ?)`,
            [
                title.trim(),
                description || null,
                priority,
                dueDate,
                req.user.userId
            ]
        );

        const taskId = taskResult.insertId;

        // Assign task to selected employees
        const assignmentValues = uniqueEmployeeIds.map(employeeId => [
            taskId,
            employeeId,
            'Pending'
        ]);

        await connection.query(
            `INSERT INTO task_assignments
             (task_id, user_id, status)
             VALUES ?`,
            [assignmentValues]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Task created and assigned successfully.',
            taskId,
            assignedEmployees: uniqueEmployeeIds.length
        });

    } catch (error) {
        await connection.rollback();

        console.error('Create task error:', error);

        res.status(500).json({
            message: 'Unable to create and assign task.'
        });

    } finally {
        connection.release();
    }
});


// GET All Tasks with Employee Assignment Details
router.get('/tasks', async (req, res) => {
    try {
        const [tasks] = await db.query(`
            SELECT
                t.task_id,
                t.title,
                t.description,
                t.priority,
                t.due_date,
                t.created_at,
                u.user_id,
                u.name AS employee_name,
                u.email AS employee_email,
                ta.status AS assignment_status
            FROM tasks t
            LEFT JOIN task_assignments ta
                ON t.task_id = ta.task_id
            LEFT JOIN users u
                ON ta.user_id = u.user_id
            ORDER BY t.created_at DESC, t.task_id DESC
        `);

        res.status(200).json({
            message: 'Tasks retrieved successfully.',
            tasks
        });

    } catch (error) {
        console.error('Get manager tasks error:', error);

        res.status(500).json({
            message: 'Unable to retrieve tasks.'
        });
    }
});

// GET: Fetch notifications for the logged-in manager
router.get('/notifications', async (req, res) => {
    try {
        const [notifications] = await db.query(
            `SELECT notification_id, message, type, is_read, created_at
             FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [req.user.userId]
        );

        res.status(200).json({
            message: 'Notifications retrieved successfully.',
            notifications
        });

    } catch (error) {
        console.error('Fetch notifications error:', error);
        res.status(500).json({
            message: 'Failed to retrieve notifications.'
        });
    }
});


// PUT: Mark a notification as read
router.put('/notifications/:notificationId/read', async (req, res) => {
    try {
        const { notificationId } = req.params;

        const [result] = await db.query(
            `UPDATE notifications
             SET is_read = 1
             WHERE notification_id = ? AND user_id = ?`,
            [notificationId, req.user.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Notification not found.'
            });
        }

        res.status(200).json({
            message: 'Notification marked as read.'
        });

    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({
            message: 'Failed to update notification.'
        });
    }
});

module.exports = router;
