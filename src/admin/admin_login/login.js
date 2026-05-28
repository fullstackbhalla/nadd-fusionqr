import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import './login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.login(formData);
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify({
                    userId: response.data.userId,
                    fullName: response.data.fullName,
                    email: response.data.email,
                    mobileNumber: response.data.mobileNumber,
                    isActive: response.data.isActive
                }));
                
                navigate('/dashboard');
            } else {
                setError('No token received from server');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Animated Background */}
            <div className="animated-pink-bg">
                <div className="pink-blob blob-1"></div>
                <div className="pink-blob blob-2"></div>
                <div className="pink-blob blob-3"></div>
                <div className="pink-blob blob-4"></div>
            </div>

            {/* Login Card */}
            <div className="login-card-pink">
                {/* Logo Section */}
                <div className="logo-pink">
                    <div className="logo-glow-pink">
                        <div className="logo-circle-pink">
                            <svg className="logo-svg" viewBox="0 0 40 40" fill="none">
                                <rect width="40" height="40" rx="12" fill="url(#pinkGradient)"/>
                                <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                                <circle cx="28" cy="14" r="2.5" fill="white"/>
                                <defs>
                                    <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#FF6B9D"/>
                                        <stop offset="50%" stopColor="#C44569"/>
                                        <stop offset="100%" stopColor="#FFB6C1"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                    <h1 className="brand-pink">NADD Fusion QR</h1>
                    <p className="subtitle-pink">Secure Access to QR Management System</p>
                </div>

                {/* Welcome Badge */}
                <div className="welcome-badge-pink">
                    <span className="welcome-dot"></span>
                    <span>Welcome Back</span>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-pink">
                        <span className="error-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <div className="input-pink">
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder=" "
                            className="input-field-pink"
                        />
                        <label className="input-label-pink">Email or Mobile Number</label>
                        <div className="input-icon-pink">📧</div>
                    </div>

                    <div className="input-pink">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder=" "
                            className="input-field-pink"
                        />
                        <label className="input-label-pink">Password</label>
                        <div className="input-icon-pink">🔒</div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-login-pink">
                        {loading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            <>
                                Sign In
                                <span className="btn-arrow">→</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Action Buttons */}
                <div className="action-buttons-pink">
                    <button onClick={() => navigate('/register')} className="btn-create-pink">
                        Create New Account
                    </button>
                    <button onClick={() => navigate('/forgot-password')} className="btn-forgot-pink">
                        Forgot Password?
                    </button>
                </div>

                {/* Footer */}
                <div className="footer-pink">
                    <div className="footer-line"></div>
                    <p>Developed and Designed by <strong>MCA Department</strong></p>
                    <p className="footer-year">2025 - 2027 | All Rights Reserved</p>
                </div>
            </div>
        </div>
    );
};

export default Login;