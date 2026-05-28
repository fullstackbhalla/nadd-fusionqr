import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './NotificationToast.css';

const NotificationToast = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
            onConnect: () => {
                console.log('✅ WebSocket Connected');
                client.subscribe('/topic/notifications', (message) => {
                    const notification = JSON.parse(message.body);
                    console.log('📢 Notification received:', notification);
                    addNotification(notification);
                });
            },
            onDisconnect: () => {
                console.log('❌ WebSocket Disconnected');
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
            }
        });

        client.activate();

        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, []);

    const addNotification = (notification) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { ...notification, id }]);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    const getNotificationStyle = (type) => {
        switch(type) {
            case 'qr_generated':
                return 'notification-success';
            case 'qr_scanned':
                return 'notification-info';
            case 'product_added':
                return 'notification-warning';
            default:
                return 'notification-default';
        }
    };

    return (
        <div className="notification-toast-container">
            {notifications.map(notif => (
                <div 
                    key={notif.id} 
                    className={`notification-toast ${getNotificationStyle(notif.type)}`}
                    onClick={() => removeNotification(notif.id)}
                >
                    <div className="notification-icon">{notif.icon}</div>
                    <div className="notification-content">
                        <div className="notification-title">{notif.title}</div>
                        <div className="notification-message">{notif.message}</div>
                        <div className="notification-time">
                            {new Date(notif.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                    <button className="notification-close">×</button>
                </div>
            ))}
        </div>
    );
};

export default NotificationToast;