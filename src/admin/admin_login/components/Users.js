import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Users.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobileNumber: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: '',
        role: 'USER',
        isActive: true
    });
    
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmNewPassword: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8081/api/users');
            console.log('Users fetched:', response.data);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        setLoading(true);
        
        try {
            if (editingUser) {
                // Update user
                await axios.put(`http://localhost:8081/api/users/${editingUser.userId}`, {
                    fullName: formData.fullName,
                    email: formData.email,
                    mobileNumber: formData.mobileNumber,
                    dateOfBirth: formData.dateOfBirth,
                    role: formData.role,
                    isActive: formData.isActive
                });
                alert('User updated successfully!');
            } else {
                // Create new user
                await axios.post('http://localhost:8081/api/users/register', {
                    fullName: formData.fullName,
                    email: formData.email,
                    mobileNumber: formData.mobileNumber,
                    dateOfBirth: formData.dateOfBirth,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    role: formData.role,
                    isActive: formData.isActive
                });
                alert('User created successfully!');
            }
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            alert(error.response?.data?.error || 'Error saving user');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            alert('New passwords do not match!');
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        
        setLoading(true);
        try {
            await axios.put(`http://localhost:8081/api/users/${selectedUser.userId}/change-password`, {
                newPassword: passwordData.newPassword
            });
            alert('Password changed successfully!');
            setShowChangePassword(false);
            setPasswordData({ newPassword: '', confirmNewPassword: '' });
            setSelectedUser(null);
        } catch (error) {
            console.error('Error changing password:', error);
            alert('Error changing password');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            fullName: user.fullName || '',
            email: user.email || '',
            mobileNumber: user.mobileNumber || '',
            dateOfBirth: user.dateOfBirth || '',
            password: '',
            confirmPassword: '',
            role: user.role || 'USER',
            isActive: user.isActive !== undefined ? user.isActive : true
        });
        setShowAddForm(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setLoading(true);
            try {
                await axios.delete(`http://localhost:8081/api/users/${userId}`);
                alert('User deleted successfully');
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Error deleting user');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleToggleStatus = async (user) => {
        const newStatus = !user.isActive;
        if (window.confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this user?`)) {
            setLoading(true);
            try {
                await axios.put(`http://localhost:8081/api/users/${user.userId}/toggle-status`, {
                    isActive: newStatus
                });
                alert(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
                fetchUsers();
            } catch (error) {
                console.error('Error toggling user status:', error);
                alert('Error updating user status');
            } finally {
                setLoading(false);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            fullName: '',
            email: '',
            mobileNumber: '',
            dateOfBirth: '',
            password: '',
            confirmPassword: '',
            role: 'USER',
            isActive: true
        });
        setEditingUser(null);
        setShowAddForm(false);
    };

    const getRoleBadgeClass = (role) => {
        switch(role) {
            case 'ADMIN': return 'role-admin';
            case 'MANAGER': return 'role-manager';
            default: return 'role-user';
        }
    };

    const getStatusBadgeClass = (isActive) => {
        return isActive ? 'status-active' : 'status-inactive';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobileNumber?.includes(searchTerm)
    );

    return (
        <div className="users-container">
            {/* Header */}
            <div className="users-header">
                <h1>User Management</h1>
                <button className="add-user-btn" onClick={() => setShowAddForm(true)}>
                    + Add New User
                </button>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by name, email or mobile number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <span className="search-icon">🔍</span>
            </div>

            {/* Stats Summary */}
            <div className="users-stats">
                <div className="stat-box">
                    <div className="stat-value">{users.length}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value">{users.filter(u => u.isActive).length}</div>
                    <div className="stat-label">Active Users</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value">{users.filter(u => u.role === 'ADMIN').length}</div>
                    <div className="stat-label">Admins</div>
                </div>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="loading-spinner">Loading users...</div>
            ) : (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Mobile</th>
                                <th>Date of Birth</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="no-data">No users found</td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.userId}>
                                        <td>{user.userId}</td>
                                        <td>{user.fullName}</td>
                                        <td>{user.email}</td>
                                        <td>{user.mobileNumber}</td>
                                        <td>{formatDate(user.dateOfBirth)}</td>
                                        <td>
                                            <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadgeClass(user.isActive)}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>{formatDateTime(user.lastLogin)}</td>
                                        <td>{formatDateTime(user.createdAt)}</td>
                                        <td className="actions-cell">
                                            <button 
                                                className="action-btn edit" 
                                                onClick={() => handleEdit(user)}
                                                title="Edit User"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                className="action-btn password" 
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowChangePassword(true);
                                                }}
                                                title="Change Password"
                                            >
                                                🔒
                                            </button>
                                            <button 
                                                className="action-btn status" 
                                                onClick={() => handleToggleStatus(user)}
                                                title={user.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {user.isActive ? '🔴' : '🟢'}
                                            </button>
                                            <button 
                                                className="action-btn delete" 
                                                onClick={() => handleDelete(user.userId)}
                                                title="Delete User"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit User Modal */}
            {showAddForm && (
                <div className="modal-overlay" onClick={() => resetForm()}>
                    <div className="modal-content user-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                            <button className="close-btn" onClick={() => resetForm()}>×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="user-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter full name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter email"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Mobile Number *</label>
                                    <input
                                        type="tel"
                                        name="mobileNumber"
                                        value={formData.mobileNumber}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="10-digit mobile number"
                                        pattern="[0-9]{10}"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            {!editingUser && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Password *</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required={!editingUser}
                                            placeholder="Minimum 6 characters"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Confirm Password *</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            required={!editingUser}
                                            placeholder="Re-enter password"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                    >
                                        <option value="USER">User</option>
                                        <option value="MANAGER">Manager</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        name="isActive"
                                        value={formData.isActive}
                                        onChange={handleInputChange}
                                    >
                                        <option value={true}>Active</option>
                                        <option value={false}>Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-buttons">
                                <button type="button" className="cancel-btn" onClick={() => resetForm()}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showChangePassword && selectedUser && (
                <div className="modal-overlay" onClick={() => {
                    setShowChangePassword(false);
                    setSelectedUser(null);
                    setPasswordData({ newPassword: '', confirmNewPassword: '' });
                }}>
                    <div className="modal-content password-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Change Password for {selectedUser.fullName}</h2>
                            <button className="close-btn" onClick={() => {
                                setShowChangePassword(false);
                                setSelectedUser(null);
                            }}>×</button>
                        </div>
                        
                        <div className="password-form">
                            <div className="form-group">
                                <label>New Password *</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    placeholder="Minimum 6 characters"
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm New Password *</label>
                                <input
                                    type="password"
                                    name="confirmNewPassword"
                                    value={passwordData.confirmNewPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    placeholder="Re-enter new password"
                                />
                            </div>

                            <div className="form-buttons">
                                <button type="button" className="cancel-btn" onClick={() => {
                                    setShowChangePassword(false);
                                    setSelectedUser(null);
                                }}>
                                    Cancel
                                </button>
                                <button type="button" className="submit-btn" onClick={handleChangePassword} disabled={loading}>
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;