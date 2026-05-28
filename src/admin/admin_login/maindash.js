import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import './maindash.css';

// Import all page components
import DashboardContent from './components/DashboardContent';
import ProductsContent from './components/Products';
import GenerateQRContent from './components/GenerateQR';
import Users from './components/Users';
import ScanQR from './components/ScanQR';
import NotificationToast from './components/NotificationToast';

// Import from subfolders
import BulkQRGenerator from './components/qr/BulkQRGenerator';
import ProductAnalytics from './components/analytics/ProductAnalytics';
import NotificationSystem from './components/notifications/NotificationSystem';
import ReportGenerator from './components/reports/ReportGenerator';

// Placeholder components for features not yet implemented
const HistoryContent = () => <div className="content-area"><h2>Scan History</h2><p>History feature coming soon...</p></div>;
const AuditLogs = () => <div className="content-area"><h2>Audit Logs</h2><p>Audit logs feature coming soon...</p></div>;
const SettingsContent = () => <div className="content-area"><h2>Settings</h2><p>Settings feature coming soon...</p></div>;

const MainDash = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
            navigate('/login');
            return;
        }
        
        try {
            setUser(JSON.parse(userData));
        } catch (e) {
            navigate('/login');
            return;
        }
        
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDarkMode(true);
            document.body.classList.add('dark-mode');
        }
        
        // Handle responsive sidebar
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        fetchRecentActivities();
        setupWebSocket();
        
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        setLoading(false);
        
        return () => {
            if (window.websocket) {
                window.websocket.close();
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [navigate]);

    const fetchRecentActivities = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/activities/recent');
            const data = await response.json();
            setRecentActivities(data.slice(0, 5));
        } catch (error) {
            console.error('Error fetching activities:', error);
            setRecentActivities([
                { icon: '📦', message: 'New product added' },
                { icon: '📷', message: 'Product scanned' },
                { icon: '✨', message: 'QR code generated' }
            ]);
        }
    };

    const setupWebSocket = () => {
        try {
            const ws = new WebSocket('ws://localhost:8081/ws/notifications');
            ws.onmessage = (event) => {
                const notification = JSON.parse(event.data);
                setNotifications(prev => [notification, ...prev].slice(0, 50));
                setUnreadCount(prev => prev + 1);
                
                if (Notification.permission === 'granted') {
                    new Notification(notification.title || 'NADD FusionQR', {
                        body: notification.message,
                        icon: '/favicon.ico'
                    });
                }
            };
            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            window.websocket = ws;
        } catch (error) {
            console.error('WebSocket connection failed:', error);
        }
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        try {
            await fetch('http://localhost:8081/api/audit/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'LOGOUT',
                    entityType: 'USER',
                    userId: user?.userId,
                    details: 'User logged out'
                })
            });
        } catch (error) {
            console.error('Error logging logout:', error);
        }
        
        authService.logout();
        navigate('/login');
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const markNotificationsRead = () => {
        setUnreadCount(0);
        setShowNotifications(false);
    };

    const renderActiveComponent = () => {
        switch(activeTab) {
            case 'dashboard':
                return <DashboardContent user={user || {}} />;
            case 'products':
                return <ProductsContent />;
            case 'generate-qr':
                return <GenerateQRContent />;
            case 'bulk-qr':
                return <BulkQRGenerator />;
            case 'scan-qr':
                return <ScanQR />;
            case 'analytics':
                return <ProductAnalytics />;
            case 'notifications':
                return <NotificationSystem />;
            case 'reports':
                return <ReportGenerator />;
            case 'history':
                return <HistoryContent />;
            case 'users':
                return <Users user={user || {}} />;
            case 'audit-logs':
                return <AuditLogs />;
            case 'settings':
                return <SettingsContent />;
            default:
                return <DashboardContent user={user || {}} />;
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'products', label: 'Products', icon: '📦' },
        { id: 'generate-qr', label: 'Generate QR', icon: '✨' },
        { id: 'bulk-qr', label: 'Bulk QR', icon: '📱' },
        { id: 'scan-qr', label: 'Scan QR', icon: '📷' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
        { id: 'history', label: 'History', icon: '🕒' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'reports', label: 'Reports', icon: '📄' },
        { id: 'audit-logs', label: 'Audit Logs', icon: '📝' },
        { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];

    if (loading) {
        return (
            <div className="main-dashboard">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`main-dashboard ${isDarkMode ? 'dark' : 'light'}`}>
            {/* Animated Background */}
            <div className="animated-bg-dash">
                <div className="gradient-sphere sphere-1"></div>
                <div className="gradient-sphere sphere-2"></div>
                <div className="gradient-sphere sphere-3"></div>
            </div>

            {/* Sidebar Toggle Button */}
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                {sidebarOpen ? '◀' : '☰'}
            </button>

            {/* Sidebar */}
            <aside className={`sidebar-dash ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <div className="logo-icon">◈</div>
                        <span className="logo-text">NADD FusionQR</span>
                    </div>
                </div>
                
                <div className="user-info-dash">
                    <div className="user-avatar-dash">
                        {user?.fullName?.charAt(0) || 'A'}
                    </div>
                    <div className="user-details-dash">
                        <p className="user-name">{user?.fullName || 'Admin User'}</p>
                        <p className="user-email">{user?.email || 'admin@nadd.com'}</p>
                        <span className="user-role">Administrator</span>
                    </div>
                </div>

                <nav className="sidebar-nav-dash">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item-dash ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                    <button onClick={handleLogoutClick} className="nav-item-dash logout-item">
                        <span className="nav-icon">🚪</span>
                        <span className="nav-label">Logout</span>
                    </button>
                </nav>

                {/* System Status */}
                <div className="sidebar-footer">
                    <div className="system-status">
                        <div className="status-indicator online"></div>
                        <span>System Online</span>
                    </div>
                    <div className="system-version">
                        v2.0.0 | MCA 2025-27
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`main-content-dash ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <header className="top-bar">
                    <div className="page-info">
                        <h1 className="page-title">{menuItems.find(i => i.id === activeTab)?.label}</h1>
                    </div>
                    <div className="top-bar-actions">
                        {/* Notification Bell */}
                        <div className="notification-dropdown">
                            <button 
                                className="notification-btn"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                🔔
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="notification-panel">
                                    <div className="notification-header">
                                        <h4>Notifications</h4>
                                        <button onClick={markNotificationsRead}>Mark all read</button>
                                    </div>
                                    <div className="notification-list">
                                        {notifications.length === 0 ? (
                                            <p className="no-notifications">No new notifications</p>
                                        ) : (
                                            notifications.map((notif, idx) => (
                                                <div key={idx} className="notification-item">
                                                    <div className="notif-icon">{notif.icon || '🔔'}</div>
                                                    <div className="notif-content">
                                                        <p>{notif.message}</p>
                                                        <span>{new Date(notif.timestamp).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Theme Toggle */}
                        <button onClick={toggleTheme} className="theme-toggle-dash">
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                    </div>
                </header>

                {/* Recent Activities Bar */}
                <div className="activities-bar">
                    <span className="activities-label">Recent Activity:</span>
                    <div className="activities-scroll">
                        {recentActivities.map((activity, idx) => (
                            <span key={idx} className="activity-chip">
                                {activity.icon} {activity.message}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Component Content */}
                <div className="component-container">
                    {renderActiveComponent()}
                </div>
            </main>

            {/* Logout Modal */}
            {showLogoutConfirm && (
                <div className="modal-overlay-dash">
                    <div className="modal-container-dash">
                        <div className="modal-icon-dash">🚪</div>
                        <h3>Confirm Logout</h3>
                        <p>Are you sure you want to logout from your account?</p>
                        <div className="modal-buttons-dash">
                            <button onClick={confirmLogout} className="modal-btn confirm">Yes, Logout</button>
                            <button onClick={cancelLogout} className="modal-btn cancel">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast Component */}
            <NotificationToast />
        </div>
    );
};

export default MainDash;