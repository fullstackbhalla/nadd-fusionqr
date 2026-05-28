import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './NotificationSystem.css';

const NotificationSystem = () => {
    const [notifications, setNotifications] = useState([]);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        // WebSocket connection for real-time updates
        const socket = new WebSocket('ws://localhost:8081/ws/notifications');
        
        socket.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            setNotifications(prev => [notification, ...prev]);
            
            // Show toast notification
            toast.info(notification.message, {
                position: "top-right",
                autoClose: 5000,
            });
        };
        
        setWs(socket);
        
        return () => {
            if (socket) socket.close();
        };
    }, []);

    return (
        <div className="notification-center">
            <ToastContainer />
            <h3>Notifications ({notifications.length})</h3>
            <div className="notification-list">
                {notifications.map((notif, index) => (
                    <div key={index} className={`notification ${notif.type}`}>
                        <div className="notification-icon">{notif.icon}</div>
                        <div className="notification-content">
                            <p>{notif.message}</p>
                            <span>{new Date(notif.timestamp).toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationSystem;