import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import './register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobileNumber: '',
        dob: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
        else if (!/^\d{10}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Mobile number must be 10 digits';
        if (!formData.dob) newErrors.dob = 'Date of birth is required';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setLoading(true);
        setSuccessMessage('');
        
        try {
            await authService.register(formData);
            setSuccessMessage('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setErrors({ submit: err.response?.data?.error || 'Registration failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    // Generate floating particles
    const particles = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * 6 + 2}px`,
        height: `${Math.random() * 6 + 2}px`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: `${Math.random() * 15 + 8}s`
    }));

    return (
        <div className="register-container">
            {/* Animated Background Spheres */}
            <div className="animated-background">
                <div className="gradient-sphere sphere-1"></div>
                <div className="gradient-sphere sphere-2"></div>
                <div className="gradient-sphere sphere-3"></div>
                <div className="gradient-sphere sphere-4"></div>
            </div>

            {/* Floating Particles */}
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="floating-particle"
                    style={{
                        left: particle.left,
                        top: particle.top,
                        width: particle.width,
                        height: particle.height,
                        animationDelay: particle.animationDelay,
                        animationDuration: particle.animationDuration
                    }}
                />
            ))}

            {/* Main Container */}
            <div className="register-wrapper">
                <div className="register-card">
                    {/* Logo Section */}
                    <div className="logo-section">
                        <div className="logo-wrapper">
                            <div className="logo-glow"></div>
                            <div className="logo-icon">
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
                        </div>
                        <h1 className="brand-title">Create Account</h1>
                        <p className="brand-subtitle">Join NADD Fusion QR today</p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="success-alert">
                            <div className="success-content">
                                <svg className="success-icon" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>{successMessage}</span>
                            </div>
                        </div>
                    )}

                    {/* Error Alert */}
                    {errors.submit && (
                        <div className="error-alert">
                            <div className="error-content">
                                <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span>{errors.submit}</span>
                            </div>
                        </div>
                    )}

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="input-group">
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className={`input-field ${errors.fullName ? 'error' : ''}`}
                                placeholder=" "
                            />
                            <label className="input-label">Full Name</label>
                            <div className="input-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                        </div>

                        <div className="input-group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={`input-field ${errors.email ? 'error' : ''}`}
                                placeholder=" "
                            />
                            <label className="input-label">Email Address</label>
                            <div className="input-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>

                        <div className="input-group">
                            <input
                                type="tel"
                                name="mobileNumber"
                                value={formData.mobileNumber}
                                onChange={handleChange}
                                required
                                className={`input-field ${errors.mobileNumber ? 'error' : ''}`}
                                placeholder=" "
                            />
                            <label className="input-label">Mobile Number</label>
                            <div className="input-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            {errors.mobileNumber && <span className="error-message">{errors.mobileNumber}</span>}
                        </div>

                        <div className="input-group">
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                                className={`input-field ${errors.dob ? 'error' : ''}`}
                                placeholder=" "
                            />
                            <label className="input-label">Date of Birth</label>
                            <div className="input-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            {errors.dob && <span className="error-message">{errors.dob}</span>}
                        </div>

                        <div className="input-group">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className={`input-field ${errors.password ? 'error' : ''}`}
                                placeholder=" "
                            />
                            <label className="input-label">Password</label>
                            <div className="input-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        <div className="input-group">
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
                                placeholder=" "
                            />
                            <label className="input-label">Confirm Password</label>
                            <div className="input-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="register-btn"
                        >
                            {loading ? (
                                <div className="btn-loading">
                                    <div className="spinner"></div>
                                    <span>Creating Account...</span>
                                </div>
                            ) : (
                                <div className="btn-content">
                                    <span>Register</span>
                                    <span className="btn-arrow">→</span>
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="login-link">
                        <p className="login-text">
                            Already have an account?{' '}
                            <button onClick={() => navigate('/login')} className="login-btn-link">
                                Sign In Here
                                <span className="link-arrow">→</span>
                            </button>
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="register-footer">
                        <p className="footer-text">
                            Developed and Designed by <strong className="footer-highlight">MCA Department</strong>
                        </p>
                        <p className="footer-year">2025 - 2027 | All Rights Reserved</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;