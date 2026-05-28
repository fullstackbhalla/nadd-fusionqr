import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GenerateQR.css';

const GenerateQR = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [generatedQR, setGeneratedQR] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [generatingQR, setGeneratingQR] = useState(false);
    const [imageErrors, setImageErrors] = useState({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8081/api/products');
            console.log('Products fetched:', response.data);
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setGeneratedQR(null);
    };

    const generateQRCode = async () => {
        if (!selectedProduct) return;
        
        setGeneratingQR(true);
        
        try {
            const response = await axios.post(`http://localhost:8081/api/qr/generate/${selectedProduct.productId}`);
            
            if (response.data && response.data.qrCode) {
                setGeneratedQR(response.data.qrCode);
                alert('QR Code generated successfully!');
            }
        } catch (error) {
            console.error('Error generating QR code:', error);
            alert('Error generating QR code. Please try again.');
        } finally {
            setGeneratingQR(false);
        }
    };

    const downloadQR = () => {
        if (generatedQR) {
            const link = document.createElement('a');
            link.href = generatedQR;
            link.download = `${selectedProduct.productName}_QR.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const printQR = () => {
        if (generatedQR) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>QR Code - ${selectedProduct.productName}</title>
                        <style>
                            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: white; }
                            .qr-container { text-align: center; padding: 20px; }
                            .product-details { margin-top: 20px; text-align: left; border-top: 1px solid #ddd; padding-top: 20px; }
                            img { max-width: 300px; }
                            h3 { color: #333; }
                            .price { color: #e44d26; font-weight: bold; }
                        </style>
                    </head>
                    <body>
                        <div class="qr-container">
                            <img src="${generatedQR}" />
                            <div class="product-details">
                                <h3>${selectedProduct.productName}</h3>
                                <p class="price">Price: ₹${selectedProduct.price}</p>
                                <p>Brand: ${selectedProduct.brand || 'N/A'}</p>
                                <p>Category: ${selectedProduct.categoryName || 'N/A'}</p>
                            </div>
                        </div>
                    </body>
                </html>
            `);
            printWindow.print();
            printWindow.close();
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('data:')) return imagePath;
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        return `http://localhost:8081/${cleanPath}`;
    };

    const handleImageError = (productId) => {
        setImageErrors(prev => ({ ...prev, [productId]: true }));
    };

    const filteredProducts = products.filter(product => {
        if (!product) return false;
        const productName = (product.productName || '').toLowerCase();
        const productBrand = (product.brand || '').toLowerCase();
        const searchLower = (searchTerm || '').toLowerCase();
        return productName.includes(searchLower) || productBrand.includes(searchLower);
    });

    return (
        <div className="generate-qr-container">
            <div className="qr-header">
                <h1>Generate QR Code for Products</h1>
                <p>Select a product and generate its QR code</p>
            </div>

            <div className="qr-content">
                <div className="product-list-sidebar">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                    
                    <div className="product-list">
                        {loading ? (
                            <div className="loading">Loading products...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="no-products">No products found</div>
                        ) : (
                            filteredProducts.map(product => (
                                <div
                                    key={product.productId}
                                    className={`product-item ${selectedProduct?.productId === product.productId ? 'active' : ''}`}
                                    onClick={() => handleProductSelect(product)}
                                >
                                    <div className="product-thumb">
                                        {product.productImage && !imageErrors[product.productId] ? (
                                            <img 
                                                src={getImageUrl(product.productImage)} 
                                                alt={product.productName}
                                                onError={() => handleImageError(product.productId)}
                                            />
                                        ) : (
                                            <div className="thumb-placeholder">📦</div>
                                        )}
                                    </div>
                                    <div className="product-details">
                                        <h4>{product.productName || 'Unnamed Product'}</h4>
                                        <p>₹{product.price || 0}</p>
                                        <span className="product-category">{product.categoryName || 'Uncategorized'}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="qr-generator-area">
                    {selectedProduct ? (
                        <div className="qr-card">
                            <div className="product-info-card">
                                <h2>{selectedProduct.productName}</h2>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Product ID:</label>
                                        <span>{selectedProduct.productId}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Price:</label>
                                        <span className="price-value">₹{selectedProduct.price}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Brand:</label>
                                        <span>{selectedProduct.brand || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Category:</label>
                                        <span>{selectedProduct.categoryName || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="qr-display-area">
                                {generatedQR ? (
                                    <div className="qr-result">
                                        <img src={generatedQR} alt="QR Code" className="qr-image" />
                                        <div className="qr-actions">
                                            <button className="download-btn" onClick={downloadQR}>
                                                📥 Download QR
                                            </button>
                                            <button className="print-btn" onClick={printQR}>
                                                🖨️ Print QR
                                            </button>
                                            <button className="regenerate-btn" onClick={generateQRCode} disabled={generatingQR}>
                                                🔄 Regenerate
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="qr-placeholder">
                                        <div className="placeholder-icon">📱</div>
                                        <p>Click "Generate QR Code" to create QR for this product</p>
                                        <button className="generate-qr-btn" onClick={generateQRCode} disabled={generatingQR}>
                                            {generatingQR ? 'Generating...' : 'Generate QR Code'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="no-selection">
                            <div className="no-selection-icon">🎯</div>
                            <h3>Select a Product</h3>
                            <p>Please select a product from the list to generate its QR code</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateQR;