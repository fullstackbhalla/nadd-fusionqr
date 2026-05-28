import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import './dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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
        
        setLoading(false);
    }, [navigate]);

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

    const confirmLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const handleGetStarted = () => {
        navigate('/maindash');
    };

    if (loading) {
        return (
            <div className="landing-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`landing-page ${isDarkMode ? 'dark' : 'light'}`}>
            {/* Animated Background */}
            <div className="animated-background">
                <div className="gradient-sphere sphere-1"></div>
                <div className="gradient-sphere sphere-2"></div>
                <div className="gradient-sphere sphere-3"></div>
                <div className="gradient-sphere sphere-4"></div>
            </div>

            {/* Navigation Bar */}
            <nav className="navbar">
                <div className="nav-container">
                    <div className="nav-logo">
                        <div className="logo-mark">
                            <svg viewBox="0 0 40 40" fill="none">
                                <rect width="40" height="40" rx="12" fill="url(#brandGradient)"/>
                                <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                                <circle cx="28" cy="14" r="2.5" fill="white"/>
                                <defs>
                                    <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#FF6B9D"/>
                                        <stop offset="50%" stopColor="#C44569"/>
                                        <stop offset="100%" stopColor="#FFB6C1"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <span className="logo-text">NADD FusionQR</span>
                    </div>
                    <div className="nav-menu">
                        <a href="#home" className="nav-link">Home</a>
                        <a href="#features" className="nav-link">Features</a>
                    </div>
                    <div className="nav-actions">
                        <button onClick={toggleTheme} className="theme-toggle">
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                        <button onClick={handleLogoutClick} className="logout-nav-btn">
                            <svg className="logout-svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-4-4H3zm8 1v3h3l-3-3zm-2 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="hero-section">
                <div className="hero-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="pulse-dot"></span>
                            Next-Generation QR Technology
                        </div>
                        <h1 className="hero-main-title">
                            NADD FusionQR — 
                            <span className="gradient-highlight"> Redefining Smart Management</span>
                            <br />
                            Through <span className="gradient-text">MCA Innovation</span>
                        </h1>
                        <p className="hero-description">
                            Transform your business operations with cutting-edge QR management system. 
                            Create, manage, and track products seamlessly with intelligent QR technology.
                        </p>
                        <button onClick={handleGetStarted} className="btn-get-started">
                            <span>✨</span> Get Started
                            <span className="arrow-icon">→</span>
                        </button>
                        
                        <div className="hero-stats">
                            <div className="stat">
                                <div className="stat-value">500+</div>
                                <div className="stat-label">Active Products</div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat">
                                <div className="stat-value">10K+</div>
                                <div className="stat-label">QR Scans</div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat">
                                <div className="stat-value">99.9%</div>
                                <div className="stat-label">Uptime</div>
                            </div>
                        </div>
                    </div>
                    <div className="hero-image-container">
                        <div className="hero-image-wrapper">
                            <div className="image-glow"></div>
                            <img 
                                src="/images/qr-hero.png" 
                                alt="QR Code Technology"
                                className="hero-main-image"
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=500&fit=crop';
                                }}
                            />
                            <div className="floating-card card-1">
                                <div className="card-icon">⚡</div>
                                <div className="card-text">Instant Scan</div>
                            </div>
                            <div className="floating-card card-2">
                                <div className="card-icon">🔒</div>
                                <div className="card-text">Secure</div>
                            </div>
                            <div className="floating-card card-3">
                                <div className="card-icon">📊</div>
                                <div className="card-text">Real-time</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Core Features</span>
                        <h2 className="section-title">Everything You Need for <span className="gradient-text">Smart Management</span></h2>
                        <p className="section-subtitle">Powerful features designed to streamline your operations</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <div className="feature-icon-bg">
                                    <span className="feature-icon">🚀</span>
                                </div>
                            </div>
                            <h3>Instant QR Generation</h3>
                            <p>Generate unique QR codes for products instantly with automatic data embedding and customization options.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <div className="feature-icon-bg">
                                    <span className="feature-icon">📷</span>
                                </div>
                            </div>
                            <h3>Smart Scanner</h3>
                            <p>High-speed QR scanning technology with real-time product information retrieval and validation.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <div className="feature-icon-bg">
                                    <span className="feature-icon">📊</span>
                                </div>
                            </div>
                            <h3>Analytics Dashboard</h3>
                            <p>Comprehensive analytics and insights to track product performance and user engagement.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <div className="feature-icon-bg">
                                    <span className="feature-icon">🔒</span>
                                </div>
                            </div>
                            <h3>Enterprise Security</h3>
                            <p>Bank-grade encryption and secure data storage ensuring your business information is protected.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <div className="feature-icon-bg">
                                    <span className="feature-icon">📱</span>
                                </div>
                            </div>
                            <h3>Multi-Platform</h3>
                            <p>Seamlessly works across web, mobile, and tablet devices with responsive design.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <div className="feature-icon-bg">
                                    <span className="feature-icon">🔄</span>
                                </div>
                            </div>
                            <h3>Real-Time Sync</h3>
                            <p>Instant synchronization across all platforms ensuring up-to-date information always.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="benefits-section">
                <div className="container">
                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <div className="benefit-number">01</div>
                            <h3>Smart QR Management</h3>
                            <p>Generate and manage dynamic QR codes for unlimited products with custom data fields</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-number">02</div>
                            <h3>Real-Time Tracking</h3>
                            <p>Monitor product scans, user engagement, and analytics with live dashboard updates</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-number">03</div>
                            <h3>Easy Integration</h3>
                            <p>Seamlessly integrate with existing systems and workflows using our robust API</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-number">04</div>
                            <h3>24/7 Support</h3>
                            <p>Dedicated support team available round the clock for technical assistance</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Transform Your Business?</h2>
                        <p>Join thousands of businesses using NADD FusionQR for smart product management</p>
                        <button onClick={handleGetStarted} className="cta-button">
                            Get Started Now
                            <span className="cta-arrow">→</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Professional Footer */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-top">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <div className="footer-logo-mark">
                                    <span>◈</span>
                                </div>
                                <span className="footer-brand-name">NADD FusionQR</span>
                            </div>
                            <p className="footer-tagline">Smart QR Management System</p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-links-column">
                                <h4>Product</h4>
                                <a href="#features">Features</a>
                                <a href="#">Pricing</a>
                                <a href="#">Demo</a>
                            </div>
                            <div className="footer-links-column">
                                <h4>Company</h4>
                                <a href="#">About Us</a>
                                <a href="#">Blog</a>
                                <a href="#">Careers</a>
                            </div>
                            <div className="footer-links-column">
                                <h4>Support</h4>
                                <a href="#">Help Center</a>
                                <a href="#">Contact Us</a>
                                <a href="#">Privacy Policy</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <div className="footer-copyright">
                            <p>Developed and Designed by <strong className="copyright-highlight">MCA Department</strong></p>
                            <p className="copyright-year">2025 - 2027 | All Rights Reserved</p>
                        </div>
                        <div className="footer-social">
                            <a href="#" className="social-icon">📘</a>
                            <a href="#" className="social-icon">🐦</a>
                            <a href="#" className="social-icon">📷</a>
                            <a href="#" className="social-icon">💼</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Logout Modal */}
            {showLogoutConfirm && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-icon">🚪</div>
                        <h3>Confirm Logout</h3>
                        <p>Are you sure you want to logout from your account?</p>
                        <div className="modal-buttons">
                            <button onClick={confirmLogout} className="modal-btn confirm">Yes, Logout</button>
                            <button onClick={cancelLogout} className="modal-btn cancel">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;