
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getManagerNotifications,
    markManagerNotificationAsRead
} from '../services/authService';
import './ManagerNotifications.css';

function ManagerNotifications() {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    
useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
        try {
            const data = await getManagerNotifications();

            if (isMounted) {
                setNotifications(data.notifications || []);
            }
        } catch (err) {
            if (isMounted) {
                setError(
                    err.response?.data?.message ||
                    'Failed to load notifications.'
                );
            }
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    };

    loadNotifications();

    return () => {
        isMounted = false;
    };
}, []);


    const handleMarkAsRead = async (notificationId) => {
        try {
            await markManagerNotificationAsRead(notificationId);

            setNotifications((previousNotifications) =>
                previousNotifications.map((notification) =>
                    notification.notification_id === notificationId
                        ? { ...notification, is_read: 1 }
                        : notification
                )
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to update notification.'
            );
        }
    };

    const unreadCount = notifications.filter(
        (notification) => notification.is_read === 0
    ).length;

    return (
        <div className="manager-notifications-page">
            <div className="notifications-header">
                <div>
                    <h1>Notifications</h1>
                    <p>Stay updated with important activities.</p>
                </div>

                <button
                    className="notification-back-button"
                    onClick={() => navigate('/manager-dashboard')}
                >
                    Back to Dashboard
                </button>
            </div>

            <div className="notification-summary">
                <h3>All Notifications</h3>
                <span>{notifications.length} Total</span>
                <span>{unreadCount} Unread</span>
            </div>

            {loading && <p>Loading notifications...</p>}

            {error && <p className="notification-error">{error}</p>}

            {!loading && !error && notifications.length === 0 && (
                <div className="empty-notifications">
                    <h3>No notifications yet</h3>
                    <p>You're all caught up!</p>
                </div>
            )}

            {!loading && notifications.length > 0 && (
                <div className="notifications-list">
                    {notifications.map((notification) => (
                        <div
                            key={notification.notification_id}
                            className={`notification-card ${
                                notification.is_read === 0
                                    ? 'unread'
                                    : 'read'
                            }`}
                        >
                            <div className="notification-content">
                                <div className="notification-title-row">
                                    <h3>{notification.type || 'General'}</h3>

                                    {notification.is_read === 0 && (
                                        <span className="unread-label">
                                            Unread
                                        </span>
                                    )}
                                </div>

                                <p>{notification.message}</p>

                                <small>
                                    {new Date(
                                        notification.created_at
                                    ).toLocaleString()}
                                </small>
                            </div>

                            {notification.is_read === 0 && (
                                <button
                                    className="mark-read-button"
                                    onClick={() =>
                                        handleMarkAsRead(
                                            notification.notification_id
                                        )
                                    }
                                >
                                    Mark as Read
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ManagerNotifications;
