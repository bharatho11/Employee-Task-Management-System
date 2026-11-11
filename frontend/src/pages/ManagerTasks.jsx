
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getManagerEmployees,
    createManagerTask
} from '../services/authService';

import './ManagerTasks.css';

function ManagerTasks() {
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: '',
        employeeIds: []
    });

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await getManagerEmployees();
                setEmployees(data.employees);
            } catch (err) {
                if (err.response?.status === 401) {
                    sessionStorage.clear();
                    navigate('/');
                    return;
                }

                setError(
                    err.response?.data?.message ||
                    'Unable to load employees.'
                );
            } finally {
                setLoadingEmployees(false);
            }
        };

        fetchEmployees();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }));
    };

    const handleEmployeeChange = (e) => {
        const employeeId = Number(e.target.value);

        setFormData(previous => ({
            ...previous,
            employeeIds: e.target.checked
                ? [...previous.employeeIds, employeeId]
                : previous.employeeIds.filter(id => id !== employeeId)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.employeeIds.length === 0) {
            setError('Please select at least one employee.');
            return;
        }

        try {
            setSubmitting(true);

            const result = await createManagerTask(formData);

            setSuccess(
                `Task created successfully! Task ID: ${result.taskId}`
            );

            setFormData({
                title: '',
                description: '',
                priority: 'Medium',
                dueDate: '',
                employeeIds: []
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to create task. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="manager-task-page">

            <div className="manager-task-header">
                <div>
                    <h1>Create New Task</h1>
                    <p>Create a task and assign it to your employees.</p>
                </div>

                <button
                    className="task-back-button"
                    onClick={() => navigate('/manager-dashboard')}
                >
                    ← Back to Dashboard
                </button>
            </div>

            <div className="manager-task-card">

                <h2>Task Details</h2>
                <p className="task-form-subtitle">
                    Enter the task information below.
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="task-form-group">
                        <label>Task Title *</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="Enter task title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="task-form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            placeholder="Describe the task..."
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                        />
                    </div>

                    <div className="task-form-row">

                        <div className="task-form-group">
                            <label>Priority *</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                required
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div className="task-form-group">
                            <label>Due Date *</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                min={new Date().toLocaleDateString('en-CA')}
                                onChange={handleChange}
                                required
                            />
                        </div>

                    </div>

                    <div className="task-form-group">
                        <label>Assign Employees *</label>

                        {loadingEmployees ? (
                            <p>Loading employees...</p>
                        ) : employees.length === 0 ? (
                            <p className="task-empty-message">
                                No employees available. Register an employee first.
                            </p>
                        ) : (
                            <div className="employee-selection-list">
                                {employees.map(employee => (
                                    <label
                                        className="employee-selection-item"
                                        key={employee.user_id}
                                    >
                                        <input
                                            type="checkbox"
                                            value={employee.user_id}
                                            checked={formData.employeeIds.includes(employee.user_id)}
                                            onChange={handleEmployeeChange}
                                        />

                                        <span>
                                            <strong>{employee.name}</strong>
                                            <small>{employee.email}</small>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="task-form-error">{error}</div>
                    )}

                    {success && (
                        <div className="task-form-success">{success}</div>
                    )}

                    <button
                        type="submit"
                        className="create-task-button"
                        disabled={submitting || loadingEmployees || employees.length === 0}
                    >
                        {submitting ? 'Creating Task...' : 'Create & Assign Task'}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default ManagerTasks;
