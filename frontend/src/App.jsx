import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { loginUser } from './services/authService';
import './App.css';
import EmployeeDashboard from './pages/EmployeeDashboard';
import './pages/ManagerDashboard.css';
import { useEffect } from 'react';
import { getManagerDashboard } from './services/authService';
import ManagerEmployees from './pages/ManagerEmployees';
import Register from './pages/Register';
import { Link } from 'react-router-dom';
import ManagerTasks from './pages/ManagerTasks';
import ManagerTaskList from './pages/ManagerTaskList';
import ManagerNotifications from './pages/ManagerNotifications';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password) {
            setError('Please enter your email and password.');
            return;
        }

        try {
            setLoading(true);

            const data = await loginUser({
                email: email.trim(),
                password
            });

            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('user', JSON.stringify(data.user));

            if (data.user.role === 'Manager') {
                navigate('/manager-dashboard');
            } else if (data.user.role === 'Employee') {
                navigate('/employee-dashboard');
            } else {
                setError('Invalid user role.');
                sessionStorage.clear();
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to connect to the server. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">

            <div className="login-branding">
                <div className="brand-content">

                    <div className="brand-logo">
                        <span className="logo-icon">T</span>
                        <span>TaskManager</span>
                    </div>

                    <div className="brand-message">
                        <span className="brand-tagline">
                            WORK SMARTER. ACHIEVE MORE.
                        </span>

                        <h1>
                            Manage Tasks.
                            <br />
                            Empower Teams.
                        </h1>

                        <p>
                            A smarter way to organise work, track productivity
                            and achieve your team's goals.
                        </p>
                    </div>

                    <div className="brand-footer">
                        Employee Task & Productivity Management System
                    </div>

                </div>
            </div>

            <div className="login-section">

                <div className="login-card">

                    <div className="welcome-heading">
                        <h2>Welcome Back!</h2>
                        <p>Sign in to continue to your workspace.</p>
                    </div>

                    <form onSubmit={handleLogin}>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>

                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>

                            <div className="password-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                <button
                                    type="button"
                                    className="show-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="error-message">{error}</p>
                        )}

                        <div className="login-options">
                            <label className="remember-me">
                                <input type="checkbox" />
                                Remember me
                            </label>

                            <a href="#forgot-password">
                                Forgot Password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>

                    </form>
                    <p className="register-link">
                      Don't have an account?{' '}
                      <Link to="/register">Create Account</Link>
                    </p>

                    <div className="login-bottom">
                        <p>
                            Employee Task & Productivity Management System
                        </p>
                        <span>© 2026 TaskManager. All rights reserved.</span>
                    </div>

                </div>

            </div>

        </div>
    );
}

// Temporary dashboard placeholders.
// We will build the actual dashboard designs next.


function ManagerDashboard() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const navigate = useNavigate();

const [stats, setStats] = useState({
    totalEmployees: 0,
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0
});

