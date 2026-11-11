
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getManagerEmployees } from '../services/authService';

function ManagerEmployees() {
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await getManagerEmployees();
                setEmployees(data.employees);
            } catch (err) {
                console.error('Employee loading error:', err);

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
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [navigate]);

    return (
        <div style={{
            padding: '35px',
            minHeight: '100vh',
            background: '#f5f6fb',
            color: '#202945'
        }}>
            <h2>Employee Management</h2>
            <p style={{ color: '#858ba0', marginTop: '8px' }}>
                View and manage registered employees.
            </p>

            <div style={{
                background: '#ffffff',
                padding: '25px',
                marginTop: '25px',
                borderRadius: '12px',
                overflowX: 'auto'
            }}>
                <h3 style={{ marginBottom: '20px' }}>
                    Employee List
                </h3>

                {loading && <p>Loading employees...</p>}

                {error && (
                    <p style={{ color: '#c0392b' }}>{error}</p>
                )}

                {!loading && !error && (
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        textAlign: 'left'
                    }}>
                        <thead>
                            <tr>
                                <th style={cellStyle}>Employee ID</th>
                                <th style={cellStyle}>Name</th>
                                <th style={cellStyle}>Email</th>
                                <th style={cellStyle}>Team</th>
                                <th style={cellStyle}>Role</th>
                            </tr>
                        </thead>

                        <tbody>
                            {employees.length > 0 ? (
                                employees.map(employee => (
                                    <tr key={employee.user_id}>
                                        <td style={cellStyle}>
                                            {employee.user_id}
                                        </td>
                                        <td style={cellStyle}>
                                            {employee.name}
                                        </td>
                                        <td style={cellStyle}>
                                            {employee.email}
                                        </td>
                                        <td style={cellStyle}>
                                            {employee.team_name || 'Not assigned'}
                                        </td>
                                        <td style={cellStyle}>
                                            {employee.role}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={cellStyle}>
                                        No employees registered yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

const cellStyle = {
    padding: '15px',
    borderBottom: '1px solid #eeeeF3',
    fontSize: '13px'
};

export default ManagerEmployees;
