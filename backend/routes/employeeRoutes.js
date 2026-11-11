
const express = require('express');
const db = require('../config/db');
const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all employee routes
router.use(authenticateToken, authorizeRoles('Employee'));

// 1. GET EMPLOYEE DASHBOARD STATISTICS
router.get('/dashboard', async (req, res) => {
    try {
        const userId = req.user.userId;

        const [rows] = await db.query(
            `SELECT
                COUNT(*) AS totalTasks,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pendingTasks,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS inProgressTasks,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completedTasks
             FROM task_assignments
             WHERE user_id = ?`,
            [userId]
        );

        const stats = rows[0];

        const total = Number(stats.totalTasks || 0);
        const completed = Number(stats.completedTasks || 0);

        const completionRate = total > 0
            ? Math.round((completed / total) * 100)
            : 0;

        res.status(200).json({
            message: 'Employee dashboard statistics retrieved successfully.',
            stats: {
                totalTasks: total,
                pendingTasks: Number(stats.pendingTasks || 0),
                inProgressTasks: Number(stats.inProgressTasks || 0),
                completedTasks: completed,
                completionRate
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error.message);

        res.status(500).json({
            message: 'Unable to retrieve dashboard statistics.'
        });
    }
});


// 2. GET TASKS ASSIGNED TO LOGGED-IN EMPLOYEE
router.get('/tasks', async (req, res) => {
    try {
        const userId = req.user.userId;

        const [tasks] = await db.query(
            `SELECT
                t.task_id,
                t.title,
                t.description,
                t.priority,
                t.due_date,
                ta.status,
                ta.assigned_date
             FROM task_assignments ta
             INNER JOIN tasks t
                ON ta.task_id = t.task_id
             WHERE ta.user_id = ?
             ORDER BY t.due_date ASC`,
            [userId]
        );

        res.status(200).json({
            message: 'Employee tasks retrieved successfully.',
            totalTasks: tasks.length,
            tasks
        });

    } catch (error) {
        console.error('Task retrieval error:', error.message);

        res.status(500).json({
            message: 'Unable to retrieve employee tasks.'
        });
    }
});


// 3. UPDATE ASSIGNED TASK STATUS
router.put('/tasks/:taskId/status', async (req, res) => {
    const connection = await db.getConnection();

    try {
        const userId = req.user.userId;
        const taskId = Number(req.params.taskId);
        const { status } = req.body;

        const allowedStatuses = [
            'Pending',
            'In Progress',
            'Completed'
        ];

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                message: 'Invalid task ID.'
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Invalid task status.'
            });
        }

        await connection.beginTransaction();

        // Verify that this task is assigned to the logged-in employee
        const [assignments] = await connection.query(
            `SELECT status
             FROM task_assignments
             WHERE task_id = ? AND user_id = ?
             FOR UPDATE`,
            [taskId, userId]
        );

        if (assignments.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: 'Task not found or not assigned to you.'
            });
        }

        const oldStatus = assignments[0].status;

        if (oldStatus === status) {
            await connection.rollback();

            return res.status(200).json({
                message: 'Task already has this status.',
                status
            });
        }

        // Update only this employee's assignment
        await connection.query(
            `UPDATE task_assignments
             SET status = ?
             WHERE task_id = ? AND user_id = ?`,
            [status, taskId, userId]
        );

        // Record status change
        

        await connection.query(
            `INSERT INTO task_history
             (task_id, updated_by, old_status, new_status)
             VALUES (?, ?, ?, ?)`,
            [taskId, userId, oldStatus, status]
        );
        
        // Get task creator (Manager) and employee name
        const [taskDetails] = await connection.query(
            `SELECT t.created_by, u.name AS employee_name, t.title
             FROM tasks t
             JOIN users u ON u.user_id = ?
             WHERE t.task_id = ?`,
            [userId, taskId]
        );
        
        // Generate notification for the Manager
        if (taskDetails.length > 0) {
            const managerId = taskDetails[0].created_by;
            const employeeName = taskDetails[0].employee_name;
            const taskTitle = taskDetails[0].title;
        
            let notificationMessage = '';
        
            if (status === 'In Progress') {
                notificationMessage =
                    `${employeeName} started working on "${taskTitle}".`;
            } else if (status === 'Completed') {
                notificationMessage =
                    `${employeeName} completed "${taskTitle}".`;
            } else if (status === 'Pending') {
                notificationMessage =
                    `${employeeName} changed "${taskTitle}" status to Pending.`;
            }
        
            if (notificationMessage) {
                await connection.query(
                    `INSERT INTO notifications (user_id, message, type)
                     VALUES (?, ?, ?)`,
                    [managerId, notificationMessage, 'Task Update']
                );
            }
        }
        
        await connection.commit();


        res.status(200).json({
            message: 'Task status updated successfully.',
            taskId,
            oldStatus,
            newStatus: status
        });

    } catch (error) {
        await connection.rollback();

        console.error('Task update error:', error.message);

        res.status(500).json({
            message: 'Unable to update task status.'
        });

    } finally {
        connection.release();
    }
});

module.exports = router;