const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
    const fetchManagerDashboard = async () => {
        try {
            const data = await getManagerDashboard();
            setStats(data.stats);
        } catch (err) {
            console.error('Manager dashboard error:', err);

            if (err.response?.status === 401) {
                sessionStorage.clear();
                navigate('/');
                return;
            }

            setError(
                err.response?.data?.message ||
                'Unable to load manager dashboard.'
            );
        } finally {
            setLoading(false);
        }
    };

    fetchManagerDashboard();
}, [navigate]);

    const handleLogout = () => {
        sessionStorage.clear();
        window.location.href = '/';
    };

    return (
        <div className="manager-layout">

            <aside className="manager-sidebar">
                <div className="manager-brand">
                    <div className="manager-brand-icon">T</div>
                    <span>TaskManager</span>
                </div>

                <div className="manager-sidebar-label">WORKSPACE</div>

                <nav className="manager-navigation">
                    <button className="manager-nav-item active">
                        ▦ <span>Dashboard</span>
                    </button>
                    <button
                        className="manager-nav-item"
                        onClick={() => navigate('/manager-tasks')}
                    >
                        ➕ <span>Create Task</span>
                    </button>

                    <button
                        className="manager-nav-item"
                        onClick={() => navigate('/manager-task-list')}
                    >
                        ☷ <span>Task Monitoring</span>
                    </button>
                    <button
                      className="manager-nav-item"
                      onClick={() => navigate('/manager-employees')}
                    >                 
                      ◉ <span>Employees</span>
                    </button>
                    <button
                        className="manager-nav-item"
                        onClick={() => navigate('/manager-notifications')}
                    >
                        🔔 <span>Notifications</span>
                    </button>
                </nav>

                <div className="manager-sidebar-bottom">
                    <div className="manager-user">
                        <div className="manager-avatar">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
                        </div>
                        <div>
                            <strong>{user.name || 'Manager'}</strong>
                            <span>Manager</span>
                        </div>
                    </div>

                    <button className="manager-logout" onClick={handleLogout}>
                        ↪ Logout
                    </button>
                </div>
            </aside>

            <main className="manager-main">

                <header className="manager-header">
                    <div>
                        <h2>Manager Dashboard</h2>
                        <p>Manage your team and monitor productivity.</p>
                    </div>
                    <div className="manager-date">
                        📅 {new Date().toLocaleDateString('en-IN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </div>
                </header>

                <section className="manager-welcome">
                    <div>
                        <span>MANAGEMENT WORKSPACE</span>
                        <h1>Welcome back, {user.name || 'Manager'}!</h1>
                        <p>Track your team's progress and keep every task on schedule.</p>
                    </div>
                    <div className="manager-decoration">✦ ✧ ✦</div>
                </section>
                {loading && <p>Loading dashboard...</p>}

{error && (
    <p className="dashboard-error">{error}</p>
)}

                <section className="manager-stats">
                    <div className="manager-stat-card">
                        <div className="manager-stat-icon purple">♙</div>
                        <div>
                            <span>Total Employees</span>
                            <h2>{stats.totalEmployees}</h2>
                            <small>Registered employees</small>
                        </div>
                    </div>

                    <div className="manager-stat-card">
                        <div className="manager-stat-icon orange">☷</div>
                        <div>
                            <span>Total Tasks</span>
                            <h2>{stats.totalTasks}</h2>
                            <small>Tasks created</small>
                        </div>
                    </div>

                    <div className="manager-stat-card">
                        <div className="manager-stat-icon blue">↻</div>
                        <div>
                            <span>In Progress</span>
                            <h2>{stats.inProgressTasks}</h2>
                            <small>Currently working</small>
                        </div>
                    </div>

                    <div className="manager-stat-card">
                        <div className="manager-stat-icon green">✓</div>
                        <div>
                            <span>Completed</span>
                            <h2>{stats.completedTasks}</h2>
                            <small>Successfully finished</small>
                        </div>
                    </div>
                </section>

                <section className="manager-content">
                    <div className="manager-panel">
                        <div className="manager-panel-heading">
                            <div>
                                <h3>Task Overview</h3>
                                <p>Monitor tasks assigned to your team</p>
                            </div>
                        </div>

                        <div className="manager-empty-state">
                            <div>☷</div>
                            <h3>Task information will appear here</h3>
                            <p>Once connected, you can monitor all employee tasks.</p>
                        </div>
                    </div>

                    <div className="manager-panel">
                        <div className="manager-panel-heading">
                            <div>
                                <h3>Team Overview</h3>
                                <p>Employee productivity summary</p>
                            </div>
                        </div>

                        <div className="manager-empty-state">
                            <div>♙</div>
                            <h3>Employee information will appear here</h3>
                            <p>Employee records will be loaded from the database.</p>
                        </div>
                    </div>
                </section>

                <footer className="manager-footer">
                    Employee Task & Productivity Management System
                    <span>© 2026 TaskManager</span>
                </footer>

            </main>
        </div>
    );
}



function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                    path="/manager-dashboard"
                    element={<ManagerDashboard />}
                />

                <Route
                  path="/manager-employees"
                  element={<ManagerEmployees />}
                />

                <Route
                    path="/employee-dashboard"
                    element={<EmployeeDashboard />}
                />
                <Route
                    path="/manager-tasks"
                    element={<ManagerTasks />}
                />
                <Route
                    path="/manager-task-list"
                    element={<ManagerTaskList />}
                />
                <Route
                    path="/manager-notifications"
                    element={<ManagerNotifications />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
