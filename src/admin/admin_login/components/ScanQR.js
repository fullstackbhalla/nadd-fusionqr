import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import './ScanQR.css';

const ScanQR = () => {
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [scannedProducts, setScannedProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [uploadPreview, setUploadPreview] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    
    const scannerRef = useRef(null);
    const scannerContainerId = "qr-reader-container";
    const tempScannerId = "temp-scanner-container";

    useEffect(() => {
        fetchScanHistory();
        
        // Create temp scanner container for image upload
        if (!document.getElementById(tempScannerId)) {
            const div = document.createElement('div');
            div.id = tempScannerId;
            div.style.display = 'none';
            document.body.appendChild(div);
        }
        
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(err => console.log(err));
            }
            const tempDiv = document.getElementById(tempScannerId);
            if (tempDiv) tempDiv.remove();
        };
    }, []);

    const fetchScanHistory = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/scans/history');
            setScannedProducts(response.data);
        } catch (error) {
            console.error('History fetch error:', error);
        }
    };

    const startScanner = async () => {
        setCameraError(null);
        setScanResult(null);
        
        const element = document.getElementById(scannerContainerId);
        if (!element) {
            setCameraError('Scanner element not found');
            return;
        }

        try {
            // Clean up existing scanner
            if (scannerRef.current) {
                try {
                    await scannerRef.current.stop();
                } catch(e) {}
                scannerRef.current = null;
            }

            scannerRef.current = new Html5Qrcode(scannerContainerId);
            
            const config = {
                fps: 10,
                qrbox: { width: 300, height: 300 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true,
            };
            
            await scannerRef.current.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    console.log('✅ QR Code detected:', decodedText);
                    handleScanSuccess(decodedText);
                    stopScanner();
                },
                (errorMessage) => {
                    // Silent fail - normal scanning behavior
                }
            );
            setScanning(true);
        } catch (err) {
            console.error('Error starting scanner:', err);
            setCameraError('Unable to access camera. Please check permissions.');
            setScanning(false);
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadPreview(e.target.result);
                setUploadedFile(file);
                setScanResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const scanUploadedImage = async () => {
        if (!uploadedFile) {
            alert('Please select an image first');
            return;
        }

        setLoading(true);
        
        try {
            const tempScanner = new Html5Qrcode(tempScannerId);
            const result = await tempScanner.scanFile(uploadedFile, true);
            tempScanner.clear();
            
            if (result) {
                await handleScanSuccess(result);
            } else {
                setScanResult({
                    type: 'error',
                    data: 'No QR code found in the image',
                    scanTime: new Date().toLocaleString()
                });
            }
        } catch (error) {
            console.error('Error scanning image:', error);
            setScanResult({
                type: 'error',
                data: 'Could not read QR code from image. Please try another image.',
                scanTime: new Date().toLocaleString()
            });
        } finally {
            setLoading(false);
        }
    };

    const handleScanSuccess = async (decodedText) => {
        setLoading(true);
        
        try {
            let productId = null;

            try {
                const parsed = JSON.parse(decodedText);
                if (parsed.productId) productId = parsed.productId;
                else if (parsed.id) productId = parsed.id;
            } catch {
                // Not JSON
            }

            if (!productId) {
                const urlMatch = decodedText.match(/\/product\/(\d+)/);
                if (urlMatch) productId = urlMatch[1];
            }

            if (!productId && /^\d+$/.test(decodedText)) {
                productId = decodedText;
            }

            if (productId) {
                const response = await axios.get(`http://localhost:8081/api/products/${productId}`);
                const product = response.data;
                
                await axios.post('http://localhost:8081/api/scans/record', {
                    productId: parseInt(productId),
                    scannedData: decodedText,
                    scannedAt: new Date().toISOString()
                });
                
                await fetchScanHistory();
                
                setScanResult({
                    type: 'product',
                    data: product,
                    raw: decodedText,
                    scanTime: new Date().toLocaleString()
                });
            } else {
                setScanResult({
                    type: 'raw',
                    data: decodedText,
                    raw: decodedText,
                    scanTime: new Date().toLocaleString()
                });
            }
        } catch (error) {
            console.error('Processing error:', error);
            setScanResult({
                type: 'error',
                data: 'Unable to process QR code',
                raw: decodedText,
                scanTime: new Date().toLocaleString()
            });
        } finally {
            setLoading(false);
        }
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.stop().catch(err => console.log(err));
            scannerRef.current = null;
        }
        setScanning(false);
    };

    const resetAndScanAgain = () => {
        setScanResult(null);
        setUploadedFile(null);
        setUploadPreview(null);
        setLoading(false);
    };

    const clearUpload = () => {
        setUploadedFile(null);
        setUploadPreview(null);
        setScanResult(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="scanqr-container">
            <div className="scanqr-header">
                <h1>📷 QR Code Scanner</h1>
                <p>Scan QR codes using camera or upload image</p>
            </div>

            <div className="scanqr-layout">
                {/* LEFT PANEL - CAMERA & UPLOAD */}
                <div className="camera-panel">
                    <div className="panel-header">
                        <h2>Scan QR Code</h2>
                        <div className={`status-badge ${scanning ? 'scanning' : 'idle'}`}>
                            {scanning ? '🟢 Scanning' : '⚪ Idle'}
                        </div>
                    </div>

                    {/* Camera View */}
                    {!uploadPreview && (
                        <>
                            <div id={scannerContainerId} className="scanner-viewport"></div>
                            
                            {!scanning && !cameraError && (
                                <div className="camera-placeholder">
                                    <div className="placeholder-icon">📷</div>
                                    <p>Camera preview will appear here</p>
                                    <small>Click "Start Camera" to begin</small>
                                </div>
                            )}
                        </>
                    )}

                    {/* Upload Preview */}
                    {uploadPreview && (
                        <div className="upload-preview">
                            <img src={uploadPreview} alt="Upload preview" />
                            <button className="btn-clear" onClick={clearUpload}>
                                ✖ Remove
                            </button>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="camera-controls">
                        {!scanning && !uploadPreview && (
                            <button className="btn-start" onClick={startScanner}>
                                ▶ Start Camera
                            </button>
                        )}
                        {scanning && (
                            <button className="btn-stop" onClick={stopScanner}>
                                ⏹ Stop Camera
                            </button>
                        )}
                        
                        <label className="btn-upload">
                            📁 Upload QR Image
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                        </label>
                        
                        {uploadPreview && !scanning && (
                            <button className="btn-scan" onClick={scanUploadedImage} disabled={loading}>
                                {loading ? 'Scanning...' : '🔍 Scan QR Code'}
                            </button>
                        )}
                    </div>

                    {cameraError && (
                        <div className="error-message">
                            ⚠️ {cameraError}
                            <button onClick={() => window.location.reload()} className="retry-btn">
                                Refresh Page
                            </button>
                        </div>
                    )}

                    {scanning && (
                        <div className="scan-instruction">
                            📍 Position QR code in the center of the frame
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL - RESULTS */}
                <div className="dashboard-panel">
                    <div className="panel-header">
                        <h2>📊 Scan Results</h2>
                        {scanResult && <span className="new-badge">New Scan!</span>}
                    </div>

                    {loading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Processing QR Code...</p>
                        </div>
                    )}

                    {!loading && !scanResult && !scanning && !uploadPreview && (
                        <div className="waiting-state">
                            <div className="waiting-icon">📷</div>
                            <h3>Ready to Scan</h3>
                            <p>Start camera or upload a QR code image</p>
                        </div>
                    )}

                    {!loading && !scanResult && scanning && (
                        <div className="waiting-state">
                            <div className="waiting-icon">🎯</div>
                            <h3>Looking for QR Code...</h3>
                            <p>Position QR code in the center of the frame</p>
                            <div className="scan-animation"></div>
                        </div>
                    )}

                    {!loading && !scanResult && uploadPreview && !scanning && (
                        <div className="waiting-state">
                            <div className="waiting-icon">📱</div>
                            <h3>Image Ready</h3>
                            <p>Click "Scan QR Code" to process the image</p>
                        </div>
                    )}

                    {scanResult && scanResult.type === 'product' && !loading && (
                        <div className="result-card product-result">
                            <div className="result-header">
                                <div className="result-icon">✅</div>
                                <div>
                                    <h3>Product Detected!</h3>
                                    <span className="scan-time">{scanResult.scanTime}</span>
                                </div>
                            </div>
                            
                            <div className="product-info-grid">
                                <div className="info-row">
                                    <span className="info-label">Product Name:</span>
                                    <span className="info-value highlight">{scanResult.data.productName}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Product ID:</span>
                                    <span className="info-value">#{scanResult.data.productId}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Price:</span>
                                    <span className="info-value price">₹{scanResult.data.price}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Brand:</span>
                                    <span className="info-value">{scanResult.data.brand || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Category:</span>
                                    <span className="info-value">{scanResult.data.categoryName || 'N/A'}</span>
                                </div>
                            </div>

                            <button className="btn-scan-again" onClick={resetAndScanAgain}>
                                🔄 Scan Another QR
                            </button>
                        </div>
                    )}

                    {scanResult && scanResult.type === 'raw' && !loading && (
                        <div className="result-card raw-result">
                            <div className="result-header">
                                <div className="result-icon">📄</div>
                                <h3>QR Data Scanned</h3>
                            </div>
                            <div className="raw-data">
                                <pre>{scanResult.raw}</pre>
                            </div>
                            <button className="btn-scan-again" onClick={resetAndScanAgain}>
                                🔄 Scan Another QR
                            </button>
                        </div>
                    )}

                    {scanResult && scanResult.type === 'error' && !loading && (
                        <div className="result-card error-result">
                            <h3>❌ Scan Failed</h3>
                            <p>{scanResult.data}</p>
                            <button className="btn-scan-again" onClick={resetAndScanAgain}>
                                🔄 Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* RECENT SCANS */}
            <div className="recent-scans-section">
                <div className="section-header">
                    <h2>📋 Recent Scans</h2>
                    <span className="scan-count">{scannedProducts.length} scans</span>
                </div>
                
                {scannedProducts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p>No scans yet</p>
                        <p className="empty-hint">Scan a QR code to see it here</p>
                    </div>
                ) : (
                    <div className="recent-scans-list">
                        {scannedProducts.slice(0, 8).map((scan, index) => (
                            <div className="scan-item" key={scan.scanId || index}>
                                <div className="scan-item-icon">📷</div>
                                <div className="scan-item-details">
                                    <div className="scan-item-name">
                                        {scan.productName || 'Unknown Product'}
                                    </div>
                                    <div className="scan-item-time">
                                        {formatDate(scan.scannedAt)}
                                    </div>
                                </div>
                                <div className="scan-item-badge">Scanned</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanQR;