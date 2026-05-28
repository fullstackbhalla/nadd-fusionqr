import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import './ProductAnalytics.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ProductAnalytics = () => {
    const [scanData, setScanData] = useState({
        labels: [],
        datasets: []
    });
    const [popularProducts, setPopularProducts] = useState([]);
    const [summary, setSummary] = useState({});

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/analytics/dashboard');
            const data = response.data;
            
            // Line chart data - daily scans
            setScanData({
                labels: data.dailyScans.map(d => d.date),
                datasets: [
                    {
                        label: 'Daily Scans',
                        data: data.dailyScans.map(d => d.count),
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        tension: 0.4,
                    },
                ],
            });
            
            setPopularProducts(data.popularProducts);
            setSummary(data.summary);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    return (
        <div className="analytics-dashboard">
            <h2>Analytics Dashboard</h2>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Scans Today</h3>
                    <div className="stat-value">{summary.todayScans || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>This Week</h3>
                    <div className="stat-value">{summary.weeklyScans || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>This Month</h3>
                    <div className="stat-value">{summary.monthlyScans || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Products</h3>
                    <div className="stat-value">{summary.totalProducts || 0}</div>
                </div>
            </div>
            
            <div className="chart-container">
                <Line data={scanData} options={{ responsive: true }} />
            </div>
            
            <div className="popular-products">
                <h3>Most Scanned Products</h3>
                <div className="products-list">
                    {popularProducts.map(product => (
                        <div key={product.id} className="product-rank">
                            <div className="rank">{product.rank}</div>
                            <div className="name">{product.name}</div>
                            <div className="scans">{product.scans} scans</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductAnalytics;