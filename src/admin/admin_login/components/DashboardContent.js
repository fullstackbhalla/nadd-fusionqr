import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardContent = ({ user }) => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalScans: 0,
        totalQRGenerated: 0,
        activeUsers: 0,
        totalCategories: 0,
        todayScans: 0,
        weeklyScans: 0,
        monthlyScans: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
        // Refresh data every 30 seconds
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            setError(null);
            
            // Fetch all data in parallel for better performance
            const [productsRes, scansRes, usersRes, activitiesRes, categoriesRes] = await Promise.all([
                axios.get('http://localhost:8081/api/products'),
                axios.get('http://localhost:8081/api/scans/all'),
                axios.get('http://localhost:8081/api/users'),
                axios.get('http://localhost:8081/api/activities/recent'),
                axios.get('http://localhost:8081/api/categories')
            ]);
            
            const products = productsRes.data || [];
            const scans = scansRes.data || [];
            const users = usersRes.data || [];
            const categories = categoriesRes.data || [];
            
            // Calculate statistics
            const totalProducts = products.length;
            const totalScans = scans.length;
            const totalQRGenerated = products.filter(p => p.qrCode).length;
            const activeUsers = users.filter(u => u.isActive === true || u.isActive === 1).length;
            const totalCategories = categories.length;
            
            // Calculate today's scans
            const today = new Date().toDateString();
            const todayScans = scans.filter(scan => {
                const scanDate = new Date(scan.scannedAt).toDateString();
                return scanDate === today;
            }).length;
            
            // Calculate weekly scans
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const weeklyScans = scans.filter(scan => {
                const scanDate = new Date(scan.scannedAt);
                return scanDate >= oneWeekAgo;
            }).length;
            
            // Calculate monthly scans
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            const monthlyScans = scans.filter(scan => {
                const scanDate = new Date(scan.scannedAt);
                return scanDate >= oneMonthAgo;
            }).length;
            
            setStats({
                totalProducts,
                totalScans,
                totalQRGenerated,
                activeUsers,
                totalCategories,
                todayScans,
                weeklyScans,
                monthlyScans
            });
            
            // Process recent activities
            const activities = [];
            
            // Add recent products
            const recentProducts = [...products].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            ).slice(0, 3);
            
            recentProducts.forEach(product => {
                activities.push({
                    id: `product_${product.productId}`,
                    type: 'product_added',
                    productName: product.productName,
                    timestamp: product.createdAt,
                    icon: '📦'
                });
            });
            
            // Add recent scans
            const recentScans = scans.slice(0, 3);
            recentScans.forEach(scan => {
                const product = products.find(p => p.productId === scan.productId);
                activities.push({
                    id: `scan_${scan.scanId}`,
                    type: 'product_scanned',
                    productName: product?.productName || 'Unknown Product',
                    timestamp: scan.scannedAt,
                    icon: '📷'
                });
            });
            
            // Sort activities by timestamp (most recent first)
            activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setRecentActivities(activities.slice(0, 5));
            
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type) => {
        switch(type) {
            case 'product_added': return '📦';
            case 'qr_generated': return '✨';
            case 'product_scanned': return '📷';
            case 'product_updated': return '✏️';
            case 'product_deleted': return '🗑️';
            default: return '🔔';
        }
    };

    const getActivityMessage = (activity) => {
        switch(activity.type) {
            case 'product_added':
                return `New product "${activity.productName}" added to inventory`;
            case 'qr_generated':
                return `QR code generated for product "${activity.productName}"`;
            case 'product_scanned':
                return `Product "${activity.productName}" was scanned`;
            case 'product_updated':
                return `Product "${activity.productName}" was updated`;
            case 'product_deleted':
                return `Product "${activity.productName}" was deleted`;
            default:
                return activity.message || 'New activity occurred';
        }
    };

    const getTimeAgo = (timestamp) => {
        if (!timestamp) return 'Just now';
        const date = new Date(timestamp);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return `${seconds} seconds ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
        const months = Math.floor(days / 30);
        return `${months} month${months > 1 ? 's' : ''} ago`;
    };

    if (loading) {
        return (
            <div className="content-area">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="content-area">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <p>{error}</p>
                    <button onClick={fetchDashboardData} className="retry-btn">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="content-area">
            <div className="welcome-header">
                <h2>Welcome back, {user.fullName || 'Admin'}!</h2>
                <p>Here's what's happening with your QR management system today.</p>
            </div>
            
            {/* Main Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon purple">📦</div>
                    <div className="stat-info">
                        <h3>Total Products</h3>
                        <div className="stat-value">{stats.totalProducts.toLocaleString()}</div>
                        <span className="stat-trend up">In Database</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon pink">📷</div>
                    <div className="stat-info">
                        <h3>Total Scans</h3>
                        <div className="stat-value">{stats.totalScans.toLocaleString()}</div>
                        <span className="stat-trend up">All Time</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">✨</div>
                    <div className="stat-info">
                        <h3>QR Generated</h3>
                        <div className="stat-value">{stats.totalQRGenerated.toLocaleString()}</div>
                        <span className="stat-trend up">Active QR Codes</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">👥</div>
                    <div className="stat-info">
                        <h3>Active Users</h3>
                        <div className="stat-value">{stats.activeUsers.toLocaleString()}</div>
                        <span className="stat-trend up">Active Accounts</span>
                    </div>
                </div>
            </div>

            {/* Secondary Stats */}
            <div className="secondary-stats">
                <div className="stat-card small">
                    <div className="stat-icon blue">📁</div>
                    <div className="stat-info">
                        <h3>Categories</h3>
                        <div className="stat-value">{stats.totalCategories}</div>
                    </div>
                </div>
                <div className="stat-card small">
                    <div className="stat-icon teal">📆</div>
                    <div className="stat-info">
                        <h3>Today's Scans</h3>
                        <div className="stat-value">{stats.todayScans}</div>
                    </div>
                </div>
                <div className="stat-card small">
                    <div className="stat-icon indigo">📊</div>
                    <div className="stat-info">
                        <h3>This Week</h3>
                        <div className="stat-value">{stats.weeklyScans}</div>
                    </div>
                </div>
                <div className="stat-card small">
                    <div className="stat-icon purple">📈</div>
                    <div className="stat-info">
                        <h3>This Month</h3>
                        <div className="stat-value">{stats.monthlyScans}</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                    {recentActivities.length === 0 ? (
                        <div className="activity-item">
                            <div className="activity-dot"></div>
                            <div className="activity-details">
                                <p>No recent activities</p>
                                <span>Start by adding products</span>
                            </div>
                        </div>
                    ) : (
                        recentActivities.map((activity) => (
                            <div key={activity.id} className="activity-item">
                                <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                                <div className="activity-details">
                                    <p>{getActivityMessage(activity)}</p>
                                    <span>{getTimeAgo(activity.timestamp)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardContent;