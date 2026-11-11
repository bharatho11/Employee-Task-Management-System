
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getEmployeeDashboard,
    getEmployeeTasks,
    updateTaskStatus
} from '../services/authService';

import './EmployeeDashboard.css';

function EmployeeDashboard() {
    const navigate = useNavigate();

    const user = JSON.parse(
        sessionStorage.getItem('user') || '{}'
    );

    const [stats, setStats] = useState({
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        completionRate: 0
    });

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch real dashboard data from backend
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError('');

                const [dashboardData, taskData] = await Promise.all([
                    getEmployeeDashboard(),
                    getEmployeeTasks()
                ]);

                setStats(dashboardData.stats);
                setTasks(
                    taskData.tasks.map(task => ({
                        id: task.task_id,
                        title: task.title,
                        description: task.description,
                        priority: task.priority,
                        status: task.status,
                        dueDate: task.due_date
                            ? new Date(task.due_date).toLocaleDateString(
                                'en-IN',
                                {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    timeZone: 'UTC'
                                }
                            )
                            : 'Not specified'
                    }))
                );

            } catch (err) {
                console.error('Dashboard loading error:', err);

                if (err.response?.status === 401) {
                    sessionStorage.clear();
                    navigate('/');
                    return;
                }

                setError(
                    err.response?.data?.message ||
                    'Unable to load dashboard data. Please try again.'
                );

            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/');
    };

    const currentDate = new Date().toLocaleDateString(
        'en-IN',
        {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }
    );
    const handleStatusChange = async (taskId, newStatus) => {
    try {
        setError('');

        await updateTaskStatus(taskId, newStatus);

        // Update the task status on the screen
        setTasks((previousTasks) =>
            previousTasks.map((task) =>
                task.id === taskId
                    ? { ...task, status: newStatus }
                    : task
            )
        );

        // Refresh dashboard statistics
        const dashboardData = await getEmployeeDashboard();
        setStats(dashboardData.stats);

    } catch (error) {
        setError(
            error.response?.data?.message ||
            'Unable to update task status. Please try again.'
        );
    }
};
    return (
        <div className="employee-layout">

            {/* Sidebar */}
            <aside className="employee-sidebar">

                <div className="employee-brand">
                    <div className="employee-brand-icon">T</div>
                    <span>TaskManager</span>
                </div>

                <div className="sidebar-label">
                    WORKSPACE
                </div>

                <nav className="employee-navigation">

                    <button className="nav-item active">
                        <span>▦</span>
                        Dashboard
                    </button>

                    <button className="nav-item">
                        <span>☷</span>
                        My Tasks
                    </button>

                    <button className="nav-item">
                        <span>◉</span>
                        My Profile
                    </button>

                    <button className="nav-item">
                        <span>♧</span>
                        Notifications
                    </button>

                </nav>

                <div className="sidebar-bottom">

                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user.name
                                ? user.name.charAt(0).toUpperCase()
                                : 'E'}
                        </div>

                        <div className="sidebar-user-info">
                            <strong>{user.name || 'Employee'}</strong>
                            <span>Employee</span>
                        </div>
                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>

            {/* Main Content */}
            <main className="employee-main">

                {/* Top Header */}
                <header className="employee-header">

                    <div>
                        <h2>Employee Dashboard</h2>
                        <p>Manage your work and track your progress.</p>
                    </div>

                    <div className="header-date">
                        <span>📅</span>
                        {currentDate}
                    </div>

                </header>

                {/* Welcome Section */}
                <section className="employee-welcome">

                    <div>
                        <span className="welcome-tag">
                            YOUR WORKSPACE
                        </span>

                        <h1>
                            Welcome back, {user.name || 'Employee'}!
                        </h1>

                        <p>
                            Stay organised, complete your tasks
                            and achieve your daily goals.
                        </p>
                    </div>

                    <div className="welcome-decoration">
                        <span>✦</span>
                        <span>✧</span>
                        <span>✦</span>
                    </div>

                </section>

                {/* Loading and Error Messages */}
                {loading && (
                    <p className="dashboard-message">
                        Loading your dashboard...
                    </p>
                )}

                {error && (
                    <div className="dashboard-error">
                        {error}
                    </div>
                )}

                {/* Summary Cards */}
                {!loading && !error && (
                    <>
                        <section className="employee-stats">

                            <div className="stat-card">
                                <div className="stat-icon purple">☷</div>
                                <div className="stat-details">
                                    <span>Total Tasks</span>
                                    <h2>{stats.totalTasks}</h2>
                                    <small>Assigned to you</small>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon orange">◷</div>
                                <div className="stat-details">
                                    <span>Pending</span>
                                    <h2>{stats.pendingTasks}</h2>
                                    <small>Awaiting action</small>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon blue">↻</div>
                                <div className="stat-details">
                                    <span>In Progress</span>
                                    <h2>{stats.inProgressTasks}</h2>
                                    <small>Currently working</small>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon green">✓</div>
                                <div className="stat-details">
                                    <span>Completed</span>
                                    <h2>{stats.completedTasks}</h2>
                                    <small>Successfully finished</small>
                                </div>
                            </div>

                        </section>

                        {/* Dashboard Content */}
                        <section className="employee-content-grid">

                            {/* Task List */}
                            <div className="employee-panel task-panel">

                                <div className="panel-heading">
                                    <div>
                                        <h3>My Tasks</h3>
                                        <p>Overview of your assigned tasks</p>
                                    </div>

                                    <button className="view-all-button">
                                        View All
                                    </button>
                                </div>

                                <div className="task-table-wrapper">

                                    <table className="employee-task-table">

                                        <thead>
                                            <tr>
                                                <th>Task</th>
                                                <th>Priority</th>
                                                <th>Due Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {tasks.length > 0 ? (
                                                tasks.map(task => (
                                                    <tr key={task.id}>
                                                        <td>
                                                            <strong>{task.title}</strong>
                                                            <span className="task-description">
                                                                {task.description}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span className={`priority ${task.priority.toLowerCase()}`}>
                                                                {task.priority}
                                                            </span>
                                                        </td>

                                                        <td>{task.dueDate}</td>

                                                        <td>
                                                            <select
                                                            className={`task-status ${task.status.toLowerCase().replace(' ', '-')}`}
                                                            value={task.status}
                                                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                            >
                                                            <option value="In Progress">In Progress</option>
                                                            <option value="Pending">Pending</option>
                                                            <option value="Completed">Completed</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4">
                                                        No tasks assigned yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>

                                    </table>

                                </div>

                            </div>

                            {/* Productivity */}
                            <div className="employee-panel productivity-panel">

                                <div className="panel-heading">
                                    <div>
                                        <h3>My Productivity</h3>
                                        <p>Your task completion overview</p>
                                    </div>
                                </div>

                                <div className="productivity-chart">

                                    <div
                                        className="progress-circle"
                                        style={{
                                            '--progress': `${stats.completionRate * 3.6}deg`
                                        }}
                                    >
                                        <div className="progress-circle-inner">
                                            <h2>{stats.completionRate}%</h2>
                                            <span>Completed</span>
                                        </div>
                                    </div>

                                </div>

                                <div className="productivity-summary">

                                    <div>
                                        <span className="summary-dot completed-dot"></span>
                                        Completed
                                        <strong>{stats.completedTasks}</strong>
                                    </div>

                                    <div>
                                        <span className="summary-dot pending-dot"></span>
                                        Pending
                                        <strong>{stats.pendingTasks}</strong>
                                    </div>

                                    <div>
                                        <span className="summary-dot progress-dot"></span>
                                        In Progress
                                        <strong>{stats.inProgressTasks}</strong>
                                    </div>

                                </div>

                            </div>

                        </section>
                    </>
                )}

                <footer className="employee-footer">
                    Employee Task & Productivity Management System
                    <span>© 2026 TaskManager</span>
                </footer>

            </main>

        </div>
    );
}

export default EmployeeDashboard;
