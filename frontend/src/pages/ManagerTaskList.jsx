
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getManagerTasks } from '../services/authService';
import './ManagerTaskList.css';

function ManagerTaskList() {
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await getManagerTasks();
                setTasks(data.tasks);
            } catch (err) {
                console.error('Task loading error:', err);

                if (err.response?.status === 401) {
                    sessionStorage.clear();
                    navigate('/');
                    return;
                }

                setError(
                    err.response?.data?.message ||
                    'Unable to load tasks.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [navigate]);

    const formatDate = (date) => {
        if (!date) return 'Not specified';

        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC'
        });
    };

    return (
        <div className="manager-task-list-page">

            <header className="task-list-header">
                <div>
                    <h1>Task Monitoring</h1>
                    <p>View and monitor all tasks assigned to your employees.</p>
                </div>

                <button
                    className="task-list-back"
                    onClick={() => navigate('/manager-dashboard')}
                >
                    ← Back to Dashboard
                </button>
            </header>

            <section className="task-list-panel">

                <div className="task-list-panel-heading">
                    <div>
                        <h2>All Tasks</h2>
                        <p>Track task assignments and employee progress.</p>
                    </div>

                    <span className="task-count">
                        {tasks.length} Records
                    </span>
                </div>

                {loading && (
                    <p className="task-list-message">
                        Loading tasks...
                    </p>
                )}

                {error && (
                    <p className="task-list-error">{error}</p>
                )}

                {!loading && !error && (
                    <div className="task-list-table-wrapper">
                        <table className="manager-task-table">

                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Employee</th>
                                    <th>Priority</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {tasks.length > 0 ? (
                                    tasks.map((task, index) => (
                                        <tr key={`${task.task_id}-${task.user_id}-${index}`}>
                                            <td>
                                                <strong>{task.title}</strong>
                                                <small>{task.description}</small>
                                            </td>

                                            <td>
                                                {task.employee_name || 'Not assigned'}
                                                <small>
                                                    {task.employee_email || ''}
                                                </small>
                                            </td>

                                            <td>
                                                <span className={`manager-priority ${task.priority.toLowerCase()}`}>
                                                    {task.priority}
                                                </span>
                                            </td>

                                            <td>{formatDate(task.due_date)}</td>

                                            <td>
                                                <span className={`manager-task-status ${task.assignment_status?.toLowerCase().replace(' ', '-') || 'unassigned'}`}>
                                                    {task.assignment_status || 'Unassigned'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">
                                            No tasks available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>
                )}

            </section>
        </div>
    );
}

export default ManagerTaskList;
