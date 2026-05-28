import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ action: '', dateFrom: '', dateTo: '' });
    const [stats, setStats] = useState({});

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [filter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let url = 'http://localhost:8081/api/audit/logs';
            const params = new URLSearchParams();
            if (filter.action) params.append('action', filter.action);
            if (filter.dateFrom) params.append('from', filter.dateFrom);
            if (filter.dateTo) params.append('to', filter.dateTo);
            if (params.toString()) url += '?' + params.toString();
            
            const response = await axios.get(url);
            setLogs(response.data);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/audit/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const getActionBadge = (action) => {
        const badges = {
            CREATE: 'success',
            UPDATE: 'info',
            DELETE: 'danger',
            LOGIN: 'primary',
            LOGOUT: 'secondary',
            SCAN: 'warning'
        };
        return badges[action] || 'default';
    };

    return (
        <div className="audit-logs-container">
            <div className="audit-header">
                <h2>Audit Logs</h2>
                <div className="audit-stats">
                    <div className="stat">
                        <span>Total Actions (24h)</span>
                        <strong>{stats.actionsLast24Hours || 0}</strong>
                    </div>
                    <div className="stat">
                        <span>Total Logs</span>
                        <strong>{stats.totalLogs || 0}</strong>
                    </div>
                </div>
            </div>

            <div className="audit-filters">
                <select onChange={(e) => setFilter({...filter, action: e.target.value})}>
                    <option value="">All Actions</option>
                    <option value="CREATE">Create</option>
                    <option value="UPDATE">Update</option>
                    <option value="DELETE">Delete</option>
                    <option value="LOGIN">Login</option>
                    <option value="LOGOUT">Logout</option>
                    <option value="SCAN">Scan</option>
                </select>
                <input type="date" placeholder="From" onChange={(e) => setFilter({...filter, dateFrom: e.target.value})} />
                <input type="date" placeholder="To" onChange={(e) => setFilter({...filter, dateTo: e.target.value})} />
                <button onClick={fetchLogs}>Apply Filter</button>
            </div>

            {loading ? (
                <div className="loading">Loading audit logs...</div>
            ) : (
                <div className="audit-table-container">
                    <table className="audit-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Entity</th>
                                <th>Details</th>
                                <th>IP Address</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id}>
                                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td>{log.userEmail || 'System'}</td>
                                    <td>
                                        <span className={`badge badge-${getActionBadge(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td>{log.entityType} #{log.entityId}</td>
                                    <td className="details-cell">
                                        {log.details || `${log.action} ${log.entityType}`}
                                    </td>
                                    <td>{log.ipAddress || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${log.status === 'SUCCESS' ? 'success' : 'failed'}`}>
                                            {log.status || 'SUCCESS'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;