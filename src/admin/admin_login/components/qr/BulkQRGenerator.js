import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './BulkQRGenerator.css';

const BulkQRGenerator = () => {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [generating, setGenerating] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8081/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map(p => p.productId));
        }
    };

    const generateBulkQR = async () => {
        setGenerating(true);
        try {
            const response = await axios.post('http://localhost:8081/api/qr/bulk', {
                productIds: selectedProducts
            }, {
                responseType: 'blob'
            });
            
            // Download as ZIP file
            saveAs(response.data, `qrcodes_${Date.now()}.zip`);
            alert(`Successfully generated ${selectedProducts.length} QR codes!`);
        } catch (error) {
            console.error('Error generating bulk QR:', error);
            alert('Error generating QR codes. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="bulk-qr-generator">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bulk-qr-generator">
            <div className="bulk-header">
                <h2>Bulk QR Code Generator</h2>
                <p className="subtitle">Generate QR codes for multiple products at once</p>
            </div>
            
            <div className="selection-controls">
                <div className="stats-info">
                    <span>Selected: <strong>{selectedProducts.length}</strong> of <strong>{products.length}</strong> products</span>
                </div>
                <div className="button-group">
                    <button 
                        onClick={handleSelectAll} 
                        className="btn-secondary"
                    >
                        {selectedProducts.length === products.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button 
                        onClick={generateBulkQR} 
                        disabled={selectedProducts.length === 0 || generating}
                        className="btn-primary"
                    >
                        {generating ? (
                            <>
                                <span className="spinner-small"></span>
                                Generating...
                            </>
                        ) : (
                            `Generate ${selectedProducts.length} QR Codes`
                        )}
                    </button>
                </div>
            </div>
            
            <div className="products-list">
                {products.length === 0 ? (
                    <div className="no-products">
                        <p>No products found. Please add products first.</p>
                    </div>
                ) : (
                    products.map(product => (
                        <label key={product.productId} className="product-checkbox">
                            <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.productId)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedProducts([...selectedProducts, product.productId]);
                                    } else {
                                        setSelectedProducts(selectedProducts.filter(id => id !== product.productId));
                                    }
                                }}
                            />
                            <div className="product-info">
                                <span className="product-name">{product.productName}</span>
                                <span className="product-code">{product.productCode}</span>
                            </div>
                        </label>
                    ))
                )}
            </div>
        </div>
    );
};

export default BulkQRGenerator;