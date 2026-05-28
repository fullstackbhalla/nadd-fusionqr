import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './ReportGenerator.css';

const ReportGenerator = () => {
    const [reportType, setReportType] = useState('products');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [generating, setGenerating] = useState(false);

    const generatePDF = async () => {
        setGenerating(true);
        try {
            const response = await axios.post('http://localhost:8081/api/reports/generate', {
                type: reportType,
                startDate: dateRange.start,
                endDate: dateRange.end
            }, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${reportType}_report_${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error generating report:', error);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="report-generator">
            <h2>Generate Reports</h2>
            
            <div className="report-form">
                <div className="form-group">
                    <label>Report Type</label>
                    <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                        <option value="products">Products Report</option>
                        <option value="scans">Scan Analytics Report</option>
                        <option value="inventory">Inventory Report</option>
                        <option value="sales">Sales Report</option>
                    </select>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Start Date</label>
                        <input 
                            type="date" 
                            value={dateRange.start} 
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input 
                            type="date" 
                            value={dateRange.end} 
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        />
                    </div>
                </div>
                
                <button onClick={generatePDF} disabled={generating}>
                    {generating ? 'Generating...' : 'Generate Report'}
                </button>
            </div>
        </div>
    );
};

export default ReportGenerator;